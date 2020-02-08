import { createMessageQueue } from "../index";

export const canHandleMessages = self => {
  const messageQueue = createMessageQueue({ onNext: (nextMessage) => {
    handleMessage(nextMessage);
  }});

  const commandHandlers = new Map();
  const eventHandlers = new Map();
  const addHandler = ({
    isCommand,
    handlersMap,
    messageType,
    handler,
    onError
  }) => {
    if (handlersMap.has(messageType)) {
      throw Error(
        `Aggregate '${name}' already has an handler for '${messageType}'.`
      );
    }
    handlersMap.set(messageType, { handler, onError });
  };
  const removeHandler = ({ isCommand, handlersMap, messageType }) => {
    if (!handlersMap.has(messageType)) {
      throw Error(
        `Aggregate '${name}' does not have a handler for '${messageType}'.`
      );
    }
    handlersMap.delete(messageType);
  };

  const handleMessage =  async (messageData) => {
    const { isCommand, message } = messageData;
    const { messageType, payload } = message;
    const handlersMap = isCommand ? commandHandlers : eventHandlers;
    if (handlersMap.has(messageType)) {
      const { handler, onError = null } = handlersMap.get(messageType);
      const currentState = self.hasObservableState
        ? self.getCurrentState()
        : null;
      const { proposal = null, events = null } =
        (await handler({ state: currentState, payload })) || {};

      if (isCommand && proposal)
        throw Error("Command cannot change aggregate state");

      proposal && self.updateState(proposal);

      if (events) {
        events.forEach(e => {
            messageQueue.pushEvent({
              messageType: e.id,
              payload: e.payload
            }, self.name);
        });
      }

      if (!isCommand && self.canExposeEvents && self.hasEventsToExpose()) {
        if (self.getExposedEvents().includes(messageType)) {
          self.emitEvent(messageType, { from: self.name, ...payload });
        }
      }
    }
  }

  return {
    ...self,
    canHandleMessages: true,
    addCommandHandler: (cmdType, handler, onError) => {
      console.log(`> ${self.name}.addCommandHandler for ${cmdType}`);
      addHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
        handler,
        onError
      });
    },
    removeCommandHandler: (cmdType, handler, onError) => {
      console.log(`> ${self.name}.removeCommandHandler for ${cmdType}`);
      removeHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType
      });
    },
    addEventHandler: (evtType, handler, onError) => {
      console.log(`> ${self.name}.addEventHandler for ${evtType}`);
      addHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType,
        handler,
        onError
      });
    },
    removeEventHandler: evtType => {
      console.log(`> ${self.name}.removeEventHandler for ${evtType}`);
      removeHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType
      });
    },
    sendCommand: (cmdType, payload) => {
      console.log(`> ${self.name}.sendCommand: ${cmdType}`, payload);
      messageQueue.pushCommand({
        messageType: cmdType,
        payload
      },
      null);

    },
    sendEvent: (evtType, payload) => {
      console.log(`> ${self.name}.sendEvent: ${evtType}`, payload);
      messageQueue.pushEvent({
        messageType: evtType,
        payload
      },
      null);
    }
  };
};

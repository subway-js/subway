import { createMessageQueue } from "../index";
import { AGGREGATES_API_BUS } from '../../../globals/internalAggregates';
export const canHandleMessages = (self, emitToQueue) => {
  // const messageQueue = createMessageQueue({ onNext: (nextMessage) => {
  //   handleMessage(nextMessage);
  // }});

  const commandHandlers = new Map();
  const eventHandlers = new Map();
  const addHandler = ({
    isCommand,
    handlersMap,
    messageType,
    handler,
    onError,
    triggeredEventsTargetAggregate
  }) => {
    if (handlersMap.has(messageType)) {
      throw Error(
        `Aggregate '${name}' already has an handler for '${messageType}'.`
      );
    }
    handlersMap.set(messageType, { handler, onError, triggeredEventsTargetAggregate });
  };
  const removeHandler = ({ isCommand, handlersMap, messageType }) => {
    if (!handlersMap.has(messageType)) {
      throw Error(
        `Aggregate '${name}' does not have a handler for '${messageType}'.`
      );
    }
    handlersMap.delete(messageType);
  };

  return {
    ...self,
    canHandleMessages: true,
    addCommandHandler: (cmdType, handler, onError, triggeredEventsTargetAggregate = null) => {
      console.log(`> ${self.name}.addCommandHandler for ${cmdType}`);
      addHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
        handler,
        onError,
        triggeredEventsTargetAggregate
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
    handleMessage: async (nextMessage) => {
      const { message, meta } = nextMessage;
      const { isCommand, messageType, payload } = message;
      const handlersMap = isCommand ? commandHandlers : eventHandlers;
      if (handlersMap.has(messageType)) {
        const { handler, onError = null, triggeredEventsTargetAggregate = null } = handlersMap.get(messageType);
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
            emitToQueue({
              isCommand: false,
              messageType: e.id,
              payload: e.payload,
            }, triggeredEventsTargetAggregate);
          });
        }

        if (!isCommand && self.canExposeEvents && self.hasEventsToExpose()) {
          if (self.getExposedEvents().includes(messageType)) {
            emitToQueue({
              isCommand: false,
              messageType,
              payload,
              from: self.name,
            }, AGGREGATES_API_BUS)
          }
        }
      }
    }
  };
};

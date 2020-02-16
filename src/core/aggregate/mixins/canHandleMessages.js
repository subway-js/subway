export const canHandleMessages = (self, emitMessage) => {
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
    handlersMap.set(messageType, {
      handler,
      onError
    });
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
    addCommandHandler: (cmdType, handler, onError) => {
      addHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
        handler,
        onError
      });
    },
    removeCommandHandler: (cmdType, handler, onError) => {
      removeHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType
      });
    },
    addEventHandler: (evtType, handler, onError) => {
      addHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType,
        handler,
        onError
      });
    },
    removeEventHandler: evtType => {
      removeHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType
      });
    },
    handleMessage: async nextMessage => {
      const { message, meta } = nextMessage;
      const { isCommand, messageType, payload } = message;
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
            emitMessage({
              isCommand: false,
              isExposed:
                self.canExposeEvents &&
                self.hasEventsToExpose() &&
                self.getExposedEvents().includes(e.id),
              messageType: e.id,
              payload: e.payload
            });
          });
        }
      }
    }
  };
};
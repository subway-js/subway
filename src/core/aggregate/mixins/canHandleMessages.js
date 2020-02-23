export const canHandleMessages = (self, emitMessage) => {
  const commandHandlers = new Map();
  const eventHandlers = new Map();

  const addHandler = ({
    isCommand,
    handlersMap,
    messageType,
    handler,
    onRejected
  }) => {
    if (handlersMap.has(messageType)) {
      throw Error(
        `Aggregate '${name}' already has an handler for '${messageType}'.`
      );
    }
    handlersMap.set(messageType, {
      handler,
      onRejected
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
    addCommandHandler: (cmdType, handler, onRejected) => {
      addHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
        handler,
        onRejected
      });
    },
    removeCommandHandler: (cmdType, handler, onError) => {
      removeHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType
      });
    },
    addEventHandler: (evtType, handler) => {
      addHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType,
        handler,
      });
    },
    removeEventHandler: evtType => {
      removeHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType
      });
    },
    handleMessage: async ({ message, meta, onCommandRejected = null }) => {
      const { isCommand, messageType, payload } = message;
      const handlersMap = isCommand ? commandHandlers : eventHandlers;
      if (handlersMap.has(messageType)) {
        const { handler } = handlersMap.get(messageType);
        const currentState = self.hasObservableState
          ? self.getCurrentState()
          : null;

        // TODO: rejectCommand? Exception?
        const broadcasts = []
        let nextEvents = []
        let nextStateProposal = null;

        const handlerInjections = {
          broadcastEvent: (type, payload) => {
            broadcasts.push({ type, payload });
          },
          triggerEvents: (events) => {
            nextEvents = events;
          }
        }

        if(isCommand) {
          handlerInjections.rejectCommand = (reasonString, meta) => {
            onCommandRejected && onCommandRejected({ reasonString, meta })
          }
        }
        if(!isCommand) {
          handlerInjections.updateState = (nextState) => {
            nextStateProposal = nextState
          }
        }

          await handler({
            state: currentState,
            payload
          }, handlerInjections);


        nextStateProposal && self.updateState(nextStateProposal);

        nextEvents.forEach(e => {
          emitMessage({
            isCommand: false,
            isExposed: false,
            messageType: e.id,
            payload: e.payload
          });
        });

        broadcasts.forEach(({ type, payload }) => emitMessage({
          isCommand: false,
          isExposed: true,
          messageType: type,
          payload
        }))

      }
    }
  };
};

export const canHandleMessages = (
  self, 
  emitMessage,
  commandHandlers = new Map(),
  eventHandlers = new Map()
) => {

  if(!self || !self.name) {
    throw new Error('Invalid <self> argument: must be an object with a <name> property.');
  }

  if(Object.prototype.toString.call(emitMessage) !== '[object Function]') {
    throw new Error('Invalid <emitMessage> argument: must be a function.');
  }

  if(Object.prototype.toString.call(commandHandlers) !== '[object Map]') {
    throw new Error('Invalid <commandHandlers> argument: must be a Map.');
  }

  if(Object.prototype.toString.call(eventHandlers) !== '[object Map]') {
    throw new Error('Invalid <eventHandlers> argument: must be a Map.');
  }

  const addHandler = ({
    handlersMap,
    messageType,
    handler,
    onRejected = null
  }) => {
    if (handlersMap.has(messageType)) {
      throw Error(
        `Aggregate '${self.name}' already has an handler for '${messageType}'.`
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
        `Aggregate '${self.name}' does not have a handler for '${messageType}'.`
      );
    }
    handlersMap.delete(messageType);
  };

  return {
    ...self,
    canHandleMessages: true,
    addCommandHandler: (cmdType, handler, onRejected) => {

      if(!cmdType || !handler) {
        throw new Error('Missing required parameters are required: <type> and/or <handler>.');
      }
      addHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
        handler,
        onRejected
      });
    },
    removeCommandHandler: (cmdType) => {
      removeHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType
      });
    },
    addEventHandler: (evtType, handler) => {
      if(!evtType || !handler) {
        throw new Error('Missing required parameters are required: <type> and/or <handler>.');
      }
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

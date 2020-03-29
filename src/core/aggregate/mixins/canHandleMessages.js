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
        `Aggregate "${self.name}" already has a handler for command "${messageType}" is alreaady defined.`
      );
    }
    handlersMap.set(messageType, {
      handler,
      onRejected
    });
  };
  const removeHandler = ({ handlersMap, messageType }) => {
    if (!handlersMap.has(messageType)) {
      throw Error(
        `Aggregate "${self.name}" does not have a handler for "${messageType}".`
      );
    }
    handlersMap.delete(messageType);
  };

  return {
    ...self,
    canHandleMessages: true,
    addCommandHandler: (cmdType, handler, onRejected = null) => {

      if(!cmdType || !handler) {
        throw new Error('Missing parameters are required: <type> and/or <handler>.');
      }
      if(Object.prototype.toString.call(cmdType) !== '[object String]') {
        throw new Error('Invalid <cmdType> argument: must be a valid string.');
      }
      if(Object.prototype.toString.call(handler) !== '[object Function]') {
        throw new Error('Invalid <handler> argument: must be a valid string.');
      }
      if(onRejected && Object.prototype.toString.call(onRejected) !== '[object Function]') {
        throw new Error('Invalid <onReject> argument: it is optional and should be a function.');
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
      if(!cmdType || Object.prototype.toString.call(cmdType) !== '[object String]') {
        throw new Error('Invalid <cmdType> argument: must be a valid string.');
      }
      removeHandler({
        handlersMap: commandHandlers,
        messageType: cmdType
      });
    },
    addEventHandler: (evtType, handler) => {
      if(!evtType || !handler) {
        throw new Error('Missing parameters are required: <type> and/or <handler>.');
      }
      if(Object.prototype.toString.call(evtType) !== '[object String]') {
        throw new Error('Invalid <evtType> argument: must be a valid string.');
      }
      if(Object.prototype.toString.call(handler) !== '[object Function]') {
        throw new Error('Invalid <handler> argument: must be a valid string.');
      }
      addHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType,
        handler,
      });
    },
    removeEventHandler: evtType => {
      if(!evtType || Object.prototype.toString.call(evtType) !== '[object String]') {
        throw new Error('Invalid <evtType> argument: must be a valid string.');
      }
      removeHandler({
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

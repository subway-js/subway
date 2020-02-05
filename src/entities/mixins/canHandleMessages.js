export const canHandleMessages = (self) => {
  const commandHandlers = new Map();
  const eventHandlers = new Map();
  const addHandler = ({isCommand, handlersMap, messageType, handler, onError}) => {
    if(handlersMap.has(messageType)) {
      throw Error(`Aggregate '${name}' already has an handler for '${messageType}'.`);
    }
    handlersMap.set(messageType, { handler, onError });
  };
  const removeHandler = ({isCommand, handlersMap, messageType }) => {
    if(!handlersMap.has(messageType)) {
      throw Error(`Aggregate '${name}' does not have a handler for '${messageType}'.`);
    }
    handlersMap.delete(messageType);
  };
  const sendMessage = async ({isCommand, handlersMap, messageType, payload}) => {
    if(handlersMap.has(messageType)) {
      const { handler, onError = null } = handlersMap.get(messageType);
      const currentState = self.hasObservableState ? self.getCurrentState() : null;
      const {
        proposal = null,
        events = null
      } = (await handler({ state: currentState, payload})) || {};

      if (isCommand && proposal)
        throw Error("Command cannot change aggregate state");

      proposal && self.updateState(proposal);
      if(events) {
        events.forEach(e => {
          setTimeout(() => sendMessage({
            isCommand: false,
            handlersMap: eventHandlers,
            messageType: e.id,
            payload: e.payload
          }), 0)
        });
      }
    }

    if(!isCommand && self.canExposeEvents && self.hasEventsToExpose()) {
      if(self.getExposedEvents().includes(messageType)) {
        self.emitEvent(messageType, { from: self.name, ...payload })
      }
    }
  };
  return {
    ...self,
    canHandleMessages: true,
    addCommandHandler: (cmdType, handler, onError) => {
      console.log(`> ${self.name}.addCommandHandler for ${cmdType}`)
      addHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
        handler, onError
      });
    },
    removeCommandHandler: (cmdType, handler, onError) => {
      console.log(`> ${self.name}.removeCommandHandler for ${cmdType}`)
      removeHandler({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
      })
    },
    addEventHandler: (evtType, handler, onError) => {
      console.log(`> ${self.name}.addEventHandler for ${evtType}`)
      addHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType,
        handler, onError
      });
    },
    removeEventHandler: (evtType) => {
      console.log(`> ${self.name}.removeEventHandler for ${evtType}`)
      removeHandler({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType,
      })
    },
    sendCommand: (cmdType, payload) => {
      console.log(`> ${self.name}.sendCommand: ${cmdType}`, payload)
      sendMessage({
        isCommand: true,
        handlersMap: commandHandlers,
        messageType: cmdType,
        payload
      })
    },
    sendEvent: (evtType, payload) => {
      console.log(`> ${self.name}.sendEvent: ${evtType}`, payload)
      sendMessage({
        isCommand: false,
        handlersMap: eventHandlers,
        messageType: evtType,
        payload
      })
    }
  }
};

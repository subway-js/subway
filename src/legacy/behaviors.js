export const canHandleMessages = () => ({
  commandHandlers: new Map(),
  eventHandlers: new Map(),

  addCommandHandler: (cmdType, handler, onError) => {
    console.log('addCommandHandler')
  },
  removeCommandHandler: (cmdType, handler, onError) => {
    console.log('removeCommandHandler')
  },
  runCommandHandlers: () => {
    console.log('runCommandHandlers')
  },
  runEventHandlers: () => {
    console.log('runEventHandlers')
  }
})

export const hasObservableState = (initialState = {}) => {
  const subscribers = new Map();
  const state = {...initialState};
  return {
    observeState: (onNextState) => {
      const subscriptionId = Date.now();
      onNextState(state) //{...state} _?
      subscribers.set(subscriptionId, onNextState);
      console.log('observeState')
      return () => {
        subscribers.delete(subscriptionId);
      }
    },
    updateState: nextState => {
      state = { ...nextState };
      Array.from(subscribers).forEach(observer =>
        observer.next(nextState)
      );
      console.log('updateState')
    },
  }
}


export const hasState = (initialState = {}) => ({
  state: initialState,
})

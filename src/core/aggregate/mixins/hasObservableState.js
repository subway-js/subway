export const hasObservableState = (self, initialState = {}, subscribers = new Map()) => {
  if(!self || !self.name) {
    throw new Error('Invalid <self> argument: must be an object with a <name> property.');
  }

  if(Object.prototype.toString.call(initialState) !== '[object Object]') {
    throw new Error('Invalid <initialState> argument: must be an object.');
  }

  if(Object.prototype.toString.call(subscribers) !== '[object Map]') {
    throw new Error('Invalid <subscribers> argument: must be a Map.');
  }
  
  let state = { ...initialState };
  return {
    ...self,
    hasObservableState: true,
    observeState: onNextState => {
      const subscriptionId = Date.now();
      onNextState(state);
      subscribers.set(subscriptionId, onNextState);
      return () => subscribers.delete(subscriptionId);
    },
    updateState: nextState => {
      const next = { ...state, ...nextState };
      state = next;
      console.log(`> nextState for ${self.name}:`, next);
      subscribers.forEach(onNextState => onNextState(next));
    },
    getCurrentState: () => state
  };
};

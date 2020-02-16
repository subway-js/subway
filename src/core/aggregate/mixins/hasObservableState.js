export const hasObservableState = (self, initialState = {}) => {
  const subscribers = new Map();
  let state = { ...initialState };
  return {
    ...self,
    hasObservableState: true,
    observeState: onNextState => {
      const subscriptionId = Date.now();
      onNextState(state); //({...state}) //{...state} _?
      subscribers.set(subscriptionId, onNextState);
      return () => {
        subscribers.delete(subscriptionId);
      };
    },
    updateState: nextState => {
      state = nextState; //{ ...nextState };
      console.log(`> nextState for ${self.name}:`, callPayload);
      subscribers.forEach(onNextState => onNextState(nextState));
    },
    getCurrentState: () => state //({...state})
  };
};

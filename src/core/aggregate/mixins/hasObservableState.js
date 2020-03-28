export const hasObservableState = (self, initialState = {}, subscribers = new Map()) => {
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

export const hasObservableState = (self, initialState = {}) => {
  const subscribers = new Map();
  let state = {...initialState};
  return {
    ...self,
    hasObservableState: true,
    observeState: (onNextState) => {
      console.log(`> observeState callback set`)
      const subscriptionId = Date.now();
      onNextState(state)//({...state}) //{...state} _?
      subscribers.set(subscriptionId, onNextState);
      return () => {
        console.log('> stop observing')
        subscribers.delete(subscriptionId);
      }
    },
    updateState: nextState => {
      console.log(`> updateState`, nextState)
      state = nextState//{ ...nextState };
      subscribers.forEach(onNextState =>
        onNextState(nextState)
      );
    },
    getCurrentState: () => state//({...state})
  }
}

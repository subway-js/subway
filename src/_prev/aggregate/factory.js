import { canHandleMessages } from "./mixins/canHandleMessages";
import { hasObservableState } from "./mixins/hasObservableState";

export const createAggregate = (name, initialState, emitMessage) => {
  const self = {
    name
  };
  return canHandleMessages(
    hasObservableState(self, initialState),
    emitMessage
  );
};

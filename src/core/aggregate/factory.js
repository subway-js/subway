import { canHandleMessages } from "./mixins/canHandleMessages";
import { hasObservableState } from "./mixins/hasObservableState";
import { canExposeEvents } from "./mixins/canExposeEvents";

export const createAggregate = (name, initialState, emitMessage) => {
  const self = {
    name
  };
  return canHandleMessages(
    canExposeEvents(hasObservableState(self, initialState)),
    emitMessage
  );
};

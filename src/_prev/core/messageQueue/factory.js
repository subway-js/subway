import { hasMessageQueue } from "./mixins/hasMessageQueue";
// import { allowsSubscribingToExposedEvents } from "../mixins/allowsSubscribingToExposedEvents";

export const createMessageQueue = (onNextMessage, initialMessages = []) => {
  const self = {
    name
  };
  return hasMessageQueue(self, onNextMessage, initialMessages);
};

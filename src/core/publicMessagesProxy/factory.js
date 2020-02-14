import { canProxyExposedEvents } from "./mixins/canProxyExposedEvents";
import { canProxyBroadcastedCommands } from "./mixins/canProxyBroadcastedCommands";
import { canProxyUIComponents } from "./mixins/canProxyUIComponents";

export const createPublicMessagesProxy = () => {
  const self = {
    name
  };
  return canProxyBroadcastedCommands(
    canProxyExposedEvents(canProxyUIComponents(self))
  );
};

export const canProxyBroadcastedCommands = self => {
  const exposedCommandHandlers = new Map();
  return {
    ...self,
    canProxyBroadcastedCommands: true,
    exposeCommandHandler: (cmdType, originAggregateName) => {
      if (exposedCommandHandlers.has(cmdType)) {
        throw Error(
          "Command handler for " + cmdType + " has already been published"
        );
      } else {
        exposedCommandHandlers.set(cmdType, originAggregateName);
      }
      return () => {
        exposedCommandHandlers.remove(cmdType);
      };
    },
    isCommandHandled: cmdType => exposedCommandHandlers.has(cmdType),
    getCommandOwnerName: cmdType => exposedCommandHandlers.get(cmdType)
  };
};

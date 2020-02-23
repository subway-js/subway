export const hasMessageQueue = (self, initialMessages = []) => {
  let messageStore = Array.from(initialMessages);
  let onNextMessage = null;
  let count = 0;
  const flushQueue = () => {
    if (!onNextMessage) {
      throw Error("[hashMessageQueue mixin]: missing onNextMessage param");
    }
    const pendingMessages = [...messageStore];
    messageStore = [];
    pendingMessages.forEach(m => setTimeout(() => onNextMessage(m)));
  };
  return {
    ...self,
    hasMessageQueue: true,
    setMessageCallback: cb => {
      onNextMessage = cb;
    },
    isQueueEmpty: () => messageStore.length <= 0,
    pushMessage: (message, sourceAggregateName, onCommandRejected = null) => {
      // TODO factory for messages
      messageStore.push({
        id: count++, // TODO needed? generate, not from 0
        // isCommand,
        message,
        meta: {
          sourceAggregateName,
          received: Date.now()
        },
        onCommandRejected
      });
      flushQueue();
    }
  };
};

export const createMessageQueue = ({ messages = [], onNext = null }) => {
  let count = 0;
  const flushQueue = () => {
    const pendingMessages = [...messageStore];
    messageStore = [];
    pendingMessages.forEach(m => setTimeout(() => notifyNextItem(m)))
  }
  let messageStore = Array.from(messages);
  let notifyNextItem = null;
  if(onNext) {
    notifyNextItem = onNext
    flushQueue();
  };
  const _pushMessage = (message, sourceAggregate, targetAggregate) => {

    messageStore.push({
      id: count++, // TODO needed? generate, not from 0
      // isCommand,
      message,
      meta: {
        sourceAggregate,
        targetAggregate,
        received: Date.now(),
      }
    });
    flushQueue();
  }

  return {
    isEmpty: () => (messageStore.length <= 0),
    // pushCommand: (message, sourceAggregate = null) => pushMessage(true, message, sourceAggregate),
    // pushEvent: (message, sourceAggregate = null) => pushMessage(false, message, sourceAggregate),
    pushMessage: (message, sourceAggregate, targetAggregate) => {
      _pushMessage(message, sourceAggregate, targetAggregate)
    },
    observe: (next) => {
      notifyNextItem = next;
      flushQueue();
    },
  }
}
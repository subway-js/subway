export const canProxyExposedEvents = self => {
  let subscriberId = 1;
  const exposedEventsMap = new Map();
  return {
    ...self,
    canProxyExposedEvents: true,
    hasExposedEventsSubscribers: evtType => exposedEventsMap.has(evtType),
    subscribeToExposedEvent: (evtType, handler) => {
      const nextId = ++subscriberId;
      const entry = { id: nextId, handler };
      if (exposedEventsMap.has(evtType)) {
        exposedEventsMap.get(evtType).push(entry);
      } else {
        exposedEventsMap.set(evtType, [entry]);
      }
      return () => {
        const subscribers = exposedEventsMap.get(evtType);
        const nextSubscribers = subscribers.filter(sub => {
          sub.id !== nextId;
        });
        exposedEventsMap.set(evtType, nextSubscribers);
      };
    },
    notifyExposedEventSubscribers: (messageType, payload) => {
      if (exposedEventsMap.has(messageType)) {
        exposedEventsMap
          .get(messageType)
          .forEach(({ handler }) => handler(messageType, payload));
      }
    }
  };
};

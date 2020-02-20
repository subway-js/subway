export const canProxyExposedEvents = self => {
  let subscriberId = 1;
  const exposedEventsMap = new Map();
  const eventsPayload = new Map();
  const getLastEventPayload = eventType =>
    eventsPayload.has(eventType) ? eventsPayload.get(eventType) : null;
  const setLastEventPayload = ({ type, payload }) => {
    // if (!exposedEventsMap.has(type)) {
    //   throw Error(
    //     "trying to update last event payload but event is not exposed"
    //   );
    // }
    if (!type || !payload) {
      throw Error("updateLastEventPayload() called with invalid parameters");
    }
    eventsPayload.set(type, payload);
  }
  return {
    ...self,
    canProxyExposedEvents: true,
    hasExposedEventsSubscribers: evtType => exposedEventsMap.has(evtType),
    updateLastEventPayload: setLastEventPayload,
    getExposedEventLastPayload: getLastEventPayload,
    subscribeToExposedEvent: (evtType, handler) => {
      const nextId = ++subscriberId;
      const entry = { id: nextId, handler };
      if (exposedEventsMap.has(evtType)) {
        exposedEventsMap.get(evtType).push(entry);
      } else {
        exposedEventsMap.set(evtType, [entry]);
      }
      const lastPayload = getLastEventPayload(evtType);
      lastPayload && handler(evtType, lastPayload);

      return () => {
        const subscribers = exposedEventsMap.get(evtType);
        const nextSubscribers = subscribers.filter(sub => {
          sub.id !== nextId;
        });
        exposedEventsMap.set(evtType, nextSubscribers);
      };
    },
    notifyExposedEventSubscribers: (messageType, payload = null) => {
      payload && setLastEventPayload({ type: messageType, payload })
      if (exposedEventsMap.has(messageType)) {
        exposedEventsMap
          .get(messageType)
          .forEach(({ handler }) => handler(messageType, payload));
      }
    }
  };
};

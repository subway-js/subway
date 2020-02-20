export const canExposeEvents = (
  self,
  exposedEvents = new Set(),
  eventsPayload = new Map()
) => {
  // const exposedEvents = new Set();

  // TODO allow Aggregate.Event to create namespace
  // > atm, we override same events

  const expose = event => {
    const paramType = typeof event;
    if (paramType === "string") {
      exposedEvents.add(event);
    }
    // if (event && paramType === "object") {
    //   const { type, defaultValue } = event;
    //   exposedEvents.add(type);
    //   eventsPayload.set(type, defaultValue);
    // }
  };

  const stopExposing = eventType => {
    const paramType = typeof eventType;
    if (!eventType || paramType !== "string") {
      throw Error("stopExposing() called with invalid event parameter");
    }
    exposedEvents.delete(eventType);
    eventsPayload.has(eventType) && eventsPayload.delete(eventType);
  };

  return {
    ...self,
    canExposeEvents: true,
    hasEventsToExpose: () => exposedEvents.size > 0,
    getExposedEvents: () => Array.from(exposedEvents),
    // getExposedEventLastPayload: eventType =>
    //   eventsPayload.has(eventType) ? eventsPayload.has(eventType) : null,
    // updateLastEventPayload: ({ type, payload }) => {
    //   if (!exposedEvents.has(type)) {
    //     throw Error(
    //       "trying to update last event payload but event is not exposed"
    //     );
    //   }
    //   if (!type || !payload) {
    //     throw Error("updateLastEventPayload() called with invalid parameters");
    //   }
    //   eventsPayload.set(type, payload);
    // },
    exposeEvent: event => expose(event),
    exposeEvents: events => {
      events.forEach(evt => expose(evt));
    },
    stopExposingEvent: eventType => stopExposing(eventType),
    stopExposingEvents: eventTypes =>
      eventTypes.forEach(type => stopExposing(type))
  };
};

export const canExposeEvents = (self, exposedEvents = new Set()) => {
  // const exposedEvents = new Set();

  // TODO allow Aggregate.Event to create namespace
  // > atm, we override same events
  return {
    ...self,
    canExposeEvents: true,
    hasEventsToExpose: () => exposedEvents.size > 0,
    getExposedEvents: () => Array.from(exposedEvents),
    exposeEvents: eventTypes => {
      eventTypes.forEach(type => exposedEvents.add(type));
    }
  };
};

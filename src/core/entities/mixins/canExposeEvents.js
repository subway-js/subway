export const canExposeEvents = self => {
  const exposedEvents = new Set();
  return {
    ...self,
    canExposeEvents: true,
    hasEventsToExpose: () => exposedEvents.size > 0,
    getExposedEvents: () => Array.from(exposedEvents),
    exposeEvents: eventTypes => {
      console.log(`> ${self.name}.exposeEvents for ${eventTypes}`);
      eventTypes.forEach(type => exposedEvents.add(type));
    }
  };
};

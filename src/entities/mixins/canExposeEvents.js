export const canExposeEvents = (self) => {
  const exposedEvents = new Set();
  let _emitFunction = null;
  return {
    ...self,
    canExposeEvents: true,
    emitEvent: (type, payload) => {
      _emitFunction(type, payload)
    },
    hasEventsToExpose: () => (exposedEvents.size > 0),
    getExposedEvents: () => Array.from(exposedEvents),
    exposeEvents: (eventTypes, emitFunction) => {
      // if(!canExposeEvents || !hasEventsToExpose()) return;
      console.log(`> ${self.name}.exposeEvents for ${eventTypes}`)
      _emitFunction = emitFunction;
      eventTypes.forEach(type => exposedEvents.add(type))
    }
  }
};

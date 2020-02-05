export const getSystemAggregateApi = (systemAggregate, sourceAggregate) => ({
  exposeCommandHandler: (cmdType, handler, onError) => {
    systemAggregate.addCommandHandler(cmdType, handler, onError);
  },
  removeCommandHandler: (cmdType) => {
    systemAggregate.removeCommandHandler(cmdType);
  },
  exposeEvents: eventTypes => {
    sourceAggregate.exposeEvents(eventTypes, (type, payload) => {
      systemAggregate.sendEvent(type, payload)
    })
  }

})

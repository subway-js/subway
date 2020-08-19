export const hasAggregatesStore = (self, createAggregate) => {
  const _aggregatesMap = new Map();

  return {
    ...self,
    hasAggregatesStore: true,
    createAggregate: (name, initialState = {}, emitToQueue) => {
      if (_aggregatesMap.has(name)) {
        throw Error(`Aggregate '${name}' already exists`);
      }
      const aggregate = createAggregate(name, initialState, emitToQueue);
      _aggregatesMap.set(name, aggregate);
      return aggregate;
    },
    getAggregate: name => {
      if (!_aggregatesMap.has(name)) {
        throw Error(`Aggregate '${name}' does not exist`);
      }
      return _aggregatesMap.get(name);
    },
    aggregateExists: name => {
      return _aggregatesMap.has(name);
    }
  };
};

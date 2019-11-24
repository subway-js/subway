const _aggregateStores = new Map();

export const createAggregate = (aggregateName, initialState = {}) => {
  if (_aggregateStores.has(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' already exists`);
  }
  _aggregateStores.set(aggregateName, initialState);
};

export const getAggregateState = aggregateName => {
  if (!aggregateExists(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' does not exist`);
  }
  return _aggregateStores.get(aggregateName) || {};
};

export const updateAggregateState = (aggregateName, nextState) => {
  // console.log('TODO', 'implement SAM validation on updateAggregateState?') // TODO
  _aggregateStores.set(aggregateName, nextState);
  if (_aggregateStoreObservers.has(aggregateName)) {
    Array.from(_aggregateStoreObservers.get(aggregateName)).forEach(observer =>
      observer.next({ aggregate: aggregateName, nextState })
    );
  }
};

export const aggregateExists = aggregateName =>
  _aggregateStores.has(aggregateName);

const _aggregateStoreObservers = new Map();

export const observeState = aggregateName => next => {
  if (!_aggregateStoreObservers.has(aggregateName)) {
    _aggregateStoreObservers.set(aggregateName, new Set([next]));
  } else {
    _aggregateStoreObservers.get(aggregateName).add(next);
  }
  return () => {
    _aggregateStoreObservers.get(aggregateName).delete(next);
    if (_aggregateObservers.get(aggregateName).size === 0) {
      _aggregateObservers.delete(aggregateName);
    }
  };
};

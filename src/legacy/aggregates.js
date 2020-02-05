import {
  AGGREGATES_API_BUS,
  SYMBOL_ALL
} from './globals';

import { 
  createAggregate,
  createSystemAggregate
} from './aggregateFactory';

// const ReservedNames = [ AGGREGATES_API_BUS, SYMBOL_ALL ];

const _aggregatesMap = new Map();

export const createAggregate = (aggregateName, initialState = {}) => {

  if (_aggregatesMap.has(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' already exists`);
  }
  const aggregate = createAggregate(aggregateName, initialState)
  _aggregatesMap.set(aggregateName, aggregate);
};

export const getAggregate = aggregateName => {
  if (!_aggregatesMap.has(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' does not exist`);
  }
  return _aggregatesMap.get(aggregateName)
}
export const aggregateExists = aggregateName =>
  _aggregatesMap.has(aggregateName);


export const updateAggregateState = (aggregateName, nextState = null) => {
  if (!_aggregatesMap.has(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' does not exist`);
  }
  if (!!nextState) {
    throw Error(`Aggregate '${aggregateName}' next state cannot be null`);
  }
  _aggregatesMap.get(aggregateName).updateState(nextState);
};

export const observeState = aggregateName => onNextState => {
  if (!_aggregatesMap.has(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' does not exist`);
  }
  return _aggregatesMap.get(aggregateName).observeState(onNextState);
}

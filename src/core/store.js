import {
  createAggregate as callCreateAggregate,
  createSystemAggregate as callCreateSystemAggregate
} from './entities/index';

import {
  AGGREGATES_API_BUS,
} from '../globals/internalAggregates';

const _aggregatesMap = new Map();
let _systemAggregate = null;

export const createSystemAggregate = emitToQueue => {
  _systemAggregate = callCreateSystemAggregate(emitToQueue(AGGREGATES_API_BUS));
}

export const createAggregate = (name, initialState = {}, emitToQueue) => {

  if (_aggregatesMap.has(name)) {
    throw Error(`Aggregate '${name}' already exists`);
  }
  const aggregate = callCreateAggregate(name, initialState, emitToQueue)
  _aggregatesMap.set(name, aggregate);
  return aggregate;
};

export const getAggregate = name => {
  if(name === AGGREGATES_API_BUS) {
    return getSystemAggregate()
  }

  if (!_aggregatesMap.has(name)) {
    throw Error(`Aggregate '${name}' does not exist`);
  }
  return _aggregatesMap.get(name)
}

export const getSystemAggregate = () => _systemAggregate;

export const aggregateExists = name => {
  return _aggregatesMap.has(name);
}

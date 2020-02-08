import { createAggregate as callCreateAggregate } from '../../entities/index';

const _aggregatesMap = new Map();

export const createAggregate = (aggregateName, initialState = {}) => {

  if (_aggregatesMap.has(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' already exists`);
  }
  const aggregate = callCreateAggregate(aggregateName, initialState)
  _aggregatesMap.set(aggregateName, aggregate);
  return aggregate;
};

export const getAggregate = aggregateName => {
  if (!_aggregatesMap.has(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' does not exist`);
  }
  return _aggregatesMap.get(aggregateName)
}

export const aggregateExists = aggregateName =>
  _aggregatesMap.has(aggregateName);

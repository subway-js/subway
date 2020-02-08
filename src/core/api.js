import * as AggregateStore from './aggregates/store';
import { getSystemAggregate} from './bus/store';

import { getAggregateApi } from './aggregates/api';
import {
  getSystemAggregateApi,
} from './bus/api';

import {
  AGGREGATES_API_BUS,
  SYMBOL_ALL,
  MF_AGGREGATE_NAME
} from '../globals';

const ReservedNames = [ AGGREGATES_API_BUS, SYMBOL_ALL ];

const systemAggregate = getSystemAggregate();

const buildAggregateApi = (aggregate, systemAggregate) => ({
  ...getAggregateApi(aggregate),
  bus: {
    ...getSystemAggregateApi(systemAggregate, aggregate),
  }
})

export const createAggregate = (name, initialState) => {
  if(ReservedNames.includes(name)) {
    throw Error(`Aggregate name '${aggregateName}' is a reserved namespace`);
  }
  const aggregate = AggregateStore.createAggregate(name, initialState);
  return buildAggregateApi(aggregate, systemAggregate);
}

export const selectAggregate = (name) => {
  if(ReservedNames.includes(name)) {
    throw Error(`Aggregate name '${aggregateName}' is a reserved namespace`);
  }
  const aggregate = AggregateStore.getAggregate(name);
  return buildAggregateApi(aggregate, systemAggregate);
}

export const broadcastCommand = (type, payload, fromAggregate) => {
  return systemAggregate.sendCommand(type, payload, fromAggregate)
}

export const consumeEvent = (evtType, handler, onError) => {
  return systemAggregate.addEventHandler(evtType, handler, onError);
}

export const stopConsumingEvent = (evtType) => {
  return systemAggregate.removeEventHandler(evtType);
}

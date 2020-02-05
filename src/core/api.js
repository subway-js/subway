import * as AggregateStore from './aggregates/store';
import { getSystemAggregate} from './bus/store';

import { getAggregateApi } from './aggregates/api';
import {
  getSystemAggregateApi,
} from './bus/api';

const systemAggregate = getSystemAggregate();

const buildAggregateApi = (aggregate, systemAggregate) => ({
  ...getAggregateApi(aggregate),
  bus: {
    ...getSystemAggregateApi(systemAggregate, aggregate),
  }
})

export const createAggregate = (name, initialState) => {
  const aggregate = AggregateStore.createAggregate(name, initialState);
  return buildAggregateApi(aggregate, systemAggregate);
}

export const selectAggregate = (name) => {
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

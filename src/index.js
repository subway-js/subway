import {
  createAggregate as _createAggregate,
  getAggregateState as _getAggregateState,
  aggregateExists as _aggregateExists,
  observeState as _observeState
} from "./aggregates";

import {
  setCommandHandler as _setCommandHandler,
  setEventHandler as _setEventHandler
} from "./handlers";

import { sendCommand as _sendCommand, spy as _spy } from "./messaging";

import {
  init as _init,
  connect as _connect
} from "./helpers/microfrontends/index";

const getApi = aggregateName => ({
  spy: _spy(aggregateName),
  // TODO return state on first subscribe
  observeState: _observeState(aggregateName),
  sendCommand: _sendCommand(aggregateName),
  setCommandHandler: _setCommandHandler(aggregateName),
  setEventHandler: _setEventHandler(aggregateName)
});

const selectAggregate = aggregateName => {
  if (!_aggregateExists(aggregateName)) {
    throw Error(`Topic '${aggregateName}' does not exist`);
  }
  return {
    ...getApi(aggregateName)
  };
};

const createAggregate = (aggregateName, model = {}) => {
  _createAggregate(aggregateName, model);
  return {
    ...getApi(aggregateName)
  };
};

const Subway = {
  createAggregate,
  selectAggregate,
  helpers: {
    composeMicroFrontends: _init,
    installMicroFrontend: _connect
  }
};

export default Subway;

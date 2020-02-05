import {
  createAggregate as _createAggregate,
  getAggregateState as _getAggregateState,
  aggregateExists as _aggregateExists,
  observeState as _observeState
} from "./aggregates";

import {
  setCommandHandler as _setCommandHandler,
  setEventHandler as _setEventHandler,
  unsetCommandHandler as _unsetCommandHandler,
  unsetEventHandler as _unsetEventHandler,
  react as _react
} from "./handlers";

import { sendCommand as _sendCommand, spy as _spy } from "./messaging";

import {
  init as _init,
  connect as _connect
} from "./helpers/microfrontends/index";

import {
  AGGREGATES_API_BUS,
  SYMBOL_ALL
} from './globals';

const ReservedNames = [ AGGREGATES_API_BUS, SYMBOL_ALL ];

const selectAggregate = aggregateName => {
  if (!_aggregateExists(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' does not exist`);
  }

  return {
    ...getAggregateApi(aggregateName),
    // spy: _spy(aggregateName),
    // triggerAfter: _react(aggregateName)
  };
};

const createAggregate = (aggregateName, model = {}) => {
  _createAggregate(aggregateName, model);
  return {
    ...getAggregateApi(aggregateName)
  };
};

const _respondToCommand = (
  sourceEvent,
  { targetAggregate = null, triggeredEvent, withPayload = p => p }
) => {
  _react('*')(sourceEvent,
  { targetAggregate, triggeredEvent, withPayload })
}



const getAggregateApi = aggregateName => ({
  setEventHandler: _setEventHandler(aggregateName),
  unsetEventHandler: _unsetEventHandler(aggregateName),
  setCommandHandler: _setCommandHandler(aggregateName),
  unsetCommandHandler: _unsetCommandHandler(aggregateName),
  sendCommand: _sendCommand(aggregateName),
  observeState: _observeState(aggregateName),
  configureApi: getPublicApi(aggregateName)
});

const getPublicApi = aggregateName => ({
  publishCommandHandler: () => {},
  unpublishCommandHandler: () => {},
  exposeEvents: [],
  exposeComponent: () => {},
});

const Subway = {
  createAggregate,
  selectAggregate,
  broadcastCommand: () => {},
  consumeEvent: () => {}

  $dev: {
    spy: () => {},
    observAggregateState: () => {},
  },

  $helpers: {
    composeMicroFrontends: _init,
    installMicroFrontend: _connect
  }
};


//
// Rule 1: each aggregate lives inside an '/aggregates/aggregateName' folder
// Rule 2: code inside '/aggregates/xxx' should never call
//         selectAggregate() or createAggregate() with something different than 'xxx'
// Rule 3: code inside '/aggregates/xxx' should never explicitely
//         import anything from other aggregates folders e.g. '../aggregates/yyy'
//

Subway
  .createAggregate('Session', initialState)
  .selectAggregate('Session')
    .setEventHandler('xxx', () => {})
    .setCommandHandler('xxx', () => {})
    .sendCommand()
    .observeState()
    .configureApi()
      .setCommandHandler('SHOW_LOGIN_MODAL', () => {})
      .exposeEvents(['USER_LOGGED_IN', 'USER_LOGGED_OUT'])
      .exposeComponent() // E.g. ShoppingCart aggregate -> ShoppingCartHeaderDropdown

  .broadcastCommand()
  .subscribeToEvent()

  ._dev
    .spy('Aggr.Evt', () => {})
    .observAggregateState('Session')

export default Subway;

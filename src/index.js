
import {
  AGGREGATES_API_BUS,
  SYMBOL_ALL
} from './globals';

// import {
//   init,
//   connectº
// } from './helpers/microfrontends/index';

import * as AggregateManager from './core/api';

const ReservedNames = [ AGGREGATES_API_BUS, SYMBOL_ALL ];

const createAggregate = (aggregateName, model = {}) => {
  if(ReservedNames.contains(aggregateName)) {
    throw Error(`Aggregate name '${aggregateName}' is a reserved namespace`);
  }
  _createAggregate(aggregateName, model);
  return {
    ...getAggregateApi(aggregateName)
  };
};

const selectAggregate = aggregateName => {
  if(ReservedNames.contains(aggregateName)) {
    throw Error(`Aggregate name '${aggregateName}' is a reserved namespace`);
  }
  if (!_aggregateExists(aggregateName)) {
    throw Error(`Aggregate '${aggregateName}' does not exist`);
  }
  return {
    ...getAggregateApi(aggregateName),
    // spy: _spy(aggregateName),
    // triggerAfter: _react(aggregateName)
  };
};
//
// const getAggregateApi = aggregateName => ({
//   setEventHandler: () => {},
//   unsetEventHandler: () => {},
//   setCommandHandler: () => {},
//   unsetCommandHandler: () => {},
//   sendCommand: () => {},
//   observeState: () => {},
//   configureApi: getPublicApi(aggregateName)
// });
//
// const getPublicApi = aggregateName => ({
//   publishCommandHandler: () => {},
//   unpublishCommandHandler: () => {},
//   exposeEvents: [],
//   exposeComponent: () => {},
// });

const Subway = {
  createAggregate: AggregateManager.createAggregate,
  selectAggregate: AggregateManager.selectAggregate,
  broadcastCommand: AggregateManager.broadcastCommand,
  consumeEvent: AggregateManager.consumeEvent,
  stopConsumingEvent: AggregateManager.stopConsumingEvent,

  $dev: {
    spy: () => {},
    observAggregateState: () => {},
  },

  $helpers: {
    composeMicroFrontends: () => {},// init,
    installMicroFrontend: () => {},//connect
  }
};

//
// Rule 1: each aggregate lives inside an '/aggregates/aggregateName' folder
// Rule 2: code inside '/aggregates/xxx' should never call
//         selectAggregate() or createAggregate() with something different than 'xxx'
// Rule 3: code inside '/aggregates/xxx' should never explicitely
//         import anything from other aggregates folders e.g. '../aggregates/yyy'


export default Subway;

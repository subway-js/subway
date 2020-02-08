import * as MicroFrontendManager from './helpers/microfrontends/index';
import * as AggregateManager from './core/api';

//
// Rule 1: each aggregate lives inside an '/aggregates/aggregateName' folder
// Rule 2: code inside '/aggregates/xxx' should never call
//         selectAggregate() or createAggregate() with something different than 'xxx'
// Rule 3: code inside '/aggregates/xxx' should never explicitely
//         import anything from other aggregates folders e.g. '../aggregates/yyy'

const Subway = {
  createAggregate: AggregateManager.createAggregate,
  selectAggregate: AggregateManager.selectAggregate,
  broadcastCommand: AggregateManager.broadcastCommand,
  consumeEvent: AggregateManager.consumeEvent,
  stopConsumingEvent: AggregateManager.stopConsumingEvent,

  // TODO
  // $dev: {
  //   spy: () => {},
  //   observAggregateState: () => {},
  // },

  $helpers: {
    composeMicroFrontends: MicroFrontendManager.init,
    installMicroFrontend: MicroFrontendManager.connect
  }
};

export default Subway;

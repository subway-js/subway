import * as MicroFrontendManager from "./microfrontends/index";
import * as AggregateManager from "./core/facade";
import { InternalAggregateNames } from "./globals/internalAggregates";
//
// Rule 1: each aggregate lives inside an '/aggregates/aggregateName' folder
// Rule 2: code inside '/aggregates/xxx' should never call
//         selectAggregate() or createAggregate() with something different than 'xxx'
// Rule 3: code inside '/aggregates/xxx' should never explicitely
//         import anything from other aggregates folders e.g. '../aggregates/yyy'

const Subway = {
  createAggregate: (name, initialState) => {
    if (InternalAggregateNames.includes(name)) {
      throw Error(`Aggregate name '${name}' is a reserved namespace`);
    }
    return AggregateManager.createAggregate(name, initialState);
  },
  selectAggregate: AggregateManager.selectAggregate,

  // TODO
  // $dev: {
  //   spy: () => {},
  //   observAggregateState: () => {},
  // },

  microFrontends: () => ({
    compose: MicroFrontendManager.init,
    install: MicroFrontendManager.connect
  })
};

export default Subway;

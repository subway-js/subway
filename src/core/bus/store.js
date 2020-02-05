import * as AggregateFactory from '../../entities/factory';

let _systemAggregate = null

export const getSystemAggregate = () => {
  if ( _systemAggregate == null) {
    _systemAggregate = AggregateFactory.createSystemAggregate();
  }
  return _systemAggregate
}

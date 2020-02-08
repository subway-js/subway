import { createSystemAggregate as callCreateSystemAggregate } from '../../entities/index';
let _systemAggregate = null

export const getSystemAggregate = () => {
  if ( _systemAggregate == null) {
    _systemAggregate = callCreateSystemAggregate();
  }
  return _systemAggregate
}

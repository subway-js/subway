import {
  canHandleMessages
} from './mixins/canHandleMessages';
import {
  hasObservableState
} from './mixins/hasObservableState';
import {
  canExposeEvents
} from './mixins/canExposeEvents';

import {
  AGGREGATES_API_BUS
} from '../globals';

export const createAggregate = (name, initialState) => {
  const self = {
    name,
  }
  return canHandleMessages(
    canExposeEvents(
      hasObservableState(self, initialState)
    ),
  );
  // return {
  //   ...self,
  //   ...hasObservableState(self, initialState),
  //   ...canHandleMessages(self)
  // }
}

export const createSystemAggregate = () => {
  const self = {
    name: AGGREGATES_API_BUS
  }
  return canHandleMessages(self);
  // return {
  //   ...self,
  //   ...canHandleMessages(self)
  // }
}

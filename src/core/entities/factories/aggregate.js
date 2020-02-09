import {
  canHandleMessages
} from '../mixins/canHandleMessages';
import {
  hasObservableState
} from '../mixins/hasObservableState';
import {
  canExposeEvents
} from '../mixins/canExposeEvents';

import {
  AGGREGATES_API_BUS
} from '../../../globals/internalAggregates';

export const createAggregate = (name, initialState, emitToQueue) => {
  const self = {
    name,
  }
  return canHandleMessages(
    canExposeEvents(
      hasObservableState(self, initialState)
    ),
    emitToQueue
  );
}

export const createSystemAggregate = (emitToQueue) => {
  const self = {
    name: AGGREGATES_API_BUS
  }
  return canHandleMessages(self, emitToQueue);
}

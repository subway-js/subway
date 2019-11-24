import {
  runCommandHandlers as _runCommandHandlers,
  runEventHandlers as _runEventHandlers
} from "./handlers";

const ALL_MESSAGES_CHAR = "*";
const CMD_TYPE = "Command";
const EVT_TYPE = "Event";

const _aggregateObservers = new Map([[ALL_MESSAGES_CHAR, new Set()]]);

export const spy = aggregateName => (
  messageType,
  { next /*, error, complete*/ }
) => {
  if (!_aggregateObservers.has(aggregateName)) {
    _aggregateObservers.set(aggregateName, new Map());
  }
  if (!_aggregateObservers.get(aggregateName).has(messageType)) {
    _aggregateObservers.get(aggregateName).set(messageType, new Set([next]));
  } else {
    _aggregateObservers
      .get(aggregateName)
      .get(messageType)
      .add(next);
  }

  return () => {
    _aggregateObservers
      .get(aggregateName)
      .get(messageType)
      .delete(next);
    if (_aggregateObservers.get(aggregateName).get(messageType).size === 0) {
      _aggregateObservers.get(aggregateName).delete(messageType);
    }
  };
};

const _send = (isCommand, aggregateName, messageType, payload) => {
  // TODO inject model and present func
  const sendFn = isCommand ? _runCommandHandlers : _runEventHandlers;
  sendFn(sendEvent, aggregateName, messageType, payload);
  if (_aggregateObservers.has(aggregateName)) {
    if (_aggregateObservers.get(aggregateName).has(messageType)) {
      const subscribers = Array.from(
        _aggregateObservers.get(aggregateName).get(messageType)
      );
      subscribers.forEach(next => next(payload));
    }

    if (_aggregateObservers.get(aggregateName).has(ALL_MESSAGES_CHAR)) {
      const subscribers = Array.from(
        _aggregateObservers.get(aggregateName).get(ALL_MESSAGES_CHAR)
      );
      subscribers.forEach(next =>
        next({
          type: isCommand ? CMD_TYPE : EVT_TYPE,
          messageId: messageType,
          payload
        })
      );
    }
  }
};

export const sendCommand = aggregateName => (messageType, payload) => {
  _send(true, aggregateName, messageType, payload);
};

const sendEvent = (aggregateName, messageType, payload) => {
  _send(false, aggregateName, messageType, payload);
};

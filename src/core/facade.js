import { createMessageQueue } from "./entities/factories/messageQueue";

import {
  createAggregate as _callCreateAggregate,
  createSystemAggregate as _callCreateSystemAggregate,
  getAggregate as _callGetAggregate,
  getSystemAggregate as _callGetSystemAggregate,
  aggregateExists as _callAggregateExists
} from "./store";

const _messageQueue = createMessageQueue({
  onNext: callPayload => {
    console.table({
      id: callPayload.id,
      isCommand: callPayload.message.isCommand,
      isExposed: callPayload.message.isExposed,
      isBroadcasted: callPayload.message.isBroadcasted,
      type: callPayload.message.messageType,
      payload: callPayload.message.payload,
      source: callPayload.meta.sourceAggregate,
      target: callPayload.meta.targetAggregate
    });

    const {
      messageType,
      payload,
      isExposed,
      isBroadcasted,
      isCommand
    } = callPayload.message;
    const { sourceAggregate } = callPayload.meta;

    _callGetAggregate(
      isCommand && isBroadcasted
        ? exposedCommandHandlers.get(messageType)
        : sourceAggregate
    ).handleMessage(callPayload);

    if (isExposed) {
      if (exposedEventsMap.has(messageType)) {
        Array.from(exposedEventsMap.get(messageType)).forEach(h =>
          h(messageType, payload)
        );
      }
    }
  }
});

const _emitToQueue = (source /*, target*/) => (
  message /*, forcedTarget = null*/
) => {
  _messageQueue.pushMessage(message, source); //, forcedTarget || target);
};

_callCreateSystemAggregate(_emitToQueue);

export const createAggregate = (name, initialState) => {
  const aggregate = _callCreateAggregate(
    name,
    initialState,
    _emitToQueue(name) //, name)
  );
  return buildAggregateApi(aggregate);
};

export const selectAggregate = name => {
  const aggregate = _callGetAggregate(name);
  return buildAggregateApi(aggregate);
};

const buildAggregateApi = aggregate => ({
  ...getAggregateApi(aggregate),
  bus: {
    ...getSystemAggregateApi(aggregate)
  }
});

const getAggregateApi = aggregate => ({
  addEventHandler: (evtType, handler, onError) => {
    aggregate.addEventHandler(evtType, handler, onError);
  },
  removeEventHandler: evtType => {
    aggregate.removeEventHandler(evtType);
  },

  addCommandHandler: (cmdType, handler, onError) => {
    aggregate.addCommandHandler(cmdType, handler, onError);
  },
  removeCommandHandler: cmdType => {
    aggregate.removeCommandHandler(cmdType);
  },

  sendCommand: (cmdType, payload) => {
    _messageQueue.pushMessage(
      { isCommand: true, messageType: cmdType, payload },
      aggregate.name,
      aggregate.name
    );
  },
  broadcastCommand: (type, payload) => {
    _messageQueue.pushMessage(
      { isCommand: true, isBroadcasted: true, messageType: type, payload },
      aggregate.name
    );
  },

  consumeEvent: (evtType, handler, onError) => {
    // return _callGetSystemAggregate().addEventHandler(evtType, handler, onError);
    if (exposedEventsMap.has(evtType)) {
      exposedEventsMap.get(evtType).add(handler);
    } else {
      exposedEventsMap.set(evtType, new Set([handler]));
    }
    return () => {
      // TODO
    };
  },

  stopConsumingEvent: evtType => {
    return _callGetSystemAggregate().removeEventHandler(evtType);
  },

  observeState: onNextState => {
    return aggregate.observeState(onNextState);
  }
});

const exposedEventsMap = new Map();
const exposedCommandHandlers = new Map();

const getSystemAggregateApi = sourceAggregate => ({
  exposeCommandHandler: (cmdType, handler, onError) => {
    sourceAggregate.addCommandHandler(cmdType, handler, onError);
    if (exposedCommandHandlers.has(cmdType)) {
      throw Error(
        "Command handler for " + cmdType + " has already been published"
      );
    } else {
      exposedCommandHandlers.set(cmdType, sourceAggregate.name);
    }
    return () => {
      // TODO
      // clean exposedCommandHandlers
      sourceAggregate.removeCommandHandler(cmdType);
    };
  },
  removeCommandHandler: cmdType => {
    _callGetSystemAggregate().removeCommandHandler(cmdType);
  },
  exposeEvents: eventTypes => {
    sourceAggregate.exposeEvents(eventTypes);
  }
  // TODO exposeComponent
});

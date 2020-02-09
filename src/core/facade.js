import {
  createMessageQueue
} from './entities/factories/messageQueue';

import {
  createAggregate as _callCreateAggregate,
  createSystemAggregate as _callCreateSystemAggregate,
  getAggregate as _callGetAggregate,
  getSystemAggregate as _callGetSystemAggregate,
  aggregateExists as _callAggregateExists
} from './store';


const _messageQueue = createMessageQueue({ onNext: payload => {
  console.table({
    id: payload.id,
    isCommand: payload.message.isCommand,
    type: payload.message.messageType,
    payload: payload.message.payload,
    source: payload.meta.sourceAggregate,
    target: payload.meta.targetAggregate,
  })

  const { targetAggregate } = payload.meta;
  _callGetAggregate(targetAggregate).handleMessage(payload);

}});

const _emitToQueue = (source, target) => (message, forcedTarget = null) => {
  _messageQueue.pushMessage(message, source, forcedTarget || target)
};

_callCreateSystemAggregate(_emitToQueue);

export const createAggregate = (name, initialState) => {
  const aggregate = _callCreateAggregate(name, initialState, _emitToQueue(name, name));
  return buildAggregateApi(aggregate);
}

export const selectAggregate = (name) => {
  const aggregate = _callGetAggregate(name);
  return buildAggregateApi(aggregate);
}


const buildAggregateApi = (aggregate) => ({
  ...getAggregateApi(aggregate),
  bus: {
    ...getSystemAggregateApi(aggregate),
  }
})

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
    _messageQueue.pushMessage({ isCommand: true, messageType: cmdType, payload }, aggregate.name, aggregate.name)
  },
  broadcastCommand: (type, payload) => {
    _messageQueue.pushMessage({ isCommand: true, messageType: type, payload }, aggregate.name, _callGetSystemAggregate().name)
  },


  consumeEvent: (evtType, handler, onError) => {
    return _callGetSystemAggregate().addEventHandler(evtType, handler, onError);
  },

  stopConsumingEvent: (evtType) => {
    return _callGetSystemAggregate().removeEventHandler(evtType);
  },

  observeState: onNextState => {
    return aggregate.observeState(onNextState);

  },
})

const getSystemAggregateApi = (sourceAggregate) => ({
  exposeCommandHandler: (cmdType, handler, onError) => {
    _callGetSystemAggregate().addCommandHandler(cmdType, handler, onError, sourceAggregate.name);
  },
  removeCommandHandler: (cmdType) => {
    _callGetSystemAggregate().removeCommandHandler(cmdType);
  },
  exposeEvents: eventTypes => {
    sourceAggregate.exposeEvents(eventTypes, (type, payload) => {
      _messageQueue.pushMessage({ isCommand: false, messageType: type, payload }, sourceAggregate.name, _callGetSystemAggregate().name)
    })
  },
  // TODO exposeComponent

})

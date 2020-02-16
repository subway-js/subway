import { createCluster } from "./cluster/factory";
import { createMessageQueue } from "./messageQueue/factory";
import { createPublicMessagesProxy } from "./publicMessagesProxy/factory";

const cluster = createCluster();
const publicProxy = createPublicMessagesProxy();
const messageQueue = createMessageQueue();

const sendToQueue = sourceAggregateName => message => {
  messageQueue.pushMessage(message, sourceAggregateName); //, forcedTarget || target);
};

const processQueueMessage = callPayload => {
  console.log("> nextMessage:", callPayload);
  const {
    messageType,
    payload,
    isExposed,
    isBroadcasted,
    isCommand
  } = callPayload.message;
  const { sourceAggregateName } = callPayload.meta;

  const targetAggregate =
    isCommand && isBroadcasted
      ? publicProxy.isCommandHandled(messageType)
        ? publicProxy.getCommandOwnerName(messageType)
        : null
      : sourceAggregateName;

  targetAggregate &&
    cluster.getAggregate(targetAggregate).handleMessage(callPayload);

  if (publicProxy.hasExposedEventsSubscribers(messageType)) {
    publicProxy.notifyExposedEventSubscribers(messageType, payload);
  }
};

messageQueue.setMessageCallback(processQueueMessage);

export const createAggregate = (name, initialState) => {
  const aggregate = cluster.createAggregate(
    name,
    initialState,
    sendToQueue(name)
  );
  return buildAggregateApi(aggregate);
};

export const selectAggregate = name => {
  const aggregate = cluster.getAggregate(name);
  return buildAggregateApi(aggregate);
};

const buildAggregateApi = aggregate => ({
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
    // TODO reject command on error
    messageQueue.pushMessage(
      { isCommand: true, messageType: cmdType, payload },
      aggregate.name,
      aggregate.name
    );
  },
  broadcastCommand: (type, payload) => {
    messageQueue.pushMessage(
      { isCommand: true, isBroadcasted: true, messageType: type, payload },
      aggregate.name
    );
  },
  observeState: onNextState => {
    return aggregate.observeState(onNextState);
  },
  consumeEvent: (evtType, handler, onError) => {
    return publicProxy.subscribeToExposedEvent(evtType, handler);
  },
  exposeCommandHandler: (cmdType, handler, onError) => {
    aggregate.addCommandHandler(cmdType, handler, onError);
    const unsubscribe = publicProxy.exposeCommandHandler(
      cmdType,
      aggregate.name
    );

    return () => {
      unsubscribe();
      aggregate.removeCommandHandler(cmdType);
    };
  },
  exposeEvents: eventTypes => {
    // TODO stop exposing events
    aggregate.exposeEvents(eventTypes);
  },

  $experimental: {
    importComponent: id => publicProxy.getComponentById(id),
    exportComponent: (id, factoryFunction) => {
      publicProxy.exportComponent(id, factoryFunction, aggregate.name);
    }
  }
});

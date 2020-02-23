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
  reactToEvent: (evtType, handler) => {
    aggregate.addEventHandler(evtType, handler);
  },
  stopReactingToEvent: evtType => {
    aggregate.removeEventHandler(evtType);
  },
  reactToCommand: (cmdType, handler, onRejected) => {
    aggregate.addCommandHandler(cmdType, handler, onRejected);
  },
  stopReactingToCommand: cmdType => {
    aggregate.removeCommandHandler(cmdType);
  },
  command: (cmdType, payload = {}, onCommandRejected = null) => {
    // TODO reject command on error
    // onRejected()
    messageQueue.pushMessage(
      { isCommand: true, messageType: cmdType, payload },
      aggregate.name,
      onCommandRejected
    );
  },

  observeState: onNextState => {
    return aggregate.observeState(onNextState);
  },

  publicChannel: () => ({

    command: (type, payload) => {
      messageQueue.pushMessage(
        { isCommand: true, isBroadcasted: true, messageType: type, payload },
        aggregate.name
      );
    },
    reactToEvent: (evtType, handler, onError) => {
      return publicProxy.subscribeToExposedEvent(evtType, handler);
    },
    reactToCommand: (cmdType, handler, onError) => {
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
    getComponent: id => publicProxy.getComponentById(id),
    publishComponent: (id, factoryFunction) => {
      publicProxy.exportComponent(id, factoryFunction, aggregate.name);
    }
  }),
});

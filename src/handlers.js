import { getAggregateState, updateAggregateState } from "./aggregates";

const _topicCommandHandlers = new Map();
const _topicEventHandlers = new Map();

const setHandler = (topicHandlersMap, aggregateName) => {
  return (messageType, run, onError = null) => {
    if (!topicHandlersMap.has(aggregateName)) {
      topicHandlersMap.set(aggregateName, new Map());
    }
    // console.log('TODO', 'enforce ONE handler per cmd/evt? NO e.g. logger, or views') // TODO
    if (!topicHandlersMap.get(aggregateName).has(messageType)) {
      topicHandlersMap
        .get(aggregateName)
        .set(messageType, new Set([{ run, onError }]));
    } else {
      topicHandlersMap
        .get(aggregateName)
        .get(messageType)
        .add({ run, onError });
    }

    return () => {
      // TODO identify by ID or something
      _topicCommandHandlers
        .get(aggregateName)
        .get(messageType)
        .delete({ run, onError });
      if (
        _topicCommandHandlers.get(aggregateName).get(messageType).size === 0
      ) {
        _topicCommandHandlers.get(aggregateName).delete(messageType);
      }
    };
  };
};

export const setCommandHandler = aggregateName => {
  // TODO NO SIDE EFFECTS in command handlers
  return setHandler(_topicCommandHandlers, aggregateName);
};

export const setEventHandler = aggregateName => {
  return setHandler(_topicEventHandlers, aggregateName);
};

const runHandler = (
  isCommand,
  _topicHandlers,
  triggerEvent,
  aggregateName,
  messageType,
  payload
) => {
  // console.log('TODO', 'change messageType for ID?') // TODO
  // NOTE command:
  // 1. validate command
  // 2. validate in the current state of the aggregate
  // 3. trigger events
  // 4. store events
  if (_topicHandlers.has(aggregateName)) {
    if (_topicHandlers.get(aggregateName).has(messageType)) {
      // console.log('TODO', 'add MODEL and PRESENT to command handler') // TODO
      // const present = ({ modelProposal }) => {
      // 	_presentState({aggregateName, messageType, modelProposal})
      // }
      const handlers = Array.from(
        _topicHandlers.get(aggregateName).get(messageType)
      );
      handlers.forEach(handler => {
        const topicState = getAggregateState(aggregateName);

        try {
          const { proposal = null, events = null } =
            handler.run(topicState, payload) || {};
          if (isCommand && proposal)
            throw Error("Command cannot change aggregate state");
          // TODO save state if accepted
          // TODO save events in event store?
          // TODO topic name should be TO or FROM?
          proposal && updateAggregateState(aggregateName, proposal);
          setTimeout(() => {
            events &&
              events.forEach(e => triggerEvent(aggregateName, e.id, e.payload));
          }, 0);
        } catch (error) {
          const errorPayload = {
            type: "COMMAND_REJECTED",
            aggregateName,
            messageType,
            error
          };

          if (handler.onError) {
            handler.onError(errorPayload);
          } else {
            throw Error(errorPayload);
          }
        }
      });
    }
  }
};

export const runCommandHandlers = (
  triggerEvent,
  aggregateName,
  messageType,
  payload
) => {
  return runHandler(
    true,
    _topicCommandHandlers,
    triggerEvent,
    aggregateName,
    messageType,
    payload
  );
};

export const runEventHandlers = (
  triggerEvent,
  aggregateName,
  messageType,
  payload
) => {
  return runHandler(
    false,
    _topicEventHandlers,
    triggerEvent,
    aggregateName,
    messageType,
    payload
  );
};

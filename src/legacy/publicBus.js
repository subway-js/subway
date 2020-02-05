import { getAggregateState, updateAggregateState } from "./aggregates";

const _topicCommandHandlers = new Map();
const _topicEventHandlers = new Map();

export const setHandler = (isCommand, aggregatesHandlersMap, aggregateName) => {

  return (messageType, run, onError = null) => {
    if (!aggregatesHandlersMap.has(aggregateName)) {
      aggregatesHandlersMap.set(aggregateName, new Map());
    }

    if(aggregatesHandlersMap.has(aggregateName) && aggregatesHandlersMap.get(aggregateName).has(messageType)) {
      throw Error(`Aggregate '${aggregateName}' already has a ${isCommand ? ' command' : 'n event'} handler for '${messageType}'.`);
    }

    aggregatesHandlersMap
      .get(aggregateName)
      .set(messageType, { run, onError });

    // console.log('TODO', 'enforce ONE handler per cmd/evt? NO e.g. logger, or views') // TODO
    // if (!aggregatesHandlersMap.get(aggregateName).has(messageType)) {
    //   aggregatesHandlersMap
    //     .get(aggregateName)
    //     .set(messageType, new Set([{ run, onError }]));
    // } else {
    //   aggregatesHandlersMap
    //     .get(aggregateName)
    //     .get(messageType)
    //     .add({ run, onError });
    // }
    //
    // return () => {
    //   // TODO identify by ID or something
    //   _topicCommandHandlers
    //     .get(aggregateName)
    //     .get(messageType)
    //     .delete({ run, onError });
    //   if (
    //     _topicCommandHandlers.get(aggregateName).get(messageType).size === 0
    //   ) {
    //     _topicCommandHandlers.get(aggregateName).delete(messageType);
    //   }
    // };
  };
};

// TODO reactOnce
// TODO react on Aggregate.*
const reactors = new Map();
export const react = aggregateName => (
  sourceEvent,
  { targetAggregate = null, triggeredEvent, withPayload = p => p }
) => {
  // TODO check event format AGGREGATE.EVENT
  reactors.set(`${aggregateName}.${sourceEvent}`, [
    { targetAggregate, triggeredEvent, withPayload }
  ]);
};



export const unsetHandler = (isCommand, aggregatesHandlersMap, aggregateName) => {
  return (messageType) => {
    aggregatesHandlersMap.has(aggregateName) &&
    aggregatesHandlersMap.get(aggregateName).has(messageType) &&
    aggregatesHandlersMap.get(aggregateName).remove(messageType)
  }
}

export const setCommandHandler = aggregateName => {
  // TODO NO SIDE EFFECTS in command handlers
  return setHandler(true, _topicCommandHandlers, aggregateName);
};
export const unsetCommandHandler = aggregateName => {
  return unsetHandler(_topicCommandHandlers, aggregateName)
}

export const setEventHandler = aggregateName => {
  return setHandler(false, _topicEventHandlers, aggregateName);
};
export const unsetEventHandler = aggregateName => {
  return unsetHandler(_topicEventHandlers, aggregateName)
}

const runHandler = (
  isCommand,
  _topicHandlers,
  triggerEvent,
  aggregateName,
  messageType,
  payload
) => {
  // NOTE command:
  // 1. validate command
  // 2. validate in the current state of the aggregate
  // 3. trigger events
  // 4. store events
  if (_topicHandlers.has(aggregateName)) {
    if (_topicHandlers.get(aggregateName).has(messageType)) {
      const { run, onError } = _topicHandlers.get(aggregateName).get(messageType);

      let _aggregateState = getAggregateState(aggregateName);
        try {
          const { proposal = null, events = null } =
            (await run(_aggregateState, payload)) || {};
          if (isCommand && proposal)
            throw Error("Command cannot change aggregate state");
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

          if (onError) {
            onError(errorPayload);
          } else {
            throw Error(errorPayload);
          }
        }
    }
  }
  //
  // if (
  //   reactors.has(`${aggregateName}.${messageType}`) ||
  //   reactors.has(`*.${messageType}`)
  // ) {
  //   const aggregateReactors =
  //     reactors.get(`${aggregateName}.${messageType}`) || [];
  //   const allReactors = reactors.get(`*.${messageType}`) || [];
  //   [...allReactors, ...aggregateReactors].forEach(
  //     ({ targetAggregate, triggeredEvent, withPayload }) => {
  //       triggerEvent(
  //         targetAggregate ? targetAggregate : aggregateName,
  //         triggeredEvent,
  //         withPayload(payload)
  //       );
  //     }
  //   );
  // }
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

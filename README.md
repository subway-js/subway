# SubwayJS

Subway is a personal project that explores the idea of bringing **event sourcing & CQRS** to the browser for micro-frontends development.

## Concepts

_// todo_

- DDD concepts
- event sourcing concepts
- CQRS Concepts
- microfrontends

- aggregate
- commands & events

## Installation

Once you import SubwayJS in your HTML file

```html
<script src="/dist/subway.js"></script>
```

the library will create a global variable `Subway` in the `window` global object.

## Usage

### 1. Aggregates

You can create an aggregate by providing a unique aggregate name:

```js
const counterAggregate = Subway.createAggregate("counter");
```

You can also specify an initial state for the aggregate:

```js
const counterAggregate = Subway.createAggregate("counter", { value: 0 });
```

Additionally, you can select an existing aggregate:

```js
const counterAggregate = Subway.selectAggregate("counter");
```

### 2. Handling commands

It helps to think about aggregates as domain-relevant entities who are able to receive messages and do something with those messages. Messages can be **commands** or **events**.

You can send a command to an existing aggregate:

```js
Subway
  .selectAggregate("counter")
  .sendCommand("INIT_COUNTER", {
    incrementValue: 1
  });
```

but in order for it to have any effect, a command handler must be in place:

```js
Subway
  .selectAggregate("counter")
  .setCommandHandler(
    "INIT_COUNTER",
    (aggregateState, { incrementValue }) => {
      // ...
    }
  );
```

A **command handler** is a function that is triggered upon receiving a specific command. Inside the function we receive:
- the current aggregate state
- the command payload

A command handler mainly perform a check on the commands being received (e.g. using API calls), and the result of its execution is the trigger of **one or more events**:

```js
Subway
  .selectAggregate("counter")
  .setCommandHandler(
    "INIT_COUNTER",
    (aggregateState, { incrementValue }) => {
      return {
        events: [{
          id: 'COUNTER_READY',
          payload: {
            currentValue: 0,
            incrementValue
          }
        }]
      };
    }
  );
```

Commands cannot change the aggregate state: they represent an **intent** to act on it, and their name usually includes a **verb in the imperative mood**.


### 3. Handling events

We can't directly send an event to aggregate (they are the result of a command), but we can define a handler to make use of them:

```js
Subway
  .selectAggregate("counter")
  .setEventHandler(
    "COUNTER_READY",
    (aggregateState, { currentValue, incrementValue }) => {

      const stateProposal = {
        ...aggregateState,
        status: 'ready',
        currentValue,
        incrementValue
      };

      return {
        proposal,
        events: []
      };
    }
  );
```

Events indicate that something happened in our system, and they are named in the past tense: this is a very important difference in the context of event sourcing pattern.

The main difference between a command and an event handler is that the event handler **can change the aggregate state**: it can also trigger additional events to implement more complex business logic.

### 4. Observing state

So far we saw how to create an aggregate, send commands to it, and configure the chain of events and business logic triggered by those commands: we are still missing the ability to receive the new state of an aggregate (e.g. to implement our views).

We can observe an aggregate state in the following way:

```js
Subway
  .selectAggregate("counter")
  .observeState({
    next: ({ nextState }) => {
      // ...
    }
  });
```

Every time an aggregate state is updated, the `next` function will be invoked.

### 5. Spy

We can 'spy' on aggregates to see the ongoing commands and events activity:

```js
Subway
  .selectAggregate("counter")
  .spy('*', {
    next: payload => {
      // ...
    }
  });
```

You can either spy all commands and events (e.g. `spy('*', ...)`), or specify one (e.g. `spy('COUNTER_READY', ...)`)


## Examples

## Open topics

- events store
- aggregate state: mutable vs immutable
- ...

## Why 'subway'?

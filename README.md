
# SubwayJS
Subway is a personal project from [danilorossi](https://github.com/danilorossi) that explores the idea of bringing **event sourcing & CQRS** to the browser for micro-frontends development.

**It's in a very early stage and design/code/documentation is work in progress**

## Concepts / TODO
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

Check the [react event-sourcing example](https://github.com/subway-js/subway-react-example) as an implementation of this [this great tutorial](https://cqrs.nu/tutorial/cs/01-design)

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

### Micro-frontends

Check the [micro-frontends example](https://github.com/subway-js/subway/tree/master/examples/micro-frontends) for the full code.

Subway comes with two utility functions to setup your micro-frontends.

The first one is `Subway.helpers.composeMicroFrontends()`, which compose the application:

```html
<script type="text/javascript">
  Subway.helpers.composeMicroFrontends({
    mfs: [
      {
        id: "MF_1",
        src: "http://127.0.0.1:8080/examples/microservices/mf1.js",
        domSelector: "#mf1"
      },
      {
        id: "MF_2",
        src: "http://127.0.0.1:8080/examples/microservices/mf2.js",
        domSelector: "#mf2"
      },
      { id: "MF_3", domSelector: "#mf3" }
    ]
  });
</script>
```

It accepts a list of micro-frontends elements, that specify:
- an `ìd` to uniquely identify the micro-frontend
- a `src`, the URL to dynamically load the micro-frontend javascript file
- a `domSelector`, which identify the existing HTML element inside the page that will contain the micro-frontend

It is also possible to statically load a micro-frontend by omitting the `src` attribute and attaching the script tag to the html file as follows (it is possible to mix dynamic and static micro-frontends):

```html
<script type="text/javascript">
  Subway
    .helpers
    .composeMicroFrontends({
      mfs: [{
        id: "MF_1",
        src: "http://127.0.0.1:8080/examples/microservices/mf1.js",
        domSelector: "#mf1"
      }, {
        id: "MF_3",
        domSelector: "#mf3"
      }]
    });
</script>
<script id="MF_3" src="/examples/microservices/mf3.js"></script>
```

The second utility function is the one used by each micro-frontend to install itself into the application container:

```js
Subway
  .helpers
  .installMicroFrontend('MF_1', ({ domSelector }) => {
  // bootstrap your app in the HTML element identified by 'domSelector'
});
```

## Open topics

- events store? (time machine, offline capabilities, state snapshot for quick startup)
- aggregate state: mutable vs immutable (enforce immutability VS embrace mutability with SAM-ish approach)
- investigate web workers integration


# SubwayJS
Subway is a personal project from [danilorossi](https://github.com/danilorossi) that explores the idea of bringing **event sourcing & CQRS** to the browser for micro-frontends development.

## Disclaimer

**SubwayJS is in a very early stage, and design/code/documentation is work in progress**

## Background

While working as FE Architect a few years ago, I had the luck to face a very challenging problem that led me and my team designing and implementing what is now called a 'micro-frontends' architecture - we didn't really know at that time, it was around 2016.

At the same time, I have been lucky enough to work very closely to some great BE engineers implementing a backend system with a DDD approach, CQRS, microservices, a message broker, and so on.

After that, as an engineering manager, I also understood how microservices and microfrontends - and we could also mention DevOps and Domain Driven Design - are not only a technical answer to technical problems: they are also a technical answer to 'people' and management problems.

With this project, I want to explore how the approach that I found so valuable and interesting in the backend can be applied on the frontend as a way to:
- implement a micro-frontend approach
- describe a system in a way that is easily understandable, manageable and expandable, for monolithic frontends as well as micro-frontends
- keep coding :) which I don´t do anymore working as a Delivery Manager

## Current status

I started implementing [this nice tutorial](https://cqrs.nu/tutorial/cs/01-design) as a simple HTML application (check the `/example/event-sourcing/` folder) to investigate the model, the API and the overall idea and design.

I also explored the microfrontends approach in the `/example/micro-frontend/` page.

I am now implementing the same tutorial as a [react web application](https://github.com/subway-js/subway-react-restaurant).

**Next steps will be:**
- implement an actual use case e.g. web page with authentication, navigation, etc. to see how the model adapt to a real use case
- implement the same web application with micro frontends

This project touches many topics, and I am going to use this example-based approach to find a good answer to such topics, e.g.:
- *state management*: mutable or immutable? If mutable, how can SAM architecture inspire the framework?
- *events store*: do we need one? How do we manage offline and page reload? How do we synch with the backend?
- *async* command/event handlers
- is this framework *performant*, or is there any bottleneck? How to integrate *WebWorkers*?

Plus many others that will show up during this investigation.

## Installation

Import SubwayJS in your HTML file using *unpkg*:

```html
<script src="https://unpkg.com/@subway-js/subway@latest/dist/subway.js"></script>
```

The library will create a global variable `Subway` in the `window` global object.

## Current model and API

The model and  API can (and will) change based on the on-going investigation: the following description is the current state of SubwayJS, which matches the overall idea of having:

- **aggregates**, the basic domain entity, with their own in memory **store**

- **commands**, which are the trigger of events in the aggregates scope

- **events**, which are things that happened in the system and that can change an aggregate's state

- the ability to **observe** an aggregate's state, in order to be notified when a change happens

- the ability to **spy** on any aggregate message bus, to listen to events and react accordingly

- a **micro-frontends** orchestration utility, implemented with the same SubwayJS library through aggregates, commands and events

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

## Concepts

**TO DO: a quick introduction to the main concept that inspire SubayJS, such as:**
- DDD concepts
- event sourcing concepts
- CQRS Concepts
- microfrontends

- aggregate
- commands & events

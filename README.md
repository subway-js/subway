
# SubwayJS
Subway is a personal project from [danilorossi](https://github.com/danilorossi) that explores the idea of bringing some of the patterns and benefits of **Domain Driven Design, Event Sourcing and CQRS** to the browsers, for frontend and micro-frontends development.

That's a big statement, so let's first of all clarify how those patterns inspire Subway.

From **Domain Driven Design**:
- Subway promotes a software design that identifies clear sub-systems and boundaries, which not only leads to a more self-explaining codebase structure, it also helps shaping your development team structure, and prepares you for an easy transition to a micro-frontends model

From **Event Sourcing and CQRS**:
- Subway provides a *commands & events* way to describe a system behaviour that's easy to understand and to talk about. It also promotes the decoupling of each sub-system which makes it easy to switch implementations and add new features

## Status

**SubwayJS is in its early stage**

I am working on a few projects (that you can find in the SubwayJS github account, and described below as well) as a way to investigate the final API, architecture, and features of SubwayJS: please be aware that the codebase structure, API and documentation are in a very dynamic state at the moment.

## Projects

Here's some details about the project I am working on at the moment to help me shaping SubwayJS:

- there is a [nice tutorial](https://cqrs.nu/tutorial/cs/01-design) that guides the reader toward the design of a system in a 'CQRS' way: `/example/event-sourcing/` provide a very basic implementation

- `/example/micro-frontend/` explores the micro-frontends support

- I implemented the [tutorial mentioned before](https://cqrs.nu/tutorial/cs/01-design) as a [react web application](https://github.com/subway-js/subway-react-restaurant), to start understanding how SubwayJS development looks like with ReactJS.

- I started implementing an actual use case, an [ecommerce react website](https://github.com/subway-js/subway-react-ecommerce), to understand the value of the library in a real use-case (not tables, but sessions and API calls), and also to start thinking about a possible subway-react utility library

## Next steps

- Finalise the API design
- Adapt the [ecommerce react website](https://github.com/subway-js/subway-react-ecommerce] to use the latest API version
- Create a react library to support SubwayJS apps development with ReactJS
- Create a micro-frontends project based on the ecommerce one

And along the road:
- Add testing
- CI/CD pipeline
- API documentation (maybe integrating flow-type)
and everything else a library should have (who said 'a logo'?)

## --- the following is not up to date ---

## Concepts

- Aggregates
- etc.


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

- a way to **trigger events** as a result of other events from a different aggregate

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


### 6. Automatic trigger on event

If we want to do something as a result of an event in another aggregate, the steps are:
- in aggregate B, spy aggregate A for the event E
- once the spy callback is fired, send an aggregate command like B.notify_event_E_from_A
- a command handler should receive this, and trigger an event like B.event_E_from_A_fired

We can make this shorter by using the `triggerOn` function:

```js

Subway
  .selectAggregate("AggregateB")
  .triggerAfter("Event1 ", {
      targetAggregate: "AggregateA",
      triggeredEvent: 'Event2',
      withPayload: (event1Payload) => event2Payload
    });
```

The parameter `withPayload` is optional: if not specified, the same payload will be used for the triggered event.

The parameter `targetAggregate` is optional: if not specified, the source aggregate will be used as target aggregate.

This can be useful to create chain of events inside the same aggregate, when no business logic is required in between, as a short alternative to eventHandlers:

```js

Subway
  .selectAggregate("MyAggregate")
  .triggerAfter("Event ", {
      triggeredEvent: 'AfterEvent',
    });
```

It is also possible to listen to a specific event no matter the source aggregate, so that we can create an aggregate that can handle a specific message - sort of an API, e.g.:

```js

Subway
  .selectAggregate("*")
  .triggerAfter("LoginModalRequestSubmitted ", {
    targetAggregate: 'AggregateA'
      triggeredEvent: 'LoginModalVisibilityRequested',
    });
```

In this case, it is mandatory to specify the target aggregate.

### 7. Respond to external commands

As an alternative to `selectAggregate("*").triggerAfter(...)`, we can use the `respondToCommand` helper function, as a preferred way to declare
the **public** interface of our aggregate:

 ```js
 Subway
   .respondToCommand("SHOW_LOGIN_MODAL ", {
      targetAggregate: 'SessionAggregate'
       triggeredEvent: 'LoginModalRequested',
     });
 ```

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

**TO DO: a quick introduction to the main concept that inspire SubwayJS, such as:**
- DDD concepts
- event sourcing concepts
- CQRS Concepts
- microfrontends

- aggregate
- commands & events

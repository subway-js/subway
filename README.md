
# SubwayJS
Subway is a personal project from [danilorossi](https://github.com/danilorossi) that explores the idea of bringing some of the patterns and benefits of **Domain Driven Design, Event Sourcing and CQRS** to the browsers, for frontend and micro-frontends development.

That's a big statement, so let's first of all clarify how those patterns inspire Subway.

From **Domain Driven Design**:
- Subway promotes a software design that identifies clear sub-systems and boundaries, which not only leads to a more self-explaining codebase structure, it also helps shaping your development team structure, and prepares you for an easy transition to a micro-frontends model

From **Event Sourcing and CQRS**:
- Subway provides a *commands & events* way to describe a system behaviour that's easy to understand and to talk about. It also promotes the decoupling of each sub-system, which makes it easy to switch implementations and add new features

## Status

**SubwayJS is in early stage**

I am working on some projects (check the SubwayJS GitHub account or keep reading) as a way to shape the final API, architecture, and features of SubwayJS: please be aware that **the codebase structure, API and documentation are in a very dynamic state at the moment**. The **projects listed below shouldn't be consider a final example of how to use this library as well**: they are changing frequently and may not be using the latest SubwayJS version.

## Projects

Here's some details about the projects that are helping me shaping SubwayJS:

- there is a [nice tutorial](https://cqrs.nu/tutorial/cs/01-design) that guides the reader toward the design of a system in a 'CQRS' way: `/example/event-sourcing/` provide a very basic implementation

- `/example/micro-frontend/` explores the micro-frontends support

- I implemented the [tutorial mentioned before](https://cqrs.nu/tutorial/cs/01-design) as a [react web application](https://github.com/subway-js/subway-react-restaurant), to start understanding how SubwayJS development looks like with ReactJS.

- I started implementing an actual use case, an [ecommerce react website](https://github.com/subway-js/subway-react-ecommerce), to understand the value of the library in a real use-case (session, API calls, communication between sub-systems), and also to start thinking about a possible subway-react utility library

## Understanding SubwayJS model

*TODO: use [ecommerce react website](https://github.com/subway-js/subway-react-ecommerce) as an example - describe in its README the app design approach*

*TODO: provide context and differences e.g. MVC, SAM, React, Redux, Sagas etc.*

SubwayJS is about structuring your application, codebase, logic and teams: it doesn't make any assumptions on the UI library you are going to use.

*TODO: clarify app design approach - identify domains/aggregates of the system*

The current state of SubwayJS matches the overall idea of having:

- **aggregates** (or sub-systems, or domains), the main SubwayJS entities, with their own in-memory **store**

- a message broker, where **messages** are sent and dispatched - messages can be one of the following two types:

  - **commands** are proactively sent (e.g. in response to a UI action)

  - **events**, which are triggered by commands or other events, and represent facts, things that happened in the system,  and that can change an aggregate's state

- aggregates react to messages through commands or events **handlers**

- the ability to **observe** an aggregate's state, in order to be notified when a change happens - and update the UI accordingly

All of this happens in each aggregate's scope, with commands and events that are very specific, and the specific aggregate's state being updated. But, in order to have a working application, we need a way for aggregates to communicate between each other - they do it by:

- **exposing commands handler**, as a way to define a public API for other aggregates (e.g. aggregate Session could expose a command handler for *LOGOUT* or *SHOW_LOGIN_MODAL* commands, and other aggregates could *broadcast* such messages to trigger the logic)
- **exposing events**, as a way to communicate to other aggregates who can subscribe to such events e.g. a ShoppingCart UI container in a Payment aggregate could subscribe to the **USER_LOGGED_IN** event to know when to show a *proceed to checkout* button)

Features under investigation:

- the ability to **spy** on any message going through the message queue bus

- the ability to **expose components** to other aggregates e.g. the Payment aggregate could have a ShoppingCart view, and could expose a shopping cart dropdown button to be used in the navigation bar - to show the actual list of items and a checkout button)

## Micro-frontends support

Having highly decoupled aggregates (each of them with its own logic, entities, state and UI), makes it easy to transition to a micro-frontends approach.

SubwayJS provides a **micro-frontends orchestration utility** (implemented with the same SubwayJS library through aggregates, commands and events) to make it easy to split each aggregate (or domain, or sub-system) into its own project/codebase with its own release pipeline.

## Next steps

- Finalise the API design
- Adapt the [ecommerce react website](https://github.com/subway-js/subway-react-ecommerce] to use the latest API version
- Create a react library to support SubwayJS apps development with ReactJS
- Create a micro-frontends project based on the ecommerce one

And along the road:
- Add testing
- CI/CD pipeline
- API documentation


## Installation

Import SubwayJS in your HTML file using *unpkg*:

```html
<script src="https://unpkg.com/@subway-js/subway@latest/dist/subway.js"></script>
```

The library will create a global variable `Subway` in the `window` global object.

## API

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
  .command("INIT_COUNTER", {
    incrementValue: 1
  });
```

but in order for it to have any effect, a command handler must be in place:

```js
Subway
  .selectAggregate("counter")
  .reactToCommand(
    "INIT_COUNTER",
    ({ state, payload }) => {
      const { incrementValue } = payload;
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
  .reactToCommand(
    "INIT_COUNTER",
    ({ state, payload }, { triggerEvents }) => {
      const { incrementValue } = payload;
      triggerEvents([{
        id: 'COUNTER_READY',
        payload: {
          currentValue: 0,
          incrementValue
        }
      }]);
    }
  );
```

Commands cannot change the aggregate state: they represent an **intent** to act on it, and their name usually includes a **verb in the imperative mood**.


### 3. Handling events

We can't directly send an event to aggregate (they are the result of a command), but we can define a handler to make use of them:

```js
Subway
  .selectAggregate("counter")
  .reactToEvent(
    "COUNTER_READY",
    ({ state, payload }, { updateState, triggerEvents }) => {
      const { currentValue, incrementValue } = payload;
      updateState({
        ...aggregateState,
        status: 'ready',
        currentValue,
        incrementValue
      });
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
  .observeState(nextState => {
      // ...
  });
```

Every time an aggregate state is updated, the `next` function will be invoked.

### 5. Exposing commands

```js
Subway
  .selectAggregate("counter")
  .publicChannel()
  .reactToCommand(
    "RESET_COUNTER",
    ({ state, payload }, { triggerEvents }) => {
      triggerEvents([{ id: "COUNTER_RESET_REQUEST_RECEIVED" }])
    }
  );
```

```js
anotherAggregate
  .publicChannel()
  .command("RESET_COUNTER");
```

### 6. Exposing Events


```js
Subway
  .selectAggregate("counter")
  .reactToEvent(
    "COUNTER_READY",
    ({ state, payload }, { broadcastEvent }) => {
      const { currentValue, incrementValue } = payload;

      broadcastEvent('SOMETHING_INTERESTING_HAPPENED', payload);

      // ..
    }
  );
```


```js
anotherAggregate
  .publicChannel()
  .reactToEvent("SOMETHING_INTERESTING_HAPPENED", payload => {
    // ...
  });
```


### 7. Exposing Components


```js
Subway
  .selectAggregate("counter")
  .publicChannel()
  .publishComponent(
    "ExportedComponent",
    (args) => {
      // return component
    }
  );
```

```js
anotherAggregate
  .publicChannel()
  .getComponent("ExportedComponent");
```

### Micro-frontends

Check the [micro-frontends example](https://github.com/subway-js/subway/tree/master/examples/micro-frontends) for the full code.

Subway comes with two utility functions to setup your micro-frontends.

The first one is `Subway.helpers.composeMicroFrontends()`, which compose the application:

```html
<script type="text/javascript">
  Subway
    .microFrontends()
    .compose({
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
    .microFrontends()
    .compose({
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
  .microFrontends()
  .install('MF_1', ({ domSelector }) => {
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

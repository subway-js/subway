
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
    // Mount function:
    (params, { selector, element }) => {
      /*
        Mount the component on the DOM
        element specified by:
        - the selector, to be used with document.querySelector
        - or the element itself

        Parameters are used to customize the component
      */
    },
    // Unmount function:
    ({ selector, element }) => {
      /*
        Cleanup
      */
    }
  );
```

```js
anotherAggregate
  .publicChannel()
  .importComponent(
    "ExportedComponent",
    ({ mount }) => {
      mount({
        label: 'Custom Button'
      }, {
        selector: '#buttonContainer'
      })
    });
```

### Managing errors

This is a first level of errors management we can perform in SubwayJS is **command rejection**: when triggering a command, it may be rejected by using the `rejectCommand` function injected in any command handler:

```js
Subway
  .selectAggregate("counter")
  .reactToCommand(
    "INIT_COUNTER",
    ({ payload }, { triggerEvents, rejectCommand }) => {

      if(!payload.incrementValue) {
        rejectCommand( 'Missing required field for INIT_COUNTER command', {
          fields: ['incrementValue']
        });
        return;
      }

      triggerEvents([{
        id: 'COUNTER_READY',
        payload: {
          currentValue: 0,
          incrementValue: payload.incrementValue
        }
      }]);
    }
  );
```

This mechanism can be used for simple scenarios like:
- payload validation
- error on API response
etc.

We can handle a rejection by providing a callback when triggering a command:

```js
Subway
  .selectAggregate("counter")
  .command("INIT_COUNTER", {
    incrementValue: 1
  }, ({ reasonString, meta }) => {
    // ...
  });
```

What happens when something happens in some other point of a SubwayJS application lifecycle?

When we talk about errors in JavaScript, we usually think about try/catch clauses, callbacks, or rejecting promises. SubwayJS approach to errors is to consider them as any other event in the system: they just describe a different path or flow.

As an example, when logging in, there are a variety of things that could go wrong:
- wrong credentials
- no internet connection
- authentication token expired

And if we are already logged in, and we are processing a payment:
- the user may not have enough funds
- some billing information might be required
- updated T&Cs may need to be accepted
etc.

Commands rejection is a useful tool, but when an exception/error occurs inside an event handler (and we can have 'sagas' that involve multiple event handlers), we don't have such tool as we have already lost any link to the original command that triggered the chain of events.

Event handlers can trigger meaningful events, that have a real meaning in the current aggregate, e.g.:
- AuthenticationTokenExpired
- T&CAcceptanceRequired
- etc.

With such events we can send the relevant payload for our next aggregate store in order to provide all the details we need in the UI to properly deal with any error (or do something in background e.g. refresh an authentication token without even bothering the user).


### Micro-frontends

Check the [micro-frontends example](https://github.com/subway-js/subway/tree/master/examples/micro-frontends) for the full code or [subway-react-ecommerce-microfrontends](https://github.com/subway-js/subway-react-ecommerce-microfrontends) for microfrontends with SubwayJS and React.

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


const domain = window.Subway.domain('counterDomain')
const { engine, view } = domain;

engine.stores.create('counterStore', { counter: 10 })

view.stores.observe('counterStore', (state) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', state)
})


engine.broker.onCommand('increment', (message, state, domainEvent) => {
    const nextValue = state.counterStore.counter + message.payload.amount;
    return domainEvent('incrementAdded', { counter: nextValue })
});

engine.stores.updateOnEvent('counterStore', 'incrementAdded', (state, payload) => {
  return {
    ...state,
    counter: payload.counter
  }
});


 
 view.broker.pushCommand('increment', { amount: 20 })

 view.broker.pushCommand('increment', { amount: 30 })

// setTimeout(() => {
//   view.broker.pushCommand('increment', { amount: 30 })
// }, 2000)
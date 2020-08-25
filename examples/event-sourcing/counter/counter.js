
(function() {
  
  const domain = window.Subway.domain('counterDomain')
  const { engine, view } = domain;

  engine.stores.create('counterStore', { counter: 10 })

  engine.broker.onCommand('increment', (message, stores, domainEvent) => {
      const nextValue = stores.counterStore.counter + message.payload.amount;
      return domainEvent('incrementAdded', { counter: nextValue })
  });

  engine.stores.updateOnEvent('counterStore', 'incrementAdded', (state, payload) => {
    return {
      ...state,
      counter: payload.counter
    }
  });


  
  view.stores.observe('counterStore', (state) => {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', state)
  })

  view.broker.pushCommand('increment', { amount: 40 })

  setInterval(() => {
    view.broker.pushCommand('increment', { amount: 50 })
  }, 2000);

})();
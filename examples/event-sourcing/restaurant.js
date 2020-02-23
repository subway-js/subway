(function() {
  const AGGREGATE = "TabAggregate";

  const CMD = {
    OPEN_TAB: "OpenTab",
    PLACE_ORDER: "PlaceOrder",
    MARK_DRINK_SERVED: "MarkDrinksServed",
    MARK_FOOD_SERVED: "MarkFoodServed",
    CLOSE_TAB: "CloseTab"
  };

  const EVT = {
    TAB_OPENED: "TabOpened",
    DRINKS_ORDERED: "DrinksOrdered",
    FOOD_ORDERED: "FoodOrdered",
    DRINK_SERVED: "DrinksServed",
    FOOD_SERVED: "FoodServed",
    TAB_CLOSED: "TabClosed"
  };

  const EX = {
    TAB_NOT_OPEN: "Tab is not open",
    DRINKS_NOT_OUTSTANDING: "No outstanding drinks for this tab",
    FOOD_NOT_OUTSTANDING: "No outstanding food for this tab"
  };

  Subway.createAggregate(AGGREGATE, { open: false, servedItemsValue: 0 });

  const tabAggregate = Subway.selectAggregate(AGGREGATE);

  const stopObserving = tabAggregate.observeState(nextState => {
    console.log(nextState);
    setTimeout(() => {
      const el = document.querySelector("#root");
      el.innerHTML =
        el.innerHTML + "\n------------\n" + JSON.stringify(nextState, null, 2);
    }, 0);
  });

  tabAggregate.reactToCommand(CMD.OPEN_TAB, ({ state, payload }, { triggerEvents, rejectCommand }) => {

    if(!payload.table || !payload.waiter) {
      rejectCommand('Missing required fields in OPEN_TAB command payload', { missing: ['table', 'waiter']})
      return;
    }
    triggerEvents([{ id: EVT.TAB_OPENED, payload: { id: 0, table: 1, waiter: 1 } }])

  });

  tabAggregate.reactToEvent(EVT.TAB_OPENED, ({ state, payload}, { updateState }) => {
    updateState({ open: true })
  });

  tabAggregate.reactToCommand(CMD.PLACE_ORDER, ({ state, payload }, { triggerEvents }) => {
    if (!state.open) throw Error(EX.TAB_NOT_OPEN);
    const drinkSample = payload.orderedItems.filter(i => i.isDrink);
    const foodSample = payload.orderedItems.filter(i => !i.isDrink);

    triggerEvents([
      { id: EVT.DRINKS_ORDERED, payload: drinkSample },
      { id: EVT.FOOD_ORDERED, payload: foodSample }
    ])
  });

  tabAggregate.reactToEvent(EVT.DRINKS_ORDERED, ({ state, payload }, { updateState }) => {
    updateState({
      ...state,
      outstandingDrinks: payload
    })
  });

  tabAggregate.reactToEvent(EVT.FOOD_ORDERED, ({ state, payload }, { updateState }) => {
    updateState({
        ...state,
        outstandingFood: payload
      })
  });

  tabAggregate.reactToCommand(
    CMD.MARK_DRINK_SERVED,
    ({ state, payload }, { triggerEvents }) => {
      if (!state.open) throw Error(EX.TAB_NOT_OPEN);

      if (state.outstandingDrinks) {
        // TODO check we ordered what we are trying to serve
        // if( ... ) throw Error(EX.DRINKS_NOT_OUTSTANDING)
      } else {
        throw Error(EX.DRINKS_NOT_OUTSTANDING);
      }

      triggerEvents([{ id: EVT.DRINK_SERVED, payload }])
    },
    error => {
      console.log("# Error sending command:", error);
    }
  );

  tabAggregate.reactToEvent(EVT.DRINK_SERVED, ({ state, payload }, { updateState }) => {
    const nextOutstandingDrinks = state.outstandingDrinks.filter(
      drink => !payload.menuNumbers.includes(drink.menuNumber)
    );
    const temp = state.outstandingDrinks.filter(drink =>
      payload.menuNumbers.includes(drink.menuNumber)
    );
    const servedItemsValue = temp.reduce((acc, curr) => acc + curr.price, 0);
    updateState({
      ...state,
      servedItemsValue: (state.servedItemsValue || 0) + servedItemsValue,
      outstandingDrinks: nextOutstandingDrinks
    })
  });

  tabAggregate.reactToCommand(CMD.MARK_FOOD_SERVED, ({ state, payload }, { triggerEvents }) => {
    if (!state.open) throw Error(EX.TAB_NOT_OPEN);

    if (state.outstandingFood) {
      // TODO check we ordered what we are trying to serve
      // if( ... ) throw Error(EX.DRINKS_NOT_OUTSTANDING)
    } else {
      throw Error(EX.FOOD_NOT_OUTSTANDING);
    }

    triggerEvents([{ id: EVT.FOOD_SERVED, payload }])
  });

  tabAggregate.reactToEvent(EVT.FOOD_SERVED, ({ state, payload }, { updateState }) => {
    const nextOutstandingFood = state.outstandingFood.filter(
      food => !payload.menuNumbers.includes(food.menuNumber)
    );
    const temp = state.outstandingFood.filter(food =>
      payload.menuNumbers.includes(food.menuNumber)
    );
    const servedItemsValue = temp.reduce((acc, curr) => acc + curr.price, 0);

    updateState({
      ...state,
      servedItemsValue: (state.servedItemsValue || 0) + servedItemsValue,
      outstandingFood: nextOutstandingFood
    })
  });

  tabAggregate.reactToEvent(EVT.TAB_CLOSED, ({ state, payload }) => {
    const aggr = Subway.selectAggregate(AGGREGATE);
    aggr.stopReactingToCommand(CMD.OPEN_TAB);
    aggr.stopReactingToCommand(CMD.PLACE_ORDER);
    aggr.stopReactingToCommand(CMD.MARK_FOOD_SERVED);
    aggr.stopReactingToCommand(CMD.MARK_DRINK_SERVED);
    aggr.stopReactingToCommand(CMD.CLOSE_TAB);

    aggr.stopReactingToEvent(EVT.TAB_OPENED)
    aggr.stopReactingToEvent(EVT.DRINKS_ORDERED)
    aggr.stopReactingToEvent(EVT.FOOD_ORDERED)
    aggr.stopReactingToEvent(EVT.DRINK_SERVED)
    aggr.stopReactingToEvent(EVT.FOOD_SERVED)
    aggr.stopReactingToEvent(EVT.TAB_CLOSED)

    setTimeout(() => stopObserving());
    return {
      proposal: {
        open: false,
        servedItemsValue: 0
      }
    };
  });

  tabAggregate.reactToCommand(CMD.CLOSE_TAB, ({ state, payload }) => {
    const { id, amountPaid } = payload;
    const orderValue = state.servedItemsValue;
    const tip = amountPaid - orderValue;
    return {
      events: [
        {
          id: EVT.TAB_CLOSED,
          payload: { id: 0, amountPaid, orderValue, tip }
        }
      ]
    };
  });

  // --------------------------------------- //
  // ------------- SIMULATE ---------------- //
  // --------------------------------------- //

  tabAggregate.command(CMD.OPEN_TAB, { id: 0 }, (payload) => {
    console.error('[COMMAND REJECTED] >> CMD.OPEN_TAB:', payload)
  });

  tabAggregate.command(CMD.OPEN_TAB, { id: 0, table: 1, waiter: 1 });

  const foodSample = {
    menuNumber: 10,
    description: "Hamburguesa",
    isDrink: false,
    price: 15
  };
  const drinkSample = {
    menuNumber: 20,
    description: "Zero Coke",
    isDrink: true,
    price: 3
  };
  const orderSample = {
    id: 1,
    orderedItems: [foodSample, drinkSample]
  };

  setTimeout(() => {
    tabAggregate.command(CMD.PLACE_ORDER, orderSample);
  }, 500);

  setTimeout(() => {
    tabAggregate.command(CMD.MARK_DRINK_SERVED, {
      id: 0,
      menuNumbers: [20]
    });
    tabAggregate.command(CMD.MARK_FOOD_SERVED, {
      id: 0,
      menuNumbers: [10]
    });
  }, 1500);

  setTimeout(() => {
    tabAggregate.command(CMD.CLOSE_TAB, { id: 0, amountPaid: 20 });
  }, 2500);
})();

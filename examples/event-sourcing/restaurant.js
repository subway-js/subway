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

  // tabAggregate.bus.exposeCommandHandler("PublicCMD", ({ state, payload }) => {
  //   console.log(">>>>>>>>", payload);
  // });
  // tabAggregate.bus.exposeEvents([EVT.TAB_OPENED]);
  // setTimeout(() => {
  //   tabAggregate.broadcastCommand("PublicCMD", { foo: "bar" });
  //   setTimeout(() => {
  //     tabAggregate.bus.removeCommandHandler("PublicCMD");
  //     tabAggregate.broadcastCommand("PublicCMD", { foo: "bar" });
  //   });
  // }, 1000);
  //
  // tabAggregate.consumeEvent(EVT.TAB_OPENED, ({ payload }) => {
  //   console.log("::::::CONSUMING EVENT", payload);
  //   tabAggregate.stopConsumingEvent(EVT.TAB_OPENED);
  // });

  const stopObserving = tabAggregate.observeState(nextState => {
    console.log(nextState);
    setTimeout(() => {
      const el = document.querySelector("#root");
      el.innerHTML =
        el.innerHTML + "\n------------\n" + JSON.stringify(nextState, null, 2);
    }, 0);
  });

  tabAggregate.addCommandHandler(CMD.OPEN_TAB, ({ state, payload }) => {
    return {
      events: [{ id: EVT.TAB_OPENED, payload: { id: 0, table: 1, waiter: 1 } }]
    };
  });

  tabAggregate.addEventHandler(EVT.TAB_OPENED, ({ state, payload }) => {
    return {
      proposal: { open: true }
    };
  });

  tabAggregate.addCommandHandler(CMD.PLACE_ORDER, ({ state, payload }) => {
    if (!state.open) throw Error(EX.TAB_NOT_OPEN);
    const drinkSample = payload.orderedItems.filter(i => i.isDrink);
    const foodSample = payload.orderedItems.filter(i => !i.isDrink);

    return {
      events: [
        { id: EVT.DRINKS_ORDERED, payload: drinkSample },
        { id: EVT.FOOD_ORDERED, payload: foodSample }
      ]
    };
  });

  tabAggregate.addEventHandler(EVT.DRINKS_ORDERED, ({ state, payload }) => {
    return {
      proposal: {
        ...state,
        outstandingDrinks: payload
      }
    };
  });

  tabAggregate.addEventHandler(EVT.FOOD_ORDERED, ({ state, payload }) => {
    return {
      proposal: {
        ...state,
        outstandingFood: payload
      }
    };
  });

  tabAggregate.addCommandHandler(
    CMD.MARK_DRINK_SERVED,
    ({ state, payload }) => {
      if (!state.open) throw Error(EX.TAB_NOT_OPEN);

      if (state.outstandingDrinks) {
        // TODO check we ordered what we are trying to serve
        // if( ... ) throw Error(EX.DRINKS_NOT_OUTSTANDING)
      } else {
        throw Error(EX.DRINKS_NOT_OUTSTANDING);
      }

      return {
        events: [{ id: EVT.DRINK_SERVED, payload }]
      };
    },
    error => {
      console.log("# Error sending command:", error);
    }
  );

  tabAggregate.addEventHandler(EVT.DRINK_SERVED, ({ state, payload }) => {
    const nextOutstandingDrinks = state.outstandingDrinks.filter(
      drink => !payload.menuNumbers.includes(drink.menuNumber)
    );
    const temp = state.outstandingDrinks.filter(drink =>
      payload.menuNumbers.includes(drink.menuNumber)
    );
    const servedItemsValue = temp.reduce((acc, curr) => acc + curr.price, 0);
    return {
      proposal: {
        ...state,
        servedItemsValue: (state.servedItemsValue || 0) + servedItemsValue,
        outstandingDrinks: nextOutstandingDrinks
      }
    };
  });

  tabAggregate.addCommandHandler(CMD.MARK_FOOD_SERVED, ({ state, payload }) => {
    if (!state.open) throw Error(EX.TAB_NOT_OPEN);

    if (state.outstandingFood) {
      // TODO check we ordered what we are trying to serve
      // if( ... ) throw Error(EX.DRINKS_NOT_OUTSTANDING)
    } else {
      throw Error(EX.FOOD_NOT_OUTSTANDING);
    }

    return {
      events: [{ id: EVT.FOOD_SERVED, payload }]
    };
  });

  tabAggregate.addEventHandler(EVT.FOOD_SERVED, ({ state, payload }) => {
    const nextOutstandingFood = state.outstandingFood.filter(
      food => !payload.menuNumbers.includes(food.menuNumber)
    );
    const temp = state.outstandingFood.filter(food =>
      payload.menuNumbers.includes(food.menuNumber)
    );
    const servedItemsValue = temp.reduce((acc, curr) => acc + curr.price, 0);

    return {
      proposal: {
        ...state,
        servedItemsValue: (state.servedItemsValue || 0) + servedItemsValue,
        outstandingFood: nextOutstandingFood
      }
    };
  });

  tabAggregate.addEventHandler(EVT.TAB_CLOSED, ({ state, payload }) => {
    const aggr = Subway.selectAggregate(AGGREGATE);
    aggr.removeCommandHandler(CMD.OPEN_TAB);
    aggr.removeCommandHandler(CMD.PLACE_ORDER);
    aggr.removeCommandHandler(CMD.MARK_FOOD_SERVED);
    aggr.removeCommandHandler(CMD.MARK_DRINK_SERVED);
    aggr.removeCommandHandler(CMD.CLOSE_TAB);
    setTimeout(() => stopObserving());
    return {
      proposal: {
        open: false,
        servedItemsValue: 0
      }
    };
  });

  tabAggregate.addCommandHandler(CMD.CLOSE_TAB, ({ state, payload }) => {
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

  tabAggregate.sendCommand(CMD.OPEN_TAB, { id: 0, table: 1, waiter: 1 });

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
    tabAggregate.sendCommand(CMD.PLACE_ORDER, orderSample);
  }, 500);

  setTimeout(() => {
    tabAggregate.sendCommand(CMD.MARK_DRINK_SERVED, {
      id: 0,
      menuNumbers: [20]
    });
    tabAggregate.sendCommand(CMD.MARK_FOOD_SERVED, {
      id: 0,
      menuNumbers: [10]
    });
  }, 1500);

  setTimeout(() => {
    tabAggregate.sendCommand(CMD.CLOSE_TAB, { id: 0, amountPaid: 20 });
  }, 2500);
})();

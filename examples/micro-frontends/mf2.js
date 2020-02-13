(function() {
  const AGGREGATE_NAME = "MF_2";
  let $element = null;
  const log = line => {
    let current = $element.innerHTML;
    $element.innerHTML = " > " + line + "<br/>" + current;
  };
  Subway.$helpers.installMicroFrontend(AGGREGATE_NAME, ({ domSelector }) => {
    $element = document.querySelector(domSelector);
    log(AGGREGATE_NAME + " mounted on " + domSelector);
    init();
  });

  const init = () => {
    const aggregate = Subway.createAggregate(AGGREGATE_NAME, { sum: 0 });

    aggregate.observeState(({ sum }) => {
      log("current value: " + sum);
    });

    // setTimeout(
    // () =>

    //   1000
    // );

    aggregate.bus.exposeEvents(["ADD_TO_ACCUMULATOR_REQUESTED"]);

    aggregate.bus.exposeCommandHandler(
      "ADD_TO_ACCUMULATOR",
      ({ state, payload }) => {
        return {
          events: [{ id: "ADD_TO_ACCUMULATOR_REQUESTED", payload }]
        };
      }
    );

    aggregate.addEventHandler(
      "ADD_TO_ACCUMULATOR_REQUESTED",
      ({ state, payload }) => {
        return {
          proposal: {
            sum: state.sum + payload.amount
          }
        };
      }
    );

    log("ADD_TO_ACCUMULATOR command exposed");
  };
})();

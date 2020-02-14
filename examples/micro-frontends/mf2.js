(function() {
  const MF_ID = "MF_2";
  const AGGREGATE_NAME = "ACCUMULATOR";
  let $element = null;
  const log = line => {
    let current = $element.innerHTML;
    $element.innerHTML = " > " + line + "<br/>" + current;
  };
  Subway.$microFrontends.install(MF_ID, ({ domSelector }) => {
    $element = document.querySelector(domSelector);
    log(MF_ID + " mounted on " + domSelector);
    init();
  });

  const init = () => {
    const aggregate = Subway.createAggregate(AGGREGATE_NAME, { sum: 0 });

    aggregate.observeState(({ sum }) => {
      log("current value: " + sum);
    });

    aggregate.exposeEvents(["ADD_TO_ACCUMULATOR_REQUESTED"]);

    aggregate.exposeCommandHandler(
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

(function() {
  const AGGREGATE_NAME = "MF_3";
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
    const aggregate = Subway.createAggregate(AGGREGATE_NAME);
    aggregate.consumeEvent("ADD_TO_ACCUMULATOR_REQUESTED", (type, event) => {
      log("Request tracked: add " + event.amount);
    });
  };
})();

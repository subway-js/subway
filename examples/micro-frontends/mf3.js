(function() {
  const MF_ID = "MF_3";
  const AGGREGATE_NAME = "LOGGER";
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
    const aggregate = Subway.createAggregate(AGGREGATE_NAME);
    aggregate.consumeEvent("ADD_TO_ACCUMULATOR_REQUESTED", (type, event) => {
      log("Request tracked: add " + event.amount);
    });

    setTimeout(() => {
      const importedComponent = aggregate.$experimental.importComponent(
        "increaseAccumulatorButton"
      );
      const component = importedComponent.factoryFunction(
        "importedUIComponent"
      );
      $element.appendChild(component);
    });
  };
})();

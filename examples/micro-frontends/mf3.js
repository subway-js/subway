(function() {
  const MF_ID = "MF_3";
  const AGGREGATE_NAME = "LOGGER";
  let $element = null;
  const log = line => {
    let current = $element.innerHTML;
    $element.innerHTML = " > " + line + "<br/>" + current;
  };
  Subway.microFrontends().install(MF_ID, ({ domSelector }) => {
    $element = document.querySelector(domSelector);
    log(MF_ID + " mounted on " + domSelector);
    init();
  });

  const init = () => {
    const aggregate = Subway.createAggregate(AGGREGATE_NAME);

    // setTimeout(() => {
      aggregate.publicChannel().reactToEvent("SOMETHING_INTERESTING_HAPPENED", (type, event) => {
          log("Request tracked: add " + (event ? event.amount : 'null'));

      });
    // }, 1000)


    setTimeout(() => {
      const importedComponent = aggregate.publicChannel().getComponent(
        "increaseAccumulatorButton"
      );
      const component = importedComponent.factoryFunction(
        "importedUIComponent"
      );
      $element.appendChild(component);
    });
  };
})();

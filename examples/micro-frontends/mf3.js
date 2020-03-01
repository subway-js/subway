(function() {
  const MF_ID = "MF_3";
  const AGGREGATE_NAME = "LOGGER";

  let $logElement = document.createElement("div");
  $logElement.setAttribute("id", "log");

  let $importedElementContainer = document.createElement("div");
  $importedElementContainer.setAttribute("id", "buttonContainer");



  const log = line => {
    if($logElement) {
      let current = $logElement.innerHTML;
      $logElement.innerHTML = " > " + line + "<br/>" + current;
    }
  };

  Subway.microFrontends().install(MF_ID, ({ domSelector }) => {
    const $element = document.querySelector(domSelector);
      $element.appendChild($importedElementContainer)
      $element.appendChild($logElement)
    log(MF_ID + " mounted on " + domSelector);
    init();
  });

  const init = () => {
    const aggregate = Subway.createAggregate(AGGREGATE_NAME);

      aggregate.publicChannel().reactToEvent("SOMETHING_INTERESTING_HAPPENED", (type, event) => {
          log("Request tracked: add " + (event ? event.amount : 'null'));
      });

      aggregate
        .publicChannel()
        .importComponent(
          "increaseAccumulatorButton",
          ({ mount }) => {
            mount({ label: 'Custom Button' }, { selector: '#buttonContainer' })
          }
        );

  };
})();

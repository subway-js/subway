(function() {
  const AGGREGATE_NAME = "MF_1";
  let $element = null;
  const log = line => {
    let current = $element.innerHTML;
    $element.innerHTML = " > " + line + "<br/>" + current;
  };
  const getNextAmount = (min = 1, max = 10) => {
    return Math.floor(Math.random() * max + min);
  };
  Subway.$helpers.installMicroFrontend(AGGREGATE_NAME, ({ domSelector }) => {
    $element = document.querySelector(domSelector);
    log(AGGREGATE_NAME + " mounted on " + domSelector);
    init();
  });

  const init = () => {
    const aggregate = Subway.createAggregate(AGGREGATE_NAME);
    $element.addEventListener("click", () => {
      const nextAmount = getNextAmount();
      aggregate.broadcastCommand("ADD_TO_ACCUMULATOR", { amount: nextAmount });
      log("broadcasting ADD_TO_ACCUMULATOR command with value " + nextAmount);
    });
    log("Click on this area to send a command to the counter");
  };
})();

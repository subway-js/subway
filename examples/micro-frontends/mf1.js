(function() {
  const MF_ID = "MF_1";
  const AGGREGATE_NAME = "NUMBER_GENERATOR";
  let $element = null;
  const log = line => {
    let current = $element.innerHTML;
    $element.innerHTML = " > " + line + "<br/>" + current;
  };
  const getNextAmount = (min = 1, max = 10) => {
    return Math.floor(Math.random() * max + min);
  };
  Subway.microFrontends().install(MF_ID, ({ domSelector }) => {
    $element = document.querySelector(domSelector);
    log(MF_ID + " mounted on " + domSelector);
    init();
  });

  function fn() {
    Subway
      .selectAggregate(AGGREGATE_NAME)
      .publicChannel()
        .command(
          "ADD_TO_ACCUMULATOR", {
            amount: 23
          });
  }

  const init = () => {
    const aggregate = Subway.createAggregate(AGGREGATE_NAME);

    aggregate
      .publicChannel()
      .publishComponent(
        "increaseAccumulatorButton",
        buttonLabel => {
          var btn = document.createElement("button");
          btn.onclick = fn;
          btn.innerHTML = buttonLabel;
          return btn;
        }
      );

    $element.addEventListener("click", () => {
      const nextAmount = getNextAmount();
      aggregate
        .publicChannel()
        .command("ADD_TO_ACCUMULATOR", { amount: nextAmount });
          log("broadcasting ADD_TO_ACCUMULATOR command with value " + nextAmount);
        });
    log("Click on this area to send a command to the counter");
  };
})();

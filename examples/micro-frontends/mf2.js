const MF_2 = "MF_2";

Subway.$helpers.installMicroFrontend(MF_2, ({ domSelector }) => {
  document.querySelector(domSelector).innerHTML = domSelector;
});

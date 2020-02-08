const MF_1 = "MF_1";

Subway.$helpers.installMicroFrontend(MF_1, ({ domSelector }) => {
  document.querySelector(domSelector).innerHTML = domSelector;
});

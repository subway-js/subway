const MF_1 = "MF_1";

// document.addEventListener("DOMContentLoaded", function(){
// https://github.com/jquery/jquery/blob/ad6a94c3f1747829082b85fd53ee2efbae879707/src/core/ready.js#L80-L93
Subway.helpers.installMicroFrontend(MF_1, ({ domSelector }) => {
  // NOTE you need DOM to be ready, before you can manipulate it
  document.querySelector(domSelector).innerHTML = domSelector;
});

// });

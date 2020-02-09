const loadJsScript = (id, src, cb) => {
  const existingScript = document.getElementById(id);

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = src;
    script.id = id;
    // document.body.appendChild(script);
    document.getElementsByTagName("head")[0].appendChild(script);

    script.onload = () => {
      if (cb) cb(id);
    };
  }

  if (existingScript && cb) cb(id);
};

export const injectMicrofrontends = mfArray => {
  mfArray.forEach(({ id, src }) => loadJsScript(id, src));
};

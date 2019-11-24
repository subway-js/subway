import { createAggregate } from "../../aggregates";

import {
  setCommandHandler as _setCommandHandler,
  setEventHandler as _setEventHandler
} from "../../handlers";

import { AGGREGATE } from "./globals/aggregates";
import { CMD } from "./globals/commands";
import { EVT } from "./globals/events";

let unsubscribeFnsSet = new Set();

const loadJsScript = (id, src, cb) => {
  const existingScript = document.getElementById(id);

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = src; // URL for the third-party library being loaded.
    script.id = id; // e.g., googleMaps or stripe
    // document.body.appendChild(script);
    document.getElementsByTagName("head")[0].appendChild(script);

    script.onload = () => {
      if (cb) cb(id);
    };
  }

  if (existingScript && cb) cb(id);
};

const injectDynamicMicrofrontends = mfArray => {
  mfArray.forEach(({ id, src }) => loadJsScript(id, src));
};
export const init = mfConfig => {
  const rootAggregate = createAggregate(AGGREGATE.MF_ROOT, {
    initialized: false,
    loaded: [],
    pending: [...mfConfig.mfs]
  });

  const unsubCmdConnectMf = _setCommandHandler(AGGREGATE.MF_ROOT)(
    CMD.CONNECT_MF,
    (topicState, { id }) => {
      if (topicState.initialized)
        throw Error("Microfrontends have already been initialized.");
      if (topicState.loaded.filter(mf => mf.id === id).length > 0)
        throw Error(`Microfrontend "${id}" has already been initialized.`);

      const targetMf = topicState.pending.filter(mf => mf.id === id)[0];
      return {
        events: [{ id: EVT.MF_CONNECTED, payload: targetMf }]
      };
    },
    error => {
      console.log(JSON.stringify(error, undefined, 4));
    }
  );

  unsubscribeFnsSet.add(unsubCmdConnectMf);

  const unsubEvtMfConnected = _setEventHandler(AGGREGATE.MF_ROOT)(
    EVT.MF_CONNECTED,
    (topicState, targetMf) => {
      const returnValue = {
        proposal: {
          ...topicState,
          loaded: topicState.loaded.concat(targetMf),
          pending: topicState.pending.filter(mf => mf.id !== targetMf.id)
        }
      };
      if (returnValue.proposal.pending.length === 0) {
        returnValue.events = [{ id: EVT.ALL_MFS_CONNECTED, payload: targetMf }];
      }
      return returnValue;
    },
    error => {
      console.log(JSON.stringify(error, undefined, 4));
    }
  );
  unsubscribeFnsSet.add(unsubEvtMfConnected);

  const unsubEvtMfNotified = _setEventHandler(AGGREGATE.MF_ROOT)(
    EVT.ALL_MFS_CONNECTED,
    topicState => {
      let events = [];

      topicState.loaded.forEach(mf => {
        events = events.concat({ id: EVT.MF_ACK_SENT(mf.id), payload: mf });
      });

      // TODO Array.from(unsubscribeFnsSet).forEach(fn => fn())
      unsubscribeFnsSet = null;

      return {
        proposal: {
          ...topicState,
          initialized: true
        },
        events
      };
    },
    error => {
      console.log(JSON.stringify(error, undefined, 4));
    }
  );
  unsubscribeFnsSet.add(unsubEvtMfNotified);

  injectDynamicMicrofrontends([...mfConfig.mfs].filter(mf => mf.src));
};

export const connect = (sendCommand, spy) => (microFrontendId, onConnected) => {
  const unsubscribe = spy(AGGREGATE.MF_ROOT)(EVT.MF_ACK_SENT(microFrontendId), {
    next: payload => {
      // TODO unsubscribe();
      onConnected(payload);
    }
  });

  sendCommand(AGGREGATE.MF_ROOT)(CMD.CONNECT_MF, { id: microFrontendId });
};

import { createAggregate } from "../core/facade";

import { injectMicrofrontends } from "./loader";

import { CMD, EVT } from "./verbs";
import { MF_AGGREGATE_NAME } from "../globals/internalAggregates";

let mfAggregate = null;

export const init = mfConfig => {
  mfAggregate = createAggregate(MF_AGGREGATE_NAME, {
    initialized: false,
    loaded: [],
    pending: [...mfConfig.mfs]
  });

  mfAggregate.reactToCommand(
    CMD.CONNECT_MF,
    ({ state, payload }) => {
      const mfId = payload.id;
      if (state.initialized)
        throw Error("Microfrontends have already been initialized.");
      if (state.loaded.filter(mf => mf.id === mfId).length > 0)
        throw Error(`Microfrontend "${mfId}" has already been initialized.`);

      const targetMf = state.pending.filter(mf => mf.id === mfId)[0];
      return {
        events: [{ id: EVT.MF_CONNECTED, payload: targetMf }]
      };
    },
    error => {
      console.log(JSON.stringify(error, undefined, 4));
    }
  );

  mfAggregate.reactToEvent(
    EVT.MF_CONNECTED,
    ({ state, payload }) => {
      const { id } = payload;
      const returnValue = {
        proposal: {
          ...state,
          loaded: state.loaded.concat(payload),
          pending: state.pending.filter(mf => mf.id !== id)
        }
      };
      if (returnValue.proposal.pending.length === 0) {
        returnValue.events = [{ id: EVT.ALL_MFS_CONNECTED, payload: payload }];
      }
      return returnValue;
    },
    error => {
      console.log(JSON.stringify(error, undefined, 4));
    }
  );

  mfAggregate.reactToEvent(
    EVT.ALL_MFS_CONNECTED,
    ({ state }) => {
      let events = [];

      state.loaded.forEach(mf => {
        events = events.concat({ id: EVT.MF_ACK_SENT(mf.id), payload: mf });
      });

      mfAggregate.stopReactingToCommand(CMD.CONNECT_MF);
      mfAggregate.stopReactingToEvent(EVT.MF_CONNECTED);
      mfAggregate.stopReactingToEvent(EVT.ALL_MFS_CONNECTED);

      return {
        proposal: {
          ...state,
          initialized: true
        },
        events
      };
    },
    error => {
      console.log(JSON.stringify(error, undefined, 4));
    }
  );

  injectMicrofrontends([...mfConfig.mfs].filter(mf => mf.src));
};

export const connect = (microFrontendId, onConnected) => {
  const HACK_EVENT = EVT.MF_ACK_SENT(microFrontendId);

  mfAggregate.reactToEvent(HACK_EVENT, ({ payload }) => {
    onConnected(payload);
    mfAggregate.stopReactingToEvent(HACK_EVENT);
  });

  mfAggregate.command(CMD.CONNECT_MF, { id: microFrontendId });
};

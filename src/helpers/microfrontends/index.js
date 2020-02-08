export {
  createAggregate,
} from '../../entities/index';

import { injectMicrofrontends } from "./utils/loader";

import { AGGREGATE } from "./globals/aggregates";
import { CMD } from "./globals/commands";
import { EVT } from "./globals/events";

// let unsubscribeFnsSet = new Set();
let mfAggregate = null;
export const init = mfConfig => {
  mfAggregate = createAggregate(AGGREGATE.MF_ROOT, {
    initialized: false,
    loaded: [],
    pending: [...mfConfig.mfs]
  });

  const unsubCmdConnectMf = mfAggregate.setCommandHandler(
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

  // unsubscribeFnsSet.add(unsubCmdConnectMf);

  const unsubEvtMfConnected = mfAggregate.setEventHandler(
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
  // unsubscribeFnsSet.add(unsubEvtMfConnected);

  const unsubEvtMfNotified = mfAggregate.setEventHandler(
    EVT.ALL_MFS_CONNECTED,
    topicState => {
      let events = [];

      topicState.loaded.forEach(mf => {
        events = events.concat({ id: EVT.MF_ACK_SENT(mf.id), payload: mf });
      });

      // TODO Array.from(unsubscribeFnsSet).forEach(fn => fn())
      // unsubscribeFnsSet = null;
      mfAggregate.removeCommandHandler(CMD.CONNECT_MF);
      mfAggregate.removeEventHandler(EVT.MF_CONNECTED);
      mfAggregate.removeEventHandler(EVT.ALL_MFS_CONNECTED,);

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
  // unsubscribeFnsSet.add(unsubEvtMfNotified);

  injectMicrofrontends([...mfConfig.mfs].filter(mf => mf.src));
};

export const connect = (microFrontendId, onConnected) => {
  const HACK_EVENT = EVT.MF_ACK_SENT(microFrontendId);

  mfAggregate.setEventHandler(
    HACK_EVENT,
    (topicState, payload) => {
      onConnected(payload);
      mfAggregate.removeEventHandler(HACK_EVENT)
    }
  )
  // const unsubscribe = spy(AGGREGATE.MF_ROOT)(EVT.MF_ACK_SENT(microFrontendId), {
  //   next: payload => {
  //     // TODO unsubscribe();
  //     onConnected(payload);
  //   }
  // });

  mfAggregate.sendCommand(CMD.CONNECT_MF, { id: microFrontendId });
};

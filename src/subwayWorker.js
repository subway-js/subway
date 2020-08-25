import {
  INTENT_SET_EVENT_PROCESSOR,
  INTENT_SET_COMMAND_PROCESSOR,
  INTENT_SET_STORE_PROCESSOR,
  INTENT_CREATE_STORE,
  INTENT_OBSERVE_STORE,
  INTENT_PUSH_COMMAND,
} from './core/globals';

import { fromString } from './utils/functionSerializer'
import { coreFactory } from './core/index'


const subwayCore = coreFactory({
  onStoreUpdated: (storeId, domainName, nextState) => {
    postMessage({ 
      messageType: 'storeUpdated', 
      storeDomain: domainName,
      storeId,
      nextState
    });
  }
});

const log = (msg, data) => { console.log('[ WW ] ' + msg, data) };
 
self.addEventListener('message', async (message) => { 

  message.data && log('Intent received:', message.data)
  
  const { $intentType, $domainName, payload } = message.data
 
  switch( $intentType ) {
    
      case INTENT_SET_COMMAND_PROCESSOR:
        const { commandId, processorString : ps} = payload;
        subwayCore($domainName).setCommandProcessor(commandId, fromString(ps))
        break;
        
      case INTENT_SET_EVENT_PROCESSOR:
        const { eventId: eid, processorString : ps2} = payload;
        subwayCore($domainName).setEventProcessor(eid, fromString(ps2))
        break;
        
      case INTENT_SET_STORE_PROCESSOR:
        const { processorString, storeName, eventId } = payload;
        subwayCore($domainName).setStoreProcessor(storeName, eventId, fromString(processorString))
        break;

      case INTENT_CREATE_STORE:
        const { initialState } = payload;
        subwayCore($domainName).createStore(payload.storeName, initialState)
        break;
        
      case INTENT_OBSERVE_STORE:
        const { storeId } = payload;
        subwayCore($domainName).observeStore(storeId)
        break;

      case INTENT_PUSH_COMMAND:
        subwayCore($domainName).pushCommand(payload.commandId, payload.payload)
        break;

      default:
          log('Unknown message received', message)
  }
}
, false);
 
 
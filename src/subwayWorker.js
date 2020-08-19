import {
  INTENT_SET_EVENT_PROCESSOR,
  INTENT_SET_COMMAND_PROCESSOR,
  INTENT_SET_STORE_PROCESSOR,
  INTENT_CREATE_STORE,
  INTENT_OBSERVE_STORE,
  INTENT_PUSH_COMMAND,
} from './new/globals';

import { storesManagerFactory } from './new/storeSet';
import { messagesBrokerFactory } from './new/messagesManager';

const log = (msg, data) => { console.log('[ WW ] ' + msg, data) };

const storesManager = storesManagerFactory((domainName, storeName, nextState) => {
  notifyStoreUpdate(domainName, storeName, nextState) 
});

const messageBroker = messagesBrokerFactory((domainName) => {
    return storesManager(domainName).getAllStoreStates()
  }, (domainName, eventName, event) => {
    storesManager(domainName).processEvent(eventName, event)
  });

self.addEventListener('message', async (message) => {
// self.onmessage = async (message) => {

  message.data && log('Intent received:', message.data)
  
  const { $intentType, $domainName, payload } = message.data
 
  switch( $intentType ) {
    
      case INTENT_SET_COMMAND_PROCESSOR:
        const { commandId, processorString : ps} = payload;
        messageBroker($domainName).setCommandProcessor(commandId, ps)
        break;

      case INTENT_SET_STORE_PROCESSOR:
        const { processorString, storeName, eventId } = payload;
        const args = processorString.substring(processorString.indexOf("(") + 1, processorString.indexOf(")")).split(',');
        // TODO support also non-arrow function syntax, or arrow function without curly braces
        const body = processorString.substring(processorString.indexOf("{") + 1, processorString.lastIndexOf("}"));
        const cb = new Function(args, body);
        storesManager($domainName).setEventProcessor(storeName, eventId, cb)

        break;

      case INTENT_PUSH_COMMAND:
        // commandBus.push($domainName, messageId, payload) 
        messageBroker($domainName).pushCommand(payload.commandId, payload.payload)
        break;

      case INTENT_CREATE_STORE:
        const { initialState } = payload;
        storesManager($domainName).createStore(payload.storeName, initialState)
        break;
        
      case INTENT_SET_EVENT_PROCESSOR:
        const { eventId: eid, processorString : ps2} = payload;
        messageBroker($domainName).setCommandProcessor(eid, ps2)
        break;
        
      case INTENT_OBSERVE_STORE:
        const { storeId } = payload;
        storesManager($domainName).markObserved(storeId)
        break;

      default:
          log('Unknown message received', message)
  }
}
, false);


const notifyStoreUpdate = (storeId, storeDomain, nextState) => {
    postMessage({ 
        messageType: 'storeUpdated', 
        storeDomain,
        storeId,
        nextState
      });
}
 
import {
    INTENT_SET_EVENT_PROCESSOR,
    INTENT_SET_COMMAND_PROCESSOR,
    INTENT_SET_STORE_PROCESSOR,
    INTENT_CREATE_STORE,
    INTENT_OBSERVE_STORE,
    INTENT_PUSH_COMMAND,
} from '../new/globals';

export const workerDriverFactory = () => {

    let subwayWorker = null;
    let onStoreUpdatedCallback = null;
    try {
        subwayWorker = new Worker('http://127.0.0.1:8080/dist/subwayWorker.js');
    } catch (error) {  
        console.log(error);
        throw Error('Error loading subwayWorker', error);
    }
    subwayWorker.onerror = event => {
        console.log(error);
        throw Error('SubwayWorker error', error);
    }

    subwayWorker.addEventListener('message', ({ data }) => {
        const { messageType, storeDomain, storeId, nextState } = data;
        switch(messageType) {
            case 'storeUpdated':
                onStoreUpdatedCallback && onStoreUpdatedCallback(storeDomain, storeId, nextState)
                break;
        } 
    }, false);

    const postIntent = (
        intentType,
        sourceDomainName,
        payload
    ) => {
        subwayWorker.postMessage({
            $domainName: sourceDomainName,
            $intentType: intentType,
            payload, 
        });
    };

    return {
        onStoreUpdated: (cb) => {
            onStoreUpdatedCallback = cb;
        },
        // ---
        setEventProcessor: (sourceDomainName, payload) => {
            postIntent(INTENT_SET_EVENT_PROCESSOR, sourceDomainName, payload);
        },
        setCommandProcessor: (sourceDomainName, payload) => {
            postIntent(INTENT_SET_COMMAND_PROCESSOR, sourceDomainName, payload);
        },
        setStoreProcessor: (sourceDomainName, payload) => {
            postIntent(INTENT_SET_STORE_PROCESSOR, sourceDomainName, payload);
        },
        // ---
        createStore: (sourceDomainName, payload) => {
            postIntent(INTENT_CREATE_STORE, sourceDomainName, payload);
        },
        observeStore: (sourceDomainName, payload) => {
            postIntent(INTENT_OBSERVE_STORE, sourceDomainName, payload);
        },
        // ---
        pushCommand: (sourceDomainName, payload) => {
            postIntent(INTENT_PUSH_COMMAND, sourceDomainName, payload);
        },
    }

};

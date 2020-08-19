import { workerDriverFactory } from './drivers/webWorkerDriver';

window.log = (msg, data) => {console.log('[ MAIN ] ' + msg, data)}

let subwayDriver = null;

if (window.Worker) {
    subwayDriver = workerDriverFactory();
} else {
    throw Error('Cannot bootstrap SubwayJS: your browser does not support WebWorkers.')
}

const domains = {};  
 
subwayDriver.onStoreUpdated((storeDomain, storeId, nextState) => {
    const cb = (domains[storeDomain].stores[storeId] || null)
    cb && cb(nextState)
}) 

const setCommandProcessor = domainName => (commandId, processor) => {
    subwayDriver.setCommandProcessor(domainName, {
        commandId,
        processorString: processor.toString()
    }) 
}

const setEventProcessor = domainName => (eventId, processor) => {
    subwayDriver.setEventProcessor(domainName, {
        eventId,
        processorString: processor.toString()
    }) 
}

const createStore = domainName => (storeName, initialState = {}) => {
    subwayDriver.createStore(domainName, {
        storeName,
        initialState
    })

    domains[domainName].stores[storeName] = {}; 
}

const updateStoreOnEvent = domainName => (storeName, eventId, processor) => {
    subwayDriver.setStoreProcessor(domainName, {
        storeName,
        eventId,
        processorString: processor.toString()
    }) 
}

const observeStore = domainName => (storeId, cb) => {
    if(!domains[domainName].stores[storeId]) { 
        throw Error(`Store ${storeId} not found in domain ${domainName}`)
    }
    domains[domainName].stores[storeId] = cb 

    subwayDriver.observeStore(domainName, {
        storeId, 
    })
}

const sendCommand = domainName => (commandId, payload) => {

    subwayDriver.pushCommand(domainName, {
        commandId,
        payload
    }) 
}

const getDomainApi = (domainName) => {

    if(!domains[domainName]) {
        domains[domainName] = {
            stores: {}
        }
    };

    return {
        engine: {
            broker: {
                onCommand: setCommandProcessor(domainName),
                onEvent: setEventProcessor(domainName),
            },
            stores: {
                create: createStore(domainName),
                updateOnEvent: updateStoreOnEvent(domainName),
            }
        },
        view: {
            broker: {
                pushCommand: sendCommand(domainName),
                spyOrReact: null,
            },
            stores: {
                // TODO cross store communication - query?
                observe: observeStore(domainName)
            }
        },
    }
}


const Subway = {

    domain: (name) => {
        return getDomainApi(name);
    }

}

// setTimeout(() => {
//     subwayWorker.terminate()
// }, (1000));


export default Subway;
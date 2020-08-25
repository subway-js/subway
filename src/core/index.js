import { storesRepoFactory } from './storesRepo'
import { processorsRepoFactory } from './processorsRepo'
import { eventsLogFactory } from './eventsLog'

export const coreFactory = ({ onStoreUpdated }) => {

    const storesRepo = storesRepoFactory({
        onStoreUpdateCallback: (domainName, storeName, nextState) => {
            onStoreUpdated(domainName, storeName, nextState) 
        }
    })

    const processorsRepo = processorsRepoFactory({
        getDomainStoresState: (domainName) => {
            return storesRepo(domainName).getAllStoreStates()
        },
        getStoreState: (domainName, storeName) => {
            return storesRepo(domainName).getStoreState(storeName)
        },
        updateStoreState: (domainName, storeName, nextState) => {
            storesRepo(domainName).updateStore(storeName, nextState)
        }
    });

    const eventsLog = eventsLogFactory({
        runStoreProcessor: (domainName, eventName, payload) => {
            processorsRepo(domainName).processStore(eventName, payload)
        },
        runEventProcessor: (domainName, event) => {
            return processorsRepo(domainName).processEvent(event)
        }
    })

    return domainName => {

        return {
            // Processors
            setCommandProcessor: (commandId, processor) => {
                processorsRepo(domainName).setCommandProcessor(commandId, processor)
            },
            setEventProcessor:  (eventId, processor) => {
                processorsRepo(domainName).setEventProcessor(eventId, processor)
            },
            setStoreProcessor:  (storeName, eventName, processor) => {
                processorsRepo(domainName).setStoreProcessor(storeName, eventName, processor)
            },

            // Stores
            createStore: (storeName, initialState = {}) => {
                storesRepo(domainName).createStore(storeName, initialState);
            },
            observeStore: (storeId) => {
                storesRepo(domainName).markObserved(storeId)
            },

            // Broker
            pushCommand: (commandId, payload) => {
                const result = processorsRepo(domainName).processCommand(commandId, payload)
                const nextEvents = typeof result === 'object' ? [ result ] : result;
                nextEvents.forEach(event => eventsLog(domainName).log(event))
            },
            // TODO
            // observe? 'event' '*.event' 'domain.event', or command - command@rejected?
        }
    }
}
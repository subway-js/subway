
export const processorsRepoFactory = ({ 
    getDomainStoresState,
    getStoreState,
    updateStoreState 
}) => {

    const commandProcessors = new Map();
    const eventProcessors = new Map();
    const storeProcessors = new Map();


    const domainEventFactory = (originDomainName) => (id, payload) => {
        const created = Date.now();
        return {
          created,
          uuid: created,
          originDomainName,
          eventId: id,
          payload
        }
    }


    return domainName => {
        return {
            setCommandProcessor: (commandId, processor) => {
                if(!commandProcessors.has(domainName)) {
                    commandProcessors.set(domainName, new Map());
                }
                // TODO allow multiple processors?
                commandProcessors.get(domainName).set(commandId, processor);
            },

            setEventProcessor: (eventId, processor) => {
                if(!eventProcessors.has(domainName)) {
                    eventProcessors.set(domainName, new Map());
                }
                // TODO allow multiple processors?
                eventProcessors.get(domainName).set(eventId, processor);
            },

            setStoreProcessor: (storeName, eventName, processor) => {
                // In this domain, some store will react to eventName
                const key = `${domainName}@${eventName}`;
                if(!storeProcessors.has(key)) {
                    storeProcessors.set(key, new Map([ [storeName, processor] ]))
                } else {
                    if(storeProcessors.get(key).has(storeName)) {
                        throw Error(`Store ${storeName} in domain ${domainName} already has a processor for event ${eventName}`);
                    } else {
                        storeProcessors.get(key).set(storeName, processor);
                    }
                } 
            },

            processCommand: (commandId, payload) => {
                if(commandProcessors.has(domainName) &&
                    commandProcessors.get(domainName).has(commandId)) {
                    const commandProcessor = commandProcessors.get(domainName).get(commandId)
                    return commandProcessor(
                        { commandId, payload },
                        getDomainStoresState(domainName),
                        domainEventFactory(domainName)    
                    )
                }
                return []
            },
            processEvent: ({ eventId, payload }) => {
                if(eventProcessors.has(domainName) &&
                    eventProcessors.get(domainName).has(eventId)) {
                    const eventProcessor = eventProcessors.get(domainName).get(eventId)
                    return eventProcessor(
                        { eventId, payload },
                        getDomainStoresState(domainName),
                        domainEventFactory(domainName)    
                    )
                }
                return []
            },
            processStore: (eventId, payload) => {
                const key = `${domainName}@${eventId}`;
                if(storeProcessors.has(key) && storeProcessors.get(key).size > 0) {
                    const processors = Array.from(storeProcessors.get(key).entries());
                    processors.forEach(([storeName, processorFunc]) => {
                        const nextState = processorFunc(
                            getStoreState(domainName, storeName),
                            payload 
                        );
                        updateStoreState(domainName, storeName, nextState);
                    })
                }
            }
        }
    }
}
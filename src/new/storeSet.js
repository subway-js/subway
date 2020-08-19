
export const storesManagerFactory = (notifyFunction) => {
    const domains = new Map();
    const observed = new Map();
    const processors = new Map();

    const updateStoreState = (domainName, storeName, nextState) => {
        // TODO check if exists etc.
        domains.get(domainName).set(storeName, nextState);

        const key = `${domainName}@${storeName}`;
        if(observed.has(key)) {
            // TODO
            notifyFunction(storeName, domainName, nextState)
        }
    }

    return (domainName) => ({
        createStore: (storeName, initialState = {}) => {
            // First store for domain 'domainName'
            if(!domains.has(domainName)) {// throw Error(`Cannot create store ${storeName} for missing domain ${domainName}`);
                domains.set(domainName, new Map([ [storeName, initialState] ]))
            } else {
                if (domains.get(domainName).has(storeName)) {
                    throw Error(`Store ${storeName} already defined for domain ${domainName}`);
                } else {
                    // another store for domain 'domainName'
                    domains.get(domainName).set(storeName, initialState);
                }
            }

            console.log('____STORES____', domainName, domains)
        },
        setEventProcessor: (storeName, eventName, processor) => {
            // const key = `${domainName}@${storeName}`; //@${eventName}

            const key = `${domainName}@${eventName}`; //@${eventName}

            if(!processors.has(key)) {
                // processors.set(key, new Map([ [eventName, processor] ]))
                processors.set(key, new Map([ [storeName, processor] ]))
            } else {
                // if(processors.get(key).has(eventName)) {
                if(processors.get(key).has(storeName)) {
                    throw Error(`Store ${storeName} in domain ${domainName} already has a processor for event ${eventName}`);
                } else {
                    processors.get(key).set(storeName, processor);
                    // processors.get(key).set(eventName, processor);
                }
            } 
        },
        processEvent: (/*storeName, */eventName, event) => {
            // TODO storename not known when event ocurr
            // const key = `${domainName}@${storeName}`;
            const key = `${domainName}@${eventName}`;
            
            if(processors.has(key)) {
                // if(processors.get(key).has(eventName)) {
                    const storeProcessors = Array.from(processors.get(key).entries());
                    storeProcessors.forEach(([storeName, processorFunc]) => {
                        const nextState = processorFunc(
                            { ...domains.get(domainName).get(storeName) },
                            event.payload 
                        );
                        updateStoreState(domainName, storeName, nextState);
                    })
                    // const nextState = processors.get(key.get(eventName))( CURRENT_STATE, event.payload );
                    // updateStoreState(domainName, storeName, nextState);
                // }
            }
        },
        // TODO mark/unmark observed
        markObserved: storeName => {
            const key = `${domainName}@${storeName}`;
            if(observed.has(key)) {
                observed.set(key, observed.get(key) + 1)
            } else {
                observed.set(key, 1);
            }
            console.log('____OBSERVED____', domainName, storeName, observed.get(key))
        },
        unmarkObserved: storeName => {
            const key = `${domainName}@${storeName}`;
            if(observed.has(key)) {
                let count = observed.get(key);
                count <= 1 ?
                    observed.delete(key) :
                    observed.set(key, count - 1)
            } else {
                console.log('DEBUG: store receiving unmark observed but was not observed', domainName, storeName)
            }
            console.log('____OBSERVED____', domainName, storeName, observed.get(key))
        },
        getAllStoreStates: () => {
            let storeStates = Array.from(domains.get(domainName).entries()).reduce((acc, [k, v]) => {
                return {
                    ...acc,
                    [k]: { ...v }
                }
            }, {})
            return storeStates
        },
        getStoreState: storeName => {
            return domains.get(domainName).set(storeName);
        },
        updateStore: (storeName, nextState = {}) => {
            updateStoreState(domainName, storeName, nextState);
        }
    });

};

// export const domainStoresFactory = (domainName, notifyFunction) => {

//     const domainStores = new Map();
//     const observedStores = new Set();

//     return {
//         createStore: (storeName, initialState = {}) => {
//             if(domainStores.has(storeName)) { 
//                 throw Error(`Store ${storeName} already created for domain ${domainName}`)
//             } else {
//                 domainStores.set(storeName, initialState || {});
//                 if(observedStores.has(storeName)) {
//                     notifyFunction(storeName, {...initialState})
//                 }
//             }
//         },
//         storeExists: (storeName) => (domainStores.has(storeName)),
//         // TODO deleteStore?
//         markAsObserved: (storeName) => {
//             observedStores.add(storeName);
//         },
//         markAsNotObserved: (storeName) => {
//             observedStores.remove(storeName);
//         },
//         updateStore: (storeName, nextState) => {
//             if(!domainStores.hash(storeName)) { 
//                 throw Error(`Cannot update store ${storeName}: it does not exist for domain ${domainName}`)
//             } 
//             domainStores.set(storeName, nextState);
//             // notify
//             if(observedStores.has(storeName)) {
//                 notifyFunction(storeName, {...nextState})
//             }
//         },
//         getStoreState: (storeName) => {
//             if(!domainStores.hash(storeName)) { 
//                 throw Error(`Store ${storeName}: it does not exist for domain ${domainName}`)
//             } 
//             return { ...domainStores.get(storeName) }
//         },
//     }
// };
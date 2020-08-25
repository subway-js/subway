
export const storesRepoFactory = ({ onStoreUpdateCallback }) => {
    const domains = new Map();
    const observed = new Map(); 

    const updateStoreState = (domainName, storeName, nextState) => {
        // TODO check if exists etc.
        domains.get(domainName).set(storeName, nextState);

        const key = `${domainName}@${storeName}`;
        if(observed.has(key)) {
            onStoreUpdateCallback(storeName, domainName, nextState)
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

            console.log('____STORE CREATED____', domainName, storeName, initialState)
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
        // TODO mark/unmark observed
        markObserved: storeName => {
            const key = `${domainName}@${storeName}`;
            if(observed.has(key)) {
                observed.set(key, observed.get(key) + 1)
            } else {
                observed.set(key, 1);
            }
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
        },
        getStoreState: storeName => {
            return { ...domains.get(domainName).get(storeName) };
        },
        updateStore: (storeName, nextState = {}) => {
            updateStoreState(domainName, storeName, nextState);
        }
    });

};
 
export const eventsLogFactory = ({ runStoreProcessor, runEventProcessor }) => {

    let queue = [];

    const _log = (domainName, event) => {
        const nextEvents = Array.isArray(event) ? event : [ event ];
        nextEvents.forEach(e => runStoreProcessor(domainName, e.eventId, e.payload));
        nextEvents.forEach(e => queue.push(e)); 
    }
    const _processEvents = (domainName) => {
        if(queue.length > 0) {
            const pendingEvents = [...queue];
            queue = [];
            pendingEvents.forEach(event => {
                const result = runEventProcessor(domainName, event)
                const nextEvents = Array.isArray(result) ? result : [ result ]; //typeof result === 'object' ? [ result ] : result;
                _log(domainName, nextEvents)
            });
        } 
    }
    return domainName => {

        return {
            log: (event) => {
                _log(domainName, event);
                _processEvents(domainName)
            },
            processEvents: () => {
                _processEvents(domainName)
                // setTimeout(() => _processEvents(domainName), 0)
            }
        }
    }
}
export const eventsLogFactory = ({ runStoreProcessor }) => {

    let queue = [];

    return domainName => {

        return {
            log: (event) => {
                runStoreProcessor(domainName, event.eventId, event.payload);
                queue.push(event);
            },
            processEvents: () => {
                // !eventsQueue.empty() && 
                //     eventsQueue.forEach(e => {
                //         const events = process(e);
                //         events.forEach(evt => logEvent(evt))
                //     })
                // set timeout processEventqueue
            }
        }
    }
}
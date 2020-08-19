export const messagesBrokerFactory = (getStoresByDomain, storeProcessor) => {

    let commands = [];
    let events = [];
    const commandProcessors = new Map();
    const eventProcessors = new Map();

    const domainEvent = (originDomainName) => (id, payload) => {
        const created = Date.now();
        return {
          created,
          uuid: created,
          originDomainName,
          eventId: id,
          payload
        }
      }

    const hydrateProcessor = processorString => {
        const argName = processorString.substring(processorString.indexOf("(") + 1, processorString.indexOf(")")).split(',');
        // TODO support also non-arrow function syntax, or arrow function without curly braces
        const funcBody = processorString.substring(processorString.indexOf("{") + 1, processorString.lastIndexOf("}"));
        return new Function(argName, funcBody);
    }
    const pushEvents = (event) => {
        events.push(...event);
        // setTimeout(() => processEvents());
        processEvents();
    };
    const processCommand = () => {
        const pendingMessages = [...commands];
        commands = [];
        let nextEvents = [];
        pendingMessages.forEach(m => {
            const { commandId, originDomainName, payload } = m;
            const result = commandProcessors.get(originDomainName).get(commandId)(
               m, getStoresByDomain(originDomainName), domainEvent(originDomainName)
            );
            const events = typeof result === 'object' ? [ result ] : result;
            if(events && events.length > 0) {
                nextEvents = nextEvents.concat(events)
            }
        })
        if(nextEvents && nextEvents.length > 0) {
            pushEvents(nextEvents);
        }
      };
    const processEvents = () => {
        if(!events || events.length <= 0) return;
        const pendingMessages = [...events];
        events = [];
        let nextEvents = [];
        // pendingMessages.forEach(m => setTimeout(() => {
        pendingMessages.forEach(m => {
            const { eventId, originDomainName, payload } = m;
            if(eventProcessors.has(originDomainName) && eventProcessors.get(originDomainName).has(eventId)) {
                const result = eventProcessors.get(originDomainName).get(eventId)(
                    m, getStoresByDomain(originDomainName), domainEvent(originDomainName)
                );
                const events = typeof result === 'object' ? [ result ] : result;
                if(events && events.length > 0) {
                    nextEvents = nextEvents.concat(events)
                }
            }
            storeProcessor(originDomainName, eventId, m)
        // }), 0);
        })
        if(nextEvents && nextEvents.length > 0) {
            pushEvents(nextEvents);
        }
    };


    return (domainName) => {

        return {
            setCommandProcessor: (commandId, processorString) => {
                const processor = hydrateProcessor(processorString);
                if(!commandProcessors.has(domainName)) {
                    commandProcessors.set(domainName, new Map());
                }
                // TODO allow multiple processors?
                commandProcessors.get(domainName).set(commandId, processor);
            },
            setEventProcessor:  (eventId, processorString) => {
                const processor = hydrateProcessor(processorString);
                if(!eventProcessors.has(domainName)) {
                    eventProcessors.set(domainName, new Map());
                }
                // TODO allow multiple processors?
                eventProcessors.get(domainName).set(eventId, processor);
            },
            pushCommand: (commandId, payload) => {
                commands.push({ commandId, payload, originDomainName: domainName });
                processCommand();
            },
        }
    }
} 
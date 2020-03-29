import { canHandleMessages } from "./canHandleMessages";

describe("Aggregate / Mixins / canHandleMessages", () => {

    let instance = null;
    const BASE_OBJ_NAME = "baseObject";
    const base = {
        name: BASE_OBJ_NAME
    };
    const emitFn = jest.fn();
    let commandHandlers = null;
    let eventHandlers = null;

    describe("Feature check", () => {

        beforeEach(() => {
            commandHandlers = new Map();
            eventHandlers = new Map();
            instance = canHandleMessages(base, emitFn, commandHandlers, eventHandlers);
        });

        test("Initializes base object", () => {
            expect(instance.name).toBe(BASE_OBJ_NAME);
            expect(instance).toHaveProperty('canHandleMessages');
            expect(instance).toHaveProperty('removeCommandHandler');
            expect(instance).toHaveProperty('addEventHandler');
            expect(instance).toHaveProperty('removeEventHandler');
            expect(instance).toHaveProperty('handleMessage');
            expect(instance.canHandleMessages).toBe(true);
            expect(eventHandlers.size).toBe(0);
            expect(eventHandlers.size).toBe(0);
            expect(emitFn).not.toHaveBeenCalled();
        });
    });

    describe("Handlers subscription", () => {

        beforeEach(() => {
            commandHandlers = new Map();
            eventHandlers = new Map();
            instance = canHandleMessages(base, emitFn, commandHandlers, eventHandlers);
        });

        test("Accepts and removes command handlers ", () => {
            instance.addCommandHandler('type', () => {});
            expect(commandHandlers.has('type')).toBe(true);
            expect(eventHandlers.size).toBe(0);
            expect(commandHandlers.size).toBe(1);
            instance.addCommandHandler('anotherType', () => {});
            expect(commandHandlers.has('anotherType')).toBe(true);
            expect(eventHandlers.size).toBe(0);
            expect(commandHandlers.size).toBe(2);

            instance.removeCommandHandler('anotherType');
            expect(eventHandlers.size).toBe(0);
            expect(commandHandlers.has('anotherType')).toBe(false);
            expect(commandHandlers.size).toBe(1);
            instance.removeCommandHandler('type');
            expect(eventHandlers.size).toBe(0);
            expect(commandHandlers.has('type')).toBe(false);
            expect(commandHandlers.size).toBe(0);

            expect(() => instance.removeCommandHandler('type')).toThrowError(new Error(`Aggregate "${BASE_OBJ_NAME}" does not have a handler for "type".`));
        });

        test("Accepts one handler per command ", () => {
            instance.addCommandHandler('type', () => {});
            expect(() => instance.addCommandHandler('type', () => {})).toThrowError(new Error(`Aggregate "${BASE_OBJ_NAME}" already has a handler for command "type" is alreaady defined.`));
            instance.removeCommandHandler('type')
            expect(() => instance.addCommandHandler('type', () => {})).not.toThrowError();
        });

        const MIN_REQUIRED_PARAMS_ERR_MSG = 'Missing parameters are required: <type> and/or <handler>.';
        const CMD_TYPE_PARAM_ERR_MSG = 'Invalid <cmdType> argument: must be a valid string.';
        const HANDLER_PARAM_ERR_MSG = 'Invalid <handler> argument: must be a valid string.';
        const ON_REJECTED_PARAM_ERR_MSG = 'Invalid <onReject> argument: it is optional and should be a function.';

        test("addCommandHandler params check ", () => {

            // cmdType and handler are mandatory
            expect(() => instance.addCommandHandler()).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));
            expect(() => instance.addCommandHandler('type1')).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));

            // check cmdType param validity
            expect(() => instance.addCommandHandler(4, () => {})).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.addCommandHandler({}, () => {})).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.addCommandHandler([], () => {})).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.addCommandHandler(() => {}, () => {})).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));

            // check handler param validity
            [{}, 4, [], new Date(), "aString"].forEach((invalidType, idx) => {
                expect(() => instance.addCommandHandler(`loopType_1_${idx}`, invalidType)).toThrowError(new Error(HANDLER_PARAM_ERR_MSG));
            })

            // check onRejected param is optional
            expect(() => instance.addCommandHandler('type2', () => {})).not.toThrowError();
            expect(() => instance.addCommandHandler('type3', () => {}, () => {})).not.toThrowError();
            expect(() => instance.addCommandHandler('type4', () => {}, null)).not.toThrowError();
            expect(() => instance.addCommandHandler('type5', () => {}, undefined)).not.toThrowError();

            // check onReject param validity when provided
            [{}, 4, [], new Date(), "aString"].forEach((invalidType, idx) => {
                expect(() => instance.addCommandHandler(`loopType_2_${idx}`, () => {}, invalidType)).toThrowError(new Error(ON_REJECTED_PARAM_ERR_MSG));
            })
            
        });

        test("removeCommandHandler params check ", () => {
            expect(() => instance.removeCommandHandler()).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeCommandHandler('')).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeCommandHandler(null)).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeCommandHandler(undefined)).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeCommandHandler(5)).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeCommandHandler([])).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeCommandHandler({})).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeCommandHandler(() => {})).toThrowError(new Error(CMD_TYPE_PARAM_ERR_MSG));
        });

        test("Accepts and removes event handlers ", () => {
            instance.addEventHandler('type', () => {});
            expect(eventHandlers.has('type')).toBe(true);
            expect(commandHandlers.size).toBe(0);
            expect(eventHandlers.size).toBe(1);
            instance.addEventHandler('anotherType', () => {});
            expect(eventHandlers.has('anotherType')).toBe(true);
            expect(commandHandlers.size).toBe(0);
            expect(eventHandlers.size).toBe(2);

            instance.removeEventHandler('anotherType');
            expect(commandHandlers.size).toBe(0);
            expect(eventHandlers.has('anotherType')).toBe(false);
            expect(eventHandlers.size).toBe(1);
            instance.removeEventHandler('type');
            expect(commandHandlers.size).toBe(0);
            expect(eventHandlers.has('type')).toBe(false); 
            expect(eventHandlers.size).toBe(0);

            expect(() => instance.removeEventHandler('type')).toThrowError(new Error(`Aggregate "${BASE_OBJ_NAME}" does not have a handler for "type".`));
        });
        
        test("Accepts one handler per event ", () => {
            instance.addEventHandler('type', () => {});
            expect(() => instance.addEventHandler('type', () => {})).toThrowError(new Error(`Aggregate "${BASE_OBJ_NAME}" already has a handler for command "type" is alreaady defined.`));
            instance.removeEventHandler('type')
            expect(() => instance.addEventHandler('type', () => {})).not.toThrowError();
        });

        const EVT_TYPE_PARAM_ERR_MSG = 'Invalid <evtType> argument: must be a valid string.';
        
        test("addEventHandler params check ", () => {
             // evtType and handler are mandatory
            expect(() => instance.addEventHandler()).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));
            expect(() => instance.addEventHandler('type')).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));

            // check evtType param validity
            expect(() => instance.addEventHandler(4, () => {})).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.addEventHandler({}, () => {})).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.addEventHandler([], () => {})).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.addEventHandler(() => {}, () => {})).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));

            // check handler param validity
            expect(() => instance.addEventHandler('type', {})).toThrowError(new Error(HANDLER_PARAM_ERR_MSG));
            expect(() => instance.addEventHandler('type', 5)).toThrowError(new Error(HANDLER_PARAM_ERR_MSG));
            expect(() => instance.addEventHandler('type', [])).toThrowError(new Error(HANDLER_PARAM_ERR_MSG));
            expect(() => instance.addEventHandler('type', new Date())).toThrowError(new Error(HANDLER_PARAM_ERR_MSG));
            expect(() => instance.addEventHandler('type', "aString")).toThrowError(new Error(HANDLER_PARAM_ERR_MSG));

        });

        test("removeEventHandler params check ", () => {
            expect(() => instance.removeEventHandler()).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeEventHandler('')).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeEventHandler(null)).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeEventHandler(undefined)).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeEventHandler(5)).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeEventHandler([])).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeEventHandler({})).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
            expect(() => instance.removeEventHandler(() => {})).toThrowError(new Error(EVT_TYPE_PARAM_ERR_MSG));
        });
        
    });

    // TODO handle
    // TODO mixins cooperation: hasObservableState

    describe("Runtime constructor params check", () => {

        const SELF_PARAM_ERR_MSG = 'Invalid <self> argument: must be an object with a <name> property.';
        const EMIT_MESSAGE_PARAM_ERR_MSG = 'Invalid <emitMessage> argument: must be a function.';
        const CMD_HANDLERS_PARAM_ERR_MSG = 'Invalid <commandHandlers> argument: must be a Map.';
        const EVT_HANDLERS_PARAM_ERR_MSG = 'Invalid <eventHandlers> argument: must be a Map.';

        test("Check <self> parameters when initialized", () => {
            expect(() => canHandleMessages({})).toThrowError(new Error(SELF_PARAM_ERR_MSG));
            expect(() => canHandleMessages(null)).toThrowError(new Error(SELF_PARAM_ERR_MSG));
            expect(() => canHandleMessages(undefined)).toThrowError(new Error(SELF_PARAM_ERR_MSG));
            expect(() => canHandleMessages(new Date())).toThrowError(new Error(SELF_PARAM_ERR_MSG));
            expect(() => canHandleMessages(4)).toThrowError(new Error(SELF_PARAM_ERR_MSG));
            expect(() => canHandleMessages([])).toThrowError(new Error(SELF_PARAM_ERR_MSG));
            expect(() => canHandleMessages(() => {})).toThrowError(new Error(SELF_PARAM_ERR_MSG));
        });

        test("Check <emitMessage> parameters when initialized", () => {
            expect(() => canHandleMessages(self, {})).toThrowError(new Error(EMIT_MESSAGE_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, null)).toThrowError(new Error(EMIT_MESSAGE_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, undefined)).toThrowError(new Error(EMIT_MESSAGE_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, new Date())).toThrowError(new Error(EMIT_MESSAGE_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, 4)).toThrowError(new Error(EMIT_MESSAGE_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, [])).toThrowError(new Error(EMIT_MESSAGE_PARAM_ERR_MSG));
        });

        test("Check <commandHandlers> parameters when initialized", () => {
            expect(() => canHandleMessages(self, () => {}, null)).toThrowError(new Error(CMD_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, 4)).toThrowError(new Error(CMD_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, new Date())).toThrowError(new Error(CMD_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, [])).toThrowError(new Error(CMD_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, new Set())).toThrowError(new Error(CMD_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, () => {})).toThrowError(new Error(CMD_HANDLERS_PARAM_ERR_MSG));
        }); 

        test("Check <eventHandlers> parameters when initialized", () => {
            expect(() => canHandleMessages(self, () => {}, new Map(), null)).toThrowError(new Error(EVT_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, new Map(), 4)).toThrowError(new Error(EVT_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, new Map(), new Date())).toThrowError(new Error(EVT_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, new Map(), [])).toThrowError(new Error(EVT_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, new Map(), new Set())).toThrowError(new Error(EVT_HANDLERS_PARAM_ERR_MSG));
            expect(() => canHandleMessages(self, () => {}, new Map(), () => {})).toThrowError(new Error(EVT_HANDLERS_PARAM_ERR_MSG));
        }); 
    });

});
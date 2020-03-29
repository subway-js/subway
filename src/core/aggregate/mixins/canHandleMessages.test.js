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
        });

        const MIN_REQUIRED_PARAMS_ERR_MSG = 'Missing required parameters are required: <type> and/or <handler>.';

        test("addCommandHandler params check ", () => {
            expect(() => instance.addCommandHandler()).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));
            expect(() => instance.addCommandHandler('type')).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));
        });

        test("removeCommandHandler params check ", () => {

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
        });

        test("addEventHandler params check ", () => {
            expect(() => instance.addEventHandler()).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));
            expect(() => instance.addEventHandler('type')).toThrowError(new Error(MIN_REQUIRED_PARAMS_ERR_MSG));
        });

        test("removeEventHandler params check ", () => {

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
import { canHandleMessages } from "./canHandleMessages";

describe("Aggregate / Mixins / canHandleMessages", () => {

    describe("Feature check", () => {

        const BASE_OBJ_NAME = "baseObject";
        const base = {
            name: BASE_OBJ_NAME
        };
        const emitFn = jest.fn();
        let commandHandlers = null;
        let eventHandlers = null;
        let instance = null;
    
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
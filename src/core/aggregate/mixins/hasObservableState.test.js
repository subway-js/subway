import { hasObservableState } from "./hasObservableState";

describe("Aggregate / Mixins / hasObservableState", () => {

  describe("Feature check", () => {
    const BASE_OBJ_NAME = "baseObject";
    const base = {
      name: BASE_OBJ_NAME
    };
    let subscriptions = null;
    let instance = null;
    const initialState = { foo: 'bar' };
  
    beforeEach(() => {
      subscriptions = new Map();
      instance = hasObservableState(base, initialState, subscriptions);
    });
  
    
    test("Initializes base object", () => {
      expect(instance.name).toBe(BASE_OBJ_NAME);
      expect(instance).toHaveProperty('hasObservableState');
      expect(instance).toHaveProperty('observeState');
      expect(instance).toHaveProperty('updateState');
      expect(instance).toHaveProperty('getCurrentState');
      expect(instance.hasObservableState).toBe(true);
      expect(instance.getCurrentState()).toEqual(initialState);
      expect(subscriptions.size).toBe(0);
    });
  
    test("Accepts empty initial state", () => {
      let noStateInstance = hasObservableState(base);
      expect(noStateInstance.getCurrentState()).toEqual({});
      noStateInstance = hasObservableState(base, undefined);
      expect(noStateInstance.getCurrentState()).toEqual({});
    });

    test("Updates the state", () => {
      const nextState = { foo: 'bar2', another: 'property'};
      instance.updateState(nextState);
      expect(instance.getCurrentState()).toHaveProperty('foo', 'bar2');
      expect(instance.getCurrentState()).toHaveProperty('another', 'property');
    });
  
    test("On update, keeps state properties not specified in the next state", () => {
      const nextState = { whatAbout: 'fooProperty'};
      instance.updateState(nextState);
      expect(instance.getCurrentState()).toHaveProperty('foo', 'bar');
      expect(instance.getCurrentState()).toHaveProperty('whatAbout', 'fooProperty');
    });
  
    test("Accepts subscriptions", () => {
      instance.observeState(() => {});
      expect(subscriptions.size).toBe(1);
      setTimeout(() => {
        instance.observeState(() => {});
        expect(subscriptions.size).toBe(2);
      }, 0);
    });
  
    test("Allows cancelling subscriptions", () => {
      const sub1 = instance.observeState(() => {});
      console.log('[without this log, test fails: delay needed between two calls]')
      const sub2 = instance.observeState(() => {});
      const [key1, key2] = Array.from(subscriptions.keys());
  
      sub2();
      expect(subscriptions.has(key2)).toBe(false);
      expect(subscriptions.has(key1)).toBe(true);
      expect(subscriptions.size).toBe(1);
  
      sub1();
      expect(subscriptions.has(key2)).toBe(false);
      expect(subscriptions.has(key1)).toBe(false);
      expect(subscriptions.size).toBe(0);
    });
    
    test("Subscribers immediately receive current state on subscription", () => {
      const onNextStateMock = jest.fn();
      instance.observeState(onNextStateMock);  
      expect(onNextStateMock).toHaveBeenCalledTimes(1);
      expect(onNextStateMock).toHaveBeenCalledWith({ foo: 'bar' });
    });
  
    test("Subscribers are notified when state changes", () => {
      const onNextStateMock = jest.fn();
      instance.observeState(onNextStateMock);  
      instance.updateState({ state: 'updated' });
      instance.updateState({ foo: 'bar2' });
      expect(onNextStateMock).toHaveBeenCalledTimes(3);
      expect(onNextStateMock).toHaveBeenLastCalledWith({
        foo: 'bar2',
        state: 'updated'
      });
      expect(instance.getCurrentState()).toEqual({
        foo: 'bar2',
        state: 'updated'
      });
    });
  });

  describe("Runtime constructor params check", () => {

    const SELF_PARAM_ERR_MSG = 'Invalid <self> argument: must be an object with a <name> property.';
    const SELF_INITIAL_STATE_ERR_MSG = 'Invalid <initialState> argument: must be an object.';
    const SELF_SUBSCRIBERS_ERR_MSG = 'Invalid <subscribers> argument: must be a Map.';

    test("Check <self> parameters when initialized", () => {
      expect(() => hasObservableState({})).toThrowError(new Error(SELF_PARAM_ERR_MSG));
      expect(() => hasObservableState(null)).toThrowError(new Error(SELF_PARAM_ERR_MSG));
      expect(() => hasObservableState(undefined)).toThrowError(new Error(SELF_PARAM_ERR_MSG));
      expect(() => hasObservableState(new Date())).toThrowError(new Error(SELF_PARAM_ERR_MSG));
      expect(() => hasObservableState(4)).toThrowError(new Error(SELF_PARAM_ERR_MSG));
      expect(() => hasObservableState([])).toThrowError(new Error(SELF_PARAM_ERR_MSG));
      expect(() => hasObservableState(() => {})).toThrowError(new Error(SELF_PARAM_ERR_MSG));
    });
  
    test("Check <initialState> parameters when initialized", () => {
      expect(() => hasObservableState(self, null)).toThrowError(new Error(SELF_INITIAL_STATE_ERR_MSG));
      expect(() => hasObservableState(self, 4)).toThrowError(new Error(SELF_INITIAL_STATE_ERR_MSG));
      expect(() => hasObservableState(self, new Date())).toThrowError(new Error(SELF_INITIAL_STATE_ERR_MSG));
      expect(() => hasObservableState(self, [])).toThrowError(new Error(SELF_INITIAL_STATE_ERR_MSG));
      expect(() => hasObservableState(self, () => {})).toThrowError(new Error(SELF_INITIAL_STATE_ERR_MSG));
    }); 
  
    test("Check <subscribers> parameters when initialized", () => {
      // expect(() => hasObservableState(self, {}, undefined)).toThrowError(new Error(SELF_SUBSCRIBERS_ERR_MSG));
      expect(() => hasObservableState(self, {}, null)).toThrowError(new Error(SELF_SUBSCRIBERS_ERR_MSG));
      expect(() => hasObservableState(self, {}, 4)).toThrowError(new Error(SELF_SUBSCRIBERS_ERR_MSG));
      expect(() => hasObservableState(self, {}, new Date())).toThrowError(new Error(SELF_SUBSCRIBERS_ERR_MSG));
      expect(() => hasObservableState(self, {}, [])).toThrowError(new Error(SELF_SUBSCRIBERS_ERR_MSG));
      expect(() => hasObservableState(self, {}, new Set())).toThrowError(new Error(SELF_SUBSCRIBERS_ERR_MSG));
      expect(() => hasObservableState(self, {}, () => {})).toThrowError(new Error(SELF_SUBSCRIBERS_ERR_MSG));
    }); 
  
  });
  
  
/*
  test("mixin can track events", () => {
    instance.exposeEvents(["1"]);
    expect(instance.hasEventsToExpose()).toBe(true);
    expect(instance.getExposedEvents().length).toBe(1);
    expect(instance.getExposedEvents()[0]).toEqual("1");
    instance.exposeEvents(["2"]);
    expect(instance.hasEventsToExpose()).toBe(true);
    expect(instance.getExposedEvents().length).toBe(2);
    expect(instance.getExposedEvents()[0]).toEqual("1");
    expect(instance.getExposedEvents()[1]).toEqual("2");
  });

  test("mixin ignores duplicate events", () => {
    const preFilledInstance = canExposeEvents(base, new Set([1, 2, 3]));
    expect(preFilledInstance.hasEventsToExpose()).toBe(true);
    expect(preFilledInstance.getExposedEvents().length).toBe(3);
    instance.exposeEvents(["2", "3"]);
    expect(preFilledInstance.hasEventsToExpose()).toBe(true);
    expect(preFilledInstance.getExposedEvents().length).toBe(3);
  });

  test("mixin allows exposing one event or an array of events", () => {
    instance.exposeEvents(["1", "2"]);
    expect(instance.hasEventsToExpose()).toBe(true);
    expect(instance.getExposedEvents().length).toBe(2);
    instance.exposeEvent("4");
    expect(instance.getExposedEvents().length).toBe(3);
    instance.exposeEvents(["5"]);
    expect(instance.getExposedEvents().length).toBe(4);
    instance.exposeEvent("6");
    expect(instance.getExposedEvents().length).toBe(5);
  });

  test("mixin allows events to be removed from tracking list", () => {
    instance.exposeEvents(["1", "2"]);
    instance.exposeEvent("3");
    expect(instance.getExposedEvents().length).toBe(3);
    instance.stopExposingEvents(["1", "3"]);
    expect(instance.getExposedEvents().length).toBe(1);
    expect(instance.getExposedEvents()[0]).toEqual("2");
    instance.stopExposingEvents(["2"]);
    expect(instance.hasEventsToExpose()).toBe(false);
  });



  test("mixin verify parameter type when tracking one or multiple events", () => {
    // check exposeEvent is not called with array, or exposeEvents with an object
    expect(true).toBe(false);
  });

  test("mixin can track events with the same name from different aggregates", () => {
    expect(true).toBe(false);
  });*/
});

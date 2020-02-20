import { canExposeEvents } from "./canExposeEvents";

describe("Aggregate / Mixins / canExposeEvents", () => {
  const BASE_OBJ_NAME = "baseObject";
  let base = {
    name: BASE_OBJ_NAME
  };
  let instance = null;
  beforeEach(() => {
    instance = canExposeEvents(base);
  });

  test("mixin has consistent initial state", () => {
    expect(instance.name).toBe(BASE_OBJ_NAME);
    expect(instance.canExposeEvents).toBe(true);
    expect(instance.hasEventsToExpose()).toBe(false);
    expect(instance.getExposedEvents().length).toBe(0);
  });

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

  test("mixin allows event to be removed from tracking list", () => {
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
  });
});

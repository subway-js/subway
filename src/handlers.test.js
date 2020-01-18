import { setHandler } from "./handlers";

describe("handlers", () => {
  let handlersMap = null;

  beforeEach(() => {
    handlersMap = new Map();
  });

  test("jest works", () => {
    expect(1 + 2).toBe(3);
  });
});

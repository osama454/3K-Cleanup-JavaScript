I'm a JS developer. I recreate the native promise all JS function. The idea was to implement a function that takes an array of promises and returns a single promise that resolves when all promises in the array have been resolved.

Only code should be given, no explanations at all whatsoever!

Your Code should pass all the test cases given here:
```js
const { myPromiseAll } = require("./solution.js");

describe("myPromiseAll", () => {
  test("resolves with all values", async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve("hello"),
      Promise.resolve({ key: "value" }),
    ];

    const result = await myPromiseAll(promises);
    expect(result).toEqual([1, "hello", { key: "value" }]);
  });

  test("rejects if any promise rejects", async () => {
    const promises = [
      Promise.resolve(1),
      Promise.reject("error"),
      Promise.resolve(3),
    ];

    try {
      await myPromiseAll(promises);
      fail("Should have rejected");
    } catch (error) {
      expect(error).toBe("error");
    }
  });

  test("handles empty array", async () => {
    const result = await myPromiseAll([]);
    expect(result).toEqual([]);
  });

  test("handles non-promise values", async () => {
    const promises = [1, Promise.resolve(2), "three"];
    const result = await myPromiseAll(promises);
    expect(result).toEqual([1, 2, "three"]);
  });

  test("rejects with TypeError for non-array input", async () => {
    try {
      await myPromiseAll("not an array");
      fail("Should have rejected");
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      expect(error.message).toBe("Input should be an array of promises");
    }
  });

  test("handles multiple rejections correctly", async () => {
    const promises = [
      Promise.reject("error1"),
      Promise.reject("error2"),
      Promise.reject("error3"),
    ];

    try {
      await myPromiseAll(promises);
      fail("Should have rejected");
    } catch (error) {
      // Only the first rejection should be caught
      expect(error).toBe("error1");
    }
  });

  test("handles resolved promises after a rejection", async () => {
    let resolveLater;
    const promises = [
      Promise.reject("error"),
      new Promise((resolve) => {
        resolveLater = resolve;
      }),
    ];

    try {
      await myPromiseAll(promises);
      fail("Should have rejected");
    } catch (error) {
      expect(error).toBe("error");
    }

    // Resolve the second promise (this should not affect the outcome)
    resolveLater("value");
  });

  test("handles array of mixed values", async () => {
    const promises = [
      Promise.resolve(1),
      "hello",
      Promise.resolve({ key: "value" }),
      null,
      [1, 2, 3],
      undefined,
      true,
    ];

    const result = await myPromiseAll(promises);
    expect(result).toEqual([
      1,
      "hello",
      { key: "value" },
      null,
      [1, 2, 3],
      undefined,
      true,
    ]);
  });
});

```

Your code should implement:
```js
module.exports = { myPromiseAll };
```
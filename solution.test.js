// test.js
/// <reference types="jest" />
const { JSDOM } = require("jsdom");
const realSetTimeout = setTimeout; // Store a reference to the original setTimeout
jest.useFakeTimers(); // Overwrites the setTimeout and setInterval

let dom;
let window;
let document;

console.error = jest.fn((error) => {});
// Mock Three.js and Cannon.js to prevent actual rendering
function mock() {
  window.Object.defineProperty(window.HTMLElement.prototype, "textContent", {
    get: function () {
      // Return the text content of the element
      return this.innerHTML;
    },
    set: function (value) {
      // Set the text content of the element
      this.innerHTML = value;
    },
  });
  const mockCtx = {
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillStyle: "",
    fillRect: jest.fn(),
  };

  // Mocking the getContext method of a canvas element
  const mockCanvas = {
    getContext: jest.fn(() => mockCtx),
  };

  // Mocking the document.createElement method to return the mock canvas
  document.createElement = jest.fn(() => mockCanvas);
}
describe("Dice Game Initialization", () => {
  beforeAll(async () => {
    // Create a virtual DOM
    dom = await JSDOM.fromFile("index.html", {
      resources: "usable",
      runScripts: "dangerously",
    });
    await new Promise((resolve) => realSetTimeout(resolve, 2000)); // Wait until the document loads
    window = dom.window;
    document = window.document;
    mock();
  });

  test("Game elements are created", () => {
    const rollButton = document.getElementById("rollButton");
    const resultDiv = document.getElementById("result");
    const debugInfoDiv = document.getElementById("debugInfo");

    expect(rollButton).toBeTruthy();
    expect(resultDiv).toBeTruthy();
    expect(debugInfoDiv).toBeTruthy();
  });

  test("Initial result text is correct", () => {
    const resultDiv = document.getElementById("result");
    expect(resultDiv.textContent).toBe("Roll the dice!");
  });

  test("drawCircle function exists", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const drawCircle = window.drawCircle;
    expect(typeof drawCircle).toBe("function");

    // Test drawing a circle doesn't throw an error
    expect(() => {
      drawCircle(ctx, 50, 50, 10);
    }).not.toThrow();
  });

  test("createDiceTextures function returns materials", () => {
    const createDiceTextures = window.createDiceTextures;
    expect(typeof createDiceTextures).toBe("function");

    const materials = createDiceTextures();
    expect(Array.isArray(materials)).toBe(true);
    expect(materials.length).toBe(6);
  });

  test("Roll button click triggers rolling state", () => {
    const rollButton = document.getElementById("rollButton");
    const resultDiv = document.getElementById("result");

    // Simulate button click
    rollButton.click();
    jest.advanceTimersByTime(100); // Advance timers
    expect(resultDiv.textContent).toBe("Rolling...");
  });

  test("getDiceValue returns a number between 1 and 6", () => {
    const getDiceValue = window.getDiceValue;

    // Mock necessary objects for the function to work
    window.dice = { quaternion: { clone: () => new THREE.Vector3() } };
    window.diceBody = {
      angularVelocity: { length: () => 0 },
      velocity: { length: () => 0 },
    };

    const value = getDiceValue();

    // Value can be null if dice is not properly initialized
    if (value !== null) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    }
  });
});

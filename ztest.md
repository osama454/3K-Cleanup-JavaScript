```javascript
/**
 * @jest-environment jsdom
 */

const { SpeechGame } = require("./solution");

describe("SpeechGame", () => {
  let game;
  let mockShapeElement;
  let mockMessageElement;
  let mockScoreElement;
  let mockRecognition;

  beforeEach(() => {
    // Mock DOM elements
    mockShapeElement = {
      className: "",
      classList: {
        add: jest.fn(),
      },
      style: {
        top: "",
        left: "",
      },
    };
    mockMessageElement = { textContent: "" };
    mockScoreElement = { textContent: "" };

    // Create mock recognition object
    mockRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      continuous: false,
      interimResults: false,
      onresult: null,
      onend: null,
      onerror: null,
    };

    // Set up window mock with jest.fn()
    const mockSpeechRecognition = jest.fn(() => mockRecognition);
    Object.defineProperty(window, "SpeechRecognition", {
      value: mockSpeechRecognition,
      writable: true,
    });

    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: mockSpeechRecognition,
      writable: true,
    });

    game = new SpeechGame(
      mockShapeElement,
      mockMessageElement,
      mockScoreElement
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    test("should initialize with default values", () => {
      expect(game.score).toBe(0);
      expect(game.isListening).toBe(false);
      expect(game.shapes).toEqual(["circle", "square"]);
    });

    test("should setup speech recognition on init", () => {
      game.init();
      expect(game.recognition).toBeTruthy();
      expect(mockRecognition.start).toHaveBeenCalled();
    });
  });

  describe("Shape Generation", () => {
    test("should generate a valid shape", () => {
      const shape = game.generateShape();
      expect(game.shapes).toContain(shape);
      expect(mockShapeElement.classList.add).toHaveBeenCalledWith(shape);
    });

    test("should handle missing DOM element", () => {
      game.shapeElement = null;
      expect(() => game.generateShape()).not.toThrow();
      expect(game.currentShape).toBeTruthy();
    });
  });

  describe("Speech Recognition", () => {
    beforeEach(() => {
      game.init();
    });

    test("should handle correct word", () => {
      const currentShape = game.currentShape;
      game.handleSpeechResult(currentShape);
      expect(game.score).toBe(1);
      expect(mockMessageElement.textContent).toBe("Correct!");
    });

    test("should handle incorrect word", () => {
      const wrongShape = game.currentShape === "circle" ? "square" : "circle";
      game.handleSpeechResult(wrongShape);
      expect(game.score).toBe(0);
      expect(mockMessageElement.textContent).toBe("Try again!");
    });

    test("should handle speech recognition error", () => {
      game.recognition.onerror({ error: "test error" });
      expect(mockMessageElement.textContent).toContain("error");
    });

    test("should restart recognition on end when listening", () => {
      jest.useFakeTimers();
      game.isListening = true;
      game.recognition.onend();
      jest.runAllTimers();
      expect(mockRecognition.start).toHaveBeenCalled();
    });
  });

  describe("Game Controls", () => {
    test("should start listening", () => {
      game.init();
      game.startListening();
      expect(game.isListening).toBe(true);
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    test("should stop listening", () => {
      game.init();
      game.startListening();
      game.stopListening();
      expect(game.isListening).toBe(false);
      expect(mockRecognition.stop).toHaveBeenCalled();
    });

    test("should reset game state", () => {
      game.score = 5;
      game.reset();
      expect(game.score).toBe(0);
      expect(mockScoreElement.textContent).toBe("Score: 0");
      expect(mockMessageElement.textContent).toBe("");
    });
  });
});

```
I want to do an interactive class with my students, and I need a script that allows users to enter words related to a topic and create a word cloud with them. This means that it must show each word only once and if a word is repeated it must be larger. I want the arrangement of words in a spiral with different colors, they should be displayed without overlapping. Use Javascript to accomplish this task.

Write the a single HTML file that contains the CSS and the JS code on it. Only code should be given, no explanations at all whatsoever!

Your Code should pass all the test cases given here:
```js
/// <reference types="jest" />

const { JSDOM } = require("jsdom");

let window, document;
let canvas, wordInput, addWordButton, ctx;

function set() {
  canvas = document.getElementById("wordCloudCanvas");
  wordInput = document.getElementById("wordInput");
  addWordButton = document.getElementById("addWordButton");
  ctx = canvas.getContext("2d");
}

function reset(done) {
  JSDOM.fromFile("solution.html", {
    resources: "usable",
    runScripts: "dangerously",
  }).then((dom) => {
    window = dom.window;
    document = window.document;

    // Create a more comprehensive mock for canvas context
    const mockCtx = {
      clearRect: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 50 }),
      fillText: jest.fn(),
      _font: "10px Arial", // Internal tracking of font
      _fillStyle: "#000000", // Internal tracking of fillStyle
      get font() {
        return this._font;
      },
      set font(value) {
        this._font = value;
      },
      get fillStyle() {
        return this._fillStyle;
      },
      set fillStyle(value) {
        this._fillStyle = value;
      },
    };

    window.HTMLCanvasElement.prototype.getContext = function () {
      return mockCtx;
    };

    if (document.readyState != "loading") {
      set();
      done();
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        set();
        done();
      });
    }
  });
}

describe("Word Cloud Basic Requirements", () => {
  beforeAll((done) => {
    reset(done);
  });

  it("should have input field and add button for interactive input", () => {
    expect(wordInput).toBeTruthy();
    expect(addWordButton).toBeTruthy();
  });

  it("should have canvas for displaying the word cloud", () => {
    expect(canvas).toBeTruthy();
  });
});

describe("Word Frequency and Display", () => {
  beforeEach((done) => {
    reset(done);
  });

  it("should increase font size when word is repeated", () => {
    // Spy on font setter
    const fontSpy = jest.spyOn(ctx, "font", "set");

    // Add same word twice
    wordInput.value = "test";
    addWordButton.click();

    wordInput.value = "test";
    addWordButton.click();

    // Check if font was set with different sizes
    const fontCalls = fontSpy.mock.calls;
    expect(fontCalls.length).toBeGreaterThan(0);

    // Get unique font sizes used
    const uniqueFontSizes = new Set(fontCalls.map((call) => call[0]));
    expect(uniqueFontSizes.size).toBeGreaterThan(1);
  });

  it("should add words to the cloud", () => {
    const fillTextSpy = jest.spyOn(ctx, "fillText");

    // Add a word
    wordInput.value = "test";
    addWordButton.click();

    // Verify fillText was called
    expect(fillTextSpy).toHaveBeenCalled();
  });
});

describe("Word Cloud Visual Features", () => {
  beforeEach((done) => {
    reset(done);
  });

  it("should use different colors for words", () => {
    const fillStyleSpy = jest.spyOn(ctx, "fillStyle", "set");

    // Add multiple words
    ["word1", "word2", "word3"].forEach((word) => {
      wordInput.value = word;
      addWordButton.click();
    });

    // Get unique colors used
    const uniqueColors = new Set(
      fillStyleSpy.mock.calls.map((call) => call[0])
    );
    expect(uniqueColors.size).toBeGreaterThan(1);
  });

  it("should attempt to place words on canvas", () => {
    const fillTextSpy = jest.spyOn(ctx, "fillText");

    wordInput.value = "test";
    addWordButton.click();

    expect(fillTextSpy).toHaveBeenCalled();
    // Verify that fillText was called with a word and two coordinates
    expect(fillTextSpy.mock.calls[0]).toHaveLength(3);
    expect(typeof fillTextSpy.mock.calls[0][1]).toBe("number");
    expect(typeof fillTextSpy.mock.calls[0][2]).toBe("number");
  });
});

describe("User Interaction", () => {
  beforeEach((done) => {
    reset(done);
  });

  it("should clear input field after adding word", () => {
    wordInput.value = "test";
    addWordButton.click();
    expect(wordInput.value).toBe("");
  });

  it("should not add empty words", () => {
    const fillTextSpy = jest.spyOn(ctx, "fillText");
    wordInput.value = "   ";
    addWordButton.click();
    expect(fillTextSpy).not.toHaveBeenCalled();
  });
});
```
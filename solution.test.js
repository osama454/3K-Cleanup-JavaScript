/// <reference types="jest" />
const { JSDOM } = require("jsdom");

const realSetTimeout = setTimeout; // Store a reference to the original setTimeout
jest.useFakeTimers(); // Overwrites the setTimeout and setInterval

let dom;
let document;
let canvas;
let ctx;

function mockCanvasContext() {
  // Mock canvas methods
  jest.spyOn(ctx, "fillRect").mockImplementation(() => {});
  jest.spyOn(ctx, "beginPath").mockImplementation(() => {});
  jest.spyOn(ctx, "arc").mockImplementation(() => {});
  jest.spyOn(ctx, "fill").mockImplementation(() => {});
  jest.spyOn(ctx, "moveTo").mockImplementation(() => {});
  jest.spyOn(ctx, "lineTo").mockImplementation(() => {});
  jest.spyOn(ctx, "closePath").mockImplementation(() => {});
  jest.spyOn(ctx, "clearRect").mockImplementation(() => {});
}

function set() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
}

async function reset() {
  dom = await JSDOM.fromFile("solution.html", {
    resources: "usable",
    runScripts: "dangerously",
  });
  await new Promise((resolve) => realSetTimeout(resolve, 1000)); // Wait until the document loads
  window = dom.window;
  document = window.document;
  set();
  mockCanvasContext();
}

afterAll(() => {
  if (window) {
    window.close();
  }
});

describe("Drag and Drop Figures", () => {
  beforeAll(async () => {
    await reset();
  });

  test("should initialize canvas and draw figures on load", () => {
    const figures = dom.window.figures;
    expect(canvas.width).toBe(dom.window.innerWidth);
    expect(canvas.height).toBe(dom.window.innerHeight);
    expect(Array.isArray(figures)).toBe(true);
  });

  test("should create a new figure on mouse click", () => {
    const figures = dom.window.figures;
    const initialLength = figures.length;

    const clickEvent = new dom.window.MouseEvent("mousedown", {
      clientX: 100,
      clientY: 100,
    });
    canvas.dispatchEvent(clickEvent);

    expect(figures.length).toBe(initialLength + 1);
    expect(figures[figures.length - 1]).toMatchObject({
      x: 75,
      y: 75,
    });
    switch (figures[figures.length - 1].type) {
      case 0:
        expect(ctx.fillRect).toHaveBeenCalled();
        break;
      case 1:
        expect(ctx.arc).toHaveBeenCalled();
        break;
      case 2:
        expect(ctx.lineTo).toHaveBeenCalled();
        break;
      case 3:
        expect(ctx.lineTo).toHaveBeenCalled();
        break;
    }
  });

  test("should drag a figure on mouse move", () => {
    const figures = dom.window.figures;
    const newFigure = { x: 75, y: 75, type: 0, color: "#000000" };
    figures.push(newFigure);

    const mouseDownEvent = new dom.window.MouseEvent("mousedown", {
      clientX: 100,
      clientY: 100,
    });
    canvas.dispatchEvent(mouseDownEvent);

    const mouseMoveEvent = new dom.window.MouseEvent("mousemove", {
      clientX: 150,
      clientY: 150,
    });
    canvas.dispatchEvent(mouseMoveEvent);

    expect(newFigure.x).toBe(125);
    expect(newFigure.y).toBe(125);
    expect(ctx.clearRect).toHaveBeenCalled();
  });

  test("should handle touch events for figure creation and dragging", async () => {
    await reset();
    const figures = dom.window.figures;
    const initialLength = figures.length;

    let touchStartEvent = new dom.window.TouchEvent("touchstart", {
      touches: [{ clientX: 200, clientY: 200 }],
    });
    canvas.dispatchEvent(touchStartEvent);
    canvas.dispatchEvent(new dom.window.TouchEvent("touchend"));
    expect(figures.length).toBe(initialLength + 1);

    touchStartEvent = new dom.window.TouchEvent("touchstart", {
      touches: [{ clientX: 200, clientY: 200 }],
    });
    canvas.dispatchEvent(touchStartEvent);
    const touchMoveEvent = new dom.window.TouchEvent("touchmove", {
      touches: [{ clientX: 50, clientY: 50 }],
    });
    canvas.dispatchEvent(touchMoveEvent);

    expect(figures[figures.length - 1].x).toBe(25);
    expect(figures[figures.length - 1].y).toBe(25);
  });
});

/**
 * @jest-environment jsdom
 */

HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255]), // Mock red pixels
  })),
}));

const {
  createPuzzlePieces,
  handleImageUpload,
  getDominantColor,
  drawPuzzle,
  initializeModule,
  getPuzzlePieces,
  getGridSize,
} = require("./script"); // Ensure the path is correct

describe("Puzzle Game Tests", () => {
  let mockCanvas, mockContext, mockImage, mockFile, mockEvent;

  beforeEach(() => {
    // Set up mock DOM
    document.body.innerHTML = `
    <input type="file" id="imageUpload" />
    <div id="puzzleContainer" style="width: 400px; height: 400px;">
      <canvas id="puzzleCanvas" width="400" height="400"></canvas>
    </div>
    `;

    mockCanvas = document.getElementById("puzzleCanvas");
    mockContext = mockCanvas.getContext("2d"); // This is now mocked

    // Mock image
    mockImage = new Image();
    Object.defineProperty(mockImage, "width", { value: 100 });
    Object.defineProperty(mockImage, "height", { value: 100 });

    // Mock file upload event
    mockFile = new Blob(["test-image-content"], { type: "image/png" });
    mockFile.name = "test.png";
    mockEvent = { target: { files: [mockFile] } };

    // Call initializeModule (if needed)
    if (typeof initializeModule === "function") {
      initializeModule();
    }
  });

  test("getDominantColor should return default color when no image is provided", () => {
    expect(getDominantColor(null)).toBe("rgb(128,128,128)");
  });

  test("getDominantColor should return the most frequent color in the image", () => {
    const color = getDominantColor(mockImage);
    expect(color).toBe("rgb(255, 0, 0)"); // Expecting red
  });

  test("createPuzzlePieces should generate correct number of pieces", () => {
    createPuzzlePieces(mockImage);
    expect(getPuzzlePieces().length).toBe(getGridSize() ** 2);
  });

  test("drawPuzzle should clear canvas and draw pieces", () => {
    uploadedImage = new Image();
    Object.defineProperty(uploadedImage, "width", { value: 100 });
    Object.defineProperty(uploadedImage, "height", { value: 100 });

    createPuzzlePieces(uploadedImage);
    drawPuzzle();
    expect(mockContext.clearRect);
    expect(mockContext.drawImage);
  });

  test("handleImageUpload should process image file correctly", async () => {
    const readerMock = {
      readAsDataURL: jest.fn(),
      onload: jest.fn(),
    };
    global.FileReader = jest.fn(() => readerMock);

    handleImageUpload(mockEvent);
    expect(readerMock.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });
});

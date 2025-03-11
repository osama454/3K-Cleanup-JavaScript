// Define variables at module scope but don't initialize them yet
let imageUpload, puzzleCanvas, ctx, puzzleContainer;
let uploadedImage = null;
let puzzlePieces = [];
const gridSize = 4; // Number of rows and columns in the puzzle

// Function to initialize the module, which can be called after DOM is set up
function initializeModule() {
  imageUpload = document.getElementById("imageUpload");
  puzzleCanvas = document.getElementById("puzzleCanvas");
  ctx = puzzleCanvas?.getContext("2d");
  puzzleContainer = document.getElementById("puzzleContainer");

  if (imageUpload) {
    imageUpload.addEventListener("change", handleImageUpload);
  }

  // Drag and Drop Functionality
  let draggingPiece = null;

  if (puzzleCanvas) {
    puzzleCanvas.addEventListener("mousedown", (e) => {
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      for (let i = puzzlePieces.length - 1; i >= 0; i--) {
        const piece = puzzlePieces[i];
        if (
          mouseX > piece.x &&
          mouseX < piece.x + piece.width &&
          mouseY > piece.y &&
          mouseY < piece.y + piece.height
        ) {
          draggingPiece = piece;
          puzzlePieces.splice(i, 1);
          puzzlePieces.push(draggingPiece);
          drawPuzzle();
          break;
        }
      }
    });

    puzzleCanvas.addEventListener("mousemove", (e) => {
      if (draggingPiece) {
        draggingPiece.x = e.offsetX - draggingPiece.width / 2;
        draggingPiece.y = e.offsetY - draggingPiece.height / 2;
        drawPuzzle();
      }
    });

    puzzleCanvas.addEventListener("mouseup", () => {
      draggingPiece = null;
    });
  }
}

// Function to get the dominant color from an image
function getDominantColor(img) {
  if (!img || !img.width || !img.height) {
    return "rgb(128,128,128)"; // Default color if image data is invalid
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);

  const imageData = context.getImageData(0, 0, img.width, img.height).data;
  const colorCounts = {};

  for (let i = 0; i < imageData.length; i += 4) {
    const rgba = [
      imageData[i],
      imageData[i + 1],
      imageData[i + 2],
      imageData[i + 3],
    ];
    const colorKey = rgba.join(",");
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }

  const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
  const dominantColor = sortedColors[0][0].split(",").map(Number);

  return `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
}

// Function to create puzzle pieces
function createPuzzlePieces(img) {
  if (!puzzleCanvas) return;

  puzzlePieces = []; // Clear any previous pieces
  const pieceWidth = puzzleCanvas.width / gridSize;
  const pieceHeight = puzzleCanvas.height / gridSize;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const piece = {
        x: Math.random() * (puzzleCanvas.width - pieceWidth),
        y: Math.random() * (puzzleCanvas.height - pieceHeight),
        width: pieceWidth,
        height: pieceHeight,
        correctX: col * pieceWidth, // Original position
        correctY: row * pieceHeight, // Original position
      };

      puzzlePieces.push(piece);
    }
  }

  drawPuzzle(); // Draw the shuffled pieces on the canvas
}

// Function to draw the puzzle pieces on the canvas
function drawPuzzle() {
  if (!ctx || !uploadedImage) return;

  ctx.clearRect(0, 0, puzzleCanvas.width, puzzleCanvas.height);

  puzzlePieces.forEach((piece) => {
    ctx.drawImage(
      uploadedImage,
      (piece.correctX / puzzleCanvas.width) * uploadedImage.width,
      (piece.correctY / puzzleCanvas.height) * uploadedImage.height,
      uploadedImage.width / gridSize,
      uploadedImage.height / gridSize,
      piece.x,
      piece.y,
      piece.width,
      piece.height
    );
  });
}

// Function to handle image upload
function handleImageUpload(e) {
  if (!puzzleCanvas || !puzzleContainer) return;

  const file = e.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    uploadedImage = new Image();
    uploadedImage.onload = function () {
      puzzleCanvas.width = puzzleContainer.clientWidth;
      puzzleCanvas.height = puzzleContainer.clientHeight;

      puzzleContainer.style.backgroundColor = getDominantColor(uploadedImage);
      createPuzzlePieces(uploadedImage);
    };
    uploadedImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Check if we're in a browser environment
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // If document is already loaded, initialize immediately
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeModule);
  } else {
    initializeModule();
  }
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports)
  module.exports = {
    createPuzzlePieces,
    handleImageUpload,
    getDominantColor,
    drawPuzzle,
    initializeModule,
    getPuzzlePieces: () => puzzlePieces,
    getGridSize: () => gridSize,
  };

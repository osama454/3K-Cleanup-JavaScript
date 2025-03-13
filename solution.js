// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // Set canvas to full window size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas();
  }

  // Global array to store all figure data (exposed for tests)
  window.figures = [];
  // Initial resize and add event listener for window resize
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function drawFigure(x, y, type, color) {
    ctx.fillStyle = color;
    switch (type) {
      case 0: // Rectangle
        ctx.fillRect(x, y, 50, 30);
        break;
      case 1: // Circle
        ctx.beginPath();
        ctx.arc(x + 25, y + 25, 25, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 2: // Triangle
        ctx.beginPath();
        ctx.moveTo(x + 25, y);
        ctx.lineTo(x, y + 50);
        ctx.lineTo(x + 50, y + 50);
        ctx.closePath();
        ctx.fill();
        break;
      case 3: // Star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          let angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
          ctx.lineTo(
            x + 25 + 25 * Math.cos(angle),
            y + 25 + 25 * Math.sin(angle)
          );
          angle += Math.PI / 5;
          ctx.lineTo(
            x + 25 + 10 * Math.cos(angle),
            y + 25 + 10 * Math.sin(angle)
          );
        }
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    figures.forEach(({ x, y, type, color }) => {
      drawFigure(x, y, type, color);
    });
  }

  let isDragging = false;
  let selectedFigure = null;
  let offsetX, offsetY;

  function isPointInFigure(x, y, figure) {
    // Simple bounding box check - could be improved for more accurate hit detection
    return (
      x >= figure.x && x <= figure.x + 50 && y >= figure.y && y <= figure.y + 50
    );
  }

  canvas.addEventListener("mousedown", (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Check if clicking on an existing figure for dragging (check from top to bottom)
    for (let i = figures.length - 1; i >= 0; i--) {
      const figure = figures[i];
      if (isPointInFigure(mouseX, mouseY, figure)) {
        selectedFigure = figure;
        offsetX = mouseX - figure.x;
        offsetY = mouseY - figure.y;
        isDragging = true;

        // Move the selected figure to the end of the array so it's drawn on top
        figures.splice(i, 1);
        figures.push(selectedFigure);
        redrawCanvas();
        return; // Exit early if we found a figure to drag
      }
    }

    // If not dragging an existing shape, create a new one
    if (!isDragging) {
      const newFigure = {
        x: mouseX - 25,
        y: mouseY - 25,
        type: Math.floor(Math.random() * 4),
        color: getRandomColor(),
      };
      figures.push(newFigure);
      redrawCanvas();
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging && selectedFigure) {
      selectedFigure.x = e.clientX - offsetX;
      selectedFigure.y = e.clientY - offsetY;
      redrawCanvas();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    selectedFigure = null;
  });

  // Also handle touch events for mobile devices
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener("touchend", (e) => {
    const mouseEvent = new MouseEvent("mouseup");
    canvas.dispatchEvent(mouseEvent);
  });

  // Helper for tests: simulate a drag from one point to another
  window.simulateDrag = function (fromX, fromY, toX, toY) {
    for (let i = figures.length - 1; i >= 0; i--) {
      let fig = figures[i];
      if (isPointInFigure(fromX, fromY, fig)) {
        fig.x = toX - 25;
        fig.y = toY - 25;
        redrawCanvas();
        break;
      }
    }
  };

  // Initial draw
  redrawCanvas();
});

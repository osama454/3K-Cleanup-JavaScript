Hi, i want to create 3D board game on javascript. To get started I want to be able to throw a 3d cube with collision and have it bounce as a dice when I press the “Roll the dice” button. Then the game should show me on screen what number I rolled. Here is my code so far:

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>3D Dice Game</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
    #result { position: absolute; top: 10px; left: 10px; color: white; font-size: 24px; }
  </style>
</head>
<body>
    <div id="result">Roll the dice!</div>
    <button id="rollButton">Roll Dice</button>
    <div id="debugInfo"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
      // Since cannon-es loading wasn't working correctly, we'll use cannon.js instead
      window.CANNON = { REVISION: "3" };
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

```js
// Constants for dice faces mapping - [Top, Bottom, Right, Left, Front, Back]
const DICE_FACE_MAP = [1, 6, 2, 5, 3, 4];

// Game state variables
let isRolling = false;
let rollingTimeLeft = 0;
let diceValue = null;
let dice, diceBody;

// Helper to draw pips
function drawCircle(ctx, x, y, radius) {
}

// Create textures for dice
function createDiceTextures() {
}

// Get the face pointing up
function getDiceValue() {
}

// Check if dice has stopped moving
function isDiceStable() {
}

// Initialize the game
function initGame() {
}

// Start the game when page loads
window.addEventListener("DOMContentLoaded", initGame);
```

Please write the complete code files.
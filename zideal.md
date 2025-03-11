1. `index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>3D Dice Game</title>
    <style>
      body {
        margin: 0;
        overflow: hidden;
        background-color: #333;
        font-family: Arial, sans-serif;
      }
      canvas {
        display: block;
      }
      #result {
        position: absolute;
        top: 20px;
        left: 20px;
        color: white;
        font-size: 32px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }
      #rollButton {
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        font-size: 18px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      #rollButton:hover {
        background-color: #3e8e41;
      }
      #debugInfo {
        position: absolute;
        bottom: 10px;
        left: 10px;
        color: white;
        font-size: 14px;
      }
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

2. `script.js`
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
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fill();
}

// Create textures for dice
function createDiceTextures() {
  const materials = [];
  const faceValues = [2, 5, 1, 6, 3, 4]; // For BoxGeometry: [right, left, top, bottom, front, back]

  for (let i = 0; i < 6; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 128);

    context.fillStyle = "#000000";
    const faceValue = faceValues[i];

    // Different pip arrangements for each face
    switch (faceValue) {
      case 1:
        drawCircle(context, 64, 64, 24);
        break;
      case 2:
        drawCircle(context, 32, 32, 16);
        drawCircle(context, 96, 96, 16);
        break;
      case 3:
        drawCircle(context, 32, 32, 16);
        drawCircle(context, 64, 64, 16);
        drawCircle(context, 96, 96, 16);
        break;
      case 4:
        drawCircle(context, 32, 32, 16);
        drawCircle(context, 32, 96, 16);
        drawCircle(context, 96, 32, 16);
        drawCircle(context, 96, 96, 16);
        break;
      case 5:
        drawCircle(context, 32, 32, 14);
        drawCircle(context, 32, 96, 14);
        drawCircle(context, 64, 64, 14);
        drawCircle(context, 96, 32, 14);
        drawCircle(context, 96, 96, 14);
        break;
      case 6:
        drawCircle(context, 32, 32, 14);
        drawCircle(context, 32, 64, 14);
        drawCircle(context, 32, 96, 14);
        drawCircle(context, 96, 32, 14);
        drawCircle(context, 96, 64, 14);
        drawCircle(context, 96, 96, 14);
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.5,
      metalness: 0.2,
    });
    materials.push(material);
  }

  return materials;
}

// Get the face pointing up
function getDiceValue() {
  if (!dice) return null;

  const diceQuaternion = dice.quaternion.clone();

  const directions = [
    new THREE.Vector3(0, 1, 0), // Top
    new THREE.Vector3(0, -1, 0), // Bottom
    new THREE.Vector3(1, 0, 0), // Right
    new THREE.Vector3(-1, 0, 0), // Left
    new THREE.Vector3(0, 0, 1), // Front
    new THREE.Vector3(0, 0, -1), // Back
  ];

  const worldUp = new THREE.Vector3(0, 1, 0);

  let maxAlignment = -Infinity;
  let faceIndex = -1;

  for (let i = 0; i < directions.length; i++) {
    const rotatedDirection = directions[i].clone();
    rotatedDirection.applyQuaternion(diceQuaternion);

    const alignment = rotatedDirection.dot(worldUp);

    if (alignment > maxAlignment) {
      maxAlignment = alignment;
      faceIndex = i;
    }
  }

  document.getElementById("debugInfo").innerHTML =
    `Angular velocity: ${diceBody.angularVelocity.length().toFixed(2)}, ` +
    `Linear velocity: ${diceBody.velocity.length().toFixed(2)}<br>` +
    `Current value: ${DICE_FACE_MAP[faceIndex]}`;

  return DICE_FACE_MAP[faceIndex];
}

// Check if dice has stopped moving
function isDiceStable() {
  const angVel = diceBody.angularVelocity;
  const linVel = diceBody.velocity;
  const angVelMagnitude = Math.sqrt(
    angVel.x * angVel.x + angVel.y * angVel.y + angVel.z * angVel.z
  );
  const linVelMagnitude = Math.sqrt(
    linVel.x * linVel.x + linVel.y * linVel.y + linVel.z * linVel.z
  );

  return angVelMagnitude < 0.1 && linVelMagnitude < 0.1;
}

// Initialize the game
function initGame() {
  // Roll dice function
  document.getElementById("rollButton").addEventListener("click", () => {
    // Reset display
    document.getElementById("result").innerHTML = "Rolling...";

    // Set initial position above the center
    diceBody.position.set(0, 5, 0);
    diceBody.velocity.set(
      Math.random() * 5 - 2.5,
      Math.random() * 2 + 1,
      Math.random() * 5 - 2.5
    );

    // Set random angular velocity for spinning
    diceBody.angularVelocity.set(
      Math.random() * 20 - 10,
      Math.random() * 20 - 10,
      Math.random() * 20 - 10
    );

    // Reset stabilization detection
    isRolling = true;
    rollingTimeLeft = 3; // seconds to wait before checking result
  });

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  scene.add(directionalLight);

  // Physics world setup
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;
  world.defaultContactMaterial.restitution = 0.3;

  // Floor
  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({ mass: 0 });
  floorBody.addShape(floorShape);
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  floorBody.position.set(0, -2, 0);
  world.addBody(floorBody);

  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.2,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Create walls to keep dice from falling off
  function createWall(x, z, rotY) {
    const wallShape = new CANNON.Box(new CANNON.Vec3(10, 2, 0.2));
    const wallBody = new CANNON.Body({ mass: 0 });
    wallBody.addShape(wallShape);
    wallBody.position.set(x, 0, z);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotY);
    world.addBody(wallBody);

    const wallGeometry = new THREE.BoxGeometry(20, 4, 0.4);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.2,
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, 0, z);
    wall.rotation.y = rotY;
    wall.receiveShadow = true;
    scene.add(wall);
  }

  // Create four walls
  createWall(0, 10, 0);
  createWall(0, -10, 0);
  createWall(10, 0, Math.PI / 2);
  createWall(-10, 0, Math.PI / 2);

  // Create dice
  const diceSize = 1.5;
  const diceGeometry = new THREE.BoxGeometry(diceSize, diceSize, diceSize);
  const diceMaterials = createDiceTextures();
  dice = new THREE.Mesh(diceGeometry, diceMaterials);
  dice.castShadow = true;
  dice.receiveShadow = true;
  dice.position.set(0, 5, 0);
  scene.add(dice);

  // Dice physics body
  const diceShape = new CANNON.Box(
    new CANNON.Vec3(diceSize / 2, diceSize / 2, diceSize / 2)
  );
  diceBody = new CANNON.Body({ mass: 1 });
  diceBody.addShape(diceShape);
  diceBody.position.set(0, 5, 0);
  diceBody.angularDamping = 0.3;
  diceBody.linearDamping = 0.3;
  world.addBody(diceBody);

  // Animation loop
  const clock = new THREE.Clock();
  let previousTime = 0;

  function animate() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    requestAnimationFrame(animate);

    // Update physics
    world.step(1 / 60, deltaTime, 3);

    // Update dice visual position and rotation
    dice.position.copy(diceBody.position);
    dice.quaternion.copy(diceBody.quaternion);

    // Handle dice rolling state
    if (isRolling) {
      rollingTimeLeft -= deltaTime;

      if (rollingTimeLeft <= 0 && isDiceStable()) {
        isRolling = false;
        diceValue = getDiceValue();
        document.getElementById(
          "result"
        ).textContent = `You rolled a ${diceValue}!`;
      }

      // Update debug info
      getDiceValue();
    }

    renderer.render(scene, camera);
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

  // Start animation
  animate();
}

// Start the game when page loads
window.addEventListener("DOMContentLoaded", initGame);

```


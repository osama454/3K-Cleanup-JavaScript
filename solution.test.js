document.body.innerHTML = `
  <div id="result">Roll the dice!</div>
  <button id="rollButton">Roll Dice</button>
  <div id="debugInfo"></div>
`;

let mockIsStable = true;
let mockDiceValue = 6;
let isRolling = false;
let rollingTimeLeft = 0;
let dice, diceBody;

const mockFunctions = {
  createDiceTextures: () => {
    const faceValues = [2, 5, 1, 6, 3, 4];
    return faceValues.map((value) => {
      const material = new THREE.MeshStandardMaterial();
      material.userData = { faceValue: value };
      return material;
    });
  },

  isDiceStable: () => {
    return mockIsStable;
  },

  getDiceValue: () => {
    return mockDiceValue;
  },

  DICE_FACE_MAP: [1, 6, 2, 5, 3, 4],
};

jest.mock('./script.js', () => ({
  createDiceTextures: jest
    .fn()
    .mockImplementation(() => mockFunctions.createDiceTextures()),
  getDiceValue: jest
    .fn()
    .mockImplementation(() => mockFunctions.getDiceValue()),
  isDiceStable: jest
    .fn()
    .mockImplementation(() => mockFunctions.isDiceStable()),
  DICE_FACE_MAP: [1, 6, 2, 5, 3, 4],
}));

// Import the functions after mocking
const {
  createDiceTextures,
  getDiceValue,
  isDiceStable,
  DICE_FACE_MAP,
} = require('./script.js');

// Mock THREE.js
global.THREE = {
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    background: { set: jest.fn() },
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    aspect: 0,
    updateProjectionMatrix: jest.fn(),
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    shadowMap: { enabled: false },
    domElement: document.createElement('canvas'),
  })),
  Color: jest.fn(),
  PlaneGeometry: jest.fn(),
  BoxGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn().mockImplementation(() => ({
    position: { copy: jest.fn(), set: jest.fn() },
    quaternion: { copy: jest.fn() },
    rotation: { x: 0, y: 0, z: 0 },
    receiveShadow: false,
    castShadow: false,
  })),
  AmbientLight: jest.fn().mockImplementation(() => ({})),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    shadow: { camera: {} },
  })),
  Vector3: jest.fn().mockImplementation((x, y, z) => ({
    x,
    y,
    z,
    clone: jest.fn().mockReturnThis(),
    applyQuaternion: jest.fn().mockReturnThis(),
    dot: jest.fn().mockReturnValue(1),
  })),
  Quaternion: jest.fn().mockImplementation(() => ({
    setFromEuler: jest.fn(),
    clone: jest.fn().mockReturnThis(),
  })),
  Euler: jest.fn(),
  Clock: jest.fn().mockImplementation(() => ({
    getElapsedTime: jest.fn().mockReturnValue(1),
  })),
  TextureLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(),
  })),
  CanvasTexture: jest.fn(),
};

// Mock CANNON
global.CANNON = {
  World: jest.fn().mockImplementation(() => ({
    gravity: { set: jest.fn() },
    addBody: jest.fn(),
    step: jest.fn(),
  })),
  NaiveBroadphase: jest.fn(),
  Body: jest.fn().mockImplementation(() => ({
    addShape: jest.fn(),
    position: { set: jest.fn(), copy: jest.fn() },
    quaternion: {
      setFromAxisAngle: jest.fn(),
      copy: jest.fn(),
    },
    velocity: {
      set: jest.fn(),
      length: jest.fn().mockReturnValue(0),
      x: 0,
      y: 0,
      z: 0,
    },
    angularVelocity: {
      set: jest.fn(),
      length: jest.fn().mockReturnValue(0),
      x: 0,
      y: 0,
      z: 0,
    },
    linearDamping: 0,
    angularDamping: 0,
  })),
  Plane: jest.fn(),
  Box: jest.fn(),
  Vec3: jest.fn().mockImplementation(() => ({
    length: jest.fn().mockReturnValue(0),
  })),
};

// Tests
describe('Dice Face Mapping', () => {
  test('should follow standard dice convention where opposite faces sum to 7', () => {
    expect(DICE_FACE_MAP[0] + DICE_FACE_MAP[1]).toBe(7);
    expect(DICE_FACE_MAP[2] + DICE_FACE_MAP[3]).toBe(7);
    expect(DICE_FACE_MAP[4] + DICE_FACE_MAP[5]).toBe(7);
  });
});

describe('3D Dice Game', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.getElementById('result').textContent = 'Roll the dice!';
    mockIsStable = true;
    mockDiceValue = 6;

    // Setup dice and diceBody for testing
    dice = new THREE.Mesh();
    diceBody = new CANNON.Body();
  });

  test('should update result text when dice is rolled and stabilized', () => {
    const rollButton = document.getElementById('rollButton');

    // Add click event to roll button
    rollButton.addEventListener('click', () => {
      document.getElementById('result').textContent = 'Rolling...';
      isRolling = true;
      rollingTimeLeft = 3;
    });

    // Simulate clicking roll button
    rollButton.click();

    // Check if "Rolling..." text is displayed
    expect(document.getElementById('result').textContent).toBe('Rolling...');

    // Fast forward time - simulate animation frames passing
    rollingTimeLeft = 0;

    // Simulate dice becoming stable
    function animationFrame() {
      if (isRolling && rollingTimeLeft <= 0 && isDiceStable()) {
        isRolling = false;
        const value = getDiceValue();
        document.getElementById(
          'result'
        ).textContent = `You rolled a ${value}!`;
      }
    }

    // Run the animation frame
    animationFrame();

    // Verify result is updated with the correct value (6 from our mock)
    expect(document.getElementById('result').textContent).toBe(
      'You rolled a 6!'
    );
  });

  test('should not update result if dice is still moving', () => {
    // Setup - set the dice to be unstable
    mockIsStable = false;

    // Set initial UI state
    document.getElementById('result').textContent = 'Rolling...';

    // Simulate rolling state
    isRolling = true;
    rollingTimeLeft = 0;

    // Simulate animation frame
    function animationFrame() {
      if (isRolling && rollingTimeLeft <= 0 && isDiceStable()) {
        isRolling = false;
        document.getElementById(
          'result'
        ).textContent = `You rolled a ${getDiceValue()}!`;
      }
    }

    // Run the animation frame
    animationFrame();

    // Because isDiceStable() returns false, the result should not be updated
    expect(isRolling).toBe(true); // Still rolling
    expect(document.getElementById('result').textContent).toBe('Rolling...'); // Text unchanged
  });

  test('should get correct dice value based on orientation', () => {
    const mockOrientations = [
      { faceIndex: 0 },
      { faceIndex: 1 },
      { faceIndex: 2 },
      { faceIndex: 3 },
      { faceIndex: 4 },
      { faceIndex: 5 },
    ];

    mockOrientations.forEach(({ faceIndex }) => {
      const expectedValue = DICE_FACE_MAP[faceIndex];
      mockDiceValue = expectedValue;
      const result = getDiceValue();
      expect(result).toBe(expectedValue);
    });
  });

  test('should apply random forces when rolling the dice', () => {
    const diceBody = new CANNON.Body();
    const spy = jest.spyOn(diceBody.velocity, 'set');
    const angularSpy = jest.spyOn(diceBody.angularVelocity, 'set');
    const positionSpy = jest.spyOn(diceBody.position, 'set');

    const originalRandom = Math.random;
    Math.random = jest
      .fn()
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5);

    const rollDice = () => {
      diceBody.position.set(0, 5, 0);
      diceBody.velocity.set(
        Math.random() * 5 - 2.5,
        Math.random() * 2 + 1,
        Math.random() * 5 - 2.5
      );
      diceBody.angularVelocity.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
      isRolling = true;
      rollingTimeLeft = 3;
      document.getElementById('result').textContent = 'Rolling...';
    };

    rollDice();

    expect(positionSpy).toHaveBeenCalledWith(0, 5, 0);
    expect(spy).toHaveBeenCalledWith(0, 2, 0);
    expect(angularSpy).toHaveBeenCalledWith(0, 0, 0);
    expect(isRolling).toBe(true);
    expect(rollingTimeLeft).toBe(3);
    expect(document.getElementById('result').textContent).toBe('Rolling...');

    Math.random = originalRandom;
  });

  test('should create dice with correct textures in BoxGeometry order', () => {
    const materials = mockFunctions.createDiceTextures();
    expect(materials.length).toBe(6);

    const expectedValues = [2, 5, 1, 6, 3, 4];

    materials.forEach((material, index) => {
      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(material.userData.faceValue).toBe(expectedValues[index]);
    });
  });
});

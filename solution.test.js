const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Slot Machine Functions', () => {
  let dom;
  let document;
  let window;
  let scriptCode;

  beforeEach(() => {
    // Load index.html
    const indexPath = path.resolve(__dirname, 'solution.html');
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
  
    // Create JSDOM instance
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable'
    });
  
    window = dom.window;
    document = window.document;
  
    // Extract all script content from <script> tags
    scriptCode = '';
    document.querySelectorAll('script').forEach(script => {
      if (script.textContent) {
        scriptCode += script.textContent + '\n';
      }
    });
  
    // Assign global variables for test access
    global.window = window;
    global.document = document;
    global.alert = jest.fn();
  
    // Mock audio play and pause
    const audio = document.getElementById('slotReelSound');
    if (audio) {
      audio.play = jest.fn();
      audio.pause = jest.fn();
    }
  });
  

  afterEach(() => {
    jest.clearAllMocks();
    delete global.window;
    delete global.document;
    delete global.alert;
  });

  test('createSymbolElement creates a symbol element correctly', () => {
    const symbol = '😀';
    const element = window.createSymbolElement(symbol);
    expect(element.classList.contains('symbol')).toBe(true);
    expect(element.textContent).toBe(symbol);
  });

  test('assignScore returns the correct score for a symbol', () => {
    expect(window.assignScore('😀')).toBe(1);
    expect(window.assignScore('🌓')).toBe(49);
    expect(window.assignScore('!')).toBe(0);
  });

  describe('spin function', () => {
    test('should not allow multiple spins while spinning', () => {
      window.spinning = true;
      window.spin();
      expect(global.alert).not.toHaveBeenCalled();
    });
  });

  test('updateScoreDisplay updates the score display', () => {
    const scoreDisplay = document.getElementById('scoreDisplay');
    window.updateScoreDisplay(10);
    expect(scoreDisplay.textContent).toBe('Score: 10');
  });

  test('createSymbolElement should create a div with the correct symbol', () => {
    const symbol = '💎';
    const element = window.createSymbolElement(symbol);
    expect(element.tagName).toBe('DIV');
    expect(element.classList.contains('symbol')).toBe(true);
    expect(element.textContent).toBe(symbol);
  });

  test('assignScore should return correct score for a given symbol', () => {
    expect(window.assignScore('💎')).toBe(16);
    expect(window.assignScore('🍎')).toBe(20);
    expect(window.assignScore('❌')).toBe(0);
  });

  test('reset should reset slot machine to initial state', () => {
    document.body.innerHTML = `<div id="scoreDisplay"></div>`;
    window.reset();
    expect(document.getElementById('scoreDisplay').textContent).toBe('Score: 0');
  });

  test('updateScoreDisplay should correctly update score display', () => {
    document.body.innerHTML = `<div id="scoreDisplay"></div>`;
    window.updateScoreDisplay(100);
    expect(document.getElementById('scoreDisplay').textContent).toBe('Score: 100');
  });
});

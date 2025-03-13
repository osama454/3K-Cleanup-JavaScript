```html
<!DOCTYPE html>
<html>
  <head>
    <title>Speech Recognition Game</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div id="gameContainer">
      <div id="shape"></div>
      <div id="message"></div>
      <div id="score">Score: 0</div>
      <div id="controls">
        <button id="startButton">Start Game</button>
        <button id="resetButton">Reset Game</button>
      </div>
    </div>
    <script type="module" src="script.js"></script>
  </body>
</html>
```

`jest.config.js`

```javascript
export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
```

`script.js`

```javascript
import { SpeechGame } from "./speechGame.js";

document.addEventListener("DOMContentLoaded", () => {
  const shapeElement = document.getElementById("shape");
  const messageElement = document.getElementById("message");
  const scoreElement = document.getElementById("score");
  const startButton = document.getElementById("startButton");
  const resetButton = document.getElementById("resetButton");

  const game = new SpeechGame(shapeElement, messageElement, scoreElement);

  startButton.addEventListener("click", () => {
    if (game.isListening) {
      game.stopListening();
      startButton.textContent = "Start Game";
    } else {
      game.init();
      startButton.textContent = "Stop Game";
    }
  });

  resetButton.addEventListener("click", () => {
    game.reset();
    startButton.textContent = "Start Game";
  });
});
```

`speechGame.js`

```javascript
export class SpeechGame {
  constructor(shapeElement, messageElement, scoreElement) {
    this.shapeElement = shapeElement;
    this.messageElement = messageElement;
    this.scoreElement = scoreElement;
    this.score = 0;
    this.currentShape = '';
    this.recognition = null;
    this.isListening = false;
    this.shapes = ['circle', 'square'];
  }

  init() {
    this.setupSpeechRecognition();
    this.generateShape();
    this.startListening();
  }

  setupSpeechRecognition() {
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (window.SpeechRecognition) {
      this.recognition = new window.SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.toLowerCase();
        this.handleSpeechResult(spokenWord);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          setTimeout(() => {
            this.recognition.start();
          }, 100);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        if (event.error.includes('not-allowed')) {
          alert(
            'Microphone access is not allowed. Please enable permissions in your browser settings.'
          );
        }

        this.messageElement.textContent =
          'Speech recognition error. Please try again.';
      };
    } else {
      this.messageElement.textContent =
        'Speech recognition not supported in this browser.';
    }
  }

  handleSpeechResult(spokenWord) {
    console.log('Spoken word:', spokenWord);
    console.log('Current shape:', this.currentShape);

    if (spokenWord === this.currentShape) {
      this.messageElement.textContent = 'Correct!';
      this.score++;
      this.scoreElement.textContent = `Score: ${this.score}`;
      this.generateShape();
    } else {
      this.messageElement.textContent = 'Try again!';
    }
  }

  generateShape() {
    const randomIndex = Math.floor(Math.random() * this.shapes.length);
    this.currentShape = this.shapes[randomIndex];

    if (this.shapeElement) {
      this.shapeElement.className = '';
      this.shapeElement.classList.add(this.currentShape);
      this.shapeElement.style.top = `${
        Math.random() * (window.innerHeight - 200)
      }px`;
      this.shapeElement.style.left = `${
        Math.random() * (window.innerWidth - 200)
      }px`;
    }

    return this.currentShape;
  }

  startListening() {
    if (this.recognition) {
      this.isListening = true;
      this.recognition.start();
      this.messageElement.textContent = 'Listening... Say the shape name!';
    }
  }

  stopListening() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
      this.messageElement.textContent = 'Game paused';
    }
  }

  reset() {
    this.score = 0;
    this.scoreElement.textContent = 'Score: 0';
    this.messageElement.textContent = '';
    this.generateShape();
    if (this.isListening) {
      this.stopListening();
    }
  }
}

```

`styles.css`

```css
#gameContainer {
  position: relative;
  width: 100%;
  height: 100vh;
}

#shape {
  position: absolute;
  width: 100px;
  height: 100px;
  transition: all 0.3s ease;
}

.circle {
  background: red;
  border-radius: 50%;
}

.square {
  background: blue;
}

#message {
  position: fixed;
  top: 20px;
  left: 20px;
  font-size: 24px;
}

#score {
  position: fixed;
  top: 50px;
  left: 20px;
  font-size: 20px;
}

#controls {
  position: fixed;
  bottom: 20px;
  left: 20px;
}

button {
  padding: 10px 20px;
  margin-right: 10px;
  font-size: 16px;
  cursor: pointer;
}
```

`.babelrc`

```
{
  "presets": ["@babel/preset-env"]
}
```

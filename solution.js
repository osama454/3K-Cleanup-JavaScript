class SpeechGame {
  constructor(shapeElement, messageElement, scoreElement) {
    this.shapeElement = shapeElement;
    this.messageElement = messageElement;
    this.scoreElement = scoreElement;
    this.score = 0;
    this.currentShape = "";
    this.recognition = null;
    this.isListening = false;
    this.shapes = ["circle", "square"];
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
        console.error("Speech recognition error:", event.error);

        if (event.error.includes("not-allowed")) {
          alert(
            "Microphone access is not allowed. Please enable permissions in your browser settings."
          );
        }

        this.messageElement.textContent =
          "Speech recognition error. Please try again.";
      };
    } else {
      this.messageElement.textContent =
        "Speech recognition not supported in this browser.";
    }
  }

  handleSpeechResult(spokenWord) {
    console.log("Spoken word:", spokenWord);
    console.log("Current shape:", this.currentShape);

    if (spokenWord === this.currentShape) {
      this.messageElement.textContent = "Correct!";
      this.score++;
      this.scoreElement.textContent = `Score: ${this.score}`;
      this.generateShape();
    } else {
      this.messageElement.textContent = "Try again!";
    }
  }

  generateShape() {
    const randomIndex = Math.floor(Math.random() * this.shapes.length);
    this.currentShape = this.shapes[randomIndex];

    if (this.shapeElement) {
      this.shapeElement.className = "";
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
      this.messageElement.textContent = "Listening... Say the shape name!";
    }
  }

  stopListening() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
      this.messageElement.textContent = "Game paused";
    }
  }

  reset() {
    this.score = 0;
    this.scoreElement.textContent = "Score: 0";
    this.messageElement.textContent = "";
    this.generateShape();
    if (this.isListening) {
      this.stopListening();
    }
  }
}

if (typeof module !== "undefined")
  module.exports = {
    SpeechGame,
  };

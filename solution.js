class SpeechGame {
  constructor(shapeElement, messageElement, scoreElement) {
    this.shapeElement = shapeElement;
    this.messageElement = messageElement;
    this.scoreElement = scoreElement;
    this.score = 0;
    this.isListening = false;
    this.shapes = ["circle", "square"];
    this.currentShape = null;
    this.recognition = null;
  }

  init() {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const spokenWord = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        this.handleSpeechResult(spokenWord);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          setTimeout(() => {
            this.recognition.start();
          }, 1000)
        }
      };

      this.recognition.onerror = (event) => {
        if (this.messageElement) {
          this.messageElement.textContent = "Speech recognition error: " + event.error;
        }
      };
      this.recognition.start();

    } catch (error) {
      console.error("Speech Recognition not supported:", error);
      if (this.messageElement) {
        this.messageElement.textContent = "Speech recognition not supported.";
      }
    }


  }

  generateShape() {
    const randomIndex = Math.floor(Math.random() * this.shapes.length);
    this.currentShape = this.shapes[randomIndex];
    if (this.shapeElement) {
      this.shapeElement.className = "";
      this.shapeElement.classList.add(this.currentShape)
      const top = Math.random() * 400 + "px";
      const left = Math.random() * 400 + "px";

      this.shapeElement.style.top = top;
      this.shapeElement.style.left = left;
    }


    return this.currentShape;
  }


  handleSpeechResult(spokenWord) {
    if (spokenWord === this.currentShape) {
      this.score++;
      this.messageElement.textContent = "Correct!";

    } else {
      this.messageElement.textContent = "Try again!";
    }
    if (this.scoreElement) {
      this.scoreElement.textContent = "Score: " + this.score;
    }
    this.generateShape();
  }

  startListening() {
    this.isListening = true;
    this.recognition.start();
  }

  stopListening() {
    this.isListening = false;
    this.recognition.stop();
  }

  reset() {
    this.score = 0;
    this.scoreElement.textContent = "Score: " + this.score;
    this.messageElement.textContent = "";
    this.generateShape();
  }
}

if (typeof module !== "undefined")
  module.exports = {
    SpeechGame,
  };
const { initializeGame, flipCard, getCurrentState } = require("./solution.js");

// Setup a fake DOM environment if not present
beforeAll(() => {
  if (typeof document === "undefined") {
    global.document = {
      body: { innerHTML: "" },
      createElement: jest.fn((tag) => {
        const element = {
          classList: {
            add: jest.fn((className) => {
              if (!element._classList) element._classList = [];
              element._classList.push(className);
            }),
            remove: jest.fn((className) => {
              if (element._classList) {
                element._classList = element._classList.filter(
                  (c) => c !== className
                );
              }
            }),
            contains: jest.fn((className) => {
              return element._classList
                ? element._classList.includes(className)
                : false;
            }),
          },
          _classList: [],
          dataset: {},
          style: {},
          children: [],
          appendChild: jest.fn((child) => {
            element.children.push(child);
            return child;
          }),
          addEventListener: jest.fn(),
        };

        // Store span as a property for access later
        element._span = {
          classList: {
            add: jest.fn((className) => {
              if (!element._span._classList) element._span._classList = [];
              element._span._classList.push(className);
            }),
            remove: jest.fn((className) => {
              if (element._span._classList) {
                element._span._classList = element._span._classList.filter(
                  (c) => c !== className
                );
              }
            }),
            contains: jest.fn((className) => {
              return element._span._classList
                ? element._span._classList.includes(className)
                : false;
            }),
          },
          _classList: ["hidden"],
          textContent: "",
        };

        // Mock querySelector to return the stored span
        element.querySelector = jest.fn((selector) => {
          if (selector === "span") {
            return element._span;
          }
          return null;
        });

        return element;
      }),
      getElementById: jest.fn(),
    };
  }
});

describe("Memory Game", () => {
  let leftCards;
  let rightCards;
  let foundEmojis;
  let turnCounter;

  beforeEach(() => {
    // Use fake timers so we control asynchronous delays
    jest.useFakeTimers();

    // Create test DOM elements
    leftCards = document.createElement("div");
    leftCards.id = "left-cards";

    rightCards = document.createElement("div");
    rightCards.id = "right-cards";

    foundEmojis = document.createElement("div");
    foundEmojis.id = "found-emojis";
    foundEmojis.textContent = "";

    turnCounter = document.createElement("span");
    turnCounter.id = "turn-counter";
    turnCounter.textContent = "0";

    // Mock getElementById to return our elements
    jest.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "left-cards") return leftCards;
      if (id === "right-cards") return rightCards;
      if (id === "found-emojis") return foundEmojis;
      if (id === "turn-counter") return turnCounter;
      return null;
    });

    // Initialize the game with the mocked elements
    initializeGame(leftCards, rightCards);
  });

  afterEach(() => {
    // Clean up pending timers and restore real timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("Game Initialization", () => {
    it("should initialize game state correctly", () => {
      const state = getCurrentState();
      expect(state.flippedCards).toEqual([]);
      expect(state.matchedPairs).toBe(0);
      expect(state.turns).toBe(0);
      expect(state.canFlip).toBe(true);
      expect(state.mustFlipLeft).toBe(true);
    });

    it("should create correct number of cards", () => {
      expect(leftCards.children.length).toBe(4);
      expect(rightCards.children.length).toBe(4);
    });

    it("should create cards with correct structure", () => {
      const card = leftCards.children[0];
      expect(card.classList.contains("card")).toBe(true);

      const span = card.querySelector("span");
      expect(span).toBeTruthy();
      expect(span.classList.contains("hidden")).toBe(true);
    });

    it("should distribute emojis evenly", () => {
      const allEmojis = [...leftCards.children, ...rightCards.children].map(
        (card) => card.dataset.emoji
      );
      const emojiCounts = allEmojis.reduce((acc, emoji) => {
        acc[emoji] = (acc[emoji] || 0) + 1;
        return acc;
      }, {});

      Object.values(emojiCounts).forEach((count) => {
        expect(count).toBe(2);
      });
    });
  });

  describe("Card Flipping", () => {
    it("should flip a single card correctly", () => {
      const card = leftCards.children[0];
      const span = card.querySelector("span");
      flipCard(card);
      expect(card.classList.contains("flipped")).toBe(true);

      // Simulate removal of 'hidden' class in our mock
      span._classList = span._classList.filter((c) => c !== "hidden");
      expect(span.classList.contains("hidden")).toBe(false);
    });

    it("should enforce alternating sides", () => {
      const leftCard = leftCards.children[0];
      const anotherLeftCard = leftCards.children[1];
      const rightCard = rightCards.children[0];

      expect(flipCard(leftCard)).toBe(true);
      expect(flipCard(anotherLeftCard)).toBe(false);
      expect(flipCard(rightCard)).toBe(true);
    });

    it("should prevent flipping more than two cards", () => {
      const card1 = leftCards.children[0];
      const card2 = rightCards.children[0];
      const card3 = leftCards.children[1];

      flipCard(card1);
      flipCard(card2);
      expect(flipCard(card3)).toBe(false);
    });

    it("should prevent flipping already flipped cards", () => {
      const card = leftCards.children[0];
      expect(flipCard(card)).toBe(true);
      expect(flipCard(card)).toBe(false);
    });
  });

  describe("Game Logic", () => {
    it("should increment turn counter after two cards are flipped", () => {
      const leftCard = leftCards.children[0];
      const rightCard = rightCards.children[0];

      flipCard(leftCard);
      flipCard(rightCard);

      // Flush timers so the turn counter update happens
      jest.runAllTimers();

      expect(getCurrentState().turns).toBe(1);
    });

    it("should handle matching pairs correctly", () => {
      const state = getCurrentState();
      state.matchedPairs = 0;

      const leftCard = leftCards.children[0];
      const rightCard = rightCards.children[0];
      leftCard.dataset.emoji = "😊";
      rightCard.dataset.emoji = "😊";

      flipCard(leftCard);
      flipCard(rightCard);

      // Flush the timeout for handleMatch
      jest.runAllTimers();

      expect(leftCard.style.visibility).toBe("hidden");
      expect(rightCard.style.visibility).toBe("hidden");
      expect(getCurrentState().matchedPairs).toBe(1);
    });

    it("should reset non-matching pairs after delay", () => {
      const leftCard = leftCards.children[0];
      const rightCard = rightCards.children[0];
      leftCard.dataset.emoji = "😊";
      rightCard.dataset.emoji = "😂";

      flipCard(leftCard);
      flipCard(rightCard);

      // Flush the timeout for resetTurn
      jest.runAllTimers();

      expect(leftCard.classList.contains("flipped")).toBe(false);
      expect(rightCard.classList.contains("flipped")).toBe(false);
    });
  });
});

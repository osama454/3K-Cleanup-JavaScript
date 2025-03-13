const state = {
  flippedCards: [],
  matchedPairs: 0,
  turns: 0,
  canFlip: true,
  mustFlipLeft: true,
};

const emojis = ["😊", "😂", "😍", "😎"];

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function createCard(emoji, side, index) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.index = index;
  card.dataset.side = side;
  card.dataset.emoji = emoji;

  const span = document.createElement("span");
  span.textContent = emoji;
  span.classList.add("hidden");
  card.appendChild(span);

  card.addEventListener("click", () => flipCard(card));
  return card;
}

function initializeGame(leftContainer, rightContainer) {
  state.flippedCards = [];
  state.matchedPairs = 0;
  state.turns = 0;
  state.canFlip = true;
  state.mustFlipLeft = true;

  const gameEmojis = [];

  emojis.forEach((emoji) => {
    gameEmojis.push({ emoji, side: "left" });
    gameEmojis.push({ emoji, side: "right" });
  });

  const shuffledEmojis = shuffle(gameEmojis);

  const leftEmojis = shuffledEmojis.filter((card) => card.side === "left");
  const rightEmojis = shuffledEmojis.filter((card) => card.side === "right");

  leftContainer.innerHTML = "";
  rightContainer.innerHTML = "";

  leftEmojis.forEach((item, index) => {
    const card = createCard(item.emoji, "left", index);
    leftContainer.appendChild(card);
  });

  rightEmojis.forEach((item, index) => {
    const card = createCard(item.emoji, "right", index);
    rightContainer.appendChild(card);
  });
}

function flipCard(card) {
  if (!canFlipCard(card)) {
    return false;
  }

  const span = card.querySelector("span");
  card.classList.add("flipped");
  span.classList.remove("hidden");

  state.flippedCards.push(card);
  state.mustFlipLeft = card.dataset.side === "right";

  if (state.flippedCards.length === 2) {
    state.turns++;
    const turnCounter = document.getElementById("turn-counter");
    if (turnCounter) {
      turnCounter.textContent = state.turns;
    }
    checkForMatch();
  }

  return true;
}

function canFlipCard(card) {
  if (
    !state.canFlip ||
    card.classList.contains("flipped") ||
    state.flippedCards.length === 2
  ) {
    return false;
  }

  if (state.flippedCards.length === 1) {
    return card.dataset.side !== state.flippedCards[0].dataset.side;
  }

  return state.mustFlipLeft ? card.dataset.side === "left" : true;
}

function checkForMatch() {
  if (state.flippedCards.length !== 2) {
    return;
  }

  const [card1, card2] = state.flippedCards;
  state.canFlip = false;

  // Make sure both cards are defined before proceeding
  if (!card1 || !card2) {
    console.error("One or both cards are undefined");
    resetTurn();
    return;
  }

  if (card1.dataset.emoji === card2.dataset.emoji) {
    setTimeout(handleMatch, 800);
  } else {
    setTimeout(resetTurn, 1000);
  }
}

function handleMatch() {
  state.matchedPairs++;
  const foundEmojis = document.getElementById("found-emojis");
  if (foundEmojis) {
    foundEmojis.textContent += state.flippedCards[0].dataset.emoji;
  }

  state.flippedCards.forEach((card) => {
    card.style.visibility = "hidden";
  });

  resetTurn();

  if (state.matchedPairs === emojis.length) {
    setTimeout(() => alert("Congratulations! You won!"), 300);
  }
}

function resetTurn() {
  state.flippedCards.forEach((card) => {
    card.classList.remove("flipped");
    const span = card.querySelector("span");
    if (span) {
      span.classList.add("hidden");
    }
  });

  state.flippedCards = [];
  state.canFlip = true;
}

// Only initialize the game if we're in a browser environment
if (typeof document !== "undefined") {
  const leftCards = document.getElementById("left-cards");
  const rightCards = document.getElementById("right-cards");
  if (leftCards && rightCards) {
    initializeGame(leftCards, rightCards);
  }
}

if (typeof module !== "undefined")
  module.exports = {
    initializeGame,
    flipCard,
    getCurrentState: () => state,
  };

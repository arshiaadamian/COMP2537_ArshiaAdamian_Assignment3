const gameContainer = $("#game_grid");
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let clickCount = 0;
let matchedPairs = 0;
let totalPairs = 0;
let timerInterval;
let elapsedTime = 0;
let maxTimeLimit = 75;

$(document).ready(async () => {
  await startGame("easy");

  $("#startBtn").on("click", async () => {
    const difficulty = $("#difficulty").val();
    await startGame(difficulty);
  });

  $("#powerUpBtn").on("click", () => {
    activatePowerUp();
  });

  $("#resetBtn").on("click", async () => {
    const difficulty = $("#difficulty").val();
    await startGame(difficulty);
  });
});

async function startGame(difficulty) {
  clearInterval(timerInterval);
  gameContainer.empty();
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  clickCount = 0;
  matchedPairs = 0;
  elapsedTime = 0;

  gameContainer.removeClass("easy medium hard").addClass(difficulty);

  if (difficulty === "medium") {
    totalPairs = 6;
    maxTimeLimit = 100;
  } else if (difficulty === "hard") {
    totalPairs = 8;
    maxTimeLimit = 120;
  } else {
    totalPairs = 3;
    maxTimeLimit = 75;
  }

  $("#timeLimit").text(maxTimeLimit);
  $("#timer").text("0");
  updateStats();

  const images = await getRandomPokemonImages(totalPairs);
  const cards = [...images, ...images];
  shuffle(cards);

  cards.forEach((img) => {
    const card = $(`
    <div class="card">
      <div class="card-inner">
        <div class="front_face">
          <img src="${img}" alt="Pokémon" />
        </div>
        <div class="back_face">
          <img src="back.webp" alt="Pokéball" />
        </div>
      </div>
    </div>
  `);

    card.on("click", () => handleCardClick(card, img));
    gameContainer.append(card);
  });

  startTimer();
}

function handleCardClick(card, imgSrc) {
  if (lockBoard || card.hasClass("flip")) return;

  card.addClass("flip");

  if (!firstCard) {
    firstCard = { card, imgSrc };
    return;
  }

  secondCard = { card, imgSrc };
  clickCount++;
  updateStats();

  if (firstCard.imgSrc === secondCard.imgSrc) {
    firstCard.card.off("click");
    secondCard.card.off("click");
    matchedPairs++;
    resetBoard();
    updateStats();

    if (matchedPairs === totalPairs) {
      clearInterval(timerInterval);
      alert("🎉 You won!");
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.card.removeClass("flip");
      secondCard.card.removeClass("flip");
      resetBoard();
    }, 1000);
  }
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function updateStats() {
  $("#clickCount").text(clickCount);
  $("#pairsMatched").text(matchedPairs);
  $("#pairsLeft").text(totalPairs - matchedPairs);
  $("#totalPairs").text(totalPairs);
}

function startTimer() {
  $("#timer").text(elapsedTime);
  timerInterval = setInterval(() => {
    elapsedTime++;
    $("#timer").text(elapsedTime);

    if (elapsedTime >= maxTimeLimit) {
      clearInterval(timerInterval);
      alert("⏰ Time's up! Game Over.");
      $(".card").off("click");
    }
  }, 1000);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function getRandomPokemonImages(count) {
  const usedIDs = new Set();
  const images = [];

  while (images.length < count) {
    const id = Math.floor(Math.random() * 1025) + 1;
    if (usedIDs.has(id)) continue;
    usedIDs.add(id);
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    const img = data.sprites.other["official-artwork"].front_default;
    if (img) images.push(img);
  }

  return images;
}

// 🟦 POWER-UP BUTTON FUNCTION
function activatePowerUp() {
  const cards = $(".card:not(.flip)");
  if (cards.length === 0) return;

  lockBoard = true;

  cards.each(function () {
    $(this).addClass("flip");
  });

  setTimeout(() => {
    cards.each(function () {
      $(this).removeClass("flip");
    });
    lockBoard = false;
  }, 1500); // show for 2 seconds
}

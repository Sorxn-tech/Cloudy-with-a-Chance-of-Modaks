const gameArea =
  document.getElementById("gameArea");

const player =
  document.getElementById("player");

const scoreDisplay =
  document.getElementById("score");

const livesDisplay =
  document.getElementById("lives");

const highScoreDisplay =
  document.getElementById("highScore");

const startScreen =
  document.getElementById("startScreen");

const gameOverScreen =
  document.getElementById("gameOverScreen");

const finalScore =
  document.getElementById("finalScore");

const finalHighScore =
  document.getElementById(
    "finalHighScore"
  );

const newHighScoreMessage =
  document.getElementById(
    "newHighScoreMessage"
  );

const startButton =
  document.getElementById("startButton");

const restartButton =
  document.getElementById(
    "restartButton"
  );


let score = 0;
let lives = 3;

let playerX = 0;

let leftPressed = false;
let rightPressed = false;

let gameRunning = false;

let spawnTimer = null;

/*
  Slower beginning
*/
let fallSpeed = 2.6;
let spawnSpeed = 1700;


/* =========================================
   HIGH SCORE
========================================= */

let highScore =
  Number(
    localStorage.getItem(
      "catchModakHighScore"
    )
  ) || 0;

highScoreDisplay.textContent =
  highScore;


/* =========================================
   START GAME
========================================= */

function startGame() {

  score = 0;
  lives = 3;

  /*
    Easy / slow beginning
  */

  fallSpeed = 2.6;
  spawnSpeed = 1700;

  scoreDisplay.textContent =
    score;

  livesDisplay.textContent =
    lives;

  highScoreDisplay.textContent =
    highScore;

  newHighScoreMessage
    .classList
    .add("hidden");

  startScreen
    .classList
    .add("hidden");

  gameOverScreen
    .classList
    .add("hidden");

  removeAllModaks();

  resetPlayer();

  gameRunning = true;

  startSpawning();

  requestAnimationFrame(
    gameLoop
  );

}


/* =========================================
   PLAYER
========================================= */

function resetPlayer() {

  playerX =
    gameArea.clientWidth / 2 -
    player.offsetWidth / 2;

  updatePlayerPosition();

}


function updatePlayerPosition() {

  const maxX =
    gameArea.clientWidth -
    player.offsetWidth;

  playerX =
    Math.max(
      0,
      Math.min(
        playerX,
        maxX
      )
    );

  player.style.left =
    `${playerX}px`;

  player.style.transform =
    "none";

}


function movePlayer() {

  if (!gameRunning) {
    return;
  }

  const speed = 7.5;

  if (leftPressed) {
    playerX -= speed;
  }

  if (rightPressed) {
    playerX += speed;
  }

  updatePlayerPosition();

}


/* =========================================
   CREATE MODAK
========================================= */

function createModak() {

  if (!gameRunning) {
    return;
  }

  const modak =
    document.createElement("div");

  modak.className =
    "modak";

  modak.innerHTML = `
    <div class="modak-shape">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  const maxX =
    gameArea.clientWidth - 65;

  const randomX =
    Math.random() * maxX;

  modak.style.left =
    `${randomX}px`;

  modak.style.top =
    "-75px";

  modak.dataset.y =
    "-75";

  /*
    Slight size variation
  */

  const scale =
    0.82 +
    Math.random() * 0.32;

  modak.dataset.scale =
    scale;

  modak.style.transform =
    `scale(${scale})`;

  gameArea.appendChild(
    modak
  );

}


/* =========================================
   UPDATE MODAKS
========================================= */

function updateModaks() {

  const modaks =
    document.querySelectorAll(
      ".modak"
    );

  modaks.forEach(
    modak => {

      let y =
        Number(
          modak.dataset.y
        );

      y += fallSpeed;

      modak.dataset.y =
        y;

      modak.style.top =
        `${y}px`;

      checkCatch(modak);

      if (
        y >
        gameArea.clientHeight
      ) {

        
        missModak(modak);

      }

    }
  );

}


/* =========================================
   COLLISION
========================================= */

function checkCatch(modak) {

  if (
    modak.dataset.caught ===
    "true"
  ) {
    return;
  }

  const modakRect =
    modak.getBoundingClientRect();

  const playerRect =
    player.getBoundingClientRect();

  const caught =

    modakRect.bottom >=
      playerRect.top + 8 &&

    modakRect.top <
      playerRect.top + 45 &&

    modakRect.right >
      playerRect.left + 10 &&

    modakRect.left <
      playerRect.right - 10;

  if (caught) {
    catchModak(modak);
  }

}


/* =========================================
   CATCH
========================================= */

function catchModak(modak) {

  if (
    modak.dataset.caught ===
    "true"
  ) {
    return;
  }

  modak.dataset.caught =
    "true";

  score++;

  scoreDisplay.textContent =
    score;

  /*
    Live high score
  */

  if (score > highScore) {

    highScore = score;

    highScoreDisplay.textContent =
      highScore;

    localStorage.setItem(
      "catchModakHighScore",
      highScore
    );

  }

  modak.classList.add(
    "caught"
  );

  setTimeout(
    () => {
      modak.remove();
    },
    240
  );

  /*
    Falling speed becomes
    gradually faster.
  */

  if (
    score % 6 === 0
  ) {

    fallSpeed += 0.22;

  }

  if (
    score % 5 === 0
  ) {
    const audio = new Audio('audio/collect.mp3');
    audio.play();
  }

}


/* =========================================
   MISS
========================================= */

function missModak(modak) {

  if (
    modak.dataset.caught ===
    "true"
  ) {
    return;
  }

  const audio = new Audio('audio/woosh.mp3');
  audio.play();
  modak.remove();

  lives--;

  livesDisplay.textContent =
    lives;

  if (
    lives <= 0
  ) {

    endGame();

  }

}


/* =========================================
   GAME LOOP
========================================= */

function gameLoop() {

  if (!gameRunning) {
    return;
  }

  movePlayer();

  updateModaks();

  requestAnimationFrame(
    gameLoop
  );

}


/* =========================================
   SPAWN SYSTEM

   Sparse at beginning,
   faster as score increases.
========================================= */

function startSpawning() {

  clearTimeout(
    spawnTimer
  );

  function spawnNext() {

    if (!gameRunning) {
      return;
    }

    createModak();

    /*
      Difficulty based on score
    */

    if (score < 5) {

      spawnSpeed = 1700;

    }

    else if (score < 10) {

      spawnSpeed = 1500;

    }

    else if (score < 20) {

      spawnSpeed = 1250;

    }

    else if (score < 30) {

      spawnSpeed = 1050;

    }

    else if (score < 45) {

      spawnSpeed = 900;

    }

    else {

      spawnSpeed = 760;

    }

    /*
      Random delay variation makes
      spawning feel more natural.
    */

    const variation =
      Math.random() * 350;

    spawnTimer =
      setTimeout(
        spawnNext,
        spawnSpeed + variation
      );

  }


  /*
    Small pause before
    the first modak appears.
  */

  spawnTimer =
    setTimeout(
      spawnNext,
      1300
    );

}


/* =========================================
   GAME OVER
========================================= */

function endGame() {

  gameRunning = false;

  clearTimeout(
    spawnTimer
  );

  const storedHighScore =
    Number(
      localStorage.getItem(
        "catchModakHighScore"
      )
    ) || 0;


  /*
    Score was already updated
    live during gameplay.
  */

  highScore =
    Math.max(
      highScore,
      storedHighScore,
      score
    );


  localStorage.setItem(
    "catchModakHighScore",
    highScore
  );


  finalScore.textContent =
    score;

  finalHighScore.textContent =
    highScore;

  highScoreDisplay.textContent =
    highScore;


  /*
    Show record message
    when current score equals
    the best score.
  */

  if (
    score > 0 &&
    score >= highScore
  ) {

    newHighScoreMessage
      .classList
      .remove("hidden");

  }

  else {

    newHighScoreMessage
      .classList
      .add("hidden");

  }


  gameOverScreen
    .classList
    .remove("hidden");

}


/* =========================================
   REMOVE MODAKS
========================================= */

function removeAllModaks() {

  document
    .querySelectorAll(
      ".modak"
    )
    .forEach(
      item =>
        item.remove()
    );

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();

    if (
      event.key ===
      "ArrowLeft" ||
      key === "a"
    ) {

      leftPressed = true;

    }

    if (
      event.key ===
      "ArrowRight" ||
      key === "d"
    ) {

      rightPressed = true;

    }

  }
);


document.addEventListener(
  "keyup",
  event => {

    const key =
      event.key.toLowerCase();

    if (
      event.key ===
      "ArrowLeft" ||
      key === "a"
    ) {

      leftPressed = false;

    }

    if (
      event.key ===
      "ArrowRight" ||
      key === "d"
    ) {

      rightPressed = false;

    }

  }
);


/* =========================================
   MOUSE
========================================= */

gameArea.addEventListener(
  "mousemove",
  event => {

    if (!gameRunning) {
      return;
    }

    const rect =
      gameArea.getBoundingClientRect();

    playerX =
      event.clientX -
      rect.left -
      player.offsetWidth / 2;

    updatePlayerPosition();

  }
);


/* =========================================
   TOUCH / PHONE
========================================= */

function moveWithTouch(event) {

  if (!gameRunning) {
    return;
  }

  event.preventDefault();

  const touch =
    event.touches[0];

  const rect =
    gameArea.getBoundingClientRect();

  playerX =
    touch.clientX -
    rect.left -
    player.offsetWidth / 2;

  updatePlayerPosition();

}


gameArea.addEventListener(
  "touchstart",
  moveWithTouch,
  {
    passive: false
  }
);


gameArea.addEventListener(
  "touchmove",
  moveWithTouch,
  {
    passive: false
  }
);


/* =========================================
   BUTTONS
========================================= */

startButton.addEventListener(
  "click",
  startGame
);


restartButton.addEventListener(
  "click",
  startGame
);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
  "resize",
  () => {

    if (gameRunning) {

      updatePlayerPosition();

    }

    else {

      resetPlayer();

    }

  }
);


/* =========================================
   INITIAL PLAYER POSITION
========================================= */

resetPlayer();

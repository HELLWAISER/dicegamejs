// Variáveis principais
let gameState = "start";
let diceValue = 1;
let hiScore = 0;
let rolling = false;
let sounds = {};
let images = {};
let menuButtons = []; // global para os botões
let tentativas = 6;
let pontos = 0;
let fase = 1;
let meta = 6;
let dado = 0;
let podeRolar = true;
let metaAtingidaTimeout;
let levelCompleteTimeout;
let animando = false;
let tempoAnimacao = 1000; // em milissegundos
let diceImages = []; // faces estáticas (1 a 6)
let diceSpinFrames = [];

/* Pré-carregamento sons */
function preload() {
  sounds.splashScreen = loadSound('./sounds/splashScreen.mp3');
  sounds.dadorolando1 = loadSound('./sounds/dadorolando1.mp3');
  sounds.dadorolando2 = loadSound('./sounds/dadorolando2.mp3');
  sounds.gameover = loadSound('./sounds/gameover.mp3');
  sounds.levelcomplete = loadSound('./sounds/levelcomplete.mp3');
  sounds.metaatingida = loadSound('./sounds/metaatingida.mp3');
  sounds.stage1 = loadSound('./sounds/stage1.mp3');
  sounds.stage2 = loadSound('./sounds/stage2.mp3');
  sounds.stage3 = loadSound('./sounds/stage3.mp3');
  sounds.stage4 = loadSound('./sounds/stage4.mp3');
  sounds.stage5 = loadSound('./sounds/stage5.mp3');
  sounds.stage6 = loadSound('./sounds/stage6.mp3');

  /* Pré-carregamento imagens */
  images.splashScreen = loadImage('./images/splashScreen.jpg');
  images.metaatingida = loadImage('./images/metaatingida.jpeg');
  images.levelcomplete = loadImage('./images/levelcomplete.png');
  images.gameover = loadImage('./images/gameover.jpg');
  images.stage1 = loadImage('./images/stage1.jpeg');
  images.stage2 = loadImage('./images/stage2.jpg');
  images.stage3 = loadImage('./images/stage3.jpg');
  images.stage4 = loadImage('./images/stage4.jpg');
  images.stage5 = loadImage('./images/stage5.jpg');
  images.stage6 = loadImage('./images/stage6.jpg');

  for (let i = 1; i <= 6; i++) {
    diceImages[i] = loadImage('./images/dice3d_' + i + '.png');
  }
  for (let i = 1; i <= 12; i++) {
    diceSpinFrames[i] = loadImage('./images/spin_' + i + '.png');
  }
}

function mousePressed() {
  // Toca a música da splash screen se ainda não estiver tocando
  if (gameState === "start" && !sounds.splashScreen.isPlaying()) {
    sounds.splashScreen.loop();

    if (tentativas === 0 && pontos < meta) {
      sounds[`stage${fase}`].stop();
      sounds.gameover.play();
      gameState = "gameOver";

      setTimeout(() => {
        resetarJogo();
      }, 4000);

      // Volta para a tela inicial depois que o som terminar
      sounds.gameover.onended(() => {
        gameState = "start";
        tentativas = 6;
        pontos = 0;
        dado = 0;
        fase = 1;
        meta = 6;
        podeRolar = true;
      });
    }
  }

  function touchStarted() {
    mousePressed();
    return false; // evita scroll acidental da página
  }

  // Toca a música da splash screen se ainda não estiver tocando
  if (!sounds.splashScreen.isPlaying()) {
    sounds.splashScreen.loop();
  }
  else if (gameState === "gameOver") {
    resetarJogo();
  }

  // Clique na TELA INICIAL (start)
  if (gameState === "start") {
    let menuX = width * 0.7;
    let clickedButton = false;

    menuButtons.forEach(btn => {
      if (
        mouseX > menuX &&
        mouseX < menuX + 200 &&
        mouseY > btn.y - 20 &&
        mouseY < btn.y + 20
      ) {
        clickedButton = true;

        if (btn.label !== "High Score") {
          if (sounds.splashScreen.isPlaying()) {
            sounds.splashScreen.stop();
          }
          if (sounds.stage1 && !sounds.stage1.isPlaying()) {
            sounds.stage1.loop();
          }
        }
        btn.action();
      }
    });

    if (!clickedButton && !sounds.splashScreen.isPlaying()) {
      sounds.splashScreen.loop();
    }
    // Clique na TELA DE GAME OVER
    else if (gameState === "play") {
      if (podeRolar && tentativas > 0 && !animando) {
        animando = true;
        podeRolar = false;

        // Animação do dado rolando (1 segundo)
        let animacao = setInterval(() => {
          dado = int(random(1, 7));
        }, 100);

        setTimeout(() => {
          clearInterval(animacao);

          let valorReal = int(random(1, 7));
          dado = valorReal;
          tentativas--;
          pontos += valorReal;
          animando = false;
          podeRolar = true;

          // Tocar som de dado
          if (random() > 0.5) {
            sounds.dadorolando1.play();
          } else {
            sounds.dadorolando2.play();
          }

          // Verifica depois do som
          setTimeout(() => {
            // Se atingiu a meta
            if (pontos >= meta) {
              sounds.metaatingida.play();
              gameState = "metaAtingida";
            }

            // Se perdeu
            if (tentativas === 0 && pontos < meta) {
              sounds[`stage${fase}`].stop();
              sounds.gameover.play();
              gameState = "gameOver";
            }
          }, 500);
        }, tempoAnimacao);
      }
    }
  }

  // ----------------------------------------
  // Clique na TELA DE JOGO (gameState = play)
  // ----------------------------------------

  else if (gameState === "play") {
    if (podeRolar && tentativas > 0) {
      podeRolar = false;

      dado = int(random(1, 7)); // valor de 1 a 6
      tentativas--;
      pontos += dado;

      // Tocar som de dado
      if (random() > 0.5) {
        sounds.dadorolando1.play();
      } else {
        sounds.dadorolando2.play();
      }

      // Verifica depois de um pequeno delay
      setTimeout(() => {
        podeRolar = true;

        // Se o jogador atingir a meta
        if (pontos >= meta) {
          sounds.metaatingida.play();

          setTimeout(() => {
            sounds[`stage${fase}`].stop();
            sounds.levelcomplete.play();
            fase++;
            tentativas = 6;
            pontos = 0;
            dado = 0;
            meta += 4;
            // Toca próxima música de fase
            if (sounds[`stage${fase}`]) {
              sounds[`stage${fase}`].loop();
            }
          }, 1000);
        }
        // Se perdeu (acabaram tentativas e não bateu a meta)
        if (tentativas === 0 && pontos < meta) {
          sounds[`stage${fase}`].stop();
          sounds.gameover.play();
          gameState = "gameOver";
        }
      }, 1200);
    }
  }
}

function resetarJogo() {
  tentativas = 6;
  pontos = 0;
  dado = 0;
  fase = 1;
  meta = 6;
  podeRolar = true;
  gameState = "start";
}


/* Setup inicial */
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body); // Garante que o canvas está preso ao body

  textAlign(CENTER, CENTER);

  let menuX = width * 0.7;
  let menuY = height * 0.7;
  let spacing = 40;

  menuButtons = [
    { label: "Start Game", y: menuY, action: () => gameState = "play" },
    { label: "Versus", y: menuY + spacing, action: () => gameState = "versus" },
    { label: "Player 1 vs CPU", y: menuY + spacing * 2, action: () => gameState = "cpu" },
    { label: "High Score", y: menuY + spacing * 3, action: () => gameState = "score" },
  ];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* Loop principal do jogo */
function draw() {
  background(1);
  if (gameState === "start") {
    startGameScreen();
  } else if (gameState === "play") {
    playGame();
  } else if (gameState === "metaAtingida") {
    metaAtingidaScreen();
  } else if (gameState === "levelComplete") {
    levelCompleteScreen();
  } else if (gameState === "gameOver") {
    gameOverScreen();
  }
}


function gameOverScreen() {
  // Mostra imagem de fundo
  if (images.gameover) {
    imageMode(CENTER);
    image(images.gameover, width / 2, height / 2, width, height);
  }

  // Texto adicional (não necessário)
  fill(255);
  textSize(width > 600 ? width * 0.03 : width * 0.045);
  textAlign(CENTER, BOTTOM);
  //text("Você perdeu... Voltando ao menu", width / 2, height - 50);
}

/* Tela inicial (Splash Screen) */
function startGameScreen() {
  // Fundo com imagem
  if (images.splashScreen) {
    imageMode(CENTER);
    let img = images.splashScreen;
    let scaleRatio = max(width / img.width, height / img.height);
    let newW = img.width * scaleRatio;
    let newH = img.height * scaleRatio;
    image(img, width / 2, height / 2, newW, newH);
  }

  // Filtro semi-transparente escuro
  fill(0, 150);
  noStroke();
  rect(0, 0, width, height);

  // Nome do jogo
  fill(255);
  textSize(width * 0.08);
  textAlign(CENTER, CENTER);
  text("Dice Game", width / 2, height * 0.2);

  // Menu de botões
  textAlign(LEFT, CENTER);
  textSize(width * 0.04);
  let menuX = width * 0.7;

  menuButtons.forEach(btn => {
    if (
      mouseX > menuX &&
      mouseX < menuX + 200 &&
      mouseY > btn.y - 20 &&
      mouseY < btn.y + 20
    ) {
      fill(255, 200, 0);
      cursor(HAND);
    } else {
      fill(255);
      cursor(ARROW);
    }
    text(btn.label, menuX, btn.y);
  });
}

/* =============================================== */
function playGame() {
  // Fundo da fase
  imageMode(CORNER);

  let imagemFase = images[`stage${fase}`];
  if (imagemFase) {
    image(imagemFase, 0, 0, width, height);
  }
  // Filtro escuro sobre o fundo
  fill(0, 120);
  noStroke();
  rect(0, 0, width, height);

  // 3. Tamanho de texto responsivo
  let textoMobile = width > 600 ? width * 0.045 : width * 0.06;
  textSize(textoMobile);

  // HUD (parte superior)
  fill(255);
  textSize(width * 0.045);
  textAlign(LEFT, TOP);
  text(`TENTATIVAS\n${tentativas}`, 20, 20);

  textAlign(CENTER, TOP);
  text(`TOTAL\n${pontos}`, width / 2, 20);

  textAlign(RIGHT, TOP);
  text(`Objetivo ${meta}\npontos`, width - 20, 20);

  // Fase atual no rodapé
  textAlign(CENTER, BOTTOM);
  textSize(width * 0.045);
  text(`STAGE - ${fase}`, width / 2, height - 30);

  // Desenho do dado no centro da tela
  imageMode(CENTER);
  if (animando) {
    let currentFrame = frameCount % 12 + 1;
    image(diceSpinFrames[currentFrame], width / 2, height / 2, 150, 150);
  } else if (dado > 0) {
    image(diceImages[dado], width / 2, height / 2, 150, 150);
  }

  // Instrução para rolar o dado
  if (podeRolar && !animando) {
    textSize(width > 600 ? width * 0.035 : width * 0.045);
    fill(255);
    text("Clique para rolar o dado", width / 2, height - 100);
  }
}

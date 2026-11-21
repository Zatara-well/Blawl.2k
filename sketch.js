let gameState = 'MENU'; // 'MENU', 'NICKNAME', 'MODE_SELECT', 'BRAWLER_SELECT', 'PLAYING', 'GAMEOVER'
let gameMode = 'SHOWDOWN'; // 'SHOWDOWN', 'BRAWLBALL'
let selectedBrawler = 'ASH'; // 'ASH', 'TRUNK', 'COLT', 'BARLEY'
let playerNickname = "Jogador";
let isTypingNick = false;
let tempNick = "";

let player;
let bots = [];
let projectiles = [];
let meleeAttacks = [];
let waveAttacks = [];
let puddles = [];
let walls = [];
let particles = [];
let floatingTexts = [];
let deadBrawlers = [];

// Variáveis do Fute-Brawl
let ball;
let blueScore = 0;
let redScore = 0;
let matchTimer = 150;
let goalBannerTimer = 0;
let goalBannerText = "";
let goalBannerColor;

// Mapas
const MAP_WIDTH = 2400;
const MAP_HEIGHT = 2400;
const BB_WIDTH = 1600;
const BB_HEIGHT = 2200;

let camX = 0;
let camY = 0;
let screenShake = 0;

// Controles
let isMobile = false;
let leftJoy = { active: false, id: -1, baseX: 0, baseY: 0, stickX: 0, stickY: 0, dx: 0, dy: 0 };
let rightJoy = { active: false, id: -1, baseX: 0, baseY: 0, stickX: 0, stickY: 0, dx: 0, dy: 0, isAiming: false };
let superBtn = { x: 0, y: 0, r: 42, active: false, id: -1, dx: 0, dy: 0, isAiming: false };

const BOT_NAMES = ["Bot_Leão", "Spike_Br", "ShellyPro", "ElPrimo", "ColtMito", "Nita_123", "CrowSombrio", "MortisKing", "Bibi_Top", "BullRaivoso"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || width < 850;
  
  let savedNick = localStorage.getItem('brawl_nickname');
  if (savedNick) {
    playerNickname = savedNick;
  } else {
    gameState = 'NICKNAME';
    isTypingNick = true;
  }
  updateUIPositions();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || width < 850;
  updateUIPositions();
}

function updateUIPositions() {
  leftJoy.baseX = 120;
  leftJoy.baseY = height - 120;
  leftJoy.stickX = leftJoy.baseX;
  leftJoy.stickY = leftJoy.baseY;

  rightJoy.baseX = width - 120;
  rightJoy.baseY = height - 120;
  rightJoy.stickX = rightJoy.baseX;
  rightJoy.stickY = rightJoy.baseY;

  superBtn.x = width - 230;
  superBtn.y = height - 80;
}

function draw() {
  background(30);

  if (gameState === 'NICKNAME') {
    drawNicknameScreen();
  } else if (gameState === 'MENU') {
    drawMenu();
  } else if (gameState === 'MODE_SELECT') {
    drawModeSelect();
  } else if (gameState === 'BRAWLER_SELECT') {
    drawBrawlerSelect();
  } else if (gameState === 'PLAYING') {
    updateGame();
    drawGame();
  } else if (gameState === 'GAMEOVER') {
    drawGame();
    drawGameOver();
  }
}

// ==========================================
// ÍCONES DE EVENTOS (CAVEIRA E BOLA)
// ==========================================

function drawSkullIcon(x, y, s = 1) {
  push();
  translate(x, y);
  scale(s);

  // Sombra
  noStroke();
  fill(0, 0, 0, 90);
  ellipse(0, 26, 44, 14);

  // Crânio principal (verde vibrante estilo Brawl Stars)
  stroke(20, 35, 20);
  strokeWeight(3);
  fill(60, 225, 95);
  ellipse(0, -4, 48, 42);

  // Maxilar inferior
  rect(-15, 10, 30, 14, 5);
  noStroke();
  fill(60, 225, 95);
  rect(-18, 4, 36, 10);

  // Brilho no topo do crânio
  fill(150, 255, 165, 180);
  ellipse(-8, -15, 16, 8);

  // Cavidades dos olhos
  fill(20, 35, 20);
  ellipse(-10, -2, 12, 13);
  ellipse(10, -2, 12, 13);

  // Brilho interno nos olhos
  fill(60, 225, 95);
  ellipse(-11, -3, 3.5, 3.5);
  ellipse(9, -3, 3.5, 3.5);

  // Nariz (triângulo invertido)
  fill(20, 35, 20);
  triangle(-3.5, 9, 3.5, 9, 0, 3);

  // Dentes (divisórias)
  stroke(20, 35, 20);
  strokeWeight(2.5);
  line(-6, 15, -6, 23);
  line(0, 15, 0, 23);
  line(6, 15, 6, 23);

  pop();
}

function drawBallIcon(x, y, s = 1) {
  push();
  translate(x, y);
  scale(s);

  // Sombra
  noStroke();
  fill(0, 0, 0, 90);
  ellipse(0, 26, 44, 14);

  // Base branca da bola
  stroke(20, 25, 35);
  strokeWeight(3);
  fill(245, 248, 255);
  ellipse(0, 0, 50, 50);

  // Sombreamento inferior suave
  noStroke();
  fill(200, 212, 230);
  arc(0, 0, 46, 46, 0.2, PI - 0.2);

  // Contorno externo reforçado
  noFill();
  stroke(20, 25, 35);
  strokeWeight(3);
  ellipse(0, 0, 50, 50);

  // Pentágono central
  fill(28, 34, 48);
  noStroke();
  beginShape();
  for (let i = 0; i < 5; i++) {
    let a = -HALF_PI + (TWO_PI / 5) * i;
    vertex(cos(a) * 10, sin(a) * 10);
  }
  endShape(CLOSE);

  // Costuras ligando ao exterior e gomos da borda
  stroke(28, 34, 48);
  strokeWeight(2.2);
  for (let i = 0; i < 5; i++) {
    let a = -HALF_PI + (TWO_PI / 5) * i;
    let ix = cos(a) * 10;
    let iy = sin(a) * 10;
    let ox = cos(a) * 21;
    let oy = sin(a) * 21;
    line(ix, iy, ox, oy);

    // Gomo preto na borda
    push();
    translate(ox, oy);
    rotate(a);
    noStroke();
    fill(28, 34, 48);
    ellipse(1, 0, 8, 12);
    pop();
  }

  // Brilho superior esquerdo
  noStroke();
  fill(255, 255, 255, 210);
  ellipse(-9, -11, 10, 6);

  pop();
}

// ==========================================
// TELAS DE MENU E SELEÇÃO
// ==========================================

function drawMenuBg() {
  background(20, 85, 200);
  noStroke();
  fill(25, 100, 225);
  let offset = (frameCount * 0.5) % 80;
  for (let x = -80; x < width + 80; x += 80) {
    for (let y = -80; y < height + 80; y += 80) {
      if ((Math.floor(x / 80) + Math.floor(y / 80)) % 2 === 0) {
        rect(x + offset, y + offset, 40, 40, 8);
      }
    }
  }
}

function drawNicknameScreen() {
  drawMenuBg();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  let boxW = min(width - 40, 420);
  let boxH = 260;
  let bx = width / 2 - boxW / 2;
  let by = height / 2 - boxH / 2;

  fill(30, 40, 65);
  stroke(255, 200, 0);
  strokeWeight(4);
  rect(bx, by, boxW, boxH, 20);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  textStyle(BOLD);
  text("QUAL É O SEU NOME?", width / 2, by + 45);

  fill(15, 20, 35);
  stroke(100, 150, 255);
  strokeWeight(3);
  rect(bx + 30, by + 85, boxW - 60, 50, 10);

  noStroke();
  fill(255);
  textSize(22);
  let cursor = (frameCount % 40 < 20) ? "|" : "";
  text(tempNick + cursor, width / 2, by + 110);

  let btnW = 180;
  let btnH = 50;
  let btnX = width / 2 - btnW / 2;
  let btnY = by + 165;

  fill(40, 210, 80);
  stroke(255);
  strokeWeight(3);
  rect(btnX, btnY, btnW, btnH, 12);

  noStroke();
  fill(255);
  textSize(20);
  text("CONFIRMAR", width / 2, btnY + 25);
}

function drawMenu() {
  drawMenuBg();

  fill(0, 0, 0, 120);
  noStroke();
  rect(15, 15, 220, 45, 12);
  fill(255, 210, 0);
  textAlign(LEFT, CENTER);
  textSize(16);
  textStyle(BOLD);
  text("👤 " + playerNickname, 28, 37);
  fill(180);
  textSize(11);
  text("(Clique p/ mudar)", 145, 38);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  let titleSize = min(width * 0.1, 64);
  textSize(titleSize);
  fill(0, 0, 0, 150);
  text("BRAWL JS", width / 2 + 5, height * 0.16 + 5);
  fill(255, 210, 0);
  stroke(0);
  strokeWeight(6);
  text("BRAWL JS", width / 2, height * 0.16);

  let previewX = width / 2;
  let previewY = height * 0.45;
  noStroke();
  fill(0, 0, 0, 80);
  ellipse(previewX, previewY + 55, 100, 30);
  drawBrawlerPreview(previewX, previewY, selectedBrawler, 1.8);

  fill(255);
  noStroke();
  textSize(24);
  text(selectedBrawler, previewX, previewY + 95);

  let bw = 200;
  let bh = 55;
  let bx = width / 2 - bw - 15;
  let by = height - 165;
  fill(45, 55, 80);
  stroke(255);
  strokeWeight(3);
  rect(bx, by, bw, bh, 15);
  noStroke();
  fill(255);
  textSize(18);
  text("BRAWLERS", bx + bw / 2, by + bh / 2);

  let mx = width / 2 + 15;
  let my = height - 165;
  fill(gameMode === 'SHOWDOWN' ? color(110, 70, 45) : color(35, 85, 140));
  stroke(255);
  strokeWeight(3);
  rect(mx, my, bw, bh, 15);

  // Ícone do modo dentro do botão do menu
  if (gameMode === 'SHOWDOWN') {
    drawSkullIcon(mx + 32, my + bh / 2 - 2, 0.58);
  } else {
    drawBallIcon(mx + 32, my + bh / 2 - 2, 0.58);
  }

  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(15);
  let modeLabel = gameMode === 'SHOWDOWN' ? "COMBATE" : "FUTE-BRAWL";
  text(modeLabel, mx + 62, my + bh / 2);

  textAlign(CENTER, CENTER);
  let pw = 260;
  let ph = 65;
  let px = width / 2 - pw / 2;
  let py = height - 90;
  fill(255, 190, 0);
  stroke(255);
  strokeWeight(4);
  rect(px, py, pw, ph, 18);
  noStroke();
  fill(30, 20, 0);
  textSize(28);
  text("JOGAR!", width / 2, py + ph / 2);
}

function drawModeSelect() {
  drawMenuBg();
  fill(0, 0, 0, 140);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255);
  textSize(32);
  text("ESCOLHA O EVENTO", width / 2, 55);

  let modes = [
    { id: 'SHOWDOWN', name: 'COMBATE SOLITÁRIO', desc: '10 Brawlers na arena. Último sobrevivente vence!', color: [95, 62, 42] },
    { id: 'BRAWLBALL', name: 'FUTE-BRAWL', desc: '3v3 • 2 Minutos • Faça 2 gols para vencer!', color: [35, 80, 130] }
  ];

  let cardW = min(width - 40, 480);
  let cardH = 130;

  for (let i = 0; i < modes.length; i++) {
    let m = modes[i];
    let cx = width / 2 - cardW / 2;
    let cy = 120 + i * (cardH + 25);
    let isSel = (gameMode === m.id);

    fill(m.color[0], m.color[1], m.color[2]);
    stroke(isSel ? color(60, 240, 110) : color(180));
    strokeWeight(isSel ? 5 : 2);
    rect(cx, cy, cardW, cardH, 18);

    // Desenha o ícone vetorial melhorado
    if (m.id === 'SHOWDOWN') {
      drawSkullIcon(cx + 55, cy + cardH / 2 - 4, 1.15);
    } else {
      drawBallIcon(cx + 55, cy + cardH / 2 - 4, 1.15);
    }

    noStroke();
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(22);
    text(m.name, cx + 105, cy + 44);
    textStyle(NORMAL);
    textSize(14);
    fill(225);
    text(m.desc, cx + 105, cy + 78, cardW - 125, 45);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
  }

  let bw = 180;
  let bh = 50;
  fill(255, 200, 0);
  stroke(255);
  strokeWeight(3);
  rect(width / 2 - bw / 2, height - 80, bw, bh, 12);
  noStroke();
  fill(30, 20, 0);
  textSize(20);
  text("CONFIRMAR", width / 2, height - 55);
}

function drawBrawlerSelect() {
  drawMenuBg();
  fill(0, 0, 0, 140);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(255);
  textSize(32);
  text("ESCOLHA SEU BRAWLER", width / 2, 45);

  let brawlers = [
    { id: 'ASH', name: 'ASH', role: 'TANQUE' },
    { id: 'TRUNK', name: 'TRUNK', role: 'TANQUE' },
    { id: 'COLT', name: 'COLT', role: 'DESTRUIDOR' },
    { id: 'BARLEY', name: 'BARLEY', role: 'LANÇADOR' }
  ];

  let cols = width > 750 ? 2 : 1;
  let cardW = cols === 2 ? min(360, width * 0.44) : min(440, width - 40);
  let cardH = cols === 2 ? 130 : 100;
  let startY = 95;

  for (let i = 0; i < brawlers.length; i++) {
    let b = brawlers[i];
    let col = i % cols;
    let row = Math.floor(i / cols);

    let totalW = cols * cardW + (cols - 1) * 20;
    let cx = (width - totalW) / 2 + col * (cardW + 20);
    let cy = startY + row * (cardH + 15);
    let isSelected = (selectedBrawler === b.id);

    fill(35, 45, 70);
    stroke(isSelected ? color(255, 210, 0) : color(100, 120, 160));
    strokeWeight(isSelected ? 5 : 2);
    rect(cx, cy, cardW, cardH, 16);

    drawBrawlerPreview(cx + 55, cy + cardH / 2, b.id, 0.95);

    textAlign(LEFT, CENTER);
    noStroke();
    fill(255, 210, 0);
    textSize(22);
    text(b.name, cx + 110, cy + cardH / 2 - 12);

    fill(150, 220, 255);
    textSize(13);
    text(b.role, cx + 110, cy + cardH / 2 + 14);
  }

  let bw = 200;
  let bh = 50;
  fill(40, 200, 80);
  stroke(255);
  strokeWeight(3);
  rect(width / 2 - bw / 2, height - 70, bw, bh, 12);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("SELECIONAR", width / 2, height - 45);
}

// ==========================================
// INICIALIZAÇÃO DA PARTIDA
// ==========================================

function startGame() {
  bots = [];
  projectiles = [];
  meleeAttacks = [];
  waveAttacks = [];
  puddles = [];
  walls = [];
  particles = [];
  floatingTexts = [];
  deadBrawlers = [];

  if (gameMode === 'SHOWDOWN') {
    setupShowdown();
  } else {
    setupBrawlBall();
  }

  gameState = 'PLAYING';
}

function setupShowdown() {
  let blockSize = 80;
  for (let x = 320; x < MAP_WIDTH - 320; x += 320) {
    for (let y = 320; y < MAP_HEIGHT - 320; y += 320) {
      if (dist(x, y, MAP_WIDTH / 2, MAP_HEIGHT / 2) < 250) continue;
      let pattern = floor(random(4));
      if (pattern === 0) {
        walls.push(new Wall(x, y, blockSize, blockSize, false));
        walls.push(new Wall(x + blockSize, y, blockSize, blockSize, false));
      } else if (pattern === 1) {
        walls.push(new Wall(x, y, blockSize, blockSize, false));
        walls.push(new Wall(x, y + blockSize, blockSize, blockSize, false));
      } else if (pattern === 2) {
        walls.push(new Wall(x, y, blockSize, blockSize, false));
        walls.push(new Wall(x + blockSize, y, blockSize, blockSize, false));
        walls.push(new Wall(x, y + blockSize, blockSize, blockSize, false));
      } else {
        walls.push(new Wall(x, y, blockSize, blockSize, false));
      }
    }
  }

  let spawns = [];
  let numSpawns = 10;
  for (let i = 0; i < numSpawns; i++) {
    let angle = (TWO_PI / numSpawns) * i;
    let sx = MAP_WIDTH / 2 + cos(angle) * 950;
    let sy = MAP_HEIGHT / 2 + sin(angle) * 950;
    spawns.push({ x: sx, y: sy });
  }
  spawns = shuffle(spawns);

  player = new Brawler(spawns[0].x, spawns[0].y, selectedBrawler, true, playerNickname, 0);

  let types = ['ASH', 'TRUNK', 'COLT', 'BARLEY'];
  let shuffledNames = shuffle([...BOT_NAMES]);
  for (let i = 1; i < numSpawns; i++) {
    let bType = random(types);
    bots.push(new Brawler(spawns[i].x, spawns[i].y, bType, false, shuffledNames[i - 1], i));
  }
}

function setupBrawlBall() {
  blueScore = 0;
  redScore = 0;
  matchTimer = 150;
  goalBannerTimer = 0;

  let b = 80;
  let goalW = 360;
  let leftPost = (BB_WIDTH - goalW) / 2;
  let rightPost = (BB_WIDTH + goalW) / 2;

  walls.push(new Wall(0, 0, leftPost, b, true));
  walls.push(new Wall(rightPost, 0, BB_WIDTH - rightPost, b, true));
  walls.push(new Wall(0, BB_HEIGHT - b, leftPost, b, true));
  walls.push(new Wall(rightPost, BB_HEIGHT - b, BB_WIDTH - rightPost, b, true));

  walls.push(new Wall(leftPost - 40, 180, 120, 60, false));
  walls.push(new Wall(rightPost - 80, 180, 120, 60, false));
  walls.push(new Wall(leftPost - 40, BB_HEIGHT - 240, 120, 60, false));
  walls.push(new Wall(rightPost - 80, BB_HEIGHT - 240, 120, 60, false));

  walls.push(new Wall(250, BB_HEIGHT / 2 - 160, 140, 70, false));
  walls.push(new Wall(BB_WIDTH - 390, BB_HEIGHT / 2 - 160, 140, 70, false));
  walls.push(new Wall(250, BB_HEIGHT / 2 + 90, 140, 70, false));
  walls.push(new Wall(BB_WIDTH - 390, BB_HEIGHT / 2 + 90, 140, 70, false));

  ball = new Ball(BB_WIDTH / 2, BB_HEIGHT / 2);

  let types = ['ASH', 'TRUNK', 'COLT', 'BARLEY'];
  let shuffledNames = shuffle([...BOT_NAMES]);

  player = new Brawler(BB_WIDTH / 2, BB_HEIGHT - 380, selectedBrawler, true, playerNickname, 0);
  bots.push(new Brawler(BB_WIDTH / 2 - 280, BB_HEIGHT - 380, random(types), false, shuffledNames[0], 0));
  bots.push(new Brawler(BB_WIDTH / 2 + 280, BB_HEIGHT - 380, random(types), false, shuffledNames[1], 0));

  bots.push(new Brawler(BB_WIDTH / 2, 380, random(types), false, shuffledNames[2], 1));
  bots.push(new Brawler(BB_WIDTH / 2 - 280, 380, random(types), false, shuffledNames[3], 1));
  bots.push(new Brawler(BB_WIDTH / 2 + 280, 380, random(types), false, shuffledNames[4], 1));
}

function resetBrawlBallPositions() {
  ball.x = BB_WIDTH / 2;
  ball.y = BB_HEIGHT / 2;
  ball.vx = 0;
  ball.vy = 0;
  ball.carrier = null;

  projectiles = [];
  meleeAttacks = [];
  waveAttacks = [];
  puddles = [];

  let blueIdx = 0;
  let redIdx = 0;
  let all = [player, ...bots];

  for (let b of all) {
    b.hp = b.maxHp;
    b.dead = false;
    b.respawnTimer = 0;
    if (b.team === 0) {
      b.x = BB_WIDTH / 2 + (blueIdx - 1) * 260;
      b.y = BB_HEIGHT - 380;
      b.angle = -HALF_PI;
      blueIdx++;
    } else {
      b.x = BB_WIDTH / 2 + (redIdx - 1) * 260;
      b.y = 380;
      b.angle = HALF_PI;
      redIdx++;
    }
  }
}

// ==========================================
// LOOP PRINCIPAL DO JOGO
// ==========================================

function updateGame() {
  let mapW = gameMode === 'SHOWDOWN' ? MAP_WIDTH : BB_WIDTH;
  let mapH = gameMode === 'SHOWDOWN' ? MAP_HEIGHT : BB_HEIGHT;

  if (gameMode === 'BRAWLBALL') {
    if (goalBannerTimer > 0) {
      goalBannerTimer--;
      if (goalBannerTimer === 0) {
        if (blueScore >= 2 || redScore >= 2) {
          gameState = 'GAMEOVER';
          return;
        }
        resetBrawlBallPositions();
      }
      return;
    }

    if (frameCount % 60 === 0 && matchTimer > 0) {
      matchTimer--;
      if (matchTimer === 0 && blueScore !== redScore) {
        gameState = 'GAMEOVER';
        return;
      }
    }
  }

  if (!player.dead) {
    handlePlayerInput();
    player.update();
  } else if (gameMode === 'BRAWLBALL') {
    player.respawnTimer--;
    if (player.respawnTimer <= 0) {
      player.dead = false;
      player.hp = player.maxHp;
      player.x = BB_WIDTH / 2;
      player.y = BB_HEIGHT - 220;
    }
  }

  for (let i = bots.length - 1; i >= 0; i--) {
    let b = bots[i];
    if (b.dead) {
      if (gameMode === 'SHOWDOWN') {
        deadBrawlers.push(b.name);
        bots.splice(i, 1);
      } else {
        b.respawnTimer--;
        if (b.respawnTimer <= 0) {
          b.dead = false;
          b.hp = b.maxHp;
          b.x = BB_WIDTH / 2 + random(-200, 200);
          b.y = b.team === 0 ? BB_HEIGHT - 220 : 220;
        }
      }
      continue;
    }
    b.updateAI();
    b.update();
  }

  if (gameMode === 'BRAWLBALL' && ball) {
    ball.update();
  }

  for (let i = puddles.length - 1; i >= 0; i--) {
    puddles[i].update();
    if (puddles[i].life <= 0) puddles.splice(i, 1);
  }

  for (let i = waveAttacks.length - 1; i >= 0; i--) {
    waveAttacks[i].update();
    if (waveAttacks[i].life <= 0) waveAttacks.splice(i, 1);
  }

  for (let i = meleeAttacks.length - 1; i >= 0; i--) {
    meleeAttacks[i].update();
    if (meleeAttacks[i].life <= 0) meleeAttacks.splice(i, 1);
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    if (projectiles[i].dead) projectiles.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update();
    if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
  }

  let targetX = player.x - width / 2;
  let targetY = player.y - height / 2;
  camX = lerp(camX, constrain(targetX, -150, mapW - width + 150), 0.15);
  camY = lerp(camY, constrain(targetY, -150, mapH - height + 150), 0.15);

  if (screenShake > 0) screenShake *= 0.85;

  if (gameMode === 'SHOWDOWN') {
    if (player.dead || bots.length === 0) {
      gameState = 'GAMEOVER';
    }
  }
}

function handlePlayerInput() {
  let moveX = 0;
  let moveY = 0;

  if (isMobile) {
    moveX = leftJoy.dx;
    moveY = leftJoy.dy;
  } else {
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) moveY -= 1;
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) moveY += 1;
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) moveX -= 1;
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) moveX += 1;
    let mag = hypot(moveX, moveY);
    if (mag > 0) {
      moveX /= mag;
      moveY /= mag;
    }
  }

  player.vx = moveX * player.getCurrentSpeed();
  player.vy = moveY * player.getCurrentSpeed();

  if (!isMobile) {
    let worldMouseX = mouseX + camX;
    let worldMouseY = mouseY + camY;
    player.aimAngle = atan2(worldMouseY - player.y, worldMouseX - player.x);
    player.isAiming = true;
    player.isAimingSuper = keyIsDown(32) && player.superCharge >= 100;
  } else {
    if (rightJoy.isAiming) {
      player.aimAngle = atan2(rightJoy.dy, rightJoy.dx);
      player.isAiming = true;
      player.isAimingSuper = false;
    } else if (superBtn.isAiming && player.superCharge >= 100) {
      player.aimAngle = atan2(superBtn.dy, superBtn.dx);
      player.isAiming = true;
      player.isAimingSuper = true;
    } else {
      player.isAiming = false;
      player.isAimingSuper = false;
    }
  }

  if (hypot(player.vx, player.vy) > 0.1 && !player.isAiming) {
    player.angle = atan2(player.vy, player.vx);
  } else if (player.isAiming) {
    player.angle = player.aimAngle;
  }
}

function drawGame() {
  push();
  let sx = random(-screenShake, screenShake);
  let sy = random(-screenShake, screenShake);
  translate(-camX + sx, -camY + sy);

  drawArena();

  for (let p of puddles) p.draw();
  for (let w of waveAttacks) w.draw();
  for (let wall of walls) wall.draw();

  if (gameMode === 'BRAWLBALL' && ball) {
    ball.draw();
  }

  let allEntities = [];
  if (!player.dead) allEntities.push(player);
  for (let b of bots) if (!b.dead) allEntities.push(b);
  allEntities.sort((a, b) => a.y - b.y);

  for (let ent of allEntities) {
    if (ent.isPlayer && ent.isAiming) {
      ent.drawAimReticle();
    }
    ent.draw();
  }

  for (let m of meleeAttacks) m.draw();
  for (let proj of projectiles) proj.draw();
  for (let pt of particles) pt.draw();
  for (let ft of floatingTexts) ft.draw();

  pop();

  drawHUD();
}

function drawArena() {
  if (gameMode === 'SHOWDOWN') {
    background(40, 30, 25);
    noStroke();
    fill(210, 175, 115);
    rect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    fill(198, 163, 105);
    for (let x = 0; x < MAP_WIDTH; x += 160) {
      for (let y = 0; y < MAP_HEIGHT; y += 160) {
        if ((x / 160 + y / 160) % 2 === 0) {
          rect(x, y, 160, 160);
        }
      }
    }
    stroke(140, 90, 40);
    strokeWeight(16);
    noFill();
    rect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  } else {
    background(30, 80, 40);
    noStroke();
    fill(65, 165, 75);
    rect(0, 0, BB_WIDTH, BB_HEIGHT);

    fill(55, 150, 65);
    for (let y = 0; y < BB_HEIGHT; y += 220) {
      rect(0, y, BB_WIDTH, 110);
    }

    stroke(255, 255, 255, 180);
    strokeWeight(6);
    noFill();
    line(0, BB_HEIGHT / 2, BB_WIDTH, BB_HEIGHT / 2);
    ellipse(BB_WIDTH / 2, BB_HEIGHT / 2, 260, 260);

    let goalW = 360;
    let leftPost = (BB_WIDTH - goalW) / 2;
    noStroke();
    fill(220, 50, 50, 120);
    rect(leftPost, -80, goalW, 160);
    stroke(255, 80, 80);
    strokeWeight(6);
    noFill();
    rect(leftPost, -80, goalW, 160);

    noStroke();
    fill(50, 130, 240, 120);
    rect(leftPost, BB_HEIGHT - 80, goalW, 160);
    stroke(80, 170, 255);
    strokeWeight(6);
    noFill();
    rect(leftPost, BB_HEIGHT - 80, goalW, 160);
  }
}

// ==========================================
// CLASSES DO JOGO
// ==========================================

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.r = 22;
    this.carrier = null;
    this.superCharged = false;
    this.rot = 0;
  }

  update() {
    if (this.carrier) {
      if (this.carrier.dead) {
        this.carrier = null;
        return;
      }
      this.x = this.carrier.x + cos(this.carrier.angle) * 28;
      this.y = this.carrier.y + sin(this.carrier.angle) * 28;
      this.vx = 0;
      this.vy = 0;
      this.superCharged = false;
    } else {
      this.x += this.vx;
      this.y += this.vy;
      this.rot += hypot(this.vx, this.vy) * 0.05;

      let friction = this.superCharged ? 0.96 : 0.93;
      this.vx *= friction;
      this.vy *= friction;

      if (hypot(this.vx, this.vy) < 0.3) {
        this.vx = 0;
        this.vy = 0;
        this.superCharged = false;
      }

      for (let i = walls.length - 1; i >= 0; i--) {
        let w = walls[i];
        let cx = constrain(this.x, w.x, w.x + w.w);
        let cy = constrain(this.y, w.y, w.y + w.h);
        let d = dist(this.x, this.y, cx, cy);
        if (d < this.r) {
          if (this.superCharged && !w.indestructible) {
            w.destroy();
            walls.splice(i, 1);
            screenShake = 8;
          } else {
            let ang = atan2(this.y - cy, this.x - cx);
            this.x = cx + cos(ang) * this.r;
            this.y = cy + sin(ang) * this.r;
            if (abs(this.x - cx) > abs(this.y - cy)) this.vx *= -0.7;
            else this.vy *= -0.7;
          }
        }
      }

      if (this.x < this.r) { this.x = this.r; this.vx *= -0.7; }
      if (this.x > BB_WIDTH - this.r) { this.x = BB_WIDTH - this.r; this.vx *= -0.7; }

      let goalW = 360;
      let leftPost = (BB_WIDTH - goalW) / 2;
      let rightPost = (BB_WIDTH + goalW) / 2;

      if (this.x > leftPost && this.x < rightPost) {
        if (this.y < 30 && goalBannerTimer === 0) {
          blueScore++;
          triggerGoal("GOL DO TIME AZUL!", color(60, 160, 255));
        } else if (this.y > BB_HEIGHT - 30 && goalBannerTimer === 0) {
          redScore++;
          triggerGoal("GOL DO TIME VERMELHO!", color(255, 70, 70));
        }
      } else {
        if (this.y < this.r) { this.y = this.r; this.vy *= -0.7; }
        if (this.y > BB_HEIGHT - this.r) { this.y = BB_HEIGHT - this.r; this.vy *= -0.7; }
      }

      if (hypot(this.vx, this.vy) < 10) {
        let all = [player, ...bots];
        for (let b of all) {
          if (!b.dead && b.pickupCooldown <= 0 && dist(this.x, this.y, b.x, b.y) < this.r + b.r) {
            this.carrier = b;
            break;
          }
        }
      }
    }
  }

  kick(angle, power, isSuper) {
    this.carrier = null;
    this.vx = cos(angle) * power;
    this.vy = sin(angle) * power;
    this.superCharged = isSuper;
    if (isSuper) {
      createParticles(this.x, this.y, color(255, 220, 0), 15);
    }
  }

  draw() {
    push();
    translate(this.x, this.y);

    if (this.superCharged) {
      noStroke();
      fill(255, 200, 0, 120);
      ellipse(0, 0, this.r * 2.8);
    }

    fill(0, 0, 0, 80);
    noStroke();
    ellipse(0, 12, this.r * 1.8, this.r * 0.8);

    rotate(this.rot);
    fill(255);
    stroke(20);
    strokeWeight(3);
    ellipse(0, 0, this.r * 2);

    fill(30);
    noStroke();
    ellipse(0, 0, 12);
    for (let i = 0; i < 5; i++) {
      let a = (TWO_PI / 5) * i;
      ellipse(cos(a) * 14, sin(a) * 14, 9);
    }
    pop();
  }
}

function triggerGoal(txt, col) {
  goalBannerText = txt;
  goalBannerColor = col;
  goalBannerTimer = 150;
  screenShake = 15;
}

class Brawler {
  constructor(x, y, type, isPlayer, name, team) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.type = type;
    this.isPlayer = isPlayer;
    this.name = name;
    this.team = team;
    this.r = 26;
    this.angle = 0;
    this.aimAngle = 0;
    this.isAiming = false;
    this.isAimingSuper = false;
    this.dead = false;
    this.respawnTimer = 0;
    this.pickupCooldown = 0;

    this.ammo = 3;
    this.maxAmmo = 3;
    this.superCharge = 0;
    this.rage = 0;
    this.hitFlash = 0;
    this.attackWindup = 0;

    if (type === 'ASH') {
      this.maxHp = 5600;
      this.baseSpeed = 3.8;
      this.reloadTime = 85;
      this.baseDamage = 1050;
    } else if (type === 'TRUNK') {
      this.maxHp = 6000;
      this.baseSpeed = 3.7;
      this.reloadTime = 95;
      this.baseDamage = 950;
    } else if (type === 'COLT') {
      this.maxHp = 3200;
      this.baseSpeed = 4.1;
      this.reloadTime = 75;
      this.baseDamage = 360;
    } else if (type === 'BARLEY') {
      this.maxHp = 2800;
      this.baseSpeed = 3.9;
      this.reloadTime = 95;
      this.baseDamage = 680;
    }

    this.hp = this.maxHp;
    this.reloadTimer = 0;
    this.burstQueue = 0;
    this.burstTimer = 0;
    this.burstAngle = 0;
    this.burstIsSuper = false;

    this.aiTarget = null;
    this.aiChangeDirTimer = 0;
    this.aiMoveAngle = random(TWO_PI);
  }

  getCurrentSpeed() {
    if (this.type === 'ASH') {
      return this.baseSpeed * (1 + (this.rage / 100) * 0.35);
    }
    if (this.type === 'TRUNK') {
      for (let p of puddles) {
        if (p.owner === this && dist(this.x, this.y, p.x, p.y) < p.r) {
          return this.baseSpeed * 1.25;
        }
      }
    }
    return this.baseSpeed;
  }

  getCurrentDamage(base) {
    if (this.type === 'ASH') {
      return Math.round(base * (1 + (this.rage / 100) * 0.65));
    }
    if (this.type === 'TRUNK') {
      for (let p of puddles) {
        if (p.owner === this && dist(this.x, this.y, p.x, p.y) < p.r) {
          return Math.round(base * 1.25);
        }
      }
    }
    return base;
  }

  update() {
    if (this.pickupCooldown > 0) this.pickupCooldown--;

    if (this.ammo < this.maxAmmo) {
      this.reloadTimer++;
      if (this.reloadTimer >= this.reloadTime) {
        this.ammo++;
        this.reloadTimer = 0;
      }
    }

    if (this.type === 'ASH' && this.rage > 0) {
      this.rage = max(0, this.rage - 0.12);
    }

    if (this.burstQueue > 0) {
      this.burstTimer--;
      if (this.burstTimer <= 0) {
        this.fireColtBullet(this.burstAngle, this.burstIsSuper);
        this.burstQueue--;
        this.burstTimer = 4;
      }
    }

    let mapW = gameMode === 'SHOWDOWN' ? MAP_WIDTH : BB_WIDTH;
    let mapH = gameMode === 'SHOWDOWN' ? MAP_HEIGHT : BB_HEIGHT;

    this.x += this.vx;
    this.resolveWallCollisions(true);
    this.y += this.vy;
    this.resolveWallCollisions(false);

    this.x = constrain(this.x, this.r + 10, mapW - this.r - 10);
    this.y = constrain(this.y, this.r + 10, mapH - this.r - 10);

    if (this.hitFlash > 0) this.hitFlash--;
    if (this.attackWindup > 0) this.attackWindup--;
  }

  resolveWallCollisions(isX) {
    for (let w of walls) {
      let closestX = constrain(this.x, w.x, w.x + w.w);
      let closestY = constrain(this.y, w.y, w.y + w.h);
      let dx = this.x - closestX;
      let dy = this.y - closestY;
      let distSq = dx * dx + dy * dy;

      if (distSq < this.r * this.r) {
        let d = sqrt(distSq);
        if (d === 0) {
          this.x += 2;
          return;
        }
        let overlap = this.r - d;
        this.x += (dx / d) * overlap;
        this.y += (dy / d) * overlap;
      }
    }
  }

  attack(angle, targetDist) {
    if (gameMode === 'BRAWLBALL' && ball && ball.carrier === this) {
      ball.kick(angle, 16, false);
      this.pickupCooldown = 25;
      this.attackWindup = 10;
      return;
    }

    if (this.ammo < 1) return;
    this.ammo--;
    this.angle = angle;
    this.attackWindup = 12;

    if (this.type === 'ASH') {
      let dmg = this.getCurrentDamage(this.baseDamage);
      waveAttacks.push(new ShockwaveAttack(this.x, this.y, angle, 270, dmg, this));
      this.rage = min(100, this.rage + 14);
      if (this.isPlayer) screenShake = 4;

    } else if (this.type === 'TRUNK') {
      let dmg = this.getCurrentDamage(this.baseDamage);
      meleeAttacks.push(new TrunkSpinAttack(this.x, this.y, 145, dmg, this));
      puddles.push(new Puddle(this.x, this.y, 85, 80, 360, this, 'ANTS'));
      if (this.isPlayer) screenShake = 4;

    } else if (this.type === 'COLT') {
      this.burstQueue = 6;
      this.burstTimer = 0;
      this.burstAngle = angle;
      this.burstIsSuper = false;

    } else if (this.type === 'BARLEY') {
      let distClamped = constrain(targetDist || 320, 100, 460);
      let tx = this.x + cos(angle) * distClamped;
      let ty = this.y + sin(angle) * distClamped;
      projectiles.push(new ThrownBottle(this.x, this.y, tx, ty, this.baseDamage, this, false));
    }
  }

  useSuper(angle, targetDist) {
    if (gameMode === 'BRAWLBALL' && ball && ball.carrier === this && this.superCharge >= 100) {
      this.superCharge = 0;
      ball.kick(angle, 26, true);
      this.pickupCooldown = 30;
      this.attackWindup = 15;
      if (this.isPlayer) screenShake = 10;
      return;
    }

    if (this.superCharge < 100) return;
    this.superCharge = 0;
    this.angle = angle;
    this.attackWindup = 15;

    if (this.type === 'ASH') {
      this.rage = min(100, this.rage + 40);
      for (let i = -2; i <= 2; i++) {
        let a = angle + i * 0.28;
        projectiles.push(new RatBot(this.x + cos(a) * 35, this.y + sin(a) * 35, a, this));
      }
      if (this.isPlayer) screenShake = 8;

    } else if (this.type === 'TRUNK') {
      let dashDist = 300;
      let steps = 10;
      let stepX = (cos(angle) * dashDist) / steps;
      let stepY = (sin(angle) * dashDist) / steps;

      for (let s = 0; s < steps; s++) {
        let nextX = this.x + stepX;
        let nextY = this.y + stepY;
        let hitWall = false;
        for (let w of walls) {
          if (nextX + this.r > w.x && nextX - this.r < w.x + w.w &&
              nextY + this.r > w.y && nextY - this.r < w.y + w.h) {
            hitWall = true;
            break;
          }
        }
        if (hitWall) {
          angle = PI - angle;
          stepX = -stepX;
        } else {
          this.x = nextX;
          this.y = nextY;
        }
        if (s % 2 === 0) {
          puddles.push(new Puddle(this.x, this.y, 85, 90, 420, this, 'ANTS'));
        }
        let enemies = getEnemiesOf(this);
        for (let e of enemies) {
          if (!e.dead && dist(this.x, this.y, e.x, e.y) < this.r + e.r + 20) {
            e.takeDamage(1600, this);
          }
        }
      }
      if (this.isPlayer) screenShake = 10;

    } else if (this.type === 'COLT') {
      this.burstQueue = 12;
      this.burstTimer = 0;
      this.burstAngle = angle;
      this.burstIsSuper = true;
      if (this.isPlayer) screenShake = 8;

    } else if (this.type === 'BARLEY') {
      let distClamped = constrain(targetDist || 350, 120, 500);
      let cx = this.x + cos(angle) * distClamped;
      let cy = this.y + sin(angle) * distClamped;
      for (let i = 0; i < 5; i++) {
        let a = (TWO_PI / 5) * i;
        let tx = cx + cos(a) * 95;
        let ty = cy + sin(a) * 95;
        projectiles.push(new ThrownBottle(this.x, this.y, tx, ty, 780, this, true));
      }
      if (this.isPlayer) screenShake = 8;
    }
  }

  fireColtBullet(baseAngle, isSuper) {
    let spread = random(-0.04, 0.04);
    let spd = isSuper ? 18 : 15;
    let dmg = isSuper ? 450 : this.baseDamage;
    let range = isSuper ? 680 : 520;
    projectiles.push(new Bullet(this.x + cos(baseAngle) * 28, this.y + sin(baseAngle) * 28, baseAngle + spread, spd, dmg, range, this, isSuper));
  }

  takeDamage(amount, attacker) {
    if (this.dead) return;
    this.hp -= amount;
    this.hitFlash = 6;

    if (this.type === 'ASH') {
      this.rage = min(100, this.rage + (amount / this.maxHp) * 90);
    }

    if (attacker && attacker !== this) {
      attacker.superCharge = min(100, attacker.superCharge + (amount / 1800) * 35);
    }

    floatingTexts.push(new FloatingText(this.x, this.y - 35, "-" + Math.round(amount), color(255, 80, 80)));
    createParticles(this.x, this.y, color(255, 200, 50), 5);

    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.respawnTimer = 240;
      if (ball && ball.carrier === this) ball.carrier = null;
      createParticles(this.x, this.y, color(255, 60, 60), 25);
      if (this.isPlayer || (attacker && attacker.isPlayer)) screenShake = 12;
    }
  }

  updateAI() {
    if (gameMode === 'BRAWLBALL' && ball) {
      let targetGoalY = this.team === 0 ? 0 : BB_HEIGHT;
      let goalAngle = atan2(targetGoalY - this.y, (BB_WIDTH / 2) - this.x);

      if (ball.carrier === this) {
        this.vx = cos(goalAngle) * this.getCurrentSpeed();
        this.vy = sin(goalAngle) * this.getCurrentSpeed();
        this.angle = goalAngle;
        if (abs(this.y - targetGoalY) < 420) {
          if (this.superCharge >= 100) this.useSuper(goalAngle, 400);
          else this.attack(goalAngle, 400);
        }
        return;
      } else if (!ball.carrier && dist(this.x, this.y, ball.x, ball.y) < 550) {
        let bAng = atan2(ball.y - this.y, ball.x - this.x);
        this.vx = cos(bAng) * this.getCurrentSpeed();
        this.vy = sin(bAng) * this.getCurrentSpeed();
        this.angle = bAng;
        return;
      }
    }

    let nearest = null;
    let minDist = Infinity;
    let enemies = getEnemiesOf(this);

    for (let other of enemies) {
      if (other.dead) continue;
      let d = dist(this.x, this.y, other.x, other.y);
      if (d < minDist) {
        minDist = d;
        nearest = other;
      }
    }

    if (nearest && minDist < 750) {
      let angleToTarget = atan2(nearest.y - this.y, nearest.x - this.x);
      this.angle = angleToTarget;

      let idealDist = (this.type === 'ASH' || this.type === 'TRUNK') ? 140 : 360;
      let moveAng = angleToTarget;

      if (minDist < idealDist - 40) moveAng = angleToTarget + PI;
      else if (abs(minDist - idealDist) <= 60) moveAng = angleToTarget + (frameCount % 120 < 60 ? HALF_PI : -HALF_PI);

      this.vx = cos(moveAng) * this.getCurrentSpeed() * 0.85;
      this.vy = sin(moveAng) * this.getCurrentSpeed() * 0.85;

      let attackRange = (this.type === 'ASH') ? 260 : (this.type === 'TRUNK' ? 160 : 480);
      if (minDist <= attackRange && frameCount % 35 === 0) {
        if (this.superCharge >= 100 && random() < 0.6) {
          this.useSuper(angleToTarget, minDist);
        } else {
          this.attack(angleToTarget, minDist);
        }
      }
    } else {
      this.aiChangeDirTimer--;
      if (this.aiChangeDirTimer <= 0) {
        this.aiMoveAngle = random(TWO_PI);
        this.aiChangeDirTimer = floor(random(40, 100));
      }
      this.vx = cos(this.aiMoveAngle) * this.getCurrentSpeed() * 0.6;
      this.vy = sin(this.aiMoveAngle) * this.getCurrentSpeed() * 0.6;
      this.angle = this.aiMoveAngle;
    }
  }

  drawAimReticle() {
    push();
    translate(this.x, this.y);
    rotate(this.aimAngle);

    let isSuper = this.isAimingSuper;
    let col = isSuper ? color(255, 210, 0, 140) : color(255, 255, 255, 110);
    stroke(isSuper ? color(255, 210, 0) : color(255));
    strokeWeight(2);
    fill(col);

    if (gameMode === 'BRAWLBALL' && ball && ball.carrier === this) {
      rect(25, -18, isSuper ? 450 : 300, 36, 10);
    } else if (this.type === 'ASH') {
      if (isSuper) rect(25, -45, 320, 90, 12);
      else arc(0, 0, 520, 520, -0.35, 0.35, PIE);
    } else if (this.type === 'TRUNK') {
      if (isSuper) rect(25, -35, 300, 70, 12);
      else {
        ellipse(0, 0, 290, 290);
        noFill();
        stroke(255, 100, 100);
        ellipse(0, 0, 200, 200);
      }
    } else if (this.type === 'COLT') {
      rect(25, -18, isSuper ? 660 : 500, 36, 8);
    } else if (this.type === 'BARLEY') {
      let distAim = isMobile ? constrain(hypot(rightJoy.dx, rightJoy.dy) * 460, 120, 460) : constrain(dist(this.x, this.y, mouseX + camX, mouseY + camY), 120, 460);
      ellipse(distAim, 0, isSuper ? 260 : 170, isSuper ? 260 : 170);
    }
    pop();
  }

  draw() {
    push();
    translate(this.x, this.y);

    if (this.isPlayer) {
      noFill();
      stroke(this.superCharge >= 100 ? color(255, 215, 0) : color(80, 220, 100));
      strokeWeight(4);
      ellipse(0, 14, this.r * 2.2, this.r * 1.1);
    } else if (gameMode === 'BRAWLBALL') {
      noFill();
      stroke(this.team === 0 ? color(60, 160, 255) : color(255, 70, 70));
      strokeWeight(3);
      ellipse(0, 14, this.r * 2.1, this.r * 1.05);
    }

    noStroke();
    fill(0, 0, 0, 80);
    ellipse(0, 14, this.r * 1.9, this.r * 0.9);

    push();
    rotate(this.angle);
    if (this.hitFlash > 0) tint(255, 100, 100);
    drawBrawlerModel(this.type, this.attackWindup, this.rage, this.team);
    pop();

    this.drawOverheadUI();
    pop();
  }

  drawOverheadUI() {
    let yOffset = -48;

    textAlign(CENTER, BOTTOM);
    textSize(13);
    textStyle(BOLD);
    fill(0, 0, 0, 180);
    text(this.name, 1, yOffset - 13);
    if (this.isPlayer) fill(255, 230, 80);
    else if (gameMode === 'BRAWLBALL') fill(this.team === 0 ? color(120, 200, 255) : color(255, 130, 130));
    else fill(255);
    text(this.name, 0, yOffset - 14);

    let barW = 54;
    let barH = 8;
    fill(20, 20, 20, 200);
    stroke(0);
    strokeWeight(1.5);
    rect(-barW / 2, yOffset - 10, barW, barH, 3);

    let hpRatio = constrain(this.hp / this.maxHp, 0, 1);
    noStroke();
    if (this.isPlayer || (gameMode === 'BRAWLBALL' && this.team === 0)) fill(60, 220, 80);
    else fill(235, 60, 60);
    rect(-barW / 2 + 1, yOffset - 9, (barW - 2) * hpRatio, barH - 2, 2);

    fill(255);
    textSize(10);
    text(Math.ceil(this.hp), 0, yOffset - 11);

    if (this.isPlayer) {
      let slotW = (barW - 4) / 3;
      for (let i = 0; i < 3; i++) {
        let sx = -barW / 2 + i * (slotW + 2);
        fill(30, 30, 30, 200);
        rect(sx, yOffset, slotW, 4, 1);
        if (i < this.ammo) {
          fill(255, 170, 0);
          rect(sx, yOffset, slotW, 4, 1);
        } else if (i === this.ammo) {
          fill(255, 170, 0, 140);
          rect(sx, yOffset, slotW * (this.reloadTimer / this.reloadTime), 4, 1);
        }
      }
    }

    if (this.type === 'ASH' && this.rage > 0) {
      let ry = this.isPlayer ? yOffset + 6 : yOffset;
      fill(30, 30, 30, 200);
      rect(-barW / 2, ry, barW, 4, 1);
      fill(255, 50, 30);
      rect(-barW / 2, ry, barW * (this.rage / 100), 4, 1);
    }
  }
}

// ==========================================
// MODELOS VISUAIS DOS BRAWLERS
// ==========================================

function drawBrawlerModel(type, windup, rage, team = 0) {
  stroke(20);
  strokeWeight(2.5);

  if (type === 'ASH') {
    let isAngry = rage > 50;
    fill(isAngry ? color(120, 60, 60) : color(75, 130, 175));
    rect(-22, -22, 44, 44, 8);
    fill(100, 155, 200);
    rect(-18, -26, 36, 12, 4);
    fill(255, 210, 0);
    rect(4, -10, 14, 20, 3);
    fill(isAngry ? color(255, 50, 50) : color(40, 220, 255));
    noStroke();
    rect(8, -6, 6, 12, 2);

    push();
    let swing = windup > 0 ? map(windup, 12, 0, -1.2, 1.2) : 0;
    rotate(swing);
    stroke(20);
    strokeWeight(2.5);
    fill(140, 90, 45);
    rect(10, 16, 36, 6, 2);
    fill(230, 190, 60);
    rect(40, 10, 14, 18, 3);
    pop();

  } else if (type === 'TRUNK') {
    let spinAng = windup > 0 ? map(windup, 12, 0, 0, TWO_PI) : 0;
    rotate(spinAng);
    fill(115, 75, 45);
    ellipse(0, 0, 54, 54);
    fill(150, 100, 60);
    ellipse(0, 0, 42, 42);
    fill(50, 170, 60);
    noStroke();
    ellipse(-14, -16, 18, 14);
    ellipse(-18, 12, 16, 16);
    stroke(20);
    strokeWeight(2);
    fill(255, 220, 50);
    ellipse(12, -8, 9, 9);
    ellipse(12, 8, 9, 9);

  } else if (type === 'COLT') {
    fill(210, 50, 50);
    ellipse(-2, 0, 42, 46);
    fill(255, 205, 170);
    ellipse(2, 0, 30, 30);
    fill(220, 40, 40);
    triangle(8, -12, 22, 0, 8, 12);
    fill(90, 100, 115);
    rect(14, -18, 18, 7, 2);
    rect(14, 11, 18, 7, 2);

  } else if (type === 'BARLEY') {
    let isEnemy = (team !== 0);
    fill(isEnemy ? color(135, 50, 160) : color(55, 120, 210));
    ellipse(0, 0, 44, 44);
    fill(210, 175, 110);
    ellipse(0, 0, 32, 32);
    fill(40, 45, 55);
    ellipse(-2, -4, 18, 18);
    fill(255);
    ellipse(10, 0, 11, 11);
    fill(isEnemy ? color(210, 70, 255) : color(50, 190, 255));
    noStroke();
    ellipse(12, 0, 5, 5);
    stroke(20);
    strokeWeight(2);
    fill(isEnemy ? color(190, 60, 240) : color(50, 170, 255));
    rect(14, 10, 14, 9, 3);
  }
}

function drawBrawlerPreview(x, y, type, scaleVal) {
  push();
  translate(x, y);
  scale(scaleVal);
  drawBrawlerModel(type, 0, 0, 0);
  pop();
}

// ==========================================
// ATAQUES, PROJÉTEIS E PAREDES
// ==========================================

class ShockwaveAttack {
  constructor(x, y, angle, maxRange, damage, owner) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.maxRange = maxRange;
    this.damage = damage;
    this.owner = owner;
    this.life = 14;
    this.maxLife = 14;
    this.hitEntities = [];
  }

  update() {
    this.life--;
    let progress = 1 - (this.life / this.maxLife);
    let currentDist = progress * this.maxRange;

    let enemies = getEnemiesOf(this.owner);
    for (let b of enemies) {
      if (b.dead || this.hitEntities.includes(b)) continue;
      let d = dist(this.x, this.y, b.x, b.y);
      if (abs(d - currentDist) < 42) {
        let angToB = atan2(b.y - this.y, b.x - this.x);
        let diff = abs(atan2(sin(angToB - this.angle), cos(angToB - this.angle)));
        if (diff < 0.42) {
          b.takeDamage(this.damage, this.owner);
          this.hitEntities.push(b);
        }
      }
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    let progress = 1 - (this.life / this.maxLife);
    let r = progress * this.maxRange;
    let alpha = map(this.life, 0, this.maxLife, 0, 230);

    noFill();
    stroke(this.owner.rage > 50 ? color(255, 70, 40, alpha) : color(80, 210, 255, alpha));
    strokeWeight(14);
    arc(0, 0, r * 2, r * 2, -0.38, 0.38);
    pop();
  }
}

class TrunkSpinAttack {
  constructor(x, y, radius, baseDamage, owner) {
    this.x = x;
    this.y = y;
    this.r = radius;
    this.baseDamage = baseDamage;
    this.owner = owner;
    this.life = 12;
    this.maxLife = 12;
    this.hitEntities = [];
  }

  update() {
    this.life--;
    this.x = this.owner.x;
    this.y = this.owner.y;

    let enemies = getEnemiesOf(this.owner);
    for (let b of enemies) {
      if (b.dead || this.hitEntities.includes(b)) continue;
      let d = dist(this.x, this.y, b.x, b.y);
      if (d <= this.r + b.r) {
        let isOuterEdge = d >= this.r * 0.65;
        let finalDmg = isOuterEdge ? Math.round(this.baseDamage * 1.65) : this.baseDamage;
        b.takeDamage(finalDmg, this.owner);
        this.hitEntities.push(b);
        if (isOuterEdge) {
          floatingTexts.push(new FloatingText(b.x, b.y - 55, "CRÍTICO!", color(255, 220, 0)));
        }
      }
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    let alpha = map(this.life, 0, this.maxLife, 0, 180);
    noStroke();
    fill(180, 120, 60, alpha * 0.5);
    ellipse(0, 0, this.r * 2);

    noFill();
    stroke(255, 200, 70, alpha);
    strokeWeight(8);
    ellipse(0, 0, this.r * 1.85);
    pop();
  }
}

class Bullet {
  constructor(x, y, angle, speed, damage, maxRange, owner, isSuper) {
    this.x = x;
    this.y = y;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.damage = damage;
    this.maxRange = maxRange;
    this.distTraveled = 0;
    this.owner = owner;
    this.isSuper = isSuper;
    this.r = isSuper ? 10 : 6;
    this.dead = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.distTraveled += hypot(this.vx, this.vy);

    if (this.distTraveled >= this.maxRange) {
      this.dead = true;
      return;
    }

    for (let i = walls.length - 1; i >= 0; i--) {
      let w = walls[i];
      if (this.x > w.x && this.x < w.x + w.w && this.y > w.y && this.y < w.y + w.h) {
        if (this.isSuper && !w.indestructible) {
          w.destroy();
          walls.splice(i, 1);
        } else {
          this.dead = true;
          createParticles(this.x, this.y, color(255, 220, 100), 4);
        }
        return;
      }
    }

    let enemies = getEnemiesOf(this.owner);
    for (let b of enemies) {
      if (!b.dead && dist(this.x, this.y, b.x, b.y) < this.r + b.r) {
        b.takeDamage(this.damage, this.owner);
        this.dead = true;
        return;
      }
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(atan2(this.vy, this.vx));
    noStroke();
    fill(this.isSuper ? color(255, 180, 0) : color(255, 240, 100));
    rect(-this.r * 1.5, -this.r * 0.7, this.r * 3, this.r * 1.4, 4);
    pop();
  }
}

class RatBot {
  constructor(x, y, angle, owner) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 6.2;
    this.owner = owner;
    this.life = 240;
    this.r = 14;
    this.dead = false;
  }

  update() {
    this.life--;
    if (this.life <= 0) {
      this.explode();
      return;
    }

    let nearest = null;
    let minDist = 500;
    let enemies = getEnemiesOf(this.owner);
    for (let b of enemies) {
      if (!b.dead) {
        let d = dist(this.x, this.y, b.x, b.y);
        if (d < minDist) {
          minDist = d;
          nearest = b;
        }
      }
    }

    if (nearest) {
      this.angle = atan2(nearest.y - this.y, nearest.x - this.x);
    }

    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;

    for (let w of walls) {
      let cx = constrain(this.x, w.x, w.x + w.w);
      let cy = constrain(this.y, w.y, w.y + w.h);
      if (dist(this.x, this.y, cx, cy) < this.r) {
        this.angle += HALF_PI;
      }
    }

    for (let b of enemies) {
      if (!b.dead && dist(this.x, this.y, b.x, b.y) < this.r + b.r + 8) {
        this.explode();
        return;
      }
    }
  }

  explode() {
    this.dead = true;
    createParticles(this.x, this.y, color(255, 140, 30), 15);
    let enemies = getEnemiesOf(this.owner);
    for (let b of enemies) {
      if (!b.dead && dist(this.x, this.y, b.x, b.y) < 95) {
        b.takeDamage(650, this.owner);
      }
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(140, 150, 165);
    stroke(20);
    strokeWeight(2);
    ellipse(0, 0, 26, 20);
    fill(255, 60, 60);
    noStroke();
    ellipse(7, -4, 4, 4);
    ellipse(7, 4, 4, 4);
    pop();
  }
}

class ThrownBottle {
  constructor(startX, startY, targetX, targetY, damage, owner, isSuper) {
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = startX;
    this.y = startY;
    this.damage = damage;
    this.owner = owner;
    this.isSuper = isSuper;
    this.t = 0;
    this.speed = 0.035;
    this.dead = false;
  }

  update() {
    this.t += this.speed;
    if (this.t >= 1) {
      this.dead = true;
      let r = this.isSuper ? 105 : 85;
      puddles.push(new Puddle(this.targetX, this.targetY, r, this.damage, this.isSuper ? 220 : 140, this.owner, 'ACID'));
      let isAlly = (this.owner.team === 0);
      let splashCol = isAlly ? color(50, 175, 255) : color(205, 60, 240);
      createParticles(this.targetX, this.targetY, splashCol, 14);
      return;
    }
    this.x = lerp(this.startX, this.targetX, this.t);
    this.y = lerp(this.startY, this.targetY, this.t);
  }

  draw() {
    let arcHeight = sin(this.t * PI) * 120;
    let isAlly = (this.owner.team === 0);

    push();
    noStroke();
    fill(0, 0, 0, 70);
    ellipse(this.x, this.y + 10, 22, 11);

    translate(this.x, this.y - arcHeight);
    rotate(this.t * TWO_PI * 2);

    fill(isAlly ? color(40, 155, 245) : color(185, 50, 230));
    stroke(20);
    strokeWeight(2);
    rect(-8, -12, 16, 24, 5);

    noStroke();
    fill(isAlly ? color(130, 220, 255) : color(240, 140, 255));
    rect(-4, -8, 5, 16, 2);
    fill(210, 165, 100);
    rect(-4, -16, 8, 5, 1);
    pop();
  }
}

class Puddle {
  constructor(x, y, r, tickDamage, duration, owner, kind) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.tickDamage = tickDamage;
    this.life = duration;
    this.maxLife = duration;
    this.owner = owner;
    this.kind = kind;
    this.seed = random(1000);

    this.splashes = [];
    for (let i = 0; i < 8; i++) {
      let a = (TWO_PI / 8) * i + random(-0.25, 0.25);
      let d = this.r * random(0.88, 1.08);
      this.splashes.push({
        x: cos(a) * d,
        y: sin(a) * d,
        size: random(12, 22)
      });
    }

    this.bubbles = [];
    for (let i = 0; i < 6; i++) {
      let a = random(TWO_PI);
      let d = random(0, this.r * 0.65);
      this.bubbles.push({
        x: cos(a) * d,
        y: sin(a) * d,
        offset: random(TWO_PI),
        maxR: random(8, 15)
      });
    }
  }

  update() {
    this.life--;
    if (this.life % 35 === 0) {
      let enemies = getEnemiesOf(this.owner);
      for (let b of enemies) {
        if (!b.dead && dist(this.x, this.y, b.x, b.y) < this.r + b.r * 0.5) {
          b.takeDamage(this.tickDamage, this.owner);
        }
      }
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    let alpha = min(215, map(this.life, 0, 30, 0, 215));
    noStroke();

    if (this.kind === 'ACID') {
      let isAlly = (this.owner.team === 0);

      let outerRim = isAlly ? color(110, 215, 255, alpha) : color(245, 110, 255, alpha);
      let baseLiquid = isAlly ? color(30, 125, 235, alpha * 0.92) : color(155, 30, 200, alpha * 0.92);
      let innerPool = isAlly ? color(55, 165, 255, alpha * 0.85) : color(195, 55, 235, alpha * 0.85);
      let bubbleCol = isAlly ? color(170, 235, 255, alpha) : color(255, 165, 255, alpha);

      fill(outerRim);
      ellipse(0, 0, this.r * 2.04);
      for (let s of this.splashes) {
        ellipse(s.x, s.y, s.size + 4);
      }

      fill(baseLiquid);
      ellipse(0, 0, this.r * 1.92);
      for (let s of this.splashes) {
        ellipse(s.x, s.y, s.size);
      }

      let pulse = sin(frameCount * 0.1 + this.seed) * 4;
      fill(innerPool);
      ellipse(0, 0, this.r * 1.45 + pulse);

      for (let bub of this.bubbles) {
        let cycle = (frameCount * 0.08 + bub.offset) % TWO_PI;
        let br = sin(cycle) * bub.maxR;
        if (br > 2) {
          fill(bubbleCol);
          ellipse(bub.x, bub.y, br);
        }
      }

    } else {
      fill(95, 60, 30, alpha * 0.7);
      ellipse(0, 0, this.r * 2);
      fill(30, 20, 15, alpha);
      for (let i = 0; i < 10; i++) {
        let a = this.seed + i * 1.2 + frameCount * 0.06;
        let d = (this.r * 0.75) * sin(i + frameCount * 0.03);
        ellipse(cos(a) * d, sin(a) * d, 5, 5);
      }
    }
    pop();
  }
}

class Wall {
  constructor(x, y, w, h, indestructible = false) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.indestructible = indestructible;
  }

  destroy() {
    createParticles(this.x + this.w / 2, this.y + this.h / 2, color(160, 110, 60), 15);
  }

  draw() {
    noStroke();
    fill(0, 0, 0, 70);
    rect(this.x + 6, this.y + 10, this.w, this.h, 8);

    if (this.indestructible) {
      fill(70, 80, 95);
      stroke(30);
      strokeWeight(3);
      rect(this.x, this.y, this.w, this.h, 8);
      fill(100, 115, 135);
      noStroke();
      rect(this.x + 6, this.y + 6, this.w - 12, this.h - 14, 5);
    } else {
      fill(145, 95, 50);
      stroke(50, 30, 15);
      strokeWeight(3);
      rect(this.x, this.y, this.w, this.h, 8);

      fill(180, 125, 70);
      noStroke();
      rect(this.x + 6, this.y + 6, this.w - 12, this.h - 16, 5);
    }
  }
}

class Particle {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
    this.col = col;
    this.life = random(15, 28);
    this.size = random(5, 11);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.9;
    this.vy *= 0.9;
    this.life--;
  }
  draw() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), map(this.life, 0, 28, 0, 255));
    ellipse(this.x, this.y, this.size);
  }
}

class FloatingText {
  constructor(x, y, txt, col) {
    this.x = x;
    this.y = y;
    this.txt = txt;
    this.col = col;
    this.life = 35;
  }
  update() {
    this.y -= 1.2;
    this.life--;
  }
  draw() {
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    fill(0, 0, 0, map(this.life, 0, 35, 0, 220));
    text(this.txt, this.x + 1, this.y + 1);
    fill(red(this.col), green(this.col), blue(this.col), map(this.life, 0, 35, 0, 255));
    text(this.txt, this.x, this.y);
  }
}

function createParticles(x, y, col, count) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, col));
}

function getEnemiesOf(brawler) {
  let all = [player, ...bots];
  if (gameMode === 'SHOWDOWN') {
    return all.filter(b => b !== brawler);
  } else {
    return all.filter(b => b.team !== brawler.team);
  }
}

function hypot(dx, dy) {
  return sqrt(dx * dx + dy * dy);
}

// ==========================================
// HUD E CONTROLES NA TELA
// ==========================================

function drawHUD() {
  if (gameMode === 'SHOWDOWN') {
    fill(0, 0, 0, 160);
    noStroke();
    rect(15, 15, 175, 42, 10);
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(16);
    textStyle(BOLD);
    let alive = bots.length + (player.dead ? 0 : 1);
    text("RESTANTES: " + alive + "/10", 28, 36);
  } else {
    let pw = 240;
    let ph = 46;
    let px = width / 2 - pw / 2;
    fill(0, 0, 0, 180);
    noStroke();
    rect(px, 12, pw, ph, 12);

    fill(60, 160, 255);
    textAlign(CENTER, CENTER);
    textSize(24);
    textStyle(BOLD);
    text(blueScore, px + 40, 35);

    fill(255);
    textSize(16);
    let mins = floor(matchTimer / 60);
    let secs = matchTimer % 60;
    text(mins + ":" + (secs < 10 ? "0" + secs : secs), width / 2, 35);

    fill(255, 70, 70);
    textSize(24);
    text(redScore, px + pw - 40, 35);
  }

  fill(220, 50, 50, 200);
  stroke(255);
  strokeWeight(2);
  rect(width - 85, 15, 70, 35, 8);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("SAIR", width - 50, 32);

  if (gameMode === 'BRAWLBALL' && player.dead) {
    fill(0, 0, 0, 150);
    rect(0, height / 2 - 40, width, 80);
    fill(255);
    textSize(24);
    text("RENASCENDO EM " + ceil(player.respawnTimer / 60) + "...", width / 2, height / 2);
  }

  if (gameMode === 'BRAWLBALL' && goalBannerTimer > 0) {
    fill(goalBannerColor);
    stroke(255);
    strokeWeight(4);
    rect(0, height / 2 - 55, width, 110);
    noStroke();
    fill(255);
    textSize(36);
    text(goalBannerText, width / 2, height / 2);
  }

  if (isMobile) {
    drawMobileControls();
  } else {
    fill(0, 0, 0, 150);
    noStroke();
    rect(width / 2 - 220, height - 35, 440, 25, 8);
    fill(220);
    textSize(12);
    text("WASD: Mover  |  Clique: Atacar/Chutar  |  ESPAÇO + Clique: Super", width / 2, height - 22);

    let sx = width - 70;
    let sy = height - 70;
    fill(player.superCharge >= 100 ? color(255, 200, 0) : color(50, 50, 50, 180));
    stroke(255);
    strokeWeight(3);
    ellipse(sx, sy, 85);
    noStroke();
    fill(player.superCharge >= 100 ? 0 : 255);
    textSize(14);
    text(player.superCharge >= 100 ? "SUPER!" : Math.floor(player.superCharge) + "%", sx, sy);
  }
}

function drawMobileControls() {
  noStroke();
  fill(255, 255, 255, 35);
  ellipse(leftJoy.baseX, leftJoy.baseY, 130);
  fill(100, 180, 255, 180);
  ellipse(leftJoy.stickX, leftJoy.stickY, 55);

  fill(255, 80, 80, 45);
  ellipse(rightJoy.baseX, rightJoy.baseY, 130);
  fill(255, 90, 90, 200);
  ellipse(rightJoy.stickX, rightJoy.stickY, 55);

  let ready = player.superCharge >= 100;
  fill(ready ? color(255, 200, 0, 230) : color(60, 60, 60, 160));
  stroke(ready ? 255 : 120);
  strokeWeight(3);
  ellipse(superBtn.x, superBtn.y, superBtn.r * 2);

  if (!ready) {
    noFill();
    stroke(255, 200, 0);
    strokeWeight(4);
    arc(superBtn.x, superBtn.y, superBtn.r * 2, superBtn.r * 2, -HALF_PI, -HALF_PI + TWO_PI * (player.superCharge / 100));
  }

  noStroke();
  fill(ready ? 0 : 255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text("SUPER", superBtn.x, superBtn.y);
}

function drawGameOver() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);

  let title = "";
  let sub = "";
  let titleCol = color(255);

  if (gameMode === 'SHOWDOWN') {
    let rank = bots.length + (player.dead ? 1 : 0);
    title = rank === 1 ? "VITÓRIA!" : "FIM DE JOGO";
    titleCol = rank === 1 ? color(255, 215, 0) : color(255, 80, 80);
    sub = "Sua Posição: #" + rank + " de 10";
  } else {
    let won = blueScore > redScore;
    title = won ? "VITÓRIA!" : (blueScore === redScore ? "EMPATE!" : "DERROTA!");
    titleCol = won ? color(255, 215, 0) : color(255, 80, 80);
    sub = "Placar Final: " + blueScore + " x " + redScore;
  }

  fill(titleCol);
  textSize(48);
  text(title, width / 2, height * 0.35);

  fill(255);
  textSize(24);
  text(sub, width / 2, height * 0.45);

  let bw = 240;
  let bh = 60;
  fill(40, 190, 80);
  stroke(255);
  strokeWeight(3);
  rect(width / 2 - bw / 2, height * 0.6, bw, bh, 15);
  noStroke();
  fill(255);
  textSize(22);
  text("VOLTAR AO MENU", width / 2, height * 0.6 + bh / 2);
}

// ==========================================
// EVENTOS DE ENTRADA (TECLADO, MOUSE E TOUCH)
// ==========================================

function keyPressed() {
  if (gameState === 'NICKNAME') {
    if (keyCode === ENTER) {
      confirmNickname();
    } else if (keyCode === BACKSPACE) {
      tempNick = tempNick.slice(0, -1);
    } else if (key.length === 1 && tempNick.length < 14) {
      tempNick += key;
    }
  }
}

function confirmNickname() {
  let clean = tempNick.trim();
  if (clean.length > 0) {
    playerNickname = clean;
    localStorage.setItem('brawl_nickname', playerNickname);
  }
  isTypingNick = false;
  gameState = 'MENU';
}

function mousePressed() {
  if (isMobile) return;
  handleTap(mouseX, mouseY);

  if (gameState === 'PLAYING' && !player.dead && mouseY > 60) {
    let d = dist(player.x, player.y, mouseX + camX, mouseY + camY);
    if (keyIsDown(32) && player.superCharge >= 100) {
      player.useSuper(player.aimAngle, d);
    } else {
      player.attack(player.aimAngle, d);
    }
  }
}

function handleTap(x, y) {
  if (gameState === 'NICKNAME') {
    let boxW = min(width - 40, 420);
    let boxH = 260;
    let by = height / 2 - boxH / 2;
    let btnW = 180;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = by + 165;

    if (x > btnX && x < btnX + btnW && y > btnY && y < btnY + btnH) {
      confirmNickname();
    }
  } else if (gameState === 'MENU') {
    if (x > 15 && x < 235 && y > 15 && y < 60) {
      tempNick = playerNickname;
      gameState = 'NICKNAME';
      return;
    }

    let bw = 200, bh = 55, bx = width / 2 - bw - 15, by = height - 165;
    if (x > bx && x < bx + bw && y > by && y < by + bh) {
      gameState = 'BRAWLER_SELECT';
    }

    let mx = width / 2 + 15, my = height - 165;
    if (x > mx && x < mx + bw && y > my && y < my + bh) {
      gameState = 'MODE_SELECT';
    }

    let pw = 260, ph = 65, px = width / 2 - pw / 2, py = height - 90;
    if (x > px && x < px + pw && y > py && y < py + ph) {
      startGame();
    }
  } else if (gameState === 'MODE_SELECT') {
    let cardW = min(width - 40, 480);
    let cardH = 130;
    let modes = ['SHOWDOWN', 'BRAWLBALL'];
    for (let i = 0; i < modes.length; i++) {
      let cx = width / 2 - cardW / 2;
      let cy = 120 + i * (cardH + 25);
      if (x > cx && x < cx + cardW && y > cy && y < cy + cardH) {
        gameMode = modes[i];
      }
    }
    if (x > width / 2 - 90 && x < width / 2 + 90 && y > height - 80 && y < height - 30) {
      gameState = 'MENU';
    }
  } else if (gameState === 'BRAWLER_SELECT') {
    let ids = ['ASH', 'TRUNK', 'COLT', 'BARLEY'];
    let cols = width > 750 ? 2 : 1;
    let cardW = cols === 2 ? min(360, width * 0.44) : min(440, width - 40);
    let cardH = cols === 2 ? 130 : 100;
    let startY = 95;

    for (let i = 0; i < ids.length; i++) {
      let col = i % cols;
      let row = Math.floor(i / cols);
      let totalW = cols * cardW + (cols - 1) * 20;
      let cx = (width - totalW) / 2 + col * (cardW + 20);
      let cy = startY + row * (cardH + 15);
      if (x > cx && x < cx + cardW && y > cy && y < cy + cardH) {
        selectedBrawler = ids[i];
      }
    }
    if (x > width / 2 - 100 && x < width / 2 + 100 && y > height - 70 && y < height - 20) {
      gameState = 'MENU';
    }
  } else if (gameState === 'PLAYING') {
    if (x > width - 85 && x < width - 15 && y > 15 && y < 50) {
      gameState = 'MENU';
    }
  } else if (gameState === 'GAMEOVER') {
    if (x > width / 2 - 120 && x < width / 2 + 120 && y > height * 0.6 && y < height * 0.6 + 60) {
      gameState = 'MENU';
    }
  }
}

function touchStarted() {
  for (let t of touches) {
    if (gameState !== 'PLAYING') {
      handleTap(t.x, t.y);
      if (gameState === 'NICKNAME') {
        let newName = prompt("Digite seu Nickname:", playerNickname);
        if (newName && newName.trim() !== "") {
          tempNick = newName.trim().slice(0, 14);
          confirmNickname();
        }
      }
      return false;
    }

    if (t.x > width - 85 && t.x < width - 15 && t.y > 15 && t.y < 50) {
      gameState = 'MENU';
      return false;
    }

    if (dist(t.x, t.y, superBtn.x, superBtn.y) < superBtn.r + 18 && player.superCharge >= 100) {
      superBtn.active = true;
      superBtn.id = t.id;
      superBtn.isAiming = true;
      superBtn.dx = cos(player.angle);
      superBtn.dy = sin(player.angle);
    } else if (t.x < width / 2 && !leftJoy.active) {
      leftJoy.active = true;
      leftJoy.id = t.id;
      leftJoy.baseX = t.x;
      leftJoy.baseY = t.y;
      leftJoy.stickX = t.x;
      leftJoy.stickY = t.y;
    } else if (t.x >= width / 2 && !rightJoy.active) {
      rightJoy.active = true;
      rightJoy.id = t.id;
      rightJoy.baseX = t.x;
      rightJoy.baseY = t.y;
      rightJoy.stickX = t.x;
      rightJoy.stickY = t.y;
      rightJoy.isAiming = true;
      rightJoy.dx = cos(player.angle);
      rightJoy.dy = sin(player.angle);
    }
  }
  return false;
}

function touchMoved() {
  if (gameState !== 'PLAYING') return false;

  for (let t of touches) {
    if (leftJoy.active && t.id === leftJoy.id) {
      let dx = t.x - leftJoy.baseX;
      let dy = t.y - leftJoy.baseY;
      let d = hypot(dx, dy);
      let maxR = 55;
      if (d > maxR) { dx = (dx / d) * maxR; dy = (dy / d) * maxR; }
      leftJoy.stickX = leftJoy.baseX + dx;
      leftJoy.stickY = leftJoy.baseY + dy;
      leftJoy.dx = dx / maxR;
      leftJoy.dy = dy / maxR;
    } else if (rightJoy.active && t.id === rightJoy.id) {
      let dx = t.x - rightJoy.baseX;
      let dy = t.y - rightJoy.baseY;
      let d = hypot(dx, dy);
      let maxR = 55;
      if (d > maxR) { dx = (dx / d) * maxR; dy = (dy / d) * maxR; }
      rightJoy.stickX = rightJoy.baseX + dx;
      rightJoy.stickY = rightJoy.baseY + dy;
      if (d > 8) {
        rightJoy.dx = dx / maxR;
        rightJoy.dy = dy / maxR;
      }
    } else if (superBtn.active && t.id === superBtn.id) {
      let dx = t.x - superBtn.x;
      let dy = t.y - superBtn.y;
      let d = hypot(dx, dy);
      if (d > 8) {
        superBtn.dx = dx / d;
        superBtn.dy = dy / d;
      }
    }
  }
  return false;
}

function touchEnded() {
  let activeIds = touches.map(t => t.id);

  if (leftJoy.active && !activeIds.includes(leftJoy.id)) {
    leftJoy.active = false;
    leftJoy.dx = 0;
    leftJoy.dy = 0;
    updateUIPositions();
  }

  if (rightJoy.active && !activeIds.includes(rightJoy.id)) {
    if (gameState === 'PLAYING' && !player.dead) {
      let d = hypot(rightJoy.dx, rightJoy.dy) * 460;
      player.attack(atan2(rightJoy.dy, rightJoy.dx), d);
    }
    rightJoy.active = false;
    rightJoy.isAiming = false;
    updateUIPositions();
  }

  if (superBtn.active && !activeIds.includes(superBtn.id)) {
    if (gameState === 'PLAYING' && !player.dead) {
      player.useSuper(atan2(superBtn.dy, superBtn.dx), 360);
    }
    superBtn.active = false;
    superBtn.isAiming = false;
  }
  return false;
}

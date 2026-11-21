let estadoJogo = "NOME_INICIAL"; // NOME_INICIAL, MENU, SELECAO_BRAWLER, DETALHES_BRAWLER, SELECAO_MODO, INTRO_FUTEBRAWL, JOGANDO, FIM
let modoSelecionado = "COMBATE"; // COMBATE, FUTEBRAWL
let personagemSelecionado = "ASH"; // ASH, TRUNK, COLT, BARLEY
let brawlerInspecionado = "ASH";
let scrollBrawlers = 0;
let vencedor = "";

// Sistema de Nickname salvo no navegador
let nicknameJogador = "";
let inputNickname = null;
let btnConfirmarNome = null;
const CHAVE_STORAGE_NICKNAME = "brawl_stars_2d_nickname_v1";

let mundoLargura = 2200;
let mundoAltura = 2200;
let camX = 0;
let camY = 0;

let jogador;
let inimigos = [];
let aliados = [];
let projeteis = [];
let garrafas = [];
let gaiolasAsh = [];
let efeitosSpawnRatos = [];
let pocas = [];
let pocasTerra = [];
let ondasCirculares = [];
let rachadurasChao = [];
let obstaculos = [];
let particulas = [];
let textosFlutuantes = [];
let confetesGol = [];
let bola = null;

let placarAzul = 0;
let placarVermelho = 0;
let venenoRaio = 1450;
let cnv;

let timerIntroFutebrawl = 0;
let celebracaoGol = {
  ativo: false,
  timer: 0,
  autor: "",
  timeGol: "",
  alvoCamX: 0,
  alvoCamY: 0,
  pontoX: 0,
  pontoY: 0
};

let modoMira = "ATAQUE"; // "ATAQUE" ou "SUPER"
let teclasPressionadas = {};
let ultimoToqueY = 0;

const DADOS_BRAWLERS = [
  {
    id: "ASH",
    nome: "ASH",
    classe: "TANQUE",
    raridade: "ÉPICO",
    corFaixa: [175, 55, 225],
    saude: "4500",
    ataque: "750",
    superNome: "ROEDORES ROBÓTICOS",
    descCurta: "Fúria em 3 etapas (+dano e +vel)"
  },
  {
    id: "TRUNK",
    nome: "TRUNK",
    classe: "TANQUE",
    raridade: "ÉPICO",
    corFaixa: [175, 55, 225],
    saude: "4000",
    ataque: "650",
    superNome: "INVESTIDA DE TERRA",
    descCurta: "Terra dá +dano e +vel • Super ricocheteia"
  },
  {
    id: "COLT",
    nome: "COLT",
    classe: "DESTRUIDOR",
    raridade: "RARO",
    corFaixa: [50, 205, 50],
    saude: "2800",
    ataque: "6 x 320",
    superNome: "TEMPESTADE DE BALAS",
    descCurta: "Rajada rápida de 6 balas"
  },
  {
    id: "BARLEY",
    nome: "BARLEY",
    classe: "LANÇADOR",
    raridade: "RARO",
    corFaixa: [50, 205, 50],
    saude: "2600",
    ataque: "680",
    superNome: "ÚLTIMA SAIDEIRA",
    descCurta: "Garrafas por cima das paredes"
  }
];

function obterInfoBrawler(id) {
  return DADOS_BRAWLERS.find((b) => b.id === id) || DADOS_BRAWLERS[0];
}

function carregarNicknameSalvo() {
  try {
    let salvo = window.localStorage.getItem(CHAVE_STORAGE_NICKNAME);
    if (salvo && salvo.trim().length > 0) {
      return salvo.trim();
    }
  } catch (e) {}
  return "";
}

function salvarNicknameNoStorage(novoNome) {
  let limpo = novoNome.trim();
  if (limpo.length === 0) limpo = "Jogador";
  limpo = limpo.substring(0, 16);
  nicknameJogador = limpo;
  try {
    window.localStorage.setItem(CHAVE_STORAGE_NICKNAME, limpo);
  } catch (e) {}
}

function criarElementosInputNickname() {
  inputNickname = createInput("");
  inputNickname.attribute("placeholder", "nickname");
  inputNickname.attribute("maxlength", "16");
  inputNickname.style("font-size", "20px");
  inputNickname.style("font-weight", "bold");
  inputNickname.style("text-align", "center");
  inputNickname.style("border-radius", "12px");
  inputNickname.style("border", "3px solid #1e283c");
  inputNickname.style("background-color", "#f5f8ff");
  inputNickname.style("color", "#141c2c");
  inputNickname.style("outline", "none");
  inputNickname.style("box-shadow", "0 4px 12px rgba(0,0,0,0.4)");

  inputNickname.elt.addEventListener("keydown", function (e) {
    e.stopPropagation();
    if (e.key === "Enter") {
      confirmarNickname();
    }
  });

  btnConfirmarNome = createButton("CONFIRMAR");
  btnConfirmarNome.style("font-size", "18px");
  btnConfirmarNome.style("font-weight", "bold");
  btnConfirmarNome.style("border-radius", "12px");
  btnConfirmarNome.style("border", "3px solid #191919");
  btnConfirmarNome.style("background-color", "#ffcd0f");
  btnConfirmarNome.style("color", "#191919");
  btnConfirmarNome.style("cursor", "pointer");
  btnConfirmarNome.style("box-shadow", "0 5px 0 #a55f00");
  btnConfirmarNome.mousePressed(confirmarNickname);
  btnConfirmarNome.elt.addEventListener("touchstart", function (e) {
    e.preventDefault();
    e.stopPropagation();
    confirmarNickname();
  }, { passive: false });

  atualizarPosicaoElementosNickname();
}

function atualizarPosicaoElementosNickname() {
  if (!cnv || !inputNickname || !btnConfirmarNome) return;
  let rect = cnv.elt.getBoundingClientRect();
  let escala = rect.width / width;

  let wInput = 280 * escala;
  let hInput = 44 * escala;
  inputNickname.position(rect.left + rect.width / 2 - wInput / 2, rect.top + rect.height / 2 - 24 * escala);
  inputNickname.size(wInput, hInput);
  inputNickname.style("font-size", Math.max(12, Math.round(20 * escala)) + "px");

  let wBtn = 190 * escala;
  let hBtn = 46 * escala;
  btnConfirmarNome.position(rect.left + rect.width / 2 - wBtn / 2, rect.top + rect.height / 2 + 40 * escala);
  btnConfirmarNome.size(wBtn, hBtn);
  btnConfirmarNome.style("font-size", Math.max(11, Math.round(18 * escala)) + "px");
}

function mostrarFormularioNickname(preencherAtual) {
  estadoJogo = "NOME_INICIAL";
  if (inputNickname && btnConfirmarNome) {
    atualizarPosicaoElementosNickname();
    inputNickname.value(preencherAtual ? nicknameJogador : "");
    inputNickname.show();
    btnConfirmarNome.show();
    setTimeout(() => {
      if (inputNickname) inputNickname.elt.focus();
    }, 30);
  }
}

function esconderFormularioNickname() {
  if (inputNickname) {
    inputNickname.elt.blur();
    inputNickname.hide();
  }
  if (btnConfirmarNome) {
    btnConfirmarNome.hide();
  }
}

function confirmarNickname() {
  if (!inputNickname) return;
  let digitado = inputNickname.value().trim();
  if (digitado.length === 0) {
    inputNickname.elt.focus();
    return;
  }
  salvarNicknameNoStorage(digitado);
  esconderFormularioNickname();
  estadoJogo = "MENU";
}

function setup() {
  cnv = createCanvas(850, 600);
  if (document.getElementById("jogo-container")) {
    cnv.parent("jogo-container");
  }
  cnv.style("touch-action", "none");
  cnv.mousePressed(tratarCliqueCanvas);
  cnv.elt.oncontextmenu = function (e) {
    e.preventDefault();
    return false;
  };
  registrarEventosTouchCanvas();
  textAlign(CENTER, CENTER);

  criarElementosInputNickname();

  let nomeSalvo = carregarNicknameSalvo();
  if (nomeSalvo !== "") {
    nicknameJogador = nomeSalvo;
    esconderFormularioNickname();
    estadoJogo = "MENU";
  } else {
    mostrarFormularioNickname(false);
  }

  window.addEventListener("resize", atualizarPosicaoElementosNickname);

  window.addEventListener("keydown", function (e) {
    if (estadoJogo === "NOME_INICIAL") return;

    teclasPressionadas[e.key.toLowerCase()] = true;
    teclasPressionadas[e.code] = true;

    if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
      if (e.key.toLowerCase() === "j" || e.key.toLowerCase() === "z") {
        jogador.atacar();
      }
      if (e.code === "Space" || e.key.toLowerCase() === "e" || e.key.toLowerCase() === "k") {
        e.preventDefault();
        jogador.usarSuper();
      }
      if (e.key.toLowerCase() === "q") {
        alternarModoMira();
      }
    }
  });

  window.addEventListener("keyup", function (e) {
    teclasPressionadas[e.key.toLowerCase()] = false;
    teclasPressionadas[e.code] = false;
  });
}

function alternarModoMira() {
  modoMira = modoMira === "ATAQUE" ? "SUPER" : "ATAQUE";
}

function mouseWheel(event) {
  if (estadoJogo === "SELECAO_BRAWLER") {
    let totalLinhas = ceil(DADOS_BRAWLERS.length / 3);
    let alturaTotal = totalLinhas * 172;
    let maxScroll = max(0, alturaTotal - 480);
    scrollBrawlers = constrain(scrollBrawlers + event.delta * 0.6, 0, maxScroll);
    return false;
  }
  if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
    alternarModoMira();
    return false;
  }
}

function draw() {
  background(40, 140, 60);

  if (estadoJogo === "NOME_INICIAL") {
    desenharTelaNickname();
  } else if (estadoJogo === "MENU") {
    desenharMenu();
  } else if (estadoJogo === "SELECAO_BRAWLER") {
    desenharTelaBrawlers();
  } else if (estadoJogo === "DETALHES_BRAWLER") {
    desenharTelaDetalhesBrawler();
  } else if (estadoJogo === "SELECAO_MODO") {
    desenharTelaModos();
  } else if (estadoJogo === "INTRO_FUTEBRAWL") {
    desenharIntroFutebrawl();
  } else if (estadoJogo === "JOGANDO") {
    atualizarJogo();
    desenharJogo();
  } else if (estadoJogo === "FIM") {
    desenharFim();
  }
}

// ==========================================
// TELA DE NICKNAME (ANTES DO MENU)
// ==========================================
function desenharTelaNickname() {
  atualizarPosicaoElementosNickname();

  background(22, 58, 128);
  noStroke();
  fill(32, 85, 175, 160);
  ellipse(width / 2, height / 2, 650, 480);
  fill(48, 115, 215, 120);
  ellipse(width / 2, height / 2, 420, 320);

  fill(14, 24, 48, 230);
  stroke(255, 215, 0);
  strokeWeight(3);
  rect(width / 2 - 200, height / 2 - 125, 400, 250, 18);

  noStroke();
  fill(255, 215, 0);
  textStyle(BOLD);
  textSize(24);
  text("QUAL É O SEU NOME?", width / 2, height / 2 - 75);

  fill(185, 215, 255);
  textSize(13);
  text("Ele ficará salvo e aparecerá nas partidas", width / 2, height / 2 - 48);
}

// ==========================================
// LOBBY PRINCIPAL (ESTILO BRAWL STARS)
// ==========================================
function desenharMenu() {
  background(22, 58, 128);
  noStroke();
  fill(32, 85, 175, 160);
  ellipse(width / 2, height / 2 - 20, 650, 480);
  fill(48, 115, 215, 120);
  ellipse(width / 2, height / 2 - 20, 420, 320);

  fill(15, 42, 98, 180);
  rect(0, 0, width, 54);
  fill(255, 215, 0);
  textStyle(BOLD);
  textSize(24);
  text("BRAWL STARS 2D", width / 2, 28);

  let hoverNome = mouseX >= 14 && mouseX <= 214 && mouseY >= 8 && mouseY <= 46;
  fill(hoverNome ? color(48, 76, 132) : color(28, 48, 92));
  stroke(hoverNome ? color(255, 220, 60) : color(95, 150, 230));
  strokeWeight(2);
  rect(14, 8, 200, 38, 10);

  noStroke();
  fill(255, 205, 0);
  ellipse(34, 27, 22, 22);
  fill(28, 48, 92);
  ellipse(34, 24, 8, 8);
  arc(34, 34, 14, 10, PI, TWO_PI);

  textAlign(LEFT, CENTER);
  fill(255);
  textSize(14);
  text(nicknameJogador, 52, 22);
  fill(155, 205, 255);
  textSize(10);
  text("Toque para alterar", 52, 37);
  textAlign(CENTER, CENTER);

  noStroke();
  fill(10, 25, 60, 140);
  ellipse(width / 2, 365, 210, 65);
  fill(255, 225, 70, 190);
  ellipse(width / 2, 360, 175, 50);
  fill(255, 245, 160, 220);
  ellipse(width / 2, 360, 125, 34);

  let infoAtual = obterInfoBrawler(personagemSelecionado);

  fill(0, 160);
  textSize(32);
  text(infoAtual.nome, width / 2 + 2, 132);
  fill(255);
  text(infoAtual.nome, width / 2, 130);

  fill(175, 215, 255);
  textSize(13);
  text(infoAtual.classe + " • " + infoAtual.descCurta, width / 2, 160);

  let animIdle = sin(frameCount * 0.05) * 0.08;
  desenharBrawlerPorTipo(personagemSelecionado, width / 2, 285, -PI / 2 + animIdle, 2.35);

  let btnBX = 22;
  let btnBY = 255;
  let btnBW = 148;
  let btnBH = 74;

  noStroke();
  fill(12, 20, 40);
  rect(btnBX, btnBY + 5, btnBW, btnBH, 10);

  stroke(25);
  strokeWeight(3);
  fill(46, 62, 92);
  rect(btnBX, btnBY, btnBW, btnBH, 10);

  fill(255, 205, 0);
  stroke(25);
  strokeWeight(2);
  ellipse(btnBX + 30, btnBY + 37, 28, 28);
  fill(46, 62, 92);
  noStroke();
  ellipse(btnBX + 30, btnBY + 37, 11, 11);

  fill(0, 180);
  textSize(16);
  text("BRAWLERS", btnBX + 96, btnBY + 39);
  fill(255);
  text("BRAWLERS", btnBX + 95, btnBY + 37);

  let modoX = 365;
  let modoY = 505;
  let modoW = 265;
  let modoH = 74;

  noStroke();
  fill(10, 14, 24);
  rect(modoX, modoY + 5, modoW, modoH, 10);

  stroke(20);
  strokeWeight(3);
  fill(48, 56, 74);
  rect(modoX, modoY, modoW, modoH, 10);

  noStroke();
  fill(22, 26, 36);
  rect(modoX + 2, modoY + 2, modoW - 4, 20, 8, 8, 0, 0);
  fill(195, 210, 230);
  textSize(11);
  text("Toque para trocar modo", modoX + modoW / 2, modoY + 12);

  if (modoSelecionado === "COMBATE") {
    fill(65, 215, 85);
    stroke(20);
    strokeWeight(2);
    ellipse(modoX + 36, modoY + 46, 34, 32);
    rect(modoX + 27, modoY + 53, 18, 10, 3);
    fill(20);
    noStroke();
    ellipse(modoX + 30, modoY + 45, 7, 8);
    ellipse(modoX + 42, modoY + 45, 7, 8);
  } else {
    fill(255);
    stroke(20);
    strokeWeight(2);
    ellipse(modoX + 36, modoY + 47, 34, 34);
    fill(35, 110, 130);
    noStroke();
    ellipse(modoX + 36, modoY + 47, 15, 15);
  }

  textAlign(LEFT, CENTER);
  let tituloModo = modoSelecionado === "COMBATE" ? "COMBATE" : "FUTE-BRAWL";
  let subtituloMapa = modoSelecionado === "COMBATE" ? "Caverna Convulsiva (10)" : "Tiro de meta";

  fill(0, 200);
  textSize(20);
  text(tituloModo, modoX + 64, modoY + 40);
  fill(255);
  text(tituloModo, modoX + 63, modoY + 38);

  fill(0, 180);
  textSize(13);
  text(subtituloMapa, modoX + 64, modoY + 59);
  fill(135, 205, 255);
  text(subtituloMapa, modoX + 63, modoY + 58);
  textAlign(CENTER, CENTER);

  let jogarX = 642;
  let jogarY = 505;
  let jogarW = 188;
  let jogarH = 74;

  noStroke();
  fill(165, 95, 0);
  rect(jogarX, jogarY + 6, jogarW, jogarH, 10);

  stroke(25);
  strokeWeight(3);
  fill(255, 205, 15);
  rect(jogarX, jogarY, jogarW, jogarH, 10);

  noStroke();
  fill(255, 235, 95, 150);
  rect(jogarX + 5, jogarY + 4, jogarW - 10, 14, 6);

  fill(25);
  textSize(28);
  text("JOGAR", jogarX + jogarW / 2 + 2, jogarY + jogarH / 2 + 2);
  fill(255);
  text("JOGAR", jogarX + jogarW / 2, jogarY + jogarH / 2);
}

function desenharBrawlerPorTipo(tipo, x, y, angulo, escala) {
  if (tipo === "ASH") {
    desenharSpriteAsh(x, y, angulo, escala, 0, 20);
  } else if (tipo === "TRUNK") {
    desenharSpriteTrunk(x, y, angulo, escala, false, 0, false, false);
  } else if (tipo === "COLT") {
    desenharSpriteColt(x, y, angulo, escala, 0);
  } else if (tipo === "BARLEY") {
    desenharSpriteBarley(x, y, angulo, escala, 0);
  }
}

// ==========================================
// MODELO 3D FRONTAL DO ASH (TELA DE DETALHES)
// ==========================================
function desenharAsh3DFrontal(x, y, escala) {
  push();
  translate(x, y);
  scale(escala);

  let respirar = sin(frameCount * 0.06) * 2.5;
  let balancoArma = sin(frameCount * 0.05) * 0.04;

  noStroke();
  fill(8, 22, 58, 175);
  ellipse(0, 72, 118, 28);

  fill(48, 38, 128);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-34, 38, 22, 24, 6);
  fill(28, 34, 52);
  rect(-38, 54, 28, 16, 7);
  fill(65, 80, 115);
  noStroke();
  rect(-33, 57, 16, 4, 2);

  fill(48, 38, 128);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(10, 38, 22, 24, 6);
  fill(28, 34, 52);
  rect(8, 54, 28, 16, 7);
  fill(65, 80, 115);
  noStroke();
  rect(13, 57, 16, 4, 2);

  push();
  translate(0, respirar * 0.5);

  fill(26, 132, 188);
  stroke(16, 20, 32);
  strokeWeight(3);
  beginShape();
  vertex(-54, -56);
  vertex(-38, -48);
  vertex(-38, 42);
  vertex(-54, 32);
  endShape(CLOSE);

  fill(14, 72, 112);
  noStroke();
  ellipse(-46, -42, 5, 5);
  ellipse(-46, -6, 5, 5);
  ellipse(-46, 26, 5, 5);

  push();
  translate(-24, -58);
  rotate(-0.25);
  fill(145, 55, 195);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  rect(-14, -14, 24, 18, 4);
  fill(245, 175, 45);
  rect(-16, -18, 28, 6, 3);
  pop();

  fill(155, 172, 192);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  ellipse(28, -56, 18, 16);
  ellipse(22, -64, 7, 7);
  ellipse(34, -64, 7, 7);
  fill(255, 215, 40);
  noStroke();
  ellipse(25, -56, 3.5, 3.5);
  ellipse(31, -56, 3.5, 3.5);

  fill(45, 175, 232);
  stroke(16, 20, 32);
  strokeWeight(3.2);
  rect(-38, -50, 82, 92, 10);

  noStroke();
  fill(115, 218, 255, 160);
  rect(-34, -46, 74, 6, 3);

  stroke(16, 20, 32);
  strokeWeight(3);
  line(-38, 4, 44, 4);

  fill(248, 192, 38);
  noStroke();
  rect(-36, 6, 78, 10);
  fill(185, 115, 15);
  for (let px = -30; px <= 38; px += 8) {
    ellipse(px, 11, 2.5, 2.5);
  }

  fill(228, 48, 62);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  beginShape();
  vertex(-20, 6);
  vertex(26, 6);
  vertex(26, 30);
  vertex(3, 40);
  vertex(-20, 30);
  endShape(CLOSE);

  fill(252, 205, 45);
  noStroke();
  rect(-9, 13, 24, 17, 2);
  rect(-9, 9, 5, 5);
  rect(0.5, 9, 5, 5);
  rect(10, 9, 5, 5);
  fill(228, 48, 62);
  rect(-1, 20, 8, 10, 3, 3, 0, 0);

  fill(22, 102, 148);
  ellipse(-29, 32, 5.5, 5.5);
  ellipse(35, 32, 5.5, 5.5);

  fill(24, 94, 152);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-29, -42, 64, 44, 14);

  fill(12, 14, 22);
  noStroke();
  rect(-23, -36, 52, 34, 10);

  fill(255);
  beginShape();
  vertex(-17, -26);
  vertex(0, -19);
  vertex(-1, -11);
  vertex(-16, -12);
  vertex(-19, -19);
  endShape(CLOSE);

  beginShape();
  vertex(23, -26);
  vertex(6, -19);
  vertex(7, -11);
  vertex(22, -12);
  vertex(25, -19);
  endShape(CLOSE);

  fill(12, 14, 22);
  ellipse(-13, -19, 4.5, 6);
  ellipse(11, -19, 4.5, 6);

  fill(255);
  stroke(12, 14, 22);
  strokeWeight(2);
  rect(-12, -9, 30, 8, 3);
  stroke(115, 148, 182);
  strokeWeight(1.5);
  line(-2, -8, -2, -2);
  line(8, -8, 8, -2);

  fill(124, 158, 206);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-22, -72, 50, 26, 8);

  noFill();
  stroke(52, 78, 118);
  strokeWeight(3);
  ellipse(-6, -60, 17, 15);
  ellipse(14, -60, 17, 15);
  line(2.5, -60, 5.5, -60);

  fill(198, 226, 248);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  rect(-7, -50, 20, 11, 4);
  line(0, -50, 0, -39);
  line(6, -50, 6, -39);

  pop();

  push();
  translate(48, 8 + respirar * 0.4);
  rotate(balancoArma);

  fill(35, 145, 205);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  ellipse(6, 2, 18, 16);
  fill(32, 38, 52);
  ellipse(16, 6, 18, 18);

  push();
  translate(18, 4);
  rotate(-0.14);

  fill(145, 198, 232);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  ellipse(0, 24, 14, 14);

  fill(228, 48, 62);
  rect(-12, 10, 24, 7, 3);

  fill(175, 222, 248);
  rect(-6, -52, 12, 62, 3);

  fill(118, 162, 198);
  rect(-8, -26, 16, 12, 3);

  fill(88, 158, 212);
  rect(-32, -74, 64, 24, 6);
  fill(145, 205, 248);
  beginShape();
  vertex(-32, -74);
  vertex(-22, -82);
  vertex(38, -82);
  vertex(32, -74);
  endShape(CLOSE);

  fill(32, 68, 112);
  noStroke();
  triangle(0, -68, -7, -58, 7, -58);

  fill(242, 145, 48);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  beginShape();
  vertex(-28, -74);
  vertex(-32, -96);
  vertex(-14, -96);
  vertex(-14, -90);
  vertex(-4, -90);
  vertex(-4, -96);
  vertex(12, -96);
  vertex(12, -90);
  vertex(20, -90);
  vertex(20, -96);
  vertex(34, -96);
  vertex(30, -74);
  endShape(CLOSE);
  pop();
  pop();

  push();
  translate(-46, 14 - respirar * 0.4);
  rotate(-0.06 - balancoArma * 0.6);

  fill(115, 168, 215);
  stroke(16, 20, 32);
  strokeWeight(3.2);
  beginShape();
  vertex(-28, -32);
  vertex(24, -28);
  vertex(22, 18);
  vertex(-3, 38);
  vertex(-26, 16);
  endShape(CLOSE);

  fill(26, 62, 118);
  noStroke();
  beginShape();
  vertex(-21, -24);
  vertex(17, -21);
  vertex(15, 13);
  vertex(-3, 29);
  vertex(-19, 12);
  endShape(CLOSE);

  fill(135, 208, 250);
  rect(-5, -2, 6, 18, 2);
  rect(-13, -12, 22, 11, 3);
  fill(26, 62, 118);
  rect(-8, -12, 3, 5);
  rect(-1, -12, 3, 5);
  rect(6, -12, 3, 5);
  pop();

  pop();
}

// ==========================================
// RETRATOS DOS ROSTOS NOS CARDS
// ==========================================
function desenharRetratoCardBrawler(id, x, y, w, h) {
  let ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.clip();

  if (id === "ASH") {
    noStroke();
    fill(185, 42, 235);
    rect(x, y, w, h);

    push();
    translate(x + w * 0.40, y + h * 0.56);
    scale(w / 245);

    fill(42, 168, 225);
    stroke(15, 20, 30);
    strokeWeight(4);
    beginShape();
    vertex(-95, -90);
    vertex(55, -105);
    vertex(75, 85);
    vertex(-95, 85);
    endShape(CLOSE);

    fill(118, 152, 198);
    stroke(15, 20, 30);
    strokeWeight(4);
    beginShape();
    vertex(-45, -102);
    vertex(75, -105);
    vertex(62, -32);
    vertex(-32, -45);
    endShape(CLOSE);

    noFill();
    stroke(55, 82, 118);
    strokeWeight(4);
    ellipse(4, -72, 34, 30);
    ellipse(40, -75, 34, 30);
    line(21, -73, 23, -73);

    fill(195, 225, 248);
    stroke(15, 20, 30);
    strokeWeight(3.5);
    rect(-12, -52, 38, 20, 7);
    fill(125, 168, 205);
    rect(-2, -52, 10, 20);
    rect(12, -52, 10, 20);

    fill(24, 92, 148);
    stroke(15, 20, 30);
    strokeWeight(4);
    rect(-76, -34, 128, 115, 24);

    fill(12, 14, 20);
    noStroke();
    rect(-64, -22, 104, 98, 18);

    fill(14, 52, 92);
    ellipse(-68, -14, 7, 7);
    ellipse(-68, 48, 7, 7);
    ellipse(44, -14, 7, 7);
    ellipse(44, 48, 7, 7);

    fill(255);
    stroke(12, 14, 20);
    strokeWeight(3);
    beginShape();
    vertex(-52, -4);
    vertex(-12, 12);
    vertex(-14, 32);
    vertex(-48, 30);
    vertex(-56, 14);
    endShape(CLOSE);

    beginShape();
    vertex(34, 2);
    vertex(0, 14);
    vertex(2, 32);
    vertex(32, 30);
    vertex(38, 16);
    endShape(CLOSE);

    fill(12, 14, 20);
    noStroke();
    ellipse(-43, 12, 9, 14);
    ellipse(9, 16, 8, 12);

    fill(255);
    stroke(12, 14, 20);
    strokeWeight(3.5);
    beginShape();
    vertex(-38, 66);
    vertex(-34, 46);
    vertex(-12, 43);
    vertex(-4, 47);
    vertex(6, 44);
    vertex(24, 48);
    vertex(26, 66);
    endShape(CLOSE);

    stroke(115, 148, 182);
    strokeWeight(2.5);
    line(-16, 44, -16, 65);
    line(4, 45, 4, 65);
    pop();
  } else if (id === "BARLEY") {
    noStroke();
    fill(42, 208, 42);
    rect(x, y, w, h);

    push();
    translate(x + w * 0.36, y + h * 0.56);
    scale(w / 245);

    fill(218, 48, 62);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    ellipse(-12, 75, 165, 110);

    fill(92, 98, 112);
    ellipse(-28, 56, 36, 26);
    ellipse(14, 58, 36, 26);
    ellipse(-7, 56, 18, 18);

    fill(165, 182, 208);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    rect(-68, -68, 112, 112, 42);

    fill(125, 142, 168);
    ellipse(-54, -16, 22, 36);

    fill(128, 72, 168);
    stroke(15, 20, 30);
    strokeWeight(4);
    beginShape();
    vertex(-74, -64);
    vertex(32, -88);
    vertex(38, -72);
    vertex(-68, -48);
    endShape(CLOSE);

    fill(42, 68, 102);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    ellipse(-6, -24, 86, 78);

    fill(248, 232, 65);
    stroke(15, 20, 30);
    strokeWeight(3.5);
    ellipse(-4, -24, 52, 50);

    noFill();
    stroke(15, 20, 30);
    strokeWeight(5.5);
    arc(-4, -20, 24, 24, PI + 0.25, TWO_PI - 0.25);

    fill(215, 226, 244);
    stroke(15, 20, 30);
    strokeWeight(4);
    beginShape();
    vertex(-54, 16);
    bezierVertex(-62, 44, -22, 54, -6, 34);
    bezierVertex(10, 54, 52, 44, 44, 16);
    bezierVertex(36, 2, 12, 8, -6, 16);
    bezierVertex(-24, 8, -46, 2, -54, 16);
    endShape(CLOSE);
    pop();
  } else if (id === "COLT") {
    noStroke();
    fill(42, 208, 42);
    rect(x, y, w, h);

    push();
    translate(x + w * 0.36, y + h * 0.56);
    scale(w / 245);

    fill(105, 132, 225);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    beginShape();
    vertex(-75, 45);
    vertex(25, 65);
    vertex(10, 95);
    vertex(-85, 95);
    endShape(CLOSE);

    fill(215, 38, 65);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    ellipse(-22, -25, 138, 128);

    fill(245, 202, 168);
    ellipse(-68, -12, 26, 36);

    fill(252, 214, 182);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    beginShape();
    vertex(-45, -45);
    vertex(42, -45);
    vertex(48, 22);
    vertex(18, 66);
    vertex(-22, 56);
    vertex(-48, 20);
    endShape(CLOSE);

    fill(228, 42, 68);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    beginShape();
    vertex(-76, -32);
    bezierVertex(-82, -88, 35, -96, 62, -68);
    bezierVertex(55, -42, 28, -32, -12, -38);
    bezierVertex(-32, -40, -54, -22, -76, -32);
    endShape(CLOSE);

    fill(228, 42, 68);
    beginShape();
    vertex(-62, -22);
    vertex(-42, -18);
    vertex(-36, 36);
    vertex(-56, 32);
    endShape(CLOSE);

    fill(15, 20, 30);
    noStroke();
    push();
    translate(-10, -24);
    rotate(0.22);
    rect(-16, -6, 32, 11, 5);
    pop();

    push();
    translate(28, -18);
    rotate(-0.28);
    rect(-14, -6, 28, 11, 5);
    pop();

    fill(255);
    stroke(15, 20, 30);
    strokeWeight(3);
    ellipse(-10, -2, 24, 30);
    ellipse(26, 2, 20, 26);

    fill(15, 20, 30);
    noStroke();
    ellipse(-12, -2, 11, 16);
    ellipse(22, 2, 10, 14);

    noFill();
    stroke(165, 115, 88);
    strokeWeight(2.5);
    line(8, 6, 14, 18);
    line(14, 18, 4, 20);

    stroke(15, 20, 30);
    strokeWeight(3);
    arc(4, 24, 30, 18, 0.25, PI - 0.35);

    stroke(235, 165, 128);
    strokeWeight(4);
    line(12, 44, 22, 54);
    line(22, 44, 12, 54);
    pop();
  } else if (id === "TRUNK") {
    noStroke();
    fill(185, 42, 235);
    rect(x, y, w, h);

    push();
    translate(x + w * 0.42, y + h * 0.56);
    scale(w / 245);

    fill(152, 92, 48);
    stroke(15, 20, 30);
    strokeWeight(4.5);
    beginShape();
    vertex(-78, -88);
    vertex(34, -88);
    vertex(24, 85);
    vertex(-78, 85);
    endShape(CLOSE);

    stroke(92, 52, 22);
    strokeWeight(3);
    line(-45, -45, -45, -24);
    line(-12, -55, -12, -32);

    fill(218, 198, 92);
    stroke(15, 20, 30);
    strokeWeight(3.5);
    rect(-82, -56, 118, 12, 6);
    rect(-80, 44, 108, 12, 6);

    fill(85, 212, 52);
    stroke(15, 20, 30);
    strokeWeight(4);
    beginShape();
    vertex(-65, -88);
    vertex(-22, -46);
    vertex(18, -88);
    endShape(CLOSE);

    ellipse(-24, 68, 72, 42);
    line(-24, 48, -24, 85);

    fill(15, 14, 18);
    stroke(75, 42, 18);
    strokeWeight(4);
    beginShape();
    vertex(-62, -26);
    vertex(-42, -38);
    vertex(-22, -22);
    vertex(12, -34);
    vertex(18, 18);
    vertex(-18, 36);
    vertex(-58, 24);
    endShape(CLOSE);

    fill(245, 235, 45);
    noStroke();
    ellipse(-42, 6, 12, 10);
    ellipse(-32, 8, 11, 9);
    ellipse(-4, 6, 11, 9);
    ellipse(6, 5, 12, 10);

    fill(15, 14, 18);
    ellipse(-41, 6, 4, 4);
    ellipse(5, 5, 4, 4);

    push();
    translate(64, 12);
    rotate(-0.25);
    fill(125, 38, 98);
    stroke(15, 20, 30);
    strokeWeight(4);
    rect(-6, -48, 12, 18, 4);
    ellipse(0, 4, 58, 66);
    fill(188, 68, 132);
    ellipse(4, 8, 52, 56);
    fill(218, 198, 92);
    rect(-28, -28, 56, 12, 6);
    pop();

    pop();
  }

  ctx.restore();
}

// ==========================================
// SUBTELA 1: LISTA DE BRAWLERS
// ==========================================
function desenharTelaBrawlers() {
  background(22, 58, 132);

  noStroke();
  fill(32, 85, 178, 130);
  ellipse(width / 2, height / 2, 740, 520);

  let cols = 3;
  let cardW = 248;
  let cardH = 148;
  let gapX = 20;
  let gapY = 22;
  let startX = (width - (cols * cardW + (cols - 1) * gapX)) / 2;
  let startY = 88 - scrollBrawlers;

  for (let i = 0; i < DADOS_BRAWLERS.length; i++) {
    let item = DADOS_BRAWLERS[i];
    let col = i % cols;
    let row = floor(i / cols);
    let cxCard = startX + col * (cardW + gapX);
    let cyCard = startY + row * (cardH + gapY);

    let selecionado = personagemSelecionado === item.id;
    let hover = mouseY > 64 && mouseX >= cxCard && mouseX <= cxCard + cardW && mouseY >= cyCard && mouseY <= cyCard + cardH;

    noStroke();
    fill(10, 14, 24, 235);
    rect(cxCard, cyCard + 6, cardW, cardH, 14);

    desenharRetratoCardBrawler(item.id, cxCard, cyCard, cardW, cardH);

    noFill();
    strokeWeight(selecionado ? 4.5 : (hover ? 4 : 3.5));
    stroke(selecionado ? color(85, 255, 125) : (hover ? color(255, 225, 65) : color(14, 18, 28)));
    rect(cxCard, cyCard, cardW, cardH, 14);

    if (selecionado) {
      noStroke();
      fill(45, 225, 95);
      rect(cxCard + cardW - 96, cyCard + 8, 86, 19, 6);
      fill(12, 24, 16);
      textStyle(BOLD);
      textSize(10);
      text("SELECIONADO", cxCard + cardW - 53, cyCard + 17.5);
    }

    textAlign(RIGHT, BOTTOM);
    textStyle(BOLD);
    textSize(22);
    stroke(12, 16, 24, 250);
    strokeWeight(4.5);
    fill(255);
    text(item.nome, cxCard + cardW - 14, cyCard + cardH - 10);
    noStroke();
    textAlign(CENTER, CENTER);
  }

  noStroke();
  fill(15, 36, 86, 245);
  rect(0, 0, width, 64);

  let hoverVoltar = mouseX >= 16 && mouseX <= 74 && mouseY >= 12 && mouseY <= 52;
  fill(12, 20, 40);
  rect(16, 15, 58, 40, 10);
  stroke(20);
  strokeWeight(2.5);
  fill(hoverVoltar ? color(75, 110, 175) : color(48, 72, 122));
  rect(16, 12, 58, 40, 10);

  noStroke();
  fill(255);
  triangle(36, 32, 50, 21, 50, 43);

  fill(255, 215, 0);
  textStyle(BOLD);
  textSize(24);
  text("BRAWLERS (" + DADOS_BRAWLERS.length + "/" + DADOS_BRAWLERS.length + ")", width / 2, 33);
}

// ==========================================
// SUBTELA 2: DETALHES DO BRAWLER
// ==========================================
function desenharTelaDetalhesBrawler() {
  let info = obterInfoBrawler(brawlerInspecionado);

  background(22, 68, 152);
  noStroke();
  fill(35, 98, 205, 170);
  ellipse(width / 2, height / 2 + 10, 680, 520);
  fill(55, 132, 240, 130);
  ellipse(width / 2, height / 2 + 10, 410, 340);

  let hoverVoltar = mouseX >= 16 && mouseX <= 74 && mouseY >= 12 && mouseY <= 52;
  fill(12, 20, 40);
  rect(16, 15, 58, 40, 10);
  stroke(20);
  strokeWeight(2.5);
  fill(hoverVoltar ? color(75, 110, 175) : color(48, 72, 122));
  rect(16, 12, 58, 40, 10);
  noStroke();
  fill(255);
  triangle(36, 32, 50, 21, 50, 43);

  push();
  noStroke();
  fill(12, 18, 35, 180);
  beginShape();
  vertex(0, 112);
  vertex(252, 102);
  vertex(236, 188);
  vertex(0, 198);
  endShape(CLOSE);

  fill(info.corFaixa[0], info.corFaixa[1], info.corFaixa[2]);
  stroke(20);
  strokeWeight(3);
  beginShape();
  vertex(-4, 106);
  vertex(248, 96);
  vertex(232, 182);
  vertex(-4, 192);
  endShape(CLOSE);

  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(32);
  stroke(15, 18, 28, 245);
  strokeWeight(5);
  fill(255);
  text(info.nome, 24, 130);

  fill(255);
  stroke(15, 18, 28, 245);
  strokeWeight(3);
  ellipse(34, 164, 18, 18);
  fill(info.corFaixa[0], info.corFaixa[1], info.corFaixa[2]);
  noStroke();
  ellipse(34, 164, 8, 8);

  textSize(16);
  stroke(15, 18, 28, 245);
  strokeWeight(3.5);
  fill(255);
  text(info.classe, 50, 164);
  noStroke();

  textSize(12);
  stroke(15, 18, 28, 245);
  strokeWeight(3);
  fill(info.raridade === "RARO" ? color(135, 255, 135) : color(235, 160, 255));
  text(info.raridade, 175, 188);
  noStroke();
  pop();

  let selX = 24;
  let selY = 505;
  let selW = 215;
  let selH = 66;
  let jaSelecionado = personagemSelecionado === info.id;

  noStroke();
  fill(jaSelecionado ? color(25, 115, 45) : color(165, 95, 0));
  rect(selX, selY + 6, selW, selH, 12);

  stroke(20);
  strokeWeight(3);
  fill(jaSelecionado ? color(65, 225, 105) : color(255, 205, 15));
  rect(selX, selY, selW, selH, 12);

  noStroke();
  fill(255, 255, 255, 110);
  rect(selX + 6, selY + 4, selW - 12, 13, 6);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(22);
  stroke(15, 18, 26, 235);
  strokeWeight(4);
  fill(255);
  text(jaSelecionado ? "SELECIONADO" : "SELECIONAR", selX + selW / 2, selY + selH / 2);
  noStroke();

  if (info.id === "ASH") {
    desenharAsh3DFrontal(width / 2 - 15, 342, 1.58);
  } else {
    noStroke();
    fill(10, 28, 70, 160);
    ellipse(width / 2 - 15, 395, 210, 62);
    fill(95, 185, 255, 170);
    ellipse(width / 2 - 15, 390, 170, 46);

    let animIdle = sin(frameCount * 0.05) * 0.07;
    desenharBrawlerPorTipo(info.id, width / 2 - 15, 310, -PI / 2 + animIdle, 2.55);
  }

  let painelX = 565;
  let painelY = 255;
  let painelW = 262;
  let painelH = 225;

  noStroke();
  fill(10, 18, 36, 210);
  rect(painelX, painelY + 5, painelW, painelH, 14);

  stroke(20, 32, 58);
  strokeWeight(3);
  fill(18, 38, 78, 235);
  rect(painelX, painelY, painelW, painelH, 14);

  desenharLinhaStatusBrawler(
    painelX + 12,
    painelY + 16,
    painelW - 24,
    56,
    color(55, 205, 75),
    "SAÚDE",
    info.saude,
    "CORACAO"
  );

  desenharLinhaStatusBrawler(
    painelX + 12,
    painelY + 84,
    painelW - 24,
    56,
    color(235, 55, 65),
    "ATAQUE",
    info.ataque,
    "ATAQUE"
  );

  desenharLinhaStatusBrawler(
    painelX + 12,
    painelY + 152,
    painelW - 24,
    56,
    color(250, 185, 25),
    "SUPER",
    info.superNome,
    "SUPER"
  );
}

function desenharLinhaStatusBrawler(x, y, w, h, corIcone, titulo, valor, tipoIcone) {
  noStroke();
  fill(12, 26, 56, 220);
  rect(x, y, w, h, 8);

  stroke(18, 22, 32);
  strokeWeight(2.5);
  fill(corIcone);
  rect(x + 4, y + 4, h - 8, h - 8, 7);

  let icX = x + 4 + (h - 8) / 2;
  let icY = y + h / 2;
  noStroke();
  fill(255);

  if (tipoIcone === "CORACAO") {
    ellipse(icX - 5, icY - 3, 11, 11);
    ellipse(icX + 5, icY - 3, 11, 11);
    triangle(icX - 10.5, icY - 1, icX + 10.5, icY - 1, icX, icY + 10);
  } else if (tipoIcone === "ATAQUE") {
    beginShape();
    vertex(icX, icY - 11);
    vertex(icX + 4, icY - 4);
    vertex(icX + 11, icY - 3);
    vertex(icX + 5, icY + 3);
    vertex(icX + 8, icY + 10);
    vertex(icX, icY + 6);
    vertex(icX - 8, icY + 10);
    vertex(icX - 5, icY + 3);
    vertex(icX - 11, icY - 3);
    vertex(icX - 4, icY - 4);
    endShape(CLOSE);
  } else if (tipoIcone === "SUPER") {
    ellipse(icX, icY - 2, 18, 16);
    rect(icX - 6, icY + 4, 12, 6, 2);
    fill(20);
    ellipse(icX - 4, icY - 2, 4, 5);
    ellipse(icX + 4, icY - 2, 4, 5);
  }

  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(12);
  fill(175, 210, 255);
  text(titulo, x + h + 8, y + 18);

  textSize(valor.length > 12 ? 13 : 18);
  stroke(10, 14, 24, 230);
  strokeWeight(3);
  fill(255);
  text(valor, x + h + 8, y + 38);
  noStroke();
  textAlign(CENTER, CENTER);
}

// ==========================================
// TELA DE APRESENTAÇÃO DO FUTE-BRAWL (4 SEGUNDOS)
// ==========================================
function desenharIntroFutebrawl() {
  timerIntroFutebrawl--;

  noStroke();
  fill(24, 98, 210);
  rect(0, 0, width, height);

  fill(210, 48, 55);
  beginShape();
  vertex(width * 0.54, 0);
  vertex(width, 0);
  vertex(width, height);
  vertex(width * 0.46, height);
  endShape(CLOSE);

  stroke(15, 20, 32);
  strokeWeight(6);
  line(width * 0.54, 0, width * 0.46, height);

  noStroke();
  fill(12, 18, 32, 140);
  rect(0, 0, width, 64);
  rect(0, height - 54, width, 54);

  fill(255, 215, 0);
  textStyle(BOLD);
  textSize(24);
  text("FUTE-BRAWL • TIRO DE META", width / 2, 32);

  fill(15, 20, 32);
  ellipse(width / 2, height / 2, 84, 84);
  fill(255, 215, 0);
  stroke(25);
  strokeWeight(3);
  ellipse(width / 2, height / 2, 72, 72);
  noStroke();
  fill(25);
  textSize(28);
  text("VS", width / 2, height / 2 + 2);

  let anim = sin(frameCount * 0.08) * 0.06;

  let equipeAzul = [jogador, ...aliados];
  let posAzul = [
    { x: 265, y: 295, escala: 1.85 },
    { x: 135, y: 185, escala: 1.55 },
    { x: 135, y: 425, escala: 1.55 }
  ];

  for (let i = 0; i < equipeAzul.length; i++) {
    let b = equipeAzul[i];
    if (!b) continue;
    let p = posAzul[i];

    noStroke();
    fill(10, 35, 90, 170);
    ellipse(p.x, p.y + 42 * (p.escala / 1.5), 115, 36);
    fill(90, 190, 255, 190);
    ellipse(p.x, p.y + 39 * (p.escala / 1.5), 92, 26);

    desenharBrawlerPorTipo(b.tipo, p.x, p.y, -PI / 2 + anim, p.escala);

    textSize(20);
    stroke(12, 18, 30, 240);
    strokeWeight(4);
    fill(255);
    text(b.tipo, p.x, p.y + 72);
    noStroke();
  }

  let equipeVermelha = inimigos;
  let posVermelho = [
    { x: 585, y: 295, escala: 1.85 },
    { x: 715, y: 185, escala: 1.55 },
    { x: 715, y: 425, escala: 1.55 }
  ];

  for (let i = 0; i < equipeVermelha.length; i++) {
    let b = equipeVermelha[i];
    if (!b) continue;
    let p = posVermelho[i];

    noStroke();
    fill(95, 15, 20, 170);
    ellipse(p.x, p.y + 42 * (p.escala / 1.5), 115, 36);
    fill(255, 120, 120, 190);
    ellipse(p.x, p.y + 39 * (p.escala / 1.5), 92, 26);

    desenharBrawlerPorTipo(b.tipo, p.x, p.y, -PI / 2 - anim, p.escala);

    textSize(20);
    stroke(12, 18, 30, 240);
    strokeWeight(4);
    fill(255);
    text(b.tipo, p.x, p.y + 72);
    noStroke();
  }

  if (timerIntroFutebrawl <= 0) {
    estadoJogo = "JOGANDO";
  }
}

// ==========================================
// SUBTELA: SELEÇÃO DE MODO
// ==========================================
function desenharTelaModos() {
  background(20, 32, 62);

  fill(255, 215, 0);
  textStyle(BOLD);
  textSize(30);
  text("ESCOLHA O EVENTO", width / 2, 65);

  strokeWeight(4);
  stroke(modoSelecionado === "COMBATE" ? color(0, 255, 120) : color(80, 95, 130));
  fill(75, 48, 38);
  rect(135, 145, 265, 230, 18);

  fill(65, 215, 85);
  stroke(20);
  strokeWeight(3);
  ellipse(267, 215, 56, 52);
  rect(253, 232, 28, 14, 4);
  fill(20);
  noStroke();
  ellipse(257, 213, 11, 13);
  ellipse(277, 213, 11, 13);

  fill(255);
  textSize(24);
  text("COMBATE", 267, 285);
  fill(230);
  textSize(13);
  text("Caverna Convulsiva\n10 Brawlers • Mapa Gigante", 267, 328);

  strokeWeight(4);
  stroke(modoSelecionado === "FUTEBRAWL" ? color(0, 255, 120) : color(80, 95, 130));
  fill(35, 68, 105);
  rect(450, 145, 265, 230, 18);

  fill(255);
  stroke(20);
  strokeWeight(3);
  ellipse(582, 220, 56, 56);
  fill(35, 110, 130);
  noStroke();
  ellipse(582, 220, 24, 24);

  fill(255);
  textSize(24);
  text("FUTE-BRAWL", 582, 285);
  fill(230);
  textSize(13);
  text("Tiro de meta\n3v3 • Primeiro a 2 gols!", 582, 328);

  noStroke();
  fill(165, 95, 0);
  rect(width / 2 - 110, 445, 220, 60, 14);
  stroke(25);
  strokeWeight(3);
  fill(255, 205, 15);
  rect(width / 2 - 110, 440, 220, 60, 14);
  noStroke();
  fill(25);
  textSize(22);
  text("CONFIRMAR", width / 2, 470);
}

function tratarCliqueCanvas(e, toqueX, toqueY) {
  window.focus();
  let cx = toqueX !== undefined ? toqueX : mouseX;
  let cy = toqueY !== undefined ? toqueY : mouseY;
  let ehBotaoDireito = (e && e.button === 2) || mouseButton === RIGHT || mouseButton === "right";

  if (estadoJogo === "NOME_INICIAL") {
    return;
  } else if (estadoJogo === "MENU") {
    if (ehBotaoDireito) return;
    if (cx >= 14 && cx <= 214 && cy >= 8 && cy <= 46) {
      mostrarFormularioNickname(true);
      return;
    }
    if (cx > 22 && cx < 170 && cy > 255 && cy < 329) {
      scrollBrawlers = 0;
      estadoJogo = "SELECAO_BRAWLER";
      return;
    }
    if (cx > 365 && cx < 630 && cy > 505 && cy < 579) {
      estadoJogo = "SELECAO_MODO";
      return;
    }
    if (cx > 642 && cx < 830 && cy > 505 && cy < 579) {
      iniciarPartida();
      return;
    }
  } else if (estadoJogo === "SELECAO_BRAWLER") {
    if (ehBotaoDireito) return;
    if (cx >= 16 && cx <= 74 && cy >= 12 && cy <= 52) {
      estadoJogo = "MENU";
      return;
    }

    if (cy > 64) {
      let cols = 3;
      let cardW = 248;
      let cardH = 148;
      let gapX = 20;
      let gapY = 22;
      let startX = (width - (cols * cardW + (cols - 1) * gapX)) / 2;
      let startY = 88 - scrollBrawlers;

      for (let i = 0; i < DADOS_BRAWLERS.length; i++) {
        let col = i % cols;
        let row = floor(i / cols);
        let cxCard = startX + col * (cardW + gapX);
        let cyCard = startY + row * (cardH + gapY);

        if (cx >= cxCard && cx <= cxCard + cardW && cy >= cyCard && cy <= cyCard + cardH) {
          brawlerInspecionado = DADOS_BRAWLERS[i].id;
          estadoJogo = "DETALHES_BRAWLER";
          return;
        }
      }
    }
  } else if (estadoJogo === "DETALHES_BRAWLER") {
    if (ehBotaoDireito) return;
    if (cx >= 16 && cx <= 74 && cy >= 12 && cy <= 52) {
      estadoJogo = "SELECAO_BRAWLER";
      return;
    }
    if (cx >= 24 && cx <= 239 && cy >= 505 && cy <= 571) {
      personagemSelecionado = brawlerInspecionado;
      estadoJogo = "MENU";
      return;
    }
  } else if (estadoJogo === "SELECAO_MODO") {
    if (ehBotaoDireito) return;
    if (cy > 145 && cy < 375) {
      if (cx > 135 && cx < 400) modoSelecionado = "COMBATE";
      if (cx > 450 && cx < 715) modoSelecionado = "FUTEBRAWL";
    }
    if (cx > width / 2 - 110 && cx < width / 2 + 110 && cy > 440 && cy < 500) {
      estadoJogo = "MENU";
    }
  } else if (estadoJogo === "JOGANDO") {
    if (ehMobile || touches.length > 0) return;
    if (!celebracaoGol.ativo && jogador && jogador.vida > 0) {
      if (ehBotaoDireito) {
        jogador.usarSuper();
      } else {
        jogador.atacar();
      }
    }
  } else if (estadoJogo === "FIM") {
    estadoJogo = "MENU";
  }
}

// ==========================================
// INICIALIZAÇÃO DA PARTIDA
// ==========================================
function iniciarPartida() {
  esconderFormularioNickname();
  projeteis = [];
  garrafas = [];
  gaiolasAsh = [];
  efeitosSpawnRatos = [];
  pocas = [];
  pocasTerra = [];
  ondasCirculares = [];
  rachadurasChao = [];
  particulas = [];
  textosFlutuantes = [];
  confetesGol = [];
  obstaculos = [];
  inimigos = [];
  aliados = [];
  bola = null;
  placarAzul = 0;
  placarVermelho = 0;
  modoMira = "ATAQUE";
  celebracaoGol.ativo = false;

  if (modoSelecionado === "COMBATE") {
    mundoLargura = 2200;
    mundoAltura = 2200;
    venenoRaio = 1480;

    let pontosSpawn = [
      { x: 180, y: 200 },
      { x: 680, y: 170 },
      { x: 1520, y: 170 },
      { x: 2020, y: 200 },
      { x: 170, y: 1100 },
      { x: 2030, y: 1100 },
      { x: 180, y: 2000 },
      { x: 680, y: 2030 },
      { x: 1520, y: 2030 },
      { x: 2020, y: 2000 }
    ];

    let spawnsEmbaralhados = shuffle(pontosSpawn);
    jogador = new Brawler(spawnsEmbaralhados[0].x, spawnsEmbaralhados[0].y, personagemSelecionado, "AZUL", true, nicknameJogador);

    let poolBots = ["ASH", "TRUNK", "COLT", "BARLEY", "ASH", "TRUNK", "COLT", "BARLEY", "COLT"];
    for (let i = 1; i <= 9; i++) {
      let sp = spawnsEmbaralhados[i];
      let bot = new Brawler(sp.x, sp.y, poolBots[i - 1], "BOT" + i, false);
      bot.zonaPreferidaY = random(300, mundoAltura - 300);
      inimigos.push(bot);
    }

    obstaculos.push(new Obstaculo(430, 420, 90, 90));
    obstaculos.push(new Obstaculo(1680, 420, 90, 90));
    obstaculos.push(new Obstaculo(430, 1690, 90, 90));
    obstaculos.push(new Obstaculo(1680, 1690, 90, 90));

    obstaculos.push(new Obstaculo(1055, 340, 90, 65));
    obstaculos.push(new Obstaculo(1055, 1795, 90, 65));
    obstaculos.push(new Obstaculo(340, 1055, 65, 90));
    obstaculos.push(new Obstaculo(1795, 1055, 65, 90));

    obstaculos.push(new Obstaculo(730, 720, 85, 85));
    obstaculos.push(new Obstaculo(1385, 720, 85, 85));
    obstaculos.push(new Obstaculo(730, 1395, 85, 85));
    obstaculos.push(new Obstaculo(1385, 1395, 85, 85));

    obstaculos.push(new Obstaculo(1060, 860, 80, 50));
    obstaculos.push(new Obstaculo(1060, 1290, 80, 50));
    obstaculos.push(new Obstaculo(860, 1060, 50, 80));
    obstaculos.push(new Obstaculo(1290, 1060, 50, 80));

    camX = constrain(jogador.x - width / 2, 0, mundoLargura - width);
    camY = constrain(jogador.y - height / 2, 0, mundoAltura - height);
    estadoJogo = "JOGANDO";
  } else if (modoSelecionado === "FUTEBRAWL") {
    mundoLargura = 1400;
    mundoAltura = 800;
    resetarPosicoesFutebrawl();

    camX = constrain(jogador.x - width / 2, 0, mundoLargura - width);
    camY = constrain(jogador.y - height / 2, 0, mundoAltura - height);

    timerIntroFutebrawl = 240; // 4 segundos
    estadoJogo = "INTRO_FUTEBRAWL";
  }
}

function resetarPosicoesFutebrawl() {
  projeteis = [];
  garrafas = [];
  gaiolasAsh = [];
  efeitosSpawnRatos = [];
  pocas = [];
  pocasTerra = [];
  ondasCirculares = [];
  rachadurasChao = [];
  confetesGol = [];
  modoMira = "ATAQUE";
  celebracaoGol.ativo = false;

  let meioY = mundoAltura / 2;

  obstaculos = [
    new Obstaculo(210, meioY - 75, 32, 150),
    new Obstaculo(mundoLargura - 242, meioY - 75, 32, 150),
    new Obstaculo(460, 170, 75, 50),
    new Obstaculo(mundoLargura - 535, 170, 75, 50),
    new Obstaculo(460, mundoAltura - 220, 75, 50),
    new Obstaculo(mundoLargura - 535, mundoAltura - 220, 75, 50)
  ];

  jogador = new Brawler(430, meioY, personagemSelecionado, "AZUL", true, nicknameJogador);

  let aliado1 = new Brawler(300, 180, "COLT", "AZUL", false);
  aliado1.zonaPreferidaY = 170;

  let aliado2 = new Brawler(300, mundoAltura - 180, "BARLEY", "AZUL", false);
  aliado2.zonaPreferidaY = mundoAltura - 170;

  aliados = [aliado1, aliado2];

  let ini1 = new Brawler(mundoLargura - 430, meioY, "ASH", "VERMELHO", false);
  ini1.zonaPreferidaY = meioY;

  let ini2 = new Brawler(mundoLargura - 300, 180, "TRUNK", "VERMELHO", false);
  ini2.zonaPreferidaY = 170;

  let ini3 = new Brawler(mundoLargura - 300, mundoAltura - 180, "COLT", "VERMELHO", false);
  ini3.zonaPreferidaY = mundoAltura - 170;

  inimigos = [ini1, ini2, ini3];

  bola = {
    x: mundoLargura / 2,
    y: meioY,
    vx: 0,
    vy: 0,
    raio: 15,
    rotacao: 0,
    superChuteAtivo: false,
    alcanceMax: 0,
    alcanceRestante: 0,
    velInicial: 0,
    rastro: [],
    posse: null,
    ultimoChutador: null,
    ultimoTocador: null,
    cooldownChute: 0
  };
}

// ==========================================
// CELEBRAÇÃO DO GOL (CONFETES E CÂMERA DESLIZANDO)
// ==========================================
function iniciarCelebracaoGol(timeMarcador, golX, golY, autorBrawler) {
  celebracaoGol.ativo = true;
  celebracaoGol.timer = 120; // 2 segundos
  celebracaoGol.timeGol = timeMarcador;
  if (autorBrawler) {
    celebracaoGol.autor = autorBrawler.ehJogador ? autorBrawler.nomeExibicao : autorBrawler.tipo;
  } else {
    celebracaoGol.autor = timeMarcador === "AZUL" ? "TIME AZUL" : "TIME VERMELHO";
  }
  celebracaoGol.pontoX = golX;
  celebracaoGol.pontoY = golY;
  celebracaoGol.alvoCamX = constrain(golX - width / 2, 0, mundoLargura - width);
  celebracaoGol.alvoCamY = constrain(golY - height / 2, 0, mundoAltura - height);

  if (bola) {
    bola.posse = null;
    bola.vx = 0;
    bola.vy = 0;
    bola.alcanceRestante = 0;
  }

  let dirSpray = timeMarcador === "AZUL" ? -1 : 1;
  let coresConfete = [
    color(255, 215, 0),
    color(0, 200, 255),
    color(255, 70, 90),
    color(90, 255, 110),
    color(255, 145, 255),
    color(255, 255, 255)
  ];

  for (let i = 0; i < 85; i++) {
    let ang = (dirSpray === 1 ? random(-1.15, 1.15) : random(PI - 1.15, PI + 1.15));
    let vel = random(2.5, 10.5);
    confetesGol.push({
      x: golX,
      y: golY + random(-18, 18),
      vx: cos(ang) * vel,
      vy: sin(ang) * vel - random(1.5, 4.0),
      w: random(6, 11),
      h: random(4, 7),
      rot: random(TWO_PI),
      vRot: random(-0.22, 0.22),
      cor: random(coresConfete),
      vida: random(75, 120)
    });
  }
}

function atualizarCelebracaoGol() {
  camX = lerp(camX, celebracaoGol.alvoCamX, 0.22);
  camY = lerp(camY, celebracaoGol.alvoCamY, 0.22);

  for (let i = confetesGol.length - 1; i >= 0; i--) {
    let c = confetesGol[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vx *= 0.96;
    c.vy += 0.14;
    c.rot += c.vRot;
    c.vida--;
    if (c.vida <= 0) {
      confetesGol.splice(i, 1);
    }
  }

  celebracaoGol.timer--;
  if (celebracaoGol.timer <= 0) {
    celebracaoGol.ativo = false;
    if (placarVermelho >= 2) {
      vencedor = "DERROTA NO FUTE-BRAWL!";
      estadoJogo = "FIM";
    } else if (placarAzul >= 2) {
      vencedor = "VITÓRIA NO FUTE-BRAWL!";
      estadoJogo = "FIM";
    } else {
      resetarPosicoesFutebrawl();
    }
  }
}

// ==========================================
// LOOP PRINCIPAL DO JOGO E CÂMERA
// ==========================================
function atualizarJogo() {
  if (celebracaoGol.ativo) {
    atualizarCelebracaoGol();
    return;
  }

  let todosBrawlers = [jogador, ...aliados, ...inimigos];
  let meioY = mundoAltura / 2;

  if (jogador.vida > 0) {
    if (jogador.dashTimer <= 0) {
      jogador.moverJogador();
    }
    jogador.atualizar();
  } else if (modoSelecionado === "COMBATE") {
    let colocacao = inimigos.length + 1;
    vencedor = "FIM DE JOGO! Posição: #" + colocacao + " de 10";
    estadoJogo = "FIM";
    return;
  } else if (modoSelecionado === "FUTEBRAWL") {
    if (jogador.respawnTimer <= 0) jogador.respawnTimer = 180;
    jogador.respawnTimer--;
    if (jogador.respawnTimer <= 0) {
      jogador.vida = jogador.vidaMax;
      jogador.municao = 3;
      jogador.x = 120;
      jogador.y = meioY;
    }
  }

  let alvoCamX = constrain(jogador.x - width / 2, 0, mundoLargura - width);
  let alvoCamY = constrain(jogador.y - height / 2, 0, mundoAltura - height);
  camX = lerp(camX, alvoCamX, 0.14);
  camY = lerp(camY, alvoCamY, 0.14);

  for (let a of aliados) {
    if (a.vida > 0) {
      if (a.dashTimer <= 0) a.iaFutebrawl(bola, [jogador, ...aliados], inimigos);
      a.atualizar();
    } else {
      if (a.respawnTimer <= 0) a.respawnTimer = 180;
      a.respawnTimer--;
      if (a.respawnTimer <= 0) {
        a.vida = a.vidaMax;
        a.municao = 3;
        a.x = 120;
        a.y = a.zonaPreferidaY || random(180, mundoAltura - 180);
      }
    }
  }

  for (let i = inimigos.length - 1; i >= 0; i--) {
    let ini = inimigos[i];
    if (ini.vida > 0) {
      if (ini.dashTimer <= 0) {
        if (modoSelecionado === "COMBATE") {
          ini.iaCombate(todosBrawlers);
        } else {
          ini.iaFutebrawl(bola, inimigos, [jogador, ...aliados]);
        }
      }
      ini.atualizar();
    } else {
      if (modoSelecionado === "COMBATE") {
        inimigos.splice(i, 1);
      } else {
        if (ini.respawnTimer <= 0) ini.respawnTimer = 180;
        ini.respawnTimer--;
        if (ini.respawnTimer <= 0) {
          ini.vida = ini.vidaMax;
          ini.municao = 3;
          ini.x = mundoLargura - 120;
          ini.y = ini.zonaPreferidaY || random(180, mundoAltura - 180);
        }
      }
    }
  }

  for (let i = pocasTerra.length - 1; i >= 0; i--) {
    pocasTerra[i].vida--;
    if (pocasTerra[i].vida <= 0) {
      pocasTerra.splice(i, 1);
    }
  }

  for (let i = pocas.length - 1; i >= 0; i--) {
    let pc = pocas[i];
    pc.atualizar(todosBrawlers);
    if (pc.vida <= 0) {
      pocas.splice(i, 1);
    }
  }

  for (let i = garrafas.length - 1; i >= 0; i--) {
    let gf = garrafas[i];
    gf.atualizar(todosBrawlers);
    if (gf.finalizada) {
      garrafas.splice(i, 1);
    }
  }

  for (let i = gaiolasAsh.length - 1; i >= 0; i--) {
    let gl = gaiolasAsh[i];
    gl.atualizar();
    if (gl.finalizada) {
      gaiolasAsh.splice(i, 1);
    }
  }

  for (let i = efeitosSpawnRatos.length - 1; i >= 0; i--) {
    efeitosSpawnRatos[i].vida--;
    if (efeitosSpawnRatos[i].vida <= 0) {
      efeitosSpawnRatos.splice(i, 1);
    }
  }

  for (let i = projeteis.length - 1; i >= 0; i--) {
    let p = projeteis[i];
    p.atualizar(todosBrawlers);
    if (p.vida <= 0) {
      projeteis.splice(i, 1);
    }
  }

  for (let i = ondasCirculares.length - 1; i >= 0; i--) {
    let oc = ondasCirculares[i];
    oc.atualizar(todosBrawlers);
    if (oc.vida <= 0) {
      ondasCirculares.splice(i, 1);
    }
  }

  for (let i = rachadurasChao.length - 1; i >= 0; i--) {
    rachadurasChao[i].vida--;
    if (rachadurasChao[i].vida <= 0) {
      rachadurasChao.splice(i, 1);
    }
  }

  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].x += particulas[i].vx;
    particulas[i].y += particulas[i].vy;
    particulas[i].vida--;
    if (particulas[i].vida <= 0) particulas.splice(i, 1);
  }

  for (let i = textosFlutuantes.length - 1; i >= 0; i--) {
    textosFlutuantes[i].y -= 1.25;
    textosFlutuantes[i].vida--;
    if (textosFlutuantes[i].vida <= 0) textosFlutuantes.splice(i, 1);
  }

  if (modoSelecionado === "COMBATE") {
    venenoRaio = max(180, venenoRaio - 0.22);
    for (let b of todosBrawlers) {
      if (b.vida > 0 && dist(b.x, b.y, mundoLargura / 2, mundoAltura / 2) > venenoRaio) {
        if (frameCount % 30 === 0) {
          b.receberDano(350, color(100, 255, 100));
        }
      }
    }
    if (inimigos.length === 0) {
      vencedor = "VITÓRIA! #1 de 10 no Combate!";
      estadoJogo = "FIM";
    }
  } else if (modoSelecionado === "FUTEBRAWL" && bola) {
    atualizarBola();
  }
}

function lancaBolaComAlcance(chutador, angulo, alcance, velInicial, ehSuper) {
  if (!bola) return;
  bola.posse = null;
  bola.ultimoChutador = chutador;
  bola.ultimoTocador = chutador;
  bola.cooldownChute = 18;
  bola.superChuteAtivo = ehSuper;
  bola.alcanceMax = alcance;
  bola.alcanceRestante = alcance;
  bola.velInicial = velInicial;
  bola.x = constrain(chutador.x + cos(angulo) * (chutador.raio + bola.raio + 6), 25 + bola.raio, mundoLargura - 25 - bola.raio);
  bola.y = constrain(chutador.y + sin(angulo) * (chutador.raio + bola.raio + 6), 52 + bola.raio, mundoAltura - 25 - bola.raio);
  bola.vx = cos(angulo) * velInicial;
  bola.vy = sin(angulo) * velInicial;
}

function calcularTrajetoriaSimulada(origemX, origemY, angulo, alcance, raioObj, ignoraGol) {
  let meioY = mundoAltura / 2;
  let golTop = meioY - 105;
  let golBottom = meioY + 105;

  let simX = constrain(origemX, 25 + raioObj, mundoLargura - 25 - raioObj);
  let simY = constrain(origemY, 52 + raioObj, mundoAltura - 25 - raioObj);
  let dirX = cos(angulo);
  let dirY = sin(angulo);

  let pontos = [{ x: simX, y: simY }];
  let ricochetes = [];
  let passo = 8;
  let restante = alcance;
  let maxIteracoes = 90;

  while (restante > 0 && maxIteracoes > 0) {
    maxIteracoes--;
    let avanco = min(passo, restante);
    let bateuNestePasso = false;

    let nx = simX + dirX * avanco;
    if (circuloColideObstaculo(nx, simY, raioObj)) {
      dirX *= -1;
      bateuNestePasso = true;
    } else if ((nx < 25 + raioObj || nx > mundoLargura - 25 - raioObj) && (ignoraGol || simY < golTop || simY > golBottom)) {
      nx = constrain(nx, 25 + raioObj, mundoLargura - 25 - raioObj);
      dirX *= -1;
      simX = nx;
      bateuNestePasso = true;
    } else {
      simX = nx;
    }

    let ny = simY + dirY * avanco;
    if (circuloColideObstaculo(simX, ny, raioObj)) {
      dirY *= -1;
      bateuNestePasso = true;
    } else if (ny < 52 + raioObj || ny > mundoAltura - 25 - raioObj) {
      ny = constrain(ny, 52 + raioObj, mundoAltura - 25 - raioObj);
      dirY *= -1;
      simY = ny;
      bateuNestePasso = true;
    } else {
      simY = ny;
    }

    if (bateuNestePasso) {
      pontos.push({ x: simX, y: simY });
      ricochetes.push({ x: simX, y: simY });
    }

    if (!ignoraGol && (simX <= 22 || simX >= mundoLargura - 22) && simY > golTop && simY < golBottom) {
      break;
    }

    restante -= avanco;
  }

  pontos.push({ x: simX, y: simY });
  return { pontos: pontos, ricochetes: ricochetes };
}

function calcularTrajetoriaBola(chutador, angulo, alcance) {
  let raioBola = bola ? bola.raio : 15;
  let ox = chutador.x + cos(angulo) * (chutador.raio + raioBola + 6);
  let oy = chutador.y + sin(angulo) * (chutador.raio + raioBola + 6);
  return calcularTrajetoriaSimulada(ox, oy, angulo, alcance, raioBola, false);
}

function criarFaiscasRicochete(bx, by, ehSuper) {
  for (let k = 0; k < (ehSuper ? 8 : 4); k++) {
    particulas.push({
      x: bx,
      y: by,
      vx: random(-3, 3),
      vy: random(-3, 3),
      tam: random(4, 8),
      cor: ehSuper ? color(255, 220, 50, 230) : color(255, 255, 255, 180),
      vida: 12
    });
  }
}

function atualizarBola() {
  if (!bola) return;
  let meioY = mundoAltura / 2;
  let golTop = meioY - 105;
  let golBottom = meioY + 105;

  if (bola.cooldownChute > 0) {
    bola.cooldownChute--;
  }

  if (bola.posse && bola.posse.vida > 0) {
    bola.ultimoTocador = bola.posse;
    bola.superChuteAtivo = false;
    bola.alcanceRestante = 0;
    let alvoX = bola.posse.x + cos(bola.posse.angulo) * 26;
    let alvoY = bola.posse.y + sin(bola.posse.angulo) * 26;

    let velConducao = sqrt(bola.posse.vxAtual * bola.posse.vxAtual + bola.posse.vyAtual * bola.posse.vyAtual);
    bola.rotacao += velConducao * 0.08;

    if (!bolaColideObstaculo(alvoX, alvoY)) {
      bola.x = alvoX;
      bola.y = alvoY;
    } else {
      bola.x = bola.posse.x;
      bola.y = bola.posse.y;
    }

    if (velConducao > 0.5 && frameCount % 2 === 0) {
      bola.rastro.push({ x: bola.x, y: bola.y, vida: 12, super: false });
    }
  } else {
    bola.posse = null;

    if (bola.alcanceRestante > 0) {
      let proporcao = constrain(bola.alcanceRestante / max(1, bola.alcanceMax), 0, 1);
      let velPasso = min(bola.alcanceRestante, max(1.1, bola.velInicial * (proporcao * proporcao * 0.92 + 0.08)));
      let angMov = atan2(bola.vy, bola.vx);
      let vxPasso = cos(angMov) * velPasso;
      let vyPasso = sin(angMov) * velPasso;

      let posAntesX = bola.x;
      let posAntesY = bola.y;

      let subPassos = constrain(ceil(velPasso / 5), 1, 10);
      let dxSub = vxPasso / subPassos;
      let dySub = vyPasso / subPassos;

      for (let s = 0; s < subPassos; s++) {
        let nx = bola.x + dxSub;
        if (bolaColideObstaculo(nx, bola.y)) {
          dxSub *= -1;
          bola.vx *= -1;
          criarFaiscasRicochete(bola.x, bola.y, bola.superChuteAtivo);
        } else if ((nx < 25 + bola.raio || nx > mundoLargura - 25 - bola.raio) && (bola.y < golTop || bola.y > golBottom)) {
          nx = constrain(nx, 25 + bola.raio, mundoLargura - 25 - bola.raio);
          dxSub *= -1;
          bola.vx *= -1;
          bola.x = nx;
          criarFaiscasRicochete(bola.x, bola.y, bola.superChuteAtivo);
        } else {
          bola.x = nx;
        }

        let ny = bola.y + dySub;
        if (bolaColideObstaculo(bola.x, ny)) {
          dySub *= -1;
          bola.vy *= -1;
          criarFaiscasRicochete(bola.x, bola.y, bola.superChuteAtivo);
        } else if (ny < 52 + bola.raio || ny > mundoAltura - 25 - bola.raio) {
          ny = constrain(ny, 52 + bola.raio, mundoAltura - 25 - bola.raio);
          dySub *= -1;
          bola.vy *= -1;
          bola.y = ny;
          criarFaiscasRicochete(bola.x, bola.y, bola.superChuteAtivo);
        } else {
          bola.y = ny;
        }
      }

      let distPercorrida = dist(posAntesX, posAntesY, bola.x, bola.y);
      bola.alcanceRestante = max(0, bola.alcanceRestante - max(distPercorrida, velPasso * 0.5));
      bola.rotacao += distPercorrida * 0.06;

      if (distPercorrida > 0.5) {
        bola.rastro.push({
          x: bola.x,
          y: bola.y,
          vida: bola.superChuteAtivo ? 20 : 12,
          super: bola.superChuteAtivo
        });

        if (bola.superChuteAtivo && frameCount % 2 === 0) {
          particulas.push({
            x: bola.x + random(-6, 6),
            y: bola.y + random(-6, 6),
            vx: -bola.vx * 0.12 + random(-1, 1),
            vy: -bola.vy * 0.12 + random(-1, 1),
            tam: random(5, 10),
            cor: color(255, 210, 40, 230),
            vida: 14
          });
        }
      }

      if (bola.alcanceRestante <= 0) {
        bola.vx = 0;
        bola.vy = 0;
        bola.superChuteAtivo = false;
      }
    } else {
      bola.vx = 0;
      bola.vy = 0;
      bola.superChuteAtivo = false;
    }

    let todos = [jogador, ...aliados, ...inimigos];
    for (let b of todos) {
      if (b === bola.ultimoChutador && bola.cooldownChute > 0) continue;

      if (b.vida > 0 && dist(bola.x, bola.y, b.x, b.y) < b.raio + bola.raio) {
        bola.posse = b;
        bola.ultimoTocador = b;
        bola.ultimoChutador = null;
        bola.superChuteAtivo = false;
        bola.alcanceRestante = 0;
        break;
      }
    }
  }

  for (let i = bola.rastro.length - 1; i >= 0; i--) {
    bola.rastro[i].vida--;
    if (bola.rastro[i].vida <= 0) bola.rastro.splice(i, 1);
  }

  if (bola.x < 25 && bola.y > golTop && bola.y < golBottom) {
    placarVermelho++;
    let autor = (bola.ultimoTocador && bola.ultimoTocador.time === "VERMELHO") ? bola.ultimoTocador : inimigos[0];
    iniciarCelebracaoGol("VERMELHO", 22, bola.y, autor);
  } else if (bola.x > mundoLargura - 25 && bola.y > golTop && bola.y < golBottom) {
    placarAzul++;
    let autor = (bola.ultimoTocador && bola.ultimoTocador.time === "AZUL") ? bola.ultimoTocador : jogador;
    iniciarCelebracaoGol("AZUL", mundoLargura - 22, bola.y, autor);
  }
}

function circuloColideObstaculo(cx, cy, raio) {
  for (let i = 0; i < obstaculos.length; i++) {
    let o = obstaculos[i];
    let maisProxX = constrain(cx, o.x, o.x + o.w);
    let maisProxY = constrain(cy, o.y, o.y + o.h);
    if (dist(cx, cy, maisProxX, maisProxY) < raio) {
      return true;
    }
  }
  return false;
}

function bolaColideObstaculo(bx, by) {
  let raioBola = bola ? bola.raio : 15;
  return circuloColideObstaculo(bx, by, raioBola);
}

function criarTextoDano(x, y, valor, cor, ehCritico = false) {
  textosFlutuantes.push({
    x: x,
    y: y,
    valor: valor,
    cor: ehCritico ? color(255, 130, 15) : cor,
    ehCritico: ehCritico,
    vida: ehCritico ? 38 : 34,
    vidaMax: ehCritico ? 38 : 34
  });
}

// ==========================================
// RENDERIZAÇÃO DO MUNDO E HUD
// ==========================================
function desenharJogo() {
  push();
  translate(-camX, -camY);

  noStroke();
  if (modoSelecionado === "FUTEBRAWL") {
    let larguraFaixa = 80;
    for (let i = 0; i < mundoLargura / larguraFaixa; i++) {
      fill(i % 2 === 0 ? color(38, 145, 62) : color(32, 128, 53));
      rect(i * larguraFaixa, 0, larguraFaixa, mundoAltura);
    }

    let meioY = mundoAltura / 2;

    stroke(255, 255, 255, 130);
    strokeWeight(3);
    noFill();
    rect(25, 52, mundoLargura - 50, mundoAltura - 77);
    line(mundoLargura / 2, 52, mundoLargura / 2, mundoAltura - 25);
    ellipse(mundoLargura / 2, meioY, 160, 160);
    fill(255, 255, 255, 160);
    ellipse(mundoLargura / 2, meioY, 10, 10);

    noFill();
    rect(25, meioY - 165, 145, 330);
    rect(mundoLargura - 170, meioY - 165, 145, 330);
    rect(25, meioY - 110, 60, 220);
    rect(mundoLargura - 85, meioY - 110, 60, 220);

    fill(0, 160, 255, 140);
    stroke(150, 230, 255);
    rect(0, meioY - 105, 25, 210, 4);

    fill(255, 60, 60, 140);
    stroke(255, 180, 180);
    rect(mundoLargura - 25, meioY - 105, 25, 210, 4);
  } else {
    fill(35, 125, 52);
    for (let gx = 40; gx < mundoLargura; gx += 80) {
      for (let gy = 60; gy < mundoAltura; gy += 80) {
        rect(gx, gy, 40, 40, 8);
      }
    }
    stroke(255, 255, 255, 90);
    strokeWeight(4);
    noFill();
    rect(20, 50, mundoLargura - 40, mundoAltura - 70);
  }

  for (let rc of rachadurasChao) {
    let opacidade = map(rc.vida, 0, rc.vidaMax, 0, 220);
    push();
    translate(rc.x, rc.y);
    rotate(rc.angulo);

    stroke(35, 25, 15, opacidade);
    strokeWeight(4);
    noFill();
    beginShape();
    vertex(0, 0);
    vertex(rc.comprimento * 0.3, -6);
    vertex(rc.comprimento * 0.6, 5);
    vertex(rc.comprimento, -2);
    endShape();

    stroke(rc.furiaAlta ? color(255, 100, 50, opacidade) : color(120, 235, 255, opacidade * 0.85));
    strokeWeight(2);
    line(rc.comprimento * 0.25, -4, rc.comprimento * 0.45, -14);
    line(rc.comprimento * 0.55, 4, rc.comprimento * 0.75, 15);
    line(rc.comprimento * 0.8, -1, rc.comprimento * 0.95, -10);
    pop();
  }

  for (let ptTerra of pocasTerra) {
    ptTerra.desenhar();
  }

  for (let pc of pocas) {
    pc.desenhar();
  }

  for (let ef of efeitosSpawnRatos) {
    desenharEfeitoSpawnRatos(ef);
  }

  if (!celebracaoGol.ativo && jogador && jogador.vida > 0) {
    desenharMiraBrawl(jogador);
  }

  for (let o of obstaculos) {
    o.desenhar();
  }

  if (modoSelecionado === "COMBATE") {
    noFill();
    stroke(50, 255, 50, 180);
    strokeWeight(16);
    ellipse(mundoLargura / 2, mundoAltura / 2, venenoRaio * 2);
  }

  for (let oc of ondasCirculares) {
    oc.desenhar();
  }

  if (modoSelecionado === "FUTEBRAWL" && bola) {
    desenharBolaAnimada();
  }

  let todos = [jogador, ...aliados, ...inimigos];
  for (let b of todos) {
    if (b.vida > 0) {
      b.desenhar();
    } else if (modoSelecionado === "FUTEBRAWL" && b.respawnTimer > 0) {
      b.desenharRespawn();
    }
  }

  for (let p of projeteis) p.desenhar();
  for (let gf of garrafas) gf.desenhar();
  for (let gl of gaiolasAsh) gl.desenhar();

  noStroke();
  for (let pt of particulas) {
    fill(pt.cor);
    ellipse(pt.x, pt.y, pt.tam);
  }

  for (let c of confetesGol) {
    push();
    translate(c.x, c.y);
    rotate(c.rot);
    noStroke();
    fill(c.cor);
    rect(-c.w / 2, -c.h / 2, c.w, c.h, 1);
    pop();
  }

  textStyle(BOLD);
  for (let tf of textosFlutuantes) {
    let progresso = 1 - tf.vida / tf.vidaMax;
    let tamBase = tf.ehCritico ? 24 : 19;
    let escalaPop = progresso < 0.2 ? map(progresso, 0, 0.2, 1.25, 1.0) : 1.0;
    textSize(tamBase * escalaPop);

    stroke(15, 15, 20, 230);
    strokeWeight(tf.ehCritico ? 4.5 : 3.5);
    fill(tf.cor);
    text(tf.valor, tf.x, tf.y);
  }
  noStroke();

  pop();

  if (celebracaoGol.ativo) {
    desenharBannerGol();
  }

  desenharHUD();
}

function desenharEfeitoSpawnRatos(ef) {
  let progresso = 1 - ef.vida / ef.vidaMax;
  let opacidade = map(ef.vida, 0, ef.vidaMax, 0, 230);
  let ehAzul = ef.time === "AZUL";

  push();
  translate(ef.x, ef.y);

  noStroke();
  for (let p of ef.nuvens) {
    let distNuvem = p.dist * map(progresso, 0, 1, 0.65, 1.12);
    let nx = cos(p.ang) * distNuvem;
    let ny = sin(p.ang) * distNuvem;
    fill(235, 165, 65, opacidade * 0.55);
    ellipse(nx, ny, p.tam * (1 - progresso * 0.25));
  }

  for (let pt of ef.pontosRatos) {
    let px = pt.x - ef.x;
    let py = pt.y - ef.y;

    stroke(ehAzul ? color(75, 210, 255, opacidade * 0.55) : color(255, 95, 75, opacidade * 0.55));
    strokeWeight(9);
    line(0, 0, px, py);

    stroke(ehAzul ? color(210, 248, 255, opacidade) : color(255, 225, 190, opacidade));
    strokeWeight(3.5);
    line(0, 0, px, py);

    fill(ehAzul ? color(70, 200, 255, opacidade * 0.35) : color(255, 85, 70, opacidade * 0.35));
    stroke(ehAzul ? color(120, 235, 255, opacidade * 0.9) : color(255, 130, 110, opacidade * 0.9));
    strokeWeight(2.5);
    ellipse(px, py, 36 + progresso * 8, 36 + progresso * 8);
  }

  noStroke();
  fill(ehAzul ? color(180, 245, 255, opacidade) : color(255, 210, 170, opacidade));
  ellipse(0, 0, 28 * (1 - progresso * 0.5));
  pop();
}

function desenharBannerGol() {
  let progresso = 1 - celebracaoGol.timer / 120;
  let escala = progresso < 0.14 ? map(progresso, 0, 0.14, 0.4, 1.08) : 1.0;

  push();
  translate(width / 2, height * 0.28);
  scale(escala);

  noStroke();
  fill(10, 15, 28, 210);
  rect(-260, -42, 520, 84, 18);

  strokeWeight(4);
  stroke(celebracaoGol.timeGol === "AZUL" ? color(0, 200, 255) : color(255, 80, 80));
  noFill();
  rect(-260, -42, 520, 84, 18);

  textStyle(BOLD);
  textSize(34);
  stroke(12, 16, 26, 240);
  strokeWeight(5);
  fill(255, 220, 40);
  text("GOL DE " + celebracaoGol.autor + "!", 0, 2);
  noStroke();
  pop();
}

function desenharBolaAnimada() {
  if (!bola) return;
  noStroke();
  for (let r of bola.rastro) {
    let op = map(r.vida, 0, r.super ? 20 : 12, 0, r.super ? 170 : 90);
    let tam = map(r.vida, 0, r.super ? 20 : 12, 6, bola.raio * 1.9);
    fill(r.super ? color(255, 200, 30, op) : color(255, 255, 255, op));
    ellipse(r.x, r.y, tam);
  }

  if (bola.superChuteAtivo) {
    noStroke();
    fill(255, 190, 20, 120 + sin(frameCount * 0.5) * 40);
    ellipse(bola.x, bola.y, bola.raio * 3.1);
  }

  noStroke();
  fill(0, 0, 0, 85);
  ellipse(bola.x - 2, bola.y + 6, bola.raio * 2.1, bola.raio * 1.6);

  push();
  translate(bola.x, bola.y);
  rotate(bola.rotacao);

  fill(bola.superChuteAtivo ? color(255, 250, 210) : color(255));
  stroke(25);
  strokeWeight(2);
  ellipse(0, 0, bola.raio * 2);

  fill(bola.superChuteAtivo ? color(220, 100, 15) : color(35, 45, 65));
  noStroke();
  beginShape();
  for (let i = 0; i < 5; i++) {
    let a = (TWO_PI / 5) * i;
    vertex(cos(a) * 6.5, sin(a) * 6.5);
  }
  endShape(CLOSE);

  for (let i = 0; i < 5; i++) {
    let a = (TWO_PI / 5) * i;
    ellipse(cos(a) * 12.5, sin(a) * 12.5, 5.5, 5.5);
  }

  fill(255, 255, 255, 170);
  ellipse(-4, -5, 6, 4);
  pop();
}

// ==========================================
// MIRA COM TROCA VIA SCROLL DO MOUSE (ATAQUE <-> SUPER)
// ==========================================
function desenharMiraBrawl(b) {
  let superPronta = b.superCarga >= 100;

  if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === b) {
    if (modoMira === "ATAQUE") {
      let trajNormal = calcularTrajetoriaBola(b, b.angulo, 230);

      noFill();
      stroke(255, 255, 255, 70);
      strokeWeight(24);
      beginShape();
      for (let pt of trajNormal.pontos) vertex(pt.x, pt.y);
      endShape();

      stroke(255, 255, 255, 215);
      strokeWeight(2.5);
      beginShape();
      for (let pt of trajNormal.pontos) vertex(pt.x, pt.y);
      endShape();

      for (let rc of trajNormal.ricochetes) {
        fill(255, 255, 255, 225);
        noStroke();
        ellipse(rc.x, rc.y, 10, 10);
      }

      let ultimoNormal = trajNormal.pontos[trajNormal.pontos.length - 1];
      fill(255, 255, 255, 190);
      noStroke();
      ellipse(ultimoNormal.x, ultimoNormal.y, 14, 14);
    } else {
      let trajSuper = calcularTrajetoriaBola(b, b.angulo, 410);
      let corFaixa = superPronta ? color(255, 215, 0, 75) : color(95, 100, 110, 50);
      let corLinha = superPronta ? color(255, 225, 60, 235) : color(145, 150, 160, 110);

      noFill();
      stroke(corFaixa);
      strokeWeight(28);
      beginShape();
      for (let pt of trajSuper.pontos) vertex(pt.x, pt.y);
      endShape();

      stroke(corLinha);
      strokeWeight(3.5);
      beginShape();
      for (let pt of trajSuper.pontos) vertex(pt.x, pt.y);
      endShape();

      for (let rc of trajSuper.ricochetes) {
        fill(corLinha);
        stroke(30, 30, 35, superPronta ? 220 : 100);
        strokeWeight(1.5);
        ellipse(rc.x, rc.y, 13, 13);
      }

      let ultimoSuper = trajSuper.pontos[trajSuper.pontos.length - 1];
      fill(corLinha);
      stroke(30, 30, 35, superPronta ? 220 : 100);
      strokeWeight(1.5);
      ellipse(ultimoSuper.x, ultimoSuper.y, 17, 17);
    }
    return;
  }

  if (modoMira === "ATAQUE") {
    push();
    translate(b.x, b.y);

    let temMunicao = b.municao >= 1 && b.cooldownAtaque <= 0;
    let corPreenchimento = temMunicao ? color(230, 235, 240, 65) : color(80, 85, 95, 55);
    let corBorda = temMunicao ? color(255, 255, 255, 140) : color(140, 145, 155, 100);

    if (b.tipo === "ASH") {
      rotate(b.angulo);
      fill(corPreenchimento);
      stroke(corBorda);
      strokeWeight(2);
      beginShape();
      vertex(20, -16);
      vertex(145, -24);
      vertex(145, 24);
      vertex(20, 16);
      endShape(CLOSE);
    } else if (b.tipo === "TRUNK") {
      fill(corPreenchimento);
      stroke(corBorda);
      strokeWeight(2);
      ellipse(0, 0, 115 * 2);

      noFill();
      stroke(255, 255, 255, temMunicao ? 95 : 45);
      strokeWeight(1.5);
      ellipse(0, 0, (115 * 0.72) * 2);
    } else if (b.tipo === "COLT") {
      rotate(b.angulo);
      fill(corPreenchimento);
      stroke(corBorda);
      strokeWeight(2);
      rect(22, -11, 345, 22, 4);
    } else if (b.tipo === "BARLEY") {
      noFill();
      stroke(255, 255, 255, 50);
      strokeWeight(1.5);
      ellipse(0, 0, 275 * 2);

      let alvo = b.calcularAlvoBarley();
      let dx = alvo.x - b.x;
      let dy = alvo.y - b.y;

      stroke(corBorda);
      strokeWeight(2);
      line(0, 0, dx, dy);

      fill(temMunicao ? color(100, 255, 120, 65) : color(120, 120, 120, 45));
      stroke(temMunicao ? color(130, 255, 150, 170) : color(150, 150, 150, 100));
      ellipse(dx, dy, 58 * 2);
    }
    pop();
    return;
  }

  let corSuperPreenchimento = superPronta ? color(255, 215, 0, 68) : color(80, 85, 95, 52);
  let corSuperBorda = superPronta ? color(255, 230, 75, 195) : color(140, 145, 155, 100);

  if (b.tipo === "ASH") {
    let alcanceGaiola = 115;
    if (b.ehJogador && !ehMobile) {
      let dMouse = dist(b.x, b.y, mouseX + camX, mouseY + camY);
      alcanceGaiola = constrain(dMouse, 40, 115);
    }
    let destX = b.x + cos(b.angulo) * alcanceGaiola;
    let destY = b.y + sin(b.angulo) * alcanceGaiola;

    noFill();
    stroke(superPronta ? color(255, 220, 60, 75) : color(130, 135, 145, 45));
    strokeWeight(1.5);
    ellipse(b.x, b.y, 115 * 2);

    stroke(corSuperBorda);
    strokeWeight(2.5);
    line(b.x, b.y, destX, destY);

    fill(corSuperPreenchimento);
    stroke(corSuperBorda);
    strokeWeight(2);
    ellipse(destX, destY, 108, 108);
  } else if (b.tipo === "TRUNK") {
    let trajTrunk = calcularTrajetoriaSimulada(b.x, b.y, b.angulo, 378, b.raio, true);

    noFill();
    stroke(superPronta ? color(255, 215, 0, 65) : color(80, 85, 95, 48));
    strokeWeight(b.raio * 2);
    beginShape();
    for (let pt of trajTrunk.pontos) vertex(pt.x, pt.y);
    endShape();

    stroke(corSuperBorda);
    strokeWeight(2.5);
    beginShape();
    for (let pt of trajTrunk.pontos) vertex(pt.x, pt.y);
    endShape();

    for (let rc of trajTrunk.ricochetes) {
      fill(corSuperBorda);
      noStroke();
      ellipse(rc.x, rc.y, 11, 11);
    }

    let fimTrunk = trajTrunk.pontos[trajTrunk.pontos.length - 1];
    fill(corSuperPreenchimento);
    stroke(corSuperBorda);
    strokeWeight(2);
    ellipse(fimTrunk.x, fimTrunk.y, b.raio * 2);
  } else if (b.tipo === "COLT") {
    push();
    translate(b.x, b.y);
    rotate(b.angulo);
    fill(corSuperPreenchimento);
    stroke(corSuperBorda);
    strokeWeight(2.5);
    rect(22, -16, 434, 32, 6);
    pop();
  } else if (b.tipo === "BARLEY") {
    noFill();
    stroke(superPronta ? color(255, 220, 60, 75) : color(130, 135, 145, 45));
    strokeWeight(1.5);
    ellipse(b.x, b.y, 275 * 2);

    let centro = b.calcularAlvoBarley();
    let dirX = cos(b.angulo);
    let dirY = sin(b.angulo);
    let perpX = -sin(b.angulo);
    let perpY = cos(b.angulo);

    let distCentro = dist(b.x, b.y, centro.x, centro.y);
    let tAlcance = constrain((distCentro - 45) / (275 - 45), 0, 1);
    let fatorEspacamento = lerp(1.0, 1.32, pow(tAlcance, 1.15));

    let posicoes = [
      { frente: 50 * fatorEspacamento, lado: -48 * fatorEspacamento },
      { frente: 50 * fatorEspacamento, lado: 48 * fatorEspacamento },
      { frente: 0, lado: 0 },
      { frente: -50 * fatorEspacamento, lado: -48 * fatorEspacamento },
      { frente: -50 * fatorEspacamento, lado: 48 * fatorEspacamento }
    ];

    stroke(corSuperBorda);
    strokeWeight(2);
    line(b.x, b.y, centro.x, centro.y);

    for (let pos of posicoes) {
      let destX = constrain(centro.x + dirX * pos.frente + perpX * pos.lado, 35, mundoLargura - 35);
      let destY = constrain(centro.y + dirY * pos.frente + perpY * pos.lado, 60, mundoAltura - 35);
      fill(corSuperPreenchimento);
      stroke(corSuperBorda);
      strokeWeight(1.8);
      ellipse(destX, destY, 78 * 2);
    }
  }
}

// ==========================================
// ÍCONE DA FÚRIA DO ASH (3 ETAPAS VISUAIS)
// Etapa 1: nada | Etapa 2: metade da barra | Etapa 3: barra cheia
// ==========================================
function desenharIconeFuriaAsh(cx, cy, furia, escala = 1.0) {
  let etapa = furia > 66 ? 3 : (furia > 33 ? 2 : 1);

  push();
  translate(cx, cy);
  scale(escala);

  // Fundo escuro da caixa do ícone
  noStroke();
  fill(32, 36, 46);
  rect(-7.5, -7.5, 15, 15, 3);

  // Preenchimento de acordo com a etapa:
  // Etapa 1 = nada | Etapa 2 = metade inferior | Etapa 3 = caixa cheia
  if (etapa === 2) {
    fill(255, 185, 25);
    rect(-7.5, 0, 15, 7.5, 0, 0, 3, 3);
  } else if (etapa === 3) {
    fill(245, 50, 45);
    rect(-7.5, -7.5, 15, 15, 3);
  }

  // Contorno da caixa
  noFill();
  stroke(12, 16, 24);
  strokeWeight(1.8);
  rect(-7.5, -7.5, 15, 15, 3);

  // Coroa da fúria
  noStroke();
  if (etapa === 1) {
    fill(105, 112, 126);
  } else if (etapa === 2) {
    fill(255, 245, 195);
  } else {
    fill(255, 235, 75);
  }

  beginShape();
  vertex(-4.5, 3.5);
  vertex(-5.2, -3.5);
  vertex(-2.2, -0.8);
  vertex(0, -4.5);
  vertex(2.2, -0.8);
  vertex(5.2, -3.5);
  vertex(4.5, 3.5);
  endShape(CLOSE);

  fill(etapa === 3 ? color(175, 20, 20) : color(32, 36, 46));
  rect(-2.8, 0.5, 1.8, 2.2, 0.5);
  rect(1.0, 0.5, 1.8, 2.2, 0.5);

  pop();
}

function desenharSpriteAsh(x, y, angulo, escala, swingVassoura, furia = 0) {
  push();
  translate(x, y);
  scale(escala);
  rotate(angulo);

  // Aura vermelha de fúria (Etapa 2 e Etapa 3)
  if (furia > 66) {
    noStroke();
    fill(255, 45, 35, 95 + sin(frameCount * 0.35) * 25);
    ellipse(0, 0, 58 + sin(frameCount * 0.3) * 5);
  } else if (furia > 33) {
    noStroke();
    fill(255, 85, 45, 58 + sin(frameCount * 0.25) * 15);
    ellipse(0, 0, 50);
  }

  noStroke();
  fill(0, 0, 0, 70);
  ellipse(-3, 4, 42, 42);

  fill(60, 65, 75);
  stroke(25);
  strokeWeight(2);
  ellipse(6, -19, 12, 10);
  ellipse(6, 19, 12, 10);

  push();
  translate(8, 19);
  rotate(swingVassoura);
  fill(160, 100, 45);
  rect(-8, -3, 36, 6, 2);
  fill(180, 190, 200);
  rect(22, -5, 5, 10);
  fill(235, 195, 70);
  beginShape();
  vertex(27, -7);
  vertex(42, -10);
  vertex(40, 10);
  vertex(27, 7);
  endShape(CLOSE);
  pop();

  // Armadura esquentando para vermelho conforme a fúria sobe
  let nivelCor = furia / 100;
  let rArmadura = lerp(125, 232, nivelCor);
  let gArmadura = lerp(138, 52, nivelCor);
  let bArmadura = lerp(152, 45, nivelCor);
  fill(rArmadura, gArmadura, bArmadura);
  stroke(30, 35, 45);
  strokeWeight(2.5);
  rect(-17, -17, 34, 34, 7);

  fill(max(30, rArmadura - 25), max(25, gArmadura - 25), max(25, bArmadura - 25));
  noStroke();
  rect(-13, -13, 26, 26, 4);
  fill(200, 210, 220);
  ellipse(-12, -12, 3.5);
  ellipse(-12, 12, 3.5);
  ellipse(12, -12, 3.5);
  ellipse(12, 12, 3.5);

  fill(lerp(150, 215, nivelCor), lerp(162, 75, nivelCor), lerp(175, 65, nivelCor));
  stroke(30, 35, 45);
  strokeWeight(2);
  arc(2, 0, 28, 30, -HALF_PI, HALF_PI);

  fill(25, 30, 40);
  noStroke();
  rect(5, -10, 8, 20, 2);
  fill(furia > 66 ? color(255, 65, 45) : color(255, 220, 50));
  rect(7, -7, 4, 5, 1);
  rect(7, 2, 4, 5, 1);

  noFill();
  stroke(40);
  strokeWeight(3);
  line(-4, -5, -4, 5);

  pop();
}

function desenharSpriteTrunk(x, y, angulo, escala, emDash, giroAnim = 0, naTerra = false, preparando = false) {
  push();
  translate(x, y);
  scale(escala);
  rotate(angulo);

  if (naTerra) {
    noStroke();
    fill(175, 75, 235, 65 + sin(frameCount * 0.25) * 20);
    ellipse(0, 0, 50);
  }

  noStroke();
  fill(0, 0, 0, 75);
  ellipse(-3, 5, 44, 44);

  fill(120, 45, 165);
  stroke(45, 15, 65);
  strokeWeight(2);
  ellipse(2, 22, 11, 13);
  fill(225, 45, 135);
  ellipse(5, 23, 9, 10);

  let alcanceCorda = giroAnim > 0 ? map(sin((giroAnim / TWO_PI) * PI), 0, 1, 22, 92) : (preparando ? 17 : 22);
  let anguloCorda = giroAnim > 0 ? -HALF_PI : (preparando ? -1.45 : -1.15);

  let maoX = cos(anguloCorda) * alcanceCorda;
  let maoY = sin(anguloCorda) * alcanceCorda;

  stroke(215, 175, 110);
  strokeWeight(4.5);
  line(0, -14, maoX, maoY);
  stroke(95, 65, 30);
  strokeWeight(1.5);
  line(0, -14, maoX, maoY);

  push();
  translate(maoX, maoY);
  rotate(anguloCorda);
  fill(230, 40, 135);
  stroke(75, 15, 45);
  strokeWeight(2);
  rect(-7, -7, 15, 14, 5);
  fill(200, 30, 115);
  rect(-8, -8, 5, 16, 2);
  fill(235, 55, 145);
  ellipse(2, 8, 7, 5);
  pop();

  if (naTerra) {
    fill(152, 82, 115);
    stroke(68, 28, 65);
  } else {
    fill(145, 88, 46);
    stroke(55, 30, 12);
  }
  strokeWeight(2.5);
  ellipse(0, 0, 38, 38);

  noFill();
  stroke(naTerra ? color(182, 112, 145) : color(175, 115, 68));
  strokeWeight(2);
  ellipse(0, 0, 28, 28);

  noFill();
  stroke(135, 185, 65);
  strokeWeight(4);
  arc(0, 0, 37, 37, -1.3, 1.3);
  stroke(75, 115, 30);
  strokeWeight(1.5);
  arc(0, 0, 39, 39, -1.3, 1.3);

  fill(85, 185, 55);
  stroke(35, 95, 25);
  strokeWeight(1.8);
  ellipse(-9, -10, 18, 13);
  ellipse(-9, 10, 18, 13);
  fill(115, 210, 75);
  ellipse(-12, 0, 20, 15);
  ellipse(12, 0, 11, 13);

  fill(22, 18, 18);
  noStroke();
  rect(5, -10, 9, 20, 4);
  if (emDash) {
    fill(255, 120, 0);
  } else if (naTerra) {
    fill(235, 160, 255);
  } else {
    fill(255, 225, 40);
  }
  ellipse(10, -5, 5, 4);
  ellipse(10, 5, 5, 4);

  pop();
}

function desenharSpriteColt(x, y, angulo, escala, recuoArma = 0) {
  push();
  translate(x, y);
  scale(escala);
  rotate(angulo);

  noStroke();
  fill(0, 0, 0, 70);
  ellipse(-3, 4, 40, 40);

  let recuo = recuoArma * 4;
  fill(245, 205, 175);
  stroke(35, 25, 20);
  strokeWeight(2);
  rect(2 - recuo, -19, 14, 8, 3);
  rect(2 - recuo, 11, 14, 8, 3);

  fill(195, 205, 220);
  rect(14 - recuo, -18, 15, 6, 2);
  rect(14 - recuo, 12, 15, 6, 2);
  fill(90, 60, 35);
  rect(12 - recuo, -17, 5, 4);
  rect(12 - recuo, 13, 5, 4);

  fill(35, 110, 210);
  stroke(20, 40, 85);
  strokeWeight(2.5);
  ellipse(0, 0, 34, 38);

  fill(220, 50, 55);
  noStroke();
  ellipse(2, 0, 22, 24);

  fill(250, 210, 180);
  stroke(40, 25, 20);
  strokeWeight(2);
  ellipse(2, 0, 24, 24);

  fill(225, 35, 45);
  stroke(90, 15, 20);
  strokeWeight(2);
  beginShape();
  vertex(-12, -10);
  vertex(6, -12);
  vertex(14, -4);
  vertex(10, 0);
  vertex(14, 4);
  vertex(6, 12);
  vertex(-12, 10);
  vertex(-16, 0);
  endShape(CLOSE);

  pop();
}

function desenharSpriteBarley(x, y, angulo, escala, swingGarrafa = 0, time = "AZUL") {
  push();
  translate(x, y);
  scale(escala);
  rotate(angulo);

  noStroke();
  fill(0, 0, 0, 70);
  ellipse(-3, 4, 40, 40);

  fill(150, 160, 170);
  stroke(35, 40, 45);
  strokeWeight(2);
  ellipse(6, -18, 12, 9);

  push();
  translate(6, 18);
  rotate(swingGarrafa);
  ellipse(0, 0, 12, 9);
  if (time === "AZUL") {
    fill(60, 185, 245);
    stroke(20, 75, 135);
  } else {
    fill(235, 65, 65);
    stroke(120, 20, 20);
  }
  ellipse(10, 0, 13, 9);
  fill(220, 180, 110);
  rect(15, -2, 5, 4);
  pop();

  fill(time === "AZUL" ? color(45, 95, 175) : color(175, 45, 55));
  stroke(25, 35, 55);
  strokeWeight(2.5);
  ellipse(0, 0, 34, 36);

  fill(185, 195, 205);
  stroke(40, 45, 55);
  strokeWeight(2);
  ellipse(2, 0, 24, 24);

  fill(255, 235, 80);
  noStroke();
  ellipse(10, 0, 8, 9);

  fill(35, 38, 45);
  stroke(15);
  strokeWeight(2);
  ellipse(-1, 0, 22, 22);
  fill(210, 50, 50);
  noStroke();
  ellipse(-1, 0, 16, 16);
  fill(35, 38, 45);
  ellipse(-1, 0, 13, 13);

  pop();
}

function desenharHUD() {
  noStroke();
  fill(15, 20, 35, 220);
  rect(0, 0, width, 45);

  fill(255);
  textSize(16);
  textStyle(BOLD);
  if (modoSelecionado === "COMBATE") {
    text("BRAWLERS RESTANTES: " + (inimigos.length + 1) + " / 10", width / 2, 22);
  } else {
    fill(100, 200, 255);
    text("TIME AZUL: " + placarAzul, width / 2 - 100, 22);
    fill(255, 100, 100);
    text("TIME VERMELHO: " + placarVermelho, width / 2 + 100, 22);
  }

  if (!celebracaoGol.ativo && jogador && jogador.vida <= 0 && modoSelecionado === "FUTEBRAWL") {
    fill(15, 20, 35, 210);
    rect(width / 2 - 160, height / 2 - 35, 320, 70, 14);
    fill(255, 215, 0);
    textSize(20);
    let seg = ceil(jogador.respawnTimer / 60);
    text("RESSURGINDO EM " + seg + "s...", width / 2, height / 2);
  }

  if (jogador && jogador.vida > 0 && !ehMobile) {
    fill(15, 20, 35, 220);
    rect(15, height - 58, 220, 44, 10);
    fill(255);
    textSize(11);
    textAlign(LEFT, CENTER);
    let acertosTexto = "8 acertos";
    if (jogador.tipo === "ASH") acertosTexto = "7 acertos";
    else if (jogador.tipo === "COLT") acertosTexto = "12 balas";
    else if (jogador.tipo === "BARLEY") acertosTexto = "6 acertos";

    let comBola = modoSelecionado === "FUTEBRAWL" && bola && bola.posse === jogador;
    let labelSuper = "SUPER (" + acertosTexto + "):";
    if (jogador.superCarga >= 100) {
      labelSuper = comBola
        ? "SUPER CHUTE (DIR / ESPAÇO)!"
        : "SUPER PRONTA (DIR / ESPAÇO)!";
    }
    text(labelSuper, 25, height - 45);

    fill(50);
    rect(25, height - 33, 200, 10, 5);
    fill(jogador.superCarga >= 100 ? color(255, 215, 0) : color(255, 140, 0));
    rect(25, height - 33, map(jogador.superCarga, 0, 100, 0, 200), 10, 5);

    if (jogador.tipo === "ASH") {
      let etapaAtual = jogador.obterEtapaFuria();
      fill(15, 20, 35, 220);
      rect(245, height - 58, 225, 44, 10);
      fill(etapaAtual === 3 ? color(255, 95, 80) : color(255, 220, 55));
      text("FÚRIA: " + Math.round(jogador.furia) + "/100 • ETAPA " + etapaAtual + " (DANO: " + jogador.calcularDanoAtual() + ")", 255, height - 45);

      fill(50);
      rect(255, height - 33, 204, 10, 5);
      fill(etapaAtual === 3 ? color(245, 55, 45) : color(255, 210, 40));
      rect(255, height - 33, map(jogador.furia, 0, 100, 0, 204), 10, 5);

      stroke(15, 20, 35);
      strokeWeight(2);
      line(255 + 204 * 0.33, height - 33, 255 + 204 * 0.33, height - 23);
      line(255 + 204 * 0.66, height - 33, 255 + 204 * 0.66, height - 23);
      noStroke();
    }

    let badgeMiraX = jogador.tipo === "ASH" ? 480 : 245;
    fill(15, 20, 35, 220);
    rect(badgeMiraX, height - 58, 125, 44, 10);
    fill(modoMira === "SUPER" ? color(255, 215, 0) : color(220, 235, 255));
    textSize(10);
    text("MIRA (SCROLL):", badgeMiraX + 10, height - 45);
    textSize(12);
    text(modoMira === "SUPER" ? "SUPER" : "ATAQUE", badgeMiraX + 10, height - 29);

    textAlign(CENTER, CENTER);
  }

  if (!ehMobile) {
    fill(255, 230, 100);
    textSize(11);
    textAlign(RIGHT, CENTER);
    text("WASD: Mover | Esq: Atacar | Dir/Espaço: Super | Scroll: Mira", width - 15, height - 22);
    textAlign(CENTER, CENTER);
  }

  desenharControlesMobile();
}

function desenharFim() {
  background(20, 25, 40, 235);
  fill(255, 215, 0);
  textSize(36);
  text(vencedor, width / 2, height / 2 - 30);
  fill(255);
  textSize(18);
  text("Toque na tela para voltar ao lobby", width / 2, height / 2 + 30);
}

// ==========================================
// CLASSES DO JOGO
// ==========================================
class Brawler {
  constructor(x, y, tipo, time, ehJogador, nomeExibicao = "") {
    this.x = x;
    this.y = y;
    this.tipo = tipo;
    this.time = time;
    this.ehJogador = ehJogador;
    this.nomeExibicao = nomeExibicao;
    this.raio = 22;
    this.angulo = 0;
    this.municao = 3;
    this.recarga = 0;
    this.cooldownAtaque = 0;
    this.superCarga = 0;
    this.respawnTimer = 0;
    this.animAtaque = 0;
    this.giroTrunk = 0;
    this.delayAtaqueTrunk = 0;

    this.vxAtual = 0;
    this.vyAtual = 0;
    this.filaDisparosColt = [];

    this.furia = 0;
    this.tempoSemFuria = 0;

    this.tempoSemDano = 0;
    this.timerCura = 0;

    this.dashTimer = 0;
    this.dashAngulo = 0;
    this.contatoSuperTrunk = false;

    this.desvioTimer = 0;
    this.anguloDesvio = 0;
    this.ladoContornoBot = random() > 0.5 ? 1 : -1;
    this.framesPreso = 0;
    this.pontoPatrulhaX = x;
    this.pontoPatrulhaY = y;
    this.timerPatrulha = 0;
    this.delayReacao = Math.floor(random(22, 48));
    this.delaySuperBot = Math.floor(random(20, 45));
    this.zonaPreferidaY = y;
    this.tempoComBola = 0;

    if (this.tipo === "ASH") {
      this.vidaMax = 4500;
      this.velocidade = 2.95;
      this.danoBase = 750;
    } else if (this.tipo === "TRUNK") {
      this.vidaMax = 4000;
      this.velocidade = 3.1;
      this.danoBase = 650;
    } else if (this.tipo === "COLT") {
      this.vidaMax = 2800;
      this.velocidade = 3.2;
      this.danoBase = 320;
    } else if (this.tipo === "BARLEY") {
      this.vidaMax = 2600;
      this.velocidade = 2.95;
      this.danoBase = 680;
    }
    this.vida = this.vidaMax;
  }

  estaNaTerraTrunk() {
    if (this.tipo !== "TRUNK") return false;
    for (let pt of pocasTerra) {
      if (pt.time === this.time && dist(this.x, this.y, pt.x, pt.y) <= pt.raio + this.raio * 0.4) {
        return true;
      }
    }
    return false;
  }

  obterEtapaFuria() {
    if (this.furia > 66) return 3;
    if (this.furia > 33) return 2;
    return 1;
  }

  calcularVelocidadeAtual() {
    if (this.tipo === "ASH") {
      let etapa = this.obterEtapaFuria();
      if (etapa === 3) return this.velocidade * 1.22;
      if (etapa === 2) return this.velocidade * 1.11;
      return this.velocidade;
    }
    if (this.tipo === "TRUNK") {
      return this.estaNaTerraTrunk() ? this.velocidade * 1.2 : this.velocidade;
    }
    return this.velocidade;
  }

  calcularDanoAtual() {
    if (this.tipo === "ASH") {
      let etapa = this.obterEtapaFuria();
      if (etapa === 3) return this.danoBase * 2;
      if (etapa === 2) return Math.round(this.danoBase * 1.5);
      return this.danoBase;
    }
    if (this.tipo === "TRUNK") {
      return this.estaNaTerraTrunk() ? Math.round(this.danoBase * 1.3) : this.danoBase;
    }
    return this.danoBase;
  }

  calcularAlvoBarley() {
    let alcanceMax = 275;
    if (this.ehJogador && !ehMobile) {
      let mx = mouseX + camX;
      let my = mouseY + camY;
      let d = dist(this.x, this.y, mx, my);
      let distClamped = constrain(d, 45, alcanceMax);
      return {
        x: constrain(this.x + cos(this.angulo) * distClamped, 35, mundoLargura - 35),
        y: constrain(this.y + sin(this.angulo) * distClamped, 60, mundoAltura - 35)
      };
    } else if (this.ehJogador && ehMobile) {
      let forcaJoy = 0.75;
      if (joyDir.ativo) {
        forcaJoy = constrain(sqrt(joyDir.dx * joyDir.dx + joyDir.dy * joyDir.dy), 0.2, 1);
      } else if (joySuper.ativo) {
        forcaJoy = constrain(sqrt(joySuper.dx * joySuper.dx + joySuper.dy * joySuper.dy), 0.2, 1);
      }
      let distMobile = lerp(65, alcanceMax, forcaJoy);
      return {
        x: constrain(this.x + cos(this.angulo) * distMobile, 35, mundoLargura - 35),
        y: constrain(this.y + sin(this.angulo) * distMobile, 60, mundoAltura - 35)
      };
    } else {
      return {
        x: constrain(this.x + cos(this.angulo) * 200, 35, mundoLargura - 35),
        y: constrain(this.y + sin(this.angulo) * 200, 60, mundoAltura - 35)
      };
    }
  }

  calcularAlvoPreditivoBarley(alvo) {
    let alcanceMax = 275;
    let tempoVoo = 26;
    let predX = alvo.x + (alvo.vxAtual || 0) * (tempoVoo * 0.85);
    let predY = alvo.y + (alvo.vyAtual || 0) * (tempoVoo * 0.85);

    let d = dist(this.x, this.y, predX, predY);
    let ang = atan2(predY - this.y, predX - this.x);
    let distFinal = constrain(d, 45, alcanceMax);

    return {
      x: constrain(this.x + cos(ang) * distFinal, 35, mundoLargura - 35),
      y: constrain(this.y + sin(ang) * distFinal, 60, mundoAltura - 35),
      angulo: ang
    };
  }

  ganharFuria(pontos) {
    if (this.tipo === "ASH") {
      this.furia = min(100, this.furia + pontos);
      this.tempoSemFuria = 0;
    }
  }

  receberDano(qtd, corTexto = color(255, 255, 255), ehCritico = false) {
    if (this.vida <= 0) return;
    this.vida -= qtd;
    this.tempoSemDano = 0;

    if (this.vida <= 0) {
      this.furia = 0;
      this.dashTimer = 0;
      this.delayAtaqueTrunk = 0;
      this.filaDisparosColt = [];
      this.respawnTimer = 180;
    } else if (this.tipo === "ASH") {
      this.ganharFuria(3);
    }

    criarTextoDano(this.x, this.y - 54, "-" + qtd, corTexto, ehCritico);
  }

  moverJogador() {
    let dx = 0;
    let dy = 0;
    if (teclasPressionadas["a"] || teclasPressionadas["ArrowLeft"]) dx -= 1;
    if (teclasPressionadas["d"] || teclasPressionadas["ArrowRight"]) dx += 1;
    if (teclasPressionadas["w"] || teclasPressionadas["ArrowUp"]) dy -= 1;
    if (teclasPressionadas["s"] || teclasPressionadas["ArrowDown"]) dy += 1;

    if (joyEsq.ativo && (joyEsq.dx !== 0 || joyEsq.dy !== 0)) {
      dx = joyEsq.dx;
      dy = joyEsq.dy;
    }

    let velAtual = this.calcularVelocidadeAtual();

    if (dx !== 0 || dy !== 0) {
      let magnitude = sqrt(dx * dx + dy * dy);
      if (magnitude > 1) {
        dx /= magnitude;
        dy /= magnitude;
      }
      this.aplicarMovimento(dx * velAtual, dy * velAtual);
    } else {
      this.vxAtual = 0;
      this.vyAtual = 0;
    }

    if (joyDir.ativo && (abs(joyDir.dx) > 0.15 || abs(joyDir.dy) > 0.15)) {
      this.angulo = atan2(joyDir.dy, joyDir.dx);
    } else if (joySuper.ativo && (abs(joySuper.dx) > 0.15 || abs(joySuper.dy) > 0.15)) {
      this.angulo = atan2(joySuper.dy, joySuper.dx);
    } else if (!ehMobile && touches.length === 0) {
      let mouseMundoX = mouseX + camX;
      let mouseMundoY = mouseY + camY;
      this.angulo = atan2(mouseMundoY - this.y, mouseMundoX - this.x);
    } else if (joyEsq.ativo && (abs(joyEsq.dx) > 0.15 || abs(joyEsq.dy) > 0.15)) {
      this.angulo = atan2(joyEsq.dy, joyEsq.dx);
    }
  }

  aplicarMovimento(vx, vy) {
    let distAntesX = this.x;
    let distAntesY = this.y;

    let nx = constrain(this.x + vx, 32, mundoLargura - 32);
    if (!this.colideObstaculo(nx, this.y)) {
      this.x = nx;
    }
    let ny = constrain(this.y + vy, 65, mundoAltura - 32);
    if (!this.colideObstaculo(this.x, ny)) {
      this.y = ny;
    }

    this.vxAtual = this.x - distAntesX;
    this.vyAtual = this.y - distAntesY;

    return dist(distAntesX, distAntesY, this.x, this.y);
  }

  colideObstaculo(px, py) {
    for (let o of obstaculos) {
      let maisProxX = constrain(px, o.x, o.x + o.w);
      let maisProxY = constrain(py, o.y, o.y + o.h);
      if (dist(px, py, maisProxX, maisProxY) < this.raio) {
        return true;
      }
    }
    return false;
  }

  executarGolpeTrunk() {
    let naTerraAntes = this.estaNaTerraTrunk();
    let danoTrunk = this.calcularDanoAtual();

    this.giroTrunk = TWO_PI;
    ondasCirculares.push(new OndaCircularTrunk(this, 115, danoTrunk, naTerraAntes));

    pocasTerra.push(new PocaTerraTrunk(this.x, this.y, 58, this.time));
  }

  atualizar() {
    if (this.animAtaque > 0) this.animAtaque -= 0.15;
    if (this.cooldownAtaque > 0) this.cooldownAtaque--;

    if (this.tipo === "TRUNK" && this.delayAtaqueTrunk > 0) {
      this.delayAtaqueTrunk--;
      if (this.delayAtaqueTrunk === 0 && this.vida > 0) {
        this.executarGolpeTrunk();
      }
    }

    if (this.giroTrunk > 0) {
      this.giroTrunk -= 0.45;
      this.angulo += 0.52;
    }

    if (this.municao < 3) {
      this.recarga++;
      let tempoRecarga = 48;
      if (this.tipo === "TRUNK") tempoRecarga = 34;
      else if (this.tipo === "ASH") tempoRecarga = 62;
      else if (this.tipo === "BARLEY") tempoRecarga = 68;

      if (this.recarga >= tempoRecarga) {
        this.municao++;
        this.recarga = 0;
      }
    }

    if (this.tipo === "COLT" && this.filaDisparosColt.length > 0) {
      for (let i = this.filaDisparosColt.length - 1; i >= 0; i--) {
        let disp = this.filaDisparosColt[i];
        disp.delay--;
        if (disp.delay <= 0) {
          this.animAtaque = 0.75;
          let angDisparo = disp.ehSuper ? this.angulo + disp.espalhamento : disp.angulo;
          let canoLateral = disp.lado * 8;
          let px = this.x + cos(angDisparo) * 22 - sin(angDisparo) * canoLateral;
          let py = this.y + sin(angDisparo) * 22 + cos(angDisparo) * canoLateral;

          let estilo = disp.ehSuper ? "COLT_SUPER" : "COLT_BALA";
          let danoBala = disp.ehSuper ? 360 : this.danoBase;
          let proj = new Projetil(px, py, angDisparo, disp.ehSuper ? 14.0 : 10.8, disp.ehSuper ? 31 : 32, danoBala, this.time, estilo, this);

          proj.vxExtra = this.vxAtual * 0.24;
          proj.vyExtra = this.vyAtual * 0.24;
          projeteis.push(proj);

          this.filaDisparosColt.splice(i, 1);
        }
      }
    }

    if (this.tipo === "ASH" && this.furia > 0) {
      this.tempoSemFuria++;
      if (this.tempoSemFuria > 180) {
        this.furia = max(0, this.furia - 0.15);
      }
    }

    if (this.vida > 0 && this.vida < this.vidaMax) {
      this.tempoSemDano++;
      if (this.tempoSemDano >= 150) {
        this.timerCura++;
        if (this.timerCura >= 18) {
          this.timerCura = 0;
          let cura = Math.round(this.vidaMax * 0.14);
          this.vida = min(this.vidaMax, this.vida + cura);
          criarTextoDano(this.x, this.y - 54, "+" + cura, color(80, 255, 120), false);

          for (let k = 0; k < 4; k++) {
            particulas.push({
              x: this.x + random(-14, 14),
              y: this.y + random(-14, 14),
              vx: 0,
              vy: -1.5,
              tam: 5,
              cor: color(80, 255, 120, 220),
              vida: 20
            });
          }
        }
      }
    }

    if (this.dashTimer > 0) {
      this.dashTimer--;

      let inimigosEmContato = [];
      for (let a of [jogador, ...aliados, ...inimigos]) {
        if (a !== this && a.time !== this.time && a.vida > 0) {
          if (dist(this.x, this.y, a.x, a.y) < this.raio + a.raio + 16) {
            inimigosEmContato.push(a);
          }
        }
      }

      this.contatoSuperTrunk = inimigosEmContato.length > 0;

      let velDash = this.contatoSuperTrunk ? 3.2 : 13.5;
      let vxDash = cos(this.dashAngulo) * velDash;
      let vyDash = sin(this.dashAngulo) * velDash;

      let bateuParede = false;
      let nx = this.x + vxDash;
      if (nx < 32 || nx > mundoLargura - 32 || this.colideObstaculo(nx, this.y)) {
        vxDash *= -1;
        bateuParede = true;
      } else {
        this.x = nx;
      }

      let ny = this.y + vyDash;
      if (ny < 65 || ny > mundoAltura - 32 || this.colideObstaculo(this.x, ny)) {
        vyDash *= -1;
        bateuParede = true;
      } else {
        this.y = ny;
      }

      if (bateuParede) {
        this.dashAngulo = atan2(vyDash, vxDash);
        this.angulo = this.dashAngulo;
        for (let k = 0; k < 6; k++) {
          particulas.push({
            x: this.x,
            y: this.y,
            vx: random(-3.5, 3.5),
            vy: random(-3.5, 3.5),
            tam: random(5, 9),
            cor: color(145, 95, 50, 230),
            vida: 14
          });
        }
      }

      if (this.dashTimer % 2 === 0) {
        pocasTerra.push(new PocaTerraTrunk(this.x, this.y, 58, this.time));
      }

      particulas.push({
        x: this.x + random(-15, 15),
        y: this.y + random(-15, 15),
        vx: random(-2, 2),
        vy: random(-2, 2),
        tam: random(6, 12),
        cor: this.contatoSuperTrunk ? color(255, 140, 30, 220) : color(135, 85, 45, 210),
        vida: 15
      });

      if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === this) {
        lancaBolaComAlcance(this, this.dashAngulo, 230, 14.5, false);
      }

      if (this.contatoSuperTrunk && this.dashTimer % 6 === 0) {
        for (let alvo of inimigosEmContato) {
          alvo.receberDano(260, color(255, 130, 15), true);
          alvo.aplicarMovimento(cos(this.dashAngulo) * 4, sin(this.dashAngulo) * 4);
        }
      }
    } else {
      this.contatoSuperTrunk = false;
    }
  }

  atacar() {
    if (this.dashTimer > 0) return;

    if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === this) {
      lancaBolaComAlcance(this, this.angulo, 230, 14.5, false);
      return;
    }

    // Impede disparar várias munições de uma vez ao apertar rápido
    if (this.municao < 1 || this.cooldownAtaque > 0) return;
    if (this.tipo === "TRUNK" && this.delayAtaqueTrunk > 0) return;
    if (this.tipo === "COLT" && this.filaDisparosColt.length > 0) return;

    this.municao--;
    this.animAtaque = 1.2;
    this.tempoSemDano = 0;

    if (this.tipo === "ASH") {
      this.cooldownAtaque = 28;
      let alcanceAsh = 125;
      let startX = this.x + cos(this.angulo) * 20;
      let startY = this.y + sin(this.angulo) * 20;
      let danoComFuria = this.calcularDanoAtual();
      let etapaFuria = this.obterEtapaFuria();

      rachadurasChao.push({
        x: startX,
        y: startY,
        angulo: this.angulo,
        comprimento: alcanceAsh,
        furiaAlta: etapaFuria === 3,
        vida: 35,
        vidaMax: 35
      });

      for (let k = 0; k < 6; k++) {
        let d = random(20, alcanceAsh);
        particulas.push({
          x: startX + cos(this.angulo) * d,
          y: startY + sin(this.angulo) * d,
          vx: random(-1.5, 1.5),
          vy: random(-1.5, 1.5),
          tam: random(4, 8),
          cor: color(120, 95, 65, 200),
          vida: 18
        });
      }

      projeteis.push(new Projetil(startX, startY, this.angulo, 11, 11, danoComFuria, this.time, "ASH_ATAQUE", this));
    } else if (this.tipo === "TRUNK") {
      this.cooldownAtaque = 30;
      this.delayAtaqueTrunk = 10;
    } else if (this.tipo === "COLT") {
      this.cooldownAtaque = 26;
      for (let i = 0; i < 6; i++) {
        this.filaDisparosColt.push({
          delay: i * 4,
          angulo: this.angulo,
          lado: i % 2 === 0 ? -1 : 1,
          ehSuper: false,
          espalhamento: 0
        });
      }
    } else if (this.tipo === "BARLEY") {
      this.cooldownAtaque = 28;
      let alvo = this.calcularAlvoBarley();
      garrafas.push(new GarrafaBarley(this.x, this.y, alvo.x, alvo.y, this.danoBase, 58, this.time, this, false));
    }
  }

  usarSuper() {
    if (this.superCarga < 100 || this.dashTimer > 0) return;

    if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === this) {
      this.superCarga = 0;
      this.tempoSemDano = 0;
      lancaBolaComAlcance(this, this.angulo, 410, 22.0, true);

      for (let k = 0; k < 14; k++) {
        particulas.push({
          x: bola.x,
          y: bola.y,
          vx: cos(this.angulo + random(-0.6, 0.6)) * random(3, 8),
          vy: sin(this.angulo + random(-0.6, 0.6)) * random(3, 8),
          tam: random(6, 12),
          cor: color(255, 215, 0, 230),
          vida: 18
        });
      }
      return;
    }

    this.superCarga = 0;
    this.tempoSemDano = 0;
    this.cooldownAtaque = 20;

    if (this.tipo === "ASH") {
      let alcanceGaiola = 115;
      if (this.ehJogador && !ehMobile) {
        let dMouse = dist(this.x, this.y, mouseX + camX, mouseY + camY);
        alcanceGaiola = constrain(dMouse, 40, 115);
      }

      let destX = this.x;
      let destY = this.y;
      for (let passo = 10; passo <= alcanceGaiola; passo += 5) {
        let tx = constrain(this.x + cos(this.angulo) * passo, 38, mundoLargura - 38);
        let ty = constrain(this.y + sin(this.angulo) * passo, 65, mundoAltura - 38);
        let bateuObstaculo = false;
        for (let o of obstaculos) {
          if (tx > o.x - 14 && tx < o.x + o.w + 14 && ty > o.y - 14 && ty < o.y + o.h + 14) {
            bateuObstaculo = true;
            break;
          }
        }
        if (bateuObstaculo) break;
        destX = tx;
        destY = ty;
      }

      this.animAtaque = 1.0;
      gaiolasAsh.push(new GaiolaRatosAsh(this.x, this.y, destX, destY, this.angulo, this.time, this));
    } else if (this.tipo === "TRUNK") {
      this.delayAtaqueTrunk = 0;
      this.dashTimer = 28;
      this.dashAngulo = this.angulo;
      this.contatoSuperTrunk = false;
      pocasTerra.push(new PocaTerraTrunk(this.x, this.y, 58, this.time));
    } else if (this.tipo === "COLT") {
      for (let i = 0; i < 12; i++) {
        this.filaDisparosColt.push({
          delay: i * 2,
          angulo: this.angulo,
          lado: i % 2 === 0 ? -1 : 1,
          ehSuper: true,
          espalhamento: random(-0.04, 0.04)
        });
      }
    } else if (this.tipo === "BARLEY") {
      let centro = this.calcularAlvoBarley();
      let dirX = cos(this.angulo);
      let dirY = sin(this.angulo);
      let perpX = -sin(this.angulo);
      let perpY = cos(this.angulo);

      let distCentro = dist(this.x, this.y, centro.x, centro.y);
      let tAlcance = constrain((distCentro - 45) / (275 - 45), 0, 1);
      let fatorEspacamento = lerp(1.0, 1.32, pow(tAlcance, 1.15));

      let posicoes = [
        { frente: 50 * fatorEspacamento, lado: -48 * fatorEspacamento },
        { frente: 50 * fatorEspacamento, lado: 48 * fatorEspacamento },
        { frente: 0, lado: 0 },
        { frente: -50 * fatorEspacamento, lado: -48 * fatorEspacamento },
        { frente: -50 * fatorEspacamento, lado: 48 * fatorEspacamento }
      ];

      for (let pos of posicoes) {
        let destX = constrain(centro.x + dirX * pos.frente + perpX * pos.lado, 35, mundoLargura - 35);
        let destY = constrain(centro.y + dirY * pos.frente + perpY * pos.lado, 60, mundoAltura - 35);
        garrafas.push(new GarrafaBarley(this.x, this.y, destX, destY, this.danoBase, 78, this.time, this, true));
      }
    }
  }

  calcularVetorSeparacao() {
    let sepX = 0;
    let sepY = 0;
    let todos = [jogador, ...aliados, ...inimigos];
    for (let outro of todos) {
      if (outro && outro !== this && outro.vida > 0) {
        let d = dist(this.x, this.y, outro.x, outro.y);
        if (d > 0 && d < 120) {
          let forca = (120 - d) / 120;
          sepX += ((this.x - outro.x) / d) * forca * 55;
          sepY += ((this.y - outro.y) / d) * forca * 55;
        }
      }
    }
    return { x: sepX, y: sepY };
  }

  moverBotPara(destX, destY, vel) {
    let sep = this.calcularVetorSeparacao();
    let alvoX = destX + sep.x;
    let alvoY = destY + sep.y;

    if (modoSelecionado === "FUTEBRAWL") {
      let meioY = mundoAltura / 2;
      if ((this.x < 210 && destX > 242) || (this.x > 242 && destX < 210)) {
        if (this.y > meioY - 95 && this.y < meioY + 95) {
          alvoX = 226;
          alvoY = this.y < meioY ? meioY - 125 : meioY + 125;
        }
      }
      let dirX = mundoLargura - 226;
      if ((this.x < dirX - 16 && destX > dirX + 16) || (this.x > dirX + 16 && destX < dirX - 16)) {
        if (this.y > meioY - 95 && this.y < meioY + 95) {
          alvoX = dirX;
          alvoY = this.y < meioY ? meioY - 125 : meioY + 125;
        }
      }
    }

    let ang = atan2(alvoY - this.y, alvoX - this.x);

    if (this.desvioTimer > 0) {
      this.desvioTimer--;
      ang = this.anguloDesvio;
    }

    let deslocamento = this.aplicarMovimento(cos(ang) * vel, sin(ang) * vel);

    if (deslocamento < vel * 0.4) {
      this.framesPreso++;
      if (this.framesPreso >= 3) {
        this.framesPreso = 0;
        this.ladoContornoBot *= -1;
        this.desvioTimer = 34;
        this.anguloDesvio = ang + (HALF_PI * this.ladoContornoBot) + random(-0.2, 0.2);

        let angSaida = atan2(mundoAltura / 2 - this.y, mundoLargura / 2 - this.x);
        this.aplicarMovimento(cos(angSaida) * 3, sin(angSaida) * 3);
      }
    } else {
      this.framesPreso = 0;
    }
  }

  iaCombate(todosBrawlers) {
    let alvo = null;
    let menorDist = Infinity;
    for (let b of todosBrawlers) {
      if (b !== this && b.time !== this.time && b.vida > 0) {
        let d = dist(this.x, this.y, b.x, b.y);
        if (d < menorDist) {
          menorDist = d;
          alvo = b;
        }
      }
    }

    let velBot = this.calcularVelocidadeAtual();

    let distCentro = dist(this.x, this.y, mundoLargura / 2, mundoAltura / 2);
    if (distCentro > venenoRaio - 60) {
      this.moverBotPara(mundoLargura / 2, mundoAltura / 2, velBot * 0.9);
      return;
    }

    if (!alvo) {
      this.timerPatrulha--;
      if (this.timerPatrulha <= 0 || dist(this.x, this.y, this.pontoPatrulhaX, this.pontoPatrulhaY) < 60) {
        this.timerPatrulha = 120;
        let raioSeguro = min(venenoRaio - 120, mundoLargura * 0.42);
        let angRand = random(TWO_PI);
        this.pontoPatrulhaX = constrain(mundoLargura / 2 + cos(angRand) * random(100, raioSeguro), 120, mundoLargura - 120);
        this.pontoPatrulhaY = constrain(mundoAltura / 2 + sin(angRand) * random(100, raioSeguro), 120, mundoAltura - 120);
      }
      this.angulo = atan2(this.pontoPatrulhaY - this.y, this.pontoPatrulhaX - this.x);
      this.moverBotPara(this.pontoPatrulhaX, this.pontoPatrulhaY, velBot * 0.78);
      return;
    }

    this.angulo = atan2(alvo.y - this.y, alvo.x - this.x);

    let alcanceIdeal = 105;
    if (this.tipo === "TRUNK") alcanceIdeal = 95;
    else if (this.tipo === "COLT") alcanceIdeal = 270;
    else if (this.tipo === "BARLEY") alcanceIdeal = 215;

    if (menorDist > alcanceIdeal + 15) {
      this.moverBotPara(alvo.x, alvo.y, velBot * 0.84);
    } else if (menorDist < alcanceIdeal - 35) {
      let angFuga = this.angulo + PI;
      let destFugaX = constrain(this.x + cos(angFuga) * 90, 90, mundoLargura - 90);
      let destFugaY = constrain(this.y + sin(angFuga) * 90, 90, mundoAltura - 90);
      this.moverBotPara(destFugaX, destFugaY, velBot * 0.76);
    } else {
      let dirLateral = sin(frameCount * 0.04 + this.raio) > 0 ? HALF_PI : -HALF_PI;
      let destLatX = constrain(this.x + cos(this.angulo + dirLateral) * 80, 90, mundoLargura - 90);
      let destLatY = constrain(this.y + sin(this.angulo + dirLateral) * 80, 90, mundoAltura - 90);
      this.moverBotPara(destLatX, destLatY, velBot * 0.68);
    }

    let alcanceAtaque = 135;
    if (this.tipo === "TRUNK") alcanceAtaque = 120;
    else if (this.tipo === "COLT") alcanceAtaque = 345;
    else if (this.tipo === "BARLEY") alcanceAtaque = 275;

    if (menorDist <= alcanceAtaque && this.municao >= 1 && this.cooldownAtaque <= 0) {
      this.delayReacao--;
      if (this.delayReacao <= 0) {
        this.delayReacao = Math.floor(random(34, 62));
        if (this.tipo === "BARLEY") {
          let miraPred = this.calcularAlvoPreditivoBarley(alvo);
          this.angulo = miraPred.angulo;
          garrafas.push(new GarrafaBarley(this.x, this.y, miraPred.x, miraPred.y, this.danoBase, 58, this.time, this, false));
          this.municao--;
          this.cooldownAtaque = 28;
          this.animAtaque = 1.2;
          this.tempoSemDano = 0;
        } else {
          this.atacar();
        }
      }
    } else {
      this.delayReacao = max(this.delayReacao, 16);
    }

    if (this.superCarga >= 100 && menorDist <= alcanceAtaque) {
      this.delaySuperBot--;
      if (this.delaySuperBot <= 0) {
        this.delaySuperBot = Math.floor(random(24, 48));
        if (this.tipo === "BARLEY") {
          let miraPred = this.calcularAlvoPreditivoBarley(alvo);
          this.angulo = miraPred.angulo;
        }
        this.usarSuper();
      }
    }
  }

  linhaDePasseLivre(destX, destY, oponentes) {
    let dTotal = dist(this.x, this.y, destX, destY);
    if (dTotal < 40) return false;
    for (let op of oponentes) {
      if (op.vida > 0) {
        let dOp = dist(this.x, this.y, op.x, op.y);
        if (dOp < dTotal) {
          let t = ((op.x - this.x) * (destX - this.x) + (op.y - this.y) * (destY - this.y)) / (dTotal * dTotal);
          if (t > 0.15 && t < 0.92) {
            let projX = this.x + t * (destX - this.x);
            let projY = this.y + t * (destY - this.y);
            if (dist(op.x, op.y, projX, projY) < 52) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  iaFutebrawl(bola, companheiros, oponentes) {
    if (!bola) return;
    let meioY = mundoAltura / 2;
    let velBot = this.calcularVelocidadeAtual();
    let meuGolX = this.time === "AZUL" ? 35 : mundoLargura - 35;
    let golAdversarioX = this.time === "AZUL" ? mundoLargura - 25 : 25;
    let dirAtaque = this.time === "AZUL" ? 1 : -1;

    if (bola.posse === this) {
      this.tempoComBola++;

      let distMeuGol = abs(this.x - meuGolX);
      let distGolAdv = dist(this.x, this.y, golAdversarioX, meioY);

      let inimigosPerto = 0;
      let inimigoAmeaca = null;
      let menorDistOp = Infinity;
      for (let op of oponentes) {
        if (op.vida > 0) {
          let d = dist(this.x, this.y, op.x, op.y);
          if (d < 155) inimigosPerto++;
          if (d < menorDistOp) {
            menorDistOp = d;
            inimigoAmeaca = op;
          }
        }
      }

      if (distMeuGol < 340 && (inimigosPerto >= 1 || this.vida < this.vidaMax * 0.55) && this.tempoComBola > 8) {
        let angClear = this.y < meioY ? (this.time === "AZUL" ? -0.45 : PI + 0.45) : (this.time === "AZUL" ? 0.45 : PI - 0.45);
        let aliadoLivre = null;
        for (let comp of companheiros) {
          if (comp !== this && comp.vida > 0) {
            let maisAvancado = (comp.x - this.x) * dirAtaque > 80;
            if (maisAvancado && dist(this.x, this.y, comp.x, comp.y) < 360 && this.linhaDePasseLivre(comp.x, comp.y, oponentes)) {
              aliadoLivre = comp;
              break;
            }
          }
        }

        if (aliadoLivre) {
          this.angulo = atan2(aliadoLivre.y - this.y, aliadoLivre.x - this.x);
        } else {
          this.angulo = angClear;
        }
        this.tempoComBola = 0;
        this.atacar();
        return;
      }

      if (this.superCarga >= 100 && distGolAdv < 405 && this.linhaDePasseLivre(golAdversarioX, meioY, oponentes)) {
        let alvoGolY = meioY + random(-55, 55);
        this.angulo = atan2(alvoGolY - this.y, golAdversarioX - this.x);
        this.tempoComBola = 0;
        this.usarSuper();
        return;
      } else if (distGolAdv < 225) {
        let alvoGolY = meioY + random(-50, 50);
        this.angulo = atan2(alvoGolY - this.y, golAdversarioX - this.x);
        this.tempoComBola = 0;
        this.atacar();
        return;
      }

      let bloqueadoNaFrente = false;
      for (let op of oponentes) {
        if (op.vida > 0) {
          let dxOp = (op.x - this.x) * dirAtaque;
          if (dxOp > 0 && dxOp < 155 && abs(op.y - this.y) < 75) {
            bloqueadoNaFrente = true;
            break;
          }
        }
      }

      if ((bloqueadoNaFrente || this.vida < this.vidaMax * 0.42 || this.tempoComBola > 55) && this.tempoComBola > 14) {
        let melhorAlvoPasse = null;
        let melhorScore = -Infinity;

        for (let comp of companheiros) {
          if (comp !== this && comp.vida > 0) {
            let dComp = dist(this.x, this.y, comp.x, comp.y);
            if (dComp > 95 && dComp < 390 && this.linhaDePasseLivre(comp.x, comp.y, oponentes)) {
              let ganhoCampo = (comp.x - this.x) * dirAtaque;
              let score = ganhoCampo + (comp.ehJogador ? 75 : 25) - dComp * 0.15;
              if (score > melhorScore) {
                melhorScore = score;
                melhorAlvoPasse = comp;
              }
            }
          }
        }

        if (melhorAlvoPasse && melhorScore > -30) {
          let predPasseX = melhorAlvoPasse.x + (melhorAlvoPasse.vxAtual || 0) * 10;
          let predPasseY = melhorAlvoPasse.y + (melhorAlvoPasse.vyAtual || 0) * 10;
          this.angulo = atan2(predPasseY - this.y, predPasseX - this.x);
          this.tempoComBola = 0;
          this.atacar();
          return;
        }
      }

      let alvoConducaoX = golAdversarioX;
      let alvoConducaoY = meioY;

      if (inimigoAmeaca && menorDistOp < 175) {
        let desvioY = this.y < inimigoAmeaca.y ? -145 : 145;
        alvoConducaoY = constrain(this.y + desvioY, 110, mundoAltura - 110);
      } else {
        alvoConducaoY = meioY + sin(frameCount * 0.05 + this.raio) * 70;
      }

      this.angulo = atan2(alvoConducaoY - this.y, alvoConducaoX - this.x);
      this.moverBotPara(alvoConducaoX, alvoConducaoY, velBot * 0.86);
      return;
    }

    this.tempoComBola = 0;

    let bolaNoMeuCampo = (this.time === "AZUL" && bola.x < mundoLargura * 0.45) ||
                         (this.time === "VERMELHO" && bola.x > mundoLargura * 0.55);

    let adversarioComBola = bola.posse && bola.posse.time !== this.time;

    let inimigoMaisPerto = null;
    let distInimigo = Infinity;
    for (let op of oponentes) {
      if (op.vida > 0) {
        let d = dist(this.x, this.y, op.x, op.y);
        if (d < distInimigo) {
          distInimigo = d;
          inimigoMaisPerto = op;
        }
      }
    }

    let alcanceTiro = 145;
    if (this.tipo === "COLT") alcanceTiro = 280;
    else if (this.tipo === "BARLEY") alcanceTiro = 265;

    if (inimigoMaisPerto && distInimigo < alcanceTiro) {
      this.angulo = atan2(inimigoMaisPerto.y - this.y, inimigoMaisPerto.x - this.x);
      if (this.municao >= 1 && this.cooldownAtaque <= 0) {
        this.delayReacao--;
        if (this.delayReacao <= 0) {
          this.delayReacao = Math.floor(random(34, 60));
          if (this.tipo === "BARLEY") {
            let miraPred = this.calcularAlvoPreditivoBarley(inimigoMaisPerto);
            this.angulo = miraPred.angulo;
            garrafas.push(new GarrafaBarley(this.x, this.y, miraPred.x, miraPred.y, this.danoBase, 58, this.time, this, false));
            this.municao--;
            this.cooldownAtaque = 28;
            this.animAtaque = 1.2;
            this.tempoSemDano = 0;
          } else {
            this.atacar();
          }
        }
      }
      if (this.superCarga >= 100 && distInimigo < alcanceTiro) {
        this.delaySuperBot--;
        if (this.delaySuperBot <= 0) {
          this.delaySuperBot = Math.floor(random(22, 45));
          if (this.tipo === "BARLEY") {
            let miraPred = this.calcularAlvoPreditivoBarley(inimigoMaisPerto);
            this.angulo = miraPred.angulo;
          }
          this.usarSuper();
        }
      }
    }

    let souMaisPertoDaBola = true;
    let minhaDistBola = dist(this.x, this.y, bola.x, bola.y);
    for (let comp of companheiros) {
      if (comp !== this && comp.vida > 0) {
        if (dist(comp.x, comp.y, bola.x, bola.y) < minhaDistBola - 15) {
          souMaisPertoDaBola = false;
          break;
        }
      }
    }

    if (souMaisPertoDaBola) {
      this.angulo = atan2(bola.y - this.y, bola.x - this.x);
      this.moverBotPara(bola.x, bola.y, velBot * 0.88);
    } else if (bolaNoMeuCampo || adversarioComBola) {
      let defX = lerp(meuGolX, bola.x, 0.42);
      let defY = constrain(lerp(meioY, bola.y, 0.65) + (this.zonaPreferidaY - meioY) * 0.25, 130, mundoAltura - 130);
      this.moverBotPara(defX, defY, velBot * 0.84);
    } else {
      let apoioX = constrain(bola.x + dirAtaque * 135, 220, mundoLargura - 220);
      let apoioY = constrain((this.zonaPreferidaY || meioY) + sin(frameCount * 0.05) * 45, 110, mundoAltura - 110);
      this.moverBotPara(apoioX, apoioY, velBot * 0.80);
    }
  }

  desenharRespawn() {
    push();
    translate(this.x, this.y);
    noFill();
    stroke(this.time === "AZUL" ? color(0, 190, 255, 130) : color(255, 70, 70, 130));
    strokeWeight(2);
    ellipse(0, 0, 36, 36);

    fill(255, 220);
    noStroke();
    textSize(13);
    textStyle(BOLD);
    text(ceil(this.respawnTimer / 60) + "s", 0, 0);
    pop();
  }

  desenhar() {
    push();
    translate(this.x, this.y);
    noFill();
    strokeWeight(3);
    if (this.superCarga >= 100) {
      stroke(255, 215, 0, 220);
      ellipse(0, 0, this.raio * 2 + 14 + sin(frameCount * 0.2) * 4);
    } else {
      stroke(this.ehJogador ? color(65, 235, 105, 190) : (this.time === "AZUL" ? color(0, 190, 255, 180) : color(255, 60, 60, 180)));
      ellipse(0, 0, this.raio * 2 + 10);
    }
    pop();

    if (this.tipo === "ASH") {
      desenharSpriteAsh(this.x, this.y, this.angulo, 1.0, -this.animAtaque, this.furia);
    } else if (this.tipo === "TRUNK") {
      desenharSpriteTrunk(
        this.x,
        this.y,
        this.angulo,
        1.0,
        this.dashTimer > 0,
        this.giroTrunk,
        this.estaNaTerraTrunk(),
        this.delayAtaqueTrunk > 0
      );
    } else if (this.tipo === "COLT") {
      desenharSpriteColt(this.x, this.y, this.angulo, 1.0, this.animAtaque);
    } else if (this.tipo === "BARLEY") {
      desenharSpriteBarley(this.x, this.y, this.angulo, 1.0, -this.animAtaque, this.time);
    }

    let barraW = 56;
    let barraH = 11;
    let barraX = this.x - barraW / 2;
    let barraY = this.y - 46;

    let textoVidaY = barraY - 6;

    if (this.ehJogador && this.nomeExibicao) {
      textStyle(BOLD);
      textSize(11);
      stroke(10, 14, 22, 235);
      strokeWeight(2.8);
      fill(135, 245, 155);
      text(this.nomeExibicao, this.x, textoVidaY - 12);
      noStroke();
    }

    let corVida;
    if (this.ehJogador) {
      corVida = color(50, 220, 75);
    } else if (this.time === "AZUL") {
      corVida = color(45, 165, 255);
    } else {
      corVida = color(245, 55, 55);
    }

    noStroke();
    fill(0, 210);
    rect(barraX, barraY, barraW, barraH, 4);
    fill(corVida);
    let wVida = map(this.vida, 0, this.vidaMax, 0, barraW - 2);
    rect(barraX + 1, barraY + 1, max(0, wVida), barraH - 2, 3);

    textStyle(BOLD);
    textSize(11.5);
    stroke(10, 14, 22, 245);
    strokeWeight(2.8);
    fill(255);
    text(Math.max(0, Math.round(this.vida)), this.x, textoVidaY);
    noStroke();

    if (this.tipo === "ASH" && !this.ehJogador && this.time !== "AZUL") {
      desenharIconeFuriaAsh(barraX + barraW + 11, barraY + barraH / 2, this.furia, 0.95);
    }

    if (this.ehJogador) {
      for (let i = 0; i < 3; i++) {
        fill(i < this.municao ? color(255, 185, 0) : color(60));
        rect(this.x - 23 + i * 16, this.y - 32, 14, 4, 2);
      }

      if (this.tipo === "ASH") {
        let furiaY = this.y - 25.5;
        let furiaW = 46;
        let furiaH = 5.5;
        let furiaX = this.x - 23;

        desenharIconeFuriaAsh(furiaX - 9, furiaY + furiaH / 2, this.furia, 0.85);

        noStroke();
        fill(15, 18, 25, 220);
        rect(furiaX, furiaY, furiaW, furiaH, 2);

        fill(this.obterEtapaFuria() === 3 ? color(245, 55, 45) : color(255, 210, 40));
        let wFuria = map(this.furia, 0, 100, 0, furiaW - 2);
        if (wFuria > 0) {
          rect(furiaX + 1, furiaY + 1, wFuria, furiaH - 2, 1.5);
        }

        stroke(15, 18, 25);
        strokeWeight(1.5);
        line(furiaX + furiaW * 0.33, furiaY, furiaX + furiaW * 0.33, furiaY + furiaH);
        line(furiaX + furiaW * 0.66, furiaY, furiaX + furiaW * 0.66, furiaY + furiaH);
        noStroke();
      }
    }
  }
}

// ==========================================
// ASH: GAIOLA DE RATOS ROBÓTICOS (FORMATO PENTAGONAL)
// ==========================================
class GaiolaRatosAsh {
  constructor(startX, startY, destX, destY, anguloBase, time, dono) {
    this.startX = startX;
    this.startY = startY;
    this.destX = destX;
    this.destY = destY;
    this.x = startX;
    this.y = startY;
    this.anguloBase = anguloBase;
    this.time = time;
    this.dono = dono;

    this.tempoTotal = 16;
    this.tempo = 0;
    this.finalizada = false;
  }

  atualizar() {
    this.tempo++;
    let t = min(1, this.tempo / this.tempoTotal);
    this.x = lerp(this.startX, this.destX, t);
    this.y = lerp(this.startY, this.destY, t);

    if (this.tempo >= this.tempoTotal) {
      this.finalizada = true;

      let raioFormacao = 46;
      let pontosRatos = [];

      for (let i = 0; i < 5; i++) {
        let ang = -HALF_PI + (TWO_PI / 5) * i;
        let rx = constrain(this.destX + cos(ang) * raioFormacao, 25, mundoLargura - 25);
        let ry = constrain(this.destY + sin(ang) * raioFormacao, 52, mundoAltura - 25);
        pontosRatos.push({ x: rx, y: ry });

        let rato = new Projetil(rx, ry, ang, 3.8, 320, 480, this.time, "RATO", this.dono);
        rato.tempoEspalhar = 18;
        projeteis.push(rato);
      }

      let nuvens = [];
      for (let n = 0; n < 14; n++) {
        nuvens.push({
          ang: (TWO_PI / 14) * n + random(-0.15, 0.15),
          dist: random(52, 68),
          tam: random(16, 26)
        });
      }

      efeitosSpawnRatos.push({
        x: this.destX,
        y: this.destY,
        time: this.time,
        pontosRatos: pontosRatos,
        nuvens: nuvens,
        vida: 24,
        vidaMax: 24
      });
    }
  }

  desenhar() {
    let t = min(1, this.tempo / this.tempoTotal);
    let alturaArco = sin(t * PI) * 42;

    noStroke();
    fill(0, 0, 0, 80);
    ellipse(this.x, this.y, 24, 14);

    noFill();
    stroke(this.time === "AZUL" ? color(100, 215, 255, 130) : color(255, 100, 100, 130));
    strokeWeight(2);
    ellipse(this.destX, this.destY, 34, 34);

    push();
    translate(this.x, this.y - alturaArco);
    rotate(this.tempo * 0.28);

    fill(65, 72, 85);
    stroke(25, 30, 38);
    strokeWeight(2.5);
    rect(-13, -12, 26, 24, 5);

    stroke(185, 198, 212);
    strokeWeight(2);
    line(-7, -11, -7, 11);
    line(0, -11, 0, 11);
    line(7, -11, 7, 11);

    noStroke();
    fill(this.time === "AZUL" ? color(90, 235, 255) : color(255, 80, 60));
    ellipse(-4, -2, 3.5, 3.5);
    ellipse(4, 3, 3.5, 3.5);

    noFill();
    stroke(235, 190, 50);
    strokeWeight(2.5);
    arc(0, -12, 12, 8, PI, TWO_PI);
    pop();
  }
}

// ==========================================
// TRUNK: POÇA DE TERRA NO CHÃO
// ==========================================
class PocaTerraTrunk {
  constructor(x, y, raio, time) {
    this.x = x;
    this.y = y;
    this.raio = raio;
    this.time = time;
    this.vida = 240;

    this.vertices = [];
    let numPts = 14;
    for (let i = 0; i < numPts; i++) {
      let ang = (TWO_PI / numPts) * i;
      let fator = 0.88 + sin(i * 2.3 + x * 0.1) * 0.11 + cos(i * 1.7 + y * 0.1) * 0.06;
      this.vertices.push({ ang: ang, fator: fator });
    }
  }

  desenhar() {
    let opacidade = this.vida < 35 ? map(this.vida, 0, 35, 0, 225) : 225;
    let ehAzul = this.time === "AZUL";

    push();
    translate(this.x, this.y);
    noStroke();

    fill(ehAzul ? color(95, 155, 235, opacidade * 0.22) : color(235, 85, 85, opacidade * 0.22));
    ellipse(0, 0, this.raio * 2.38, this.raio * 2.15);

    fill(ehAzul ? color(115, 175, 245, opacidade * 0.32) : color(245, 100, 100, opacidade * 0.32));
    ellipse(0, 0, this.raio * 2.12, this.raio * 1.92);

    fill(102, 72, 48, opacidade);
    beginShape();
    for (let v of this.vertices) {
      let r = this.raio * v.fator;
      vertex(cos(v.ang) * r, sin(v.ang) * r * 0.9);
    }
    endShape(CLOSE);

    fill(124, 92, 64, opacidade * 0.9);
    ellipse(-8, -7, this.raio * 1.15, this.raio * 0.95);
    ellipse(10, 6, this.raio * 0.85, this.raio * 0.72);

    fill(78, 52, 32, opacidade * 0.9);
    ellipse(15, -10, 10, 7);
    ellipse(-18, 12, 11, 8);
    ellipse(5, 18, 9, 6);

    push();
    translate(-5, 6);
    rotate(-0.35);
    fill(42, 130, 32, opacidade);
    ellipse(0, 2, 15, 7);
    fill(95, 205, 50, opacidade);
    ellipse(0, 0, 14, 6);
    stroke(55, 145, 30, opacidade);
    strokeWeight(1);
    line(-5, 0, 5, 0);
    pop();

    push();
    translate(-11, 13);
    rotate(-0.65);
    noStroke();
    fill(42, 130, 32, opacidade);
    ellipse(0, 1.5, 12, 6);
    fill(110, 220, 58, opacidade);
    ellipse(0, 0, 11, 5);
    pop();

    pop();
  }
}

// ==========================================
// BARLEY: GARRAFA VOADORA E POÇA (AZUL ALIADA / VERMELHA INIMIGA)
// ==========================================
class GarrafaBarley {
  constructor(startX, startY, destX, destY, dano, raioPoca, time, dono, ehSuper) {
    this.startX = startX;
    this.startY = startY;
    this.destX = destX;
    this.destY = destY;
    this.x = startX;
    this.y = startY;
    this.dano = dano;
    this.raioPoca = raioPoca;
    this.time = time;
    this.dono = dono;
    this.ehSuper = ehSuper;

    this.tempoTotal = 26;
    this.tempo = 0;
    this.finalizada = false;
  }

  atualizar(todosBrawlers) {
    this.tempo++;
    let t = min(1, this.tempo / this.tempoTotal);
    this.x = lerp(this.startX, this.destX, t);
    this.y = lerp(this.startY, this.destY, t);

    if (this.tempo >= this.tempoTotal) {
      this.finalizada = true;

      for (let b of todosBrawlers) {
        if (b !== this.dono && b.time !== this.time && b.vida > 0) {
          if (dist(this.destX, this.destY, b.x, b.y) <= this.raioPoca + b.raio * 0.6) {
            b.receberDano(this.dano, color(120, 215, 255), false);
            if (!this.ehSuper) {
              this.dono.superCarga = min(100, this.dono.superCarga + (100 / 6));
            }
          }
        }
      }

      for (let p of projeteis) {
        if (p.estilo === "RATO" && p.time !== this.time && p.vida > 0) {
          if (dist(this.destX, this.destY, p.x, p.y) <= this.raioPoca + p.raio) {
            p.receberDanoRato(this.dano);
          }
        }
      }

      pocas.push(new PocaBarley(this.destX, this.destY, this.raioPoca, this.dano, this.time, this.dono, this.ehSuper));

      let ehAzul = this.time === "AZUL";
      for (let k = 0; k < 10; k++) {
        particulas.push({
          x: this.destX,
          y: this.destY,
          vx: random(-3.5, 3.5),
          vy: random(-3.5, 3.5),
          tam: random(5, 9),
          cor: ehAzul ? color(60, 195, 255, 220) : color(255, 85, 85, 220),
          vida: 18
        });
      }
    }
  }

  desenhar() {
    let t = min(1, this.tempo / this.tempoTotal);
    let alturaArco = sin(t * PI) * 65;
    let ehAzul = this.time === "AZUL";

    noStroke();
    fill(0, 0, 0, 75);
    ellipse(this.x, this.y, 16, 10);

    push();
    translate(this.x, this.y - alturaArco);
    rotate(this.tempo * 0.35);
    scale(1 + sin(t * PI) * 0.35);

    if (ehAzul) {
      fill(60, 185, 245);
      stroke(20, 75, 135);
    } else {
      fill(235, 65, 65);
      stroke(120, 20, 20);
    }
    strokeWeight(2);
    rect(-8, -5, 14, 10, 3);
    fill(230, 190, 120);
    rect(6, -2.5, 5, 5, 1);
    pop();
  }
}

class PocaBarley {
  constructor(x, y, raio, danoPorSegundo, time, dono, ehSuper) {
    this.x = x;
    this.y = y;
    this.raio = raio;
    this.danoTick = Math.round(danoPorSegundo / 2);
    this.time = time;
    this.dono = dono;
    this.ehSuper = ehSuper;
    this.vida = 180;
    this.timersDano = new Map();

    this.lobulos = [];
    let qtd = 18;
    for (let i = 0; i < qtd; i++) {
      this.lobulos.push({
        ang: (TWO_PI / qtd) * i,
        fase: random(TWO_PI),
        amp: random(0.06, 0.13)
      });
    }

    this.bolhas = [];
    for (let b = 0; b < 7; b++) {
      let a = random(TWO_PI);
      let d = random(this.raio * 0.25, this.raio * 0.72);
      this.bolhas.push({
        x: cos(a) * d,
        y: sin(a) * d,
        tam: random(4, 9),
        fase: random(TWO_PI)
      });
    }
  }

  atualizar(todosBrawlers) {
    this.vida--;

    for (let b of todosBrawlers) {
      if (b !== this.dono && b.time !== this.time && b.vida > 0) {
        if (dist(this.x, this.y, b.x, b.y) <= this.raio + b.raio * 0.5) {
          let t = (this.timersDano.get(b) || 0) + 1;
          if (t >= 30) {
            t = 0;
            b.receberDano(this.danoTick, color(120, 215, 255), false);
            if (!this.ehSuper) {
              this.dono.superCarga = min(100, this.dono.superCarga + (100 / 12));
            }
          }
          this.timersDano.set(b, t);
        } else {
          this.timersDano.set(b, 0);
        }
      }
    }

    for (let p of projeteis) {
      if (p.estilo === "RATO" && p.time !== this.time && p.vida > 0) {
        if (dist(this.x, this.y, p.x, p.y) <= this.raio + p.raio) {
          let t = (this.timersDano.get(p) || 0) + 1;
          if (t >= 30) {
            t = 0;
            p.receberDanoRato(this.danoTick);
          }
          this.timersDano.set(p, t);
        }
      }
    }
  }

  desenhar() {
    let opacidade = this.vida < 30 ? map(this.vida, 0, 30, 0, 195) : 195;
    let ehAzul = this.time === "AZUL";

    push();
    translate(this.x, this.y);

    noStroke();
    fill(ehAzul ? color(45, 165, 255, opacidade * 0.85) : color(245, 55, 55, opacidade * 0.72));
    beginShape();
    for (let l of this.lobulos) {
      let r = this.raio * (1.03 + sin(frameCount * 0.12 + l.fase) * l.amp);
      vertex(cos(l.ang) * r, sin(l.ang) * r * 0.92);
    }
    endShape(CLOSE);

    fill(ehAzul ? color(85, 118, 225, opacidade * 0.78) : color(210, 48, 58, opacidade * 0.62));
    beginShape();
    for (let l of this.lobulos) {
      let r = this.raio * (0.90 + sin(frameCount * 0.12 + l.fase) * (l.amp * 0.8));
      vertex(cos(l.ang) * r, sin(l.ang) * r * 0.92);
    }
    endShape(CLOSE);

    for (let bl of this.bolhas) {
      let pulso = sin(frameCount * 0.14 + bl.fase) * 1.5;
      fill(ehAzul ? color(155, 220, 255, opacidade * 0.65) : color(255, 145, 145, opacidade * 0.55));
      ellipse(bl.x, bl.y, bl.tam + pulso);
    }

    let flutuarY = sin(frameCount * 0.12) * 3.5;
    push();
    translate(0, flutuarY);
    fill(ehAzul ? color(185, 220, 255, opacidade * 0.85) : color(255, 185, 185, opacidade * 0.75));
    ellipse(0, -2, 13, 11);
    rect(-4, 2, 8, 5, 1.5);
    fill(ehAzul ? color(75, 105, 210, opacidade) : color(175, 35, 45, opacidade * 0.9));
    ellipse(-2.5, -2, 2.8, 3.2);
    ellipse(2.5, -2, 2.8, 3.2);
    pop();

    pop();
  }
}

// ==========================================
// ATAQUE DO TRUNK: GIRO COM A MÃO AMARRADA NA CORDA
// ==========================================
class OndaCircularTrunk {
  constructor(dono, raioMax, danoBase, buffadoNaTerra = false) {
    this.dono = dono;
    this.raioMax = raioMax;
    this.danoBase = danoBase;
    this.buffadoNaTerra = buffadoNaTerra;
    this.vida = 15;
    this.vidaMax = 15;
    this.atingidos = [];
    this.anguloInicio = dono.angulo;

    for (let k = 0; k < 10; k++) {
      let ang = (TWO_PI / 10) * k;
      particulas.push({
        x: dono.x + cos(ang) * (raioMax * 0.75),
        y: dono.y + sin(ang) * (raioMax * 0.75),
        vx: cos(ang + HALF_PI) * 3,
        vy: sin(ang + HALF_PI) * 3,
        tam: random(5, 9),
        cor: buffadoNaTerra ? color(195, 95, 255, 220) : color(85, 210, 75, 220),
        vida: 15
      });
    }
  }

  atualizar(todosBrawlers) {
    this.vida--;
    let progresso = 1 - this.vida / this.vidaMax;
    let raioAtual = lerp(35, this.raioMax, progresso);

    for (let b of todosBrawlers) {
      if (b !== this.dono && b.time !== this.dono.time && b.vida > 0 && !this.atingidos.includes(b)) {
        let d = dist(this.dono.x, this.dono.y, b.x, b.y);
        if (d <= raioAtual + b.raio) {
          this.atingidos.push(b);
          let ehPontaCritica = d >= this.raioMax * 0.72;
          let danoFinal = ehPontaCritica ? this.danoBase * 2 : this.danoBase;

          let corDano = this.buffadoNaTerra ? color(205, 125, 255) : color(255, 255, 255);
          b.receberDano(danoFinal, corDano, ehPontaCritica);

          let cargaGanho = ehPontaCritica ? (100 / 7) : (100 / 8);
          this.dono.superCarga = min(100, this.dono.superCarga + cargaGanho);
        }
      }
    }

    for (let p of projeteis) {
      if (p.estilo === "RATO" && p.time !== this.dono.time && p.vida > 0 && !this.atingidos.includes(p)) {
        let d = dist(this.dono.x, this.dono.y, p.x, p.y);
        if (d <= raioAtual + p.raio) {
          this.atingidos.push(p);
          p.receberDanoRato(this.danoBase);
        }
      }
    }
  }

  desenhar() {
    push();
    translate(this.dono.x, this.dono.y);
    let progresso = 1 - this.vida / this.vidaMax;
    let opacidade = map(this.vida, 0, this.vidaMax, 0, 235);
    let rot = this.anguloInicio + progresso * TWO_PI * 1.3;
    rotate(rot);

    noFill();
    strokeWeight(12);
    stroke(this.buffadoNaTerra ? color(195, 65, 240, opacidade * 0.55) : color(230, 50, 140, opacidade * 0.45));
    arc(0, 0, this.raioMax * 1.85, this.raioMax * 1.85, -0.5, PI * 0.95);

    strokeWeight(4.5);
    stroke(this.buffadoNaTerra ? color(235, 150, 255, opacidade) : color(255, 220, 70, opacidade));
    arc(0, 0, this.raioMax * 1.96, this.raioMax * 1.96, -0.35, PI * 0.85);

    noStroke();
    fill(90, 205, 70, opacidade);
    ellipse(this.raioMax * 0.88, -14, 13, 7);
    ellipse(this.raioMax * 0.76, -28, 11, 6);

    pop();
  }
}

// ==========================================
// PROJÉTEIS (ASH, RATOS ROBÓTICOS DESTRUTÍVEIS E BALAS DO COLT)
// ==========================================
class Projetil {
  constructor(x, y, angulo, vel, vida, dano, time, estilo, dono) {
    this.x = x;
    this.y = y;
    this.angulo = angulo;
    this.vel = vel;
    this.vida = vida;
    this.dano = dano;
    this.time = time;
    this.estilo = estilo;
    this.dono = dono;
    this.vxExtra = 0;
    this.vyExtra = 0;
    this.desvioTimer = 0;
    this.anguloDesvio = 0;
    this.tempoEspalhar = 0;
    this.atingidos = [];

    if (this.estilo === "RATO") {
      this.hpRatoMax = 400;
      this.hpRato = 400;
      this.raio = 13;
    } else {
      this.raio = 10;
    }
  }

  receberDanoRato(qtd) {
    if (this.estilo !== "RATO" || this.vida <= 0) return;
    this.hpRato -= qtd;
    criarTextoDano(this.x, this.y - 18, "-" + qtd, color(255, 230, 120), false);

    if (this.hpRato <= 0) {
      this.vida = 0;
      for (let k = 0; k < 8; k++) {
        particulas.push({
          x: this.x,
          y: this.y,
          vx: random(-3, 3),
          vy: random(-3, 3),
          tam: random(4, 8),
          cor: color(165, 180, 198, 230),
          vida: 14
        });
      }
    }
  }

  colideObstaculoRato(px, py) {
    for (let o of obstaculos) {
      let maisProxX = constrain(px, o.x, o.x + o.w);
      let maisProxY = constrain(py, o.y, o.y + o.h);
      if (dist(px, py, maisProxX, maisProxY) < 9) {
        return true;
      }
    }
    return false;
  }

  atualizar(todosBrawlers) {
    if (this.estilo === "RATO") {
      let alvoMaisProximo = null;
      let menorDist = Infinity;
      for (let b of todosBrawlers) {
        if (b !== this.dono && b.time !== this.time && b.vida > 0) {
          let d = dist(this.x, this.y, b.x, b.y);
          if (d < menorDist) {
            menorDist = d;
            alvoMaisProximo = b;
          }
        }
      }

      if (this.tempoEspalhar > 0) {
        this.tempoEspalhar--;
        if (alvoMaisProximo) {
          this.angulo = atan2(alvoMaisProximo.y - this.y, alvoMaisProximo.x - this.x);
        }
      } else {
        if (alvoMaisProximo) {
          let angAlvo = atan2(alvoMaisProximo.y - this.y, alvoMaisProximo.x - this.x);
          if (this.desvioTimer > 0) {
            this.desvioTimer--;
            this.angulo = this.anguloDesvio;
          } else {
            this.angulo = angAlvo;
          }
        }

        let sepX = 0;
        let sepY = 0;
        for (let outro of projeteis) {
          if (outro !== this && outro.estilo === "RATO" && outro.vida > 0) {
            let dRatos = dist(this.x, this.y, outro.x, outro.y);
            if (dRatos > 0 && dRatos < 32) {
              let forca = (32 - dRatos) / 32;
              sepX += ((this.x - outro.x) / dRatos) * forca * 1.4;
              sepY += ((this.y - outro.y) / dRatos) * forca * 1.4;
            }
          }
        }

        let vx = cos(this.angulo) * this.vel + sepX;
        let vy = sin(this.angulo) * this.vel + sepY;

        let nx = constrain(this.x + vx, 25, mundoLargura - 25);
        let ny = constrain(this.y + vy, 52, mundoAltura - 25);

        if (!this.colideObstaculoRato(nx, ny)) {
          this.x = nx;
          this.y = ny;
        } else {
          let moveu = false;
          if (!this.colideObstaculoRato(nx, this.y)) {
            this.x = nx;
            moveu = true;
          }
          if (!this.colideObstaculoRato(this.x, ny)) {
            this.y = ny;
            moveu = true;
          }

          if (!moveu) {
            let angEsq = this.angulo - HALF_PI;
            let angDir = this.angulo + HALF_PI;
            if (alvoMaisProximo) {
              let distEsq = dist(this.x + cos(angEsq) * 20, this.y + sin(angEsq) * 20, alvoMaisProximo.x, alvoMaisProximo.y);
              let distDir = dist(this.x + cos(angDir) * 20, this.y + sin(angDir) * 20, alvoMaisProximo.x, alvoMaisProximo.y);
              this.anguloDesvio = distEsq < distDir ? angEsq : angDir;
            } else {
              this.anguloDesvio = random() > 0.5 ? angDir : angEsq;
            }
            this.desvioTimer = 14;
            this.angulo = this.anguloDesvio;
          }
        }
      }
    } else {
      this.x += cos(this.angulo) * this.vel + this.vxExtra;
      this.y += sin(this.angulo) * this.vel + this.vyExtra;

      for (let i = obstaculos.length - 1; i >= 0; i--) {
        let o = obstaculos[i];
        if (this.x > o.x && this.x < o.x + o.w && this.y > o.y && this.y < o.y + o.h) {
          if (this.estilo === "COLT_SUPER") {
            obstaculos.splice(i, 1);
            for (let k = 0; k < 8; k++) {
              particulas.push({
                x: this.x,
                y: this.y,
                vx: random(-4, 4),
                vy: random(-4, 4),
                tam: random(6, 11),
                cor: color(175, 115, 60),
                vida: 18
              });
            }
            this.vida = 0;
            return;
          } else {
            this.vida = 0;
            return;
          }
        }
      }
    }

    this.vida--;

    let raioColisao = this.estilo === "COLT_SUPER" ? 16 : (this.estilo === "COLT_BALA" ? 10 : 14);

    if (this.estilo !== "RATO") {
      for (let outro of projeteis) {
        if (outro.estilo === "RATO" && outro.time !== this.time && outro.vida > 0 && !this.atingidos.includes(outro)) {
          if (dist(this.x, this.y, outro.x, outro.y) < outro.raio + raioColisao) {
            outro.receberDanoRato(this.dano);
            if (this.estilo === "COLT_BALA") {
              this.vida = 0;
              return;
            } else {
              this.atingidos.push(outro);
            }
          }
        }
      }
    }

    for (let a of todosBrawlers) {
      if (a !== this.dono && a.time !== this.time && a.vida > 0 && !this.atingidos.includes(a)) {
        if (dist(this.x, this.y, a.x, a.y) < a.raio + raioColisao) {
          let ehCritico = false;
          let corDano = color(255, 255, 255);

          if (this.estilo === "ASH_ATAQUE" && this.dono.obterEtapaFuria() === 3) {
            ehCritico = true;
          } else if (this.estilo === "COLT_SUPER") {
            ehCritico = true;
          }

          a.receberDano(this.dano, corDano, ehCritico);

          if (this.estilo === "RATO") {
            this.dono.superCarga = min(100, this.dono.superCarga + 6);
            this.dono.ganharFuria(15);

            for (let k = 0; k < 10; k++) {
              particulas.push({
                x: this.x,
                y: this.y,
                vx: random(-4, 4),
                vy: random(-4, 4),
                tam: random(5, 10),
                cor: k % 2 === 0 ? color(255, 160, 20) : color(160, 175, 195),
                vida: 16
              });
            }
            this.vida = 0;
            break;
          } else if (this.estilo === "COLT_BALA") {
            this.dono.superCarga = min(100, this.dono.superCarga + (100 / 12));
            this.vida = 0;
            break;
          } else if (this.estilo === "COLT_SUPER") {
            this.atingidos.push(a);
          } else {
            this.dono.superCarga = min(100, this.dono.superCarga + (100 / 7));
            this.dono.ganharFuria(5);
            this.atingidos.push(a);
          }
        }
      }
    }
  }

  desenhar() {
    push();
    translate(this.x, this.y);
    rotate(this.angulo);

    if (this.estilo === "ASH_ATAQUE") {
      noStroke();
      let etapaFuria = this.dono.obterEtapaFuria();
      fill(etapaFuria === 3 ? color(255, 55, 45, 225) : (etapaFuria === 2 ? color(255, 165, 45, 220) : color(100, 225, 255, 220)));
      arc(0, 0, 46, 46, -PI / 3, PI / 3);
      fill(255, 255, 255, 200);
      arc(4, 0, 28, 28, -PI / 4, PI / 4);
    } else if (this.estilo === "RATO") {
      noStroke();
      fill(0, 0, 0, 70);
      ellipse(-1, 3, 21, 16);

      stroke(70, 78, 90);
      strokeWeight(1.8);
      line(-6, 0, -14, sin(frameCount * 0.35) * 3);
      noStroke();
      fill(this.time === "AZUL" ? color(80, 220, 255) : color(255, 75, 60));
      ellipse(-15, sin(frameCount * 0.35) * 3, 4.5, 4.5);

      push();
      translate(-2, 0);
      let giroCorda = sin(frameCount * 0.35);
      stroke(170, 125, 25);
      strokeWeight(2);
      fill(245, 200, 50);
      ellipse(0, -6 * giroCorda, 5, 4);
      ellipse(0, 6 * giroCorda, 5, 4);
      pop();

      stroke(30, 35, 45);
      strokeWeight(1.8);
      fill(175, 186, 200);
      ellipse(1, -8.5, 7.5, 6.5);
      ellipse(1, 8.5, 7.5, 6.5);
      fill(95, 105, 120);
      noStroke();
      ellipse(1, -8.5, 3, 3);
      ellipse(1, 8.5, 3, 3);

      stroke(28, 32, 42);
      strokeWeight(2);
      fill(135, 148, 165);
      rect(-9, -7.5, 18, 15, 6);

      noStroke();
      fill(105, 118, 134);
      rect(-6, -4.5, 10, 9, 3);
      fill(210, 220, 232);
      ellipse(-5, -3.5, 2);
      ellipse(-5, 3.5, 2);

      stroke(28, 32, 42);
      strokeWeight(1.8);
      fill(165, 178, 195);
      triangle(7, -5.5, 7, 5.5, 13.5, 0);

      noStroke();
      fill(this.time === "AZUL" ? color(70, 230, 255) : color(255, 70, 55));
      ellipse(13, 0, 4, 4);

      fill(20, 24, 32);
      rect(4, -5.2, 3.5, 3.5, 1);
      rect(4, 1.7, 3.5, 3.5, 1);
      fill(this.time === "AZUL" ? color(90, 245, 255) : color(255, 220, 50));
      ellipse(6, -3.5, 2.2, 2.2);
      ellipse(6, 3.5, 2.2, 2.2);
    } else if (this.estilo === "COLT_BALA") {
      noStroke();
      fill(255, 210, 50, 180);
      ellipse(-6, 0, 16, 6);
      fill(255, 245, 180);
      stroke(180, 110, 20);
      strokeWeight(1.5);
      rect(-7, -3.5, 16, 7, 3);
    } else if (this.estilo === "COLT_SUPER") {
      noStroke();
      fill(255, 120, 30, 170);
      ellipse(-10, 0, 26, 12);
      fill(255, 240, 120);
      stroke(200, 80, 15);
      strokeWeight(2);
      rect(-11, -6, 24, 12, 5);
    }
    pop();

    if (this.estilo === "RATO" && this.hpRato > 0) {
      noStroke();
      fill(0, 195);
      rect(this.x - 16, this.y - 24, 32, 6, 2);
      fill(this.time === "AZUL" ? color(45, 165, 255) : color(245, 55, 55));
      rect(this.x - 15, this.y - 23, map(this.hpRato, 0, this.hpRatoMax, 0, 30), 4, 1.5);
    }
  }
}

class Obstaculo {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  desenhar() {
    fill(175, 105, 50);
    stroke(80, 45, 15);
    strokeWeight(3);
    rect(this.x, this.y, this.w, this.h, 6);
    line(this.x + 5, this.y + 5, this.x + this.w - 5, this.y + this.h - 5);
    line(this.x + this.w - 5, this.y + 5, this.x + 5, this.y + this.h - 5);
  }
}

// ==========================================
// CONTROLES VIRTUAIS PARA CELULAR (MULTITOUCH)
// ==========================================
let ehMobile = false;
let joyEsq = { ativo: false, id: -1, baseX: 115, baseY: 475, stickX: 115, stickY: 475, dx: 0, dy: 0, raio: 58 };
let joyDir = { ativo: false, id: -1, baseX: 735, baseY: 475, stickX: 735, stickY: 475, dx: 0, dy: 0, raio: 52 };
let joySuper = { ativo: false, id: -1, baseX: 625, baseY: 515, stickX: 625, stickY: 515, dx: 0, dy: 0, raio: 38 };

function obterPosicaoTouchCanvas(t) {
  let rect = cnv.elt.getBoundingClientRect();
  return {
    x: ((t.clientX - rect.left) * width) / rect.width,
    y: ((t.clientY - rect.top) * height) / rect.height
  };
}

function mirarInimigoMaisProximo() {
  if (!jogador) return;
  if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === jogador) {
    let golAdvX = jogador.time === "AZUL" ? mundoLargura - 25 : 25;
    jogador.angulo = atan2(mundoAltura / 2 - jogador.y, golAdvX - jogador.x);
    return;
  }
  let alvo = null;
  let menorDist = 420;
  for (let ini of inimigos) {
    if (ini.vida > 0) {
      let d = dist(jogador.x, jogador.y, ini.x, ini.y);
      if (d < menorDist) {
        menorDist = d;
        alvo = ini;
      }
    }
  }
  if (alvo) {
    jogador.angulo = atan2(alvo.y - jogador.y, alvo.x - jogador.x);
  }
}

function registrarEventosTouchCanvas() {
  if (!cnv || !cnv.elt) return;

  cnv.elt.addEventListener("touchstart", function (e) {
    ehMobile = true;
    if (estadoJogo === "NOME_INICIAL") return;
    e.preventDefault();

    let listaToques = Array.from(e.touches);

    if (estadoJogo !== "JOGANDO") {
      let t = e.changedTouches[0] || listaToques[listaToques.length - 1];
      if (t) {
        let pt = obterPosicaoTouchCanvas(t);
        ultimoToqueY = pt.y;
        tratarCliqueCanvas({ button: 0 }, pt.x, pt.y);
      }
      return;
    }

    for (let t of Array.from(e.changedTouches)) {
      let idToque = t.identifier;
      let pt = obterPosicaoTouchCanvas(t);

      if (pt.x < width * 0.45 && !joyEsq.ativo) {
        joyEsq.ativo = true;
        joyEsq.id = idToque;
        joyEsq.baseX = constrain(pt.x, 75, 220);
        joyEsq.baseY = constrain(pt.y, 340, height - 70);
        joyEsq.stickX = joyEsq.baseX;
        joyEsq.stickY = joyEsq.baseY;
        joyEsq.dx = 0;
        joyEsq.dy = 0;
      } else if (dist(pt.x, pt.y, joySuper.baseX, joySuper.baseY) <= 58 && !joySuper.ativo && jogador && jogador.superCarga >= 100) {
        joySuper.ativo = true;
        joySuper.id = idToque;
        joySuper.stickX = joySuper.baseX;
        joySuper.stickY = joySuper.baseY;
        joySuper.dx = 0;
        joySuper.dy = 0;
        modoMira = "SUPER";
        mirarInimigoMaisProximo();
      } else if (pt.x >= width * 0.45 && !joyDir.ativo) {
        joyDir.ativo = true;
        joyDir.id = idToque;
        joyDir.stickX = joyDir.baseX;
        joyDir.stickY = joyDir.baseY;
        joyDir.dx = 0;
        joyDir.dy = 0;
        modoMira = "ATAQUE";
        mirarInimigoMaisProximo();
      }
    }
  }, { passive: false });

  cnv.elt.addEventListener("touchmove", function (e) {
    if (estadoJogo === "NOME_INICIAL") return;
    e.preventDefault();

    if (estadoJogo === "SELECAO_BRAWLER") {
      let t = e.changedTouches[0];
      if (t) {
        let pt = obterPosicaoTouchCanvas(t);
        let dy = ultimoToqueY - pt.y;
        ultimoToqueY = pt.y;
        let totalLinhas = ceil(DADOS_BRAWLERS.length / 3);
        let maxScroll = max(0, totalLinhas * 172 - 480);
        scrollBrawlers = constrain(scrollBrawlers + dy, 0, maxScroll);
      }
      return;
    }

    if (estadoJogo !== "JOGANDO") return;

    for (let t of Array.from(e.changedTouches)) {
      let idToque = t.identifier;
      let pt = obterPosicaoTouchCanvas(t);

      if (joyEsq.ativo && idToque === joyEsq.id) {
        let dx = pt.x - joyEsq.baseX;
        let dy = pt.y - joyEsq.baseY;
        let d = sqrt(dx * dx + dy * dy);
        if (d > joyEsq.raio) {
          dx = (dx / d) * joyEsq.raio;
          dy = (dy / d) * joyEsq.raio;
        }
        joyEsq.stickX = joyEsq.baseX + dx;
        joyEsq.stickY = joyEsq.baseY + dy;
        joyEsq.dx = dx / joyEsq.raio;
        joyEsq.dy = dy / joyEsq.raio;
      } else if (joyDir.ativo && idToque === joyDir.id) {
        let dx = pt.x - joyDir.baseX;
        let dy = pt.y - joyDir.baseY;
        let d = sqrt(dx * dx + dy * dy);
        if (d > joyDir.raio) {
          dx = (dx / d) * joyDir.raio;
          dy = (dy / d) * joyDir.raio;
        }
        joyDir.stickX = joyDir.baseX + dx;
        joyDir.stickY = joyDir.baseY + dy;
        joyDir.dx = dx / joyDir.raio;
        joyDir.dy = dy / joyDir.raio;
        modoMira = "ATAQUE";
        if (jogador && d > 10) {
          jogador.angulo = atan2(dy, dx);
        }
      } else if (joySuper.ativo && idToque === joySuper.id) {
        let dx = pt.x - joySuper.baseX;
        let dy = pt.y - joySuper.baseY;
        let d = sqrt(dx * dx + dy * dy);
        if (d > joySuper.raio) {
          dx = (dx / d) * joySuper.raio;
          dy = (dy / d) * joySuper.raio;
        }
        joySuper.stickX = joySuper.baseX + dx;
        joySuper.stickY = joySuper.baseY + dy;
        joySuper.dx = dx / joySuper.raio;
        joySuper.dy = dy / joySuper.raio;
        modoMira = "SUPER";
        if (jogador && d > 8) {
          jogador.angulo = atan2(dy, dx);
        }
      }
    }
  }, { passive: false });

  function finalizarToques(e) {
    if (estadoJogo === "NOME_INICIAL") return;
    e.preventDefault();
    for (let t of Array.from(e.changedTouches)) {
      let idToque = t.identifier;

      if (joyEsq.ativo && idToque === joyEsq.id) {
        joyEsq.ativo = false;
        joyEsq.id = -1;
        joyEsq.baseX = 115;
        joyEsq.baseY = 475;
        joyEsq.stickX = joyEsq.baseX;
        joyEsq.stickY = joyEsq.baseY;
        joyEsq.dx = 0;
        joyEsq.dy = 0;
      }

      if (joyDir.ativo && idToque === joyDir.id) {
        if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
          if (abs(joyDir.dx) < 0.15 && abs(joyDir.dy) < 0.15) {
            mirarInimigoMaisProximo();
          }
          jogador.atacar();
        }
        joyDir.ativo = false;
        joyDir.id = -1;
        joyDir.stickX = joyDir.baseX;
        joyDir.stickY = joyDir.baseY;
        joyDir.dx = 0;
        joyDir.dy = 0;
      }

      if (joySuper.ativo && idToque === joySuper.id) {
        if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
          if (abs(joySuper.dx) < 0.15 && abs(joySuper.dy) < 0.15) {
            mirarInimigoMaisProximo();
          }
          jogador.usarSuper();
        }
        modoMira = "ATAQUE";
        joySuper.ativo = false;
        joySuper.id = -1;
        joySuper.stickX = joySuper.baseX;
        joySuper.stickY = joySuper.baseY;
        joySuper.dx = 0;
        joySuper.dy = 0;
      }
    }
  }

  cnv.elt.addEventListener("touchend", finalizarToques, { passive: false });
  cnv.elt.addEventListener("touchcancel", finalizarToques, { passive: false });
}

function desenharControlesMobile() {
  if (!ehMobile && touches.length === 0) return;

  push();

  noStroke();
  fill(255, 255, 255, 35);
  ellipse(joyEsq.baseX, joyEsq.baseY, joyEsq.raio * 2);
  stroke(255, 255, 255, 110);
  strokeWeight(3);
  noFill();
  ellipse(joyEsq.baseX, joyEsq.baseY, joyEsq.raio * 2);

  fill(80, 195, 255, 210);
  stroke(255);
  strokeWeight(2.5);
  ellipse(joyEsq.stickX, joyEsq.stickY, 46);

  fill(255, 75, 75, 45);
  stroke(255, 110, 110, 140);
  strokeWeight(3);
  ellipse(joyDir.baseX, joyDir.baseY, joyDir.raio * 2);

  fill(255, 70, 70, 225);
  stroke(255);
  strokeWeight(2.5);
  ellipse(joyDir.stickX, joyDir.stickY, 46);

  noStroke();
  fill(255);
  textStyle(BOLD);
  textSize(10);
  text("ATACAR", joyDir.stickX, joyDir.stickY);

  let superPronta = jogador && jogador.superCarga >= 100;
  fill(superPronta ? color(255, 210, 0, 70) : color(80, 80, 90, 50));
  stroke(superPronta ? color(255, 225, 40, 220) : color(150, 150, 160, 110));
  strokeWeight(3);
  ellipse(joySuper.baseX, joySuper.baseY, joySuper.raio * 2);

  if (jogador && !superPronta) {
    noFill();
    stroke(255, 175, 0, 210);
    strokeWeight(4);
    let angCarga = map(jogador.superCarga, 0, 100, 0, TWO_PI);
    arc(joySuper.baseX, joySuper.baseY, joySuper.raio * 2, joySuper.raio * 2, -HALF_PI, -HALF_PI + angCarga);
  }

  fill(superPronta ? color(255, 200, 0, 235) : color(105, 105, 115, 190));
  stroke(255, superPronta ? 240 : 120);
  strokeWeight(2);
  ellipse(joySuper.stickX, joySuper.stickY, 38);

  noStroke();
  fill(superPronta ? color(25) : color(220));
  textSize(9);
  text("SUPER", joySuper.stickX, joySuper.stickY);

  pop();
}

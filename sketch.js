let estadoJogo = "NOME_INICIAL"; // NOME_INICIAL, MENU, SELECAO_BRAWLER, DETALHES_BRAWLER, SELECAO_MODO, INTRO_FUTEBRAWL, JOGANDO, FIM
let modoSelecionado = "COMBATE"; // COMBATE, FUTEBRAWL
let personagemSelecionado = "ASH"; // ASH, TRUNK, COLT, BARLEY
let brawlerInspecionado = "ASH";
let scrollBrawlers = 0;
let vencedor = "";
let estatisticasPartida = [];

// Sistema de Tela Cheia / Proporção no PC (tecla ESC)
let modoTelaCheia = false;

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
let tempoFutebrawl = 7200; // 2 minutos (120s * 60fps)
let prorrogacaoFutebrawl = false;
let tempoProrrogacaoFutebrawl = 3600; // 1 minuto (60s * 60fps)
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
    descCurta: "Fúria em 3 etapas (+dano e +vel)",
    bio: "Ash fica furioso com toda a sujeira que precisa limpar no castelo. Quanto mais apanha ou bate, mais rápido e forte ele fica!"
  },
  {
    id: "TRUNK",
    nome: "TRUNK",
    classe: "TANQUE",
    raridade: "ÉPICO",
    corFaixa: [175, 55, 225],
    saude: "4800",
    ataque: "650",
    superNome: "MOVIDO A VINGANÇA",
    descCurta: "Terra dá +dano e +vel • Super ricocheteia",
    bio: "Trunk é uma árvore de aparência um tanto peculiar. Será que é porque, na verdade, estamos falando de uma colônia de formigas superinteligentes controlando uma árvore mecânica? Não, não pode ser. Que absurdo!"
  },
  {
    id: "COLT",
    nome: "COLT",
    classe: "DESTRUIDOR",
    raridade: "RARO",
    corFaixa: [50, 205, 50],
    saude: "2800",
    ataque: "6 x 320",
    superNome: "TREM-BALA",
    descCurta: "Rajada rápida de 6 balas",
    bio: "Todo mundo que visita o Starr Park quer ver o Colt de perto, pois o cara é boa-pinta, carismático e cheio de truques com suas pistolas. A única que não entende o sucesso dele é a Shelly."
  },
  {
    id: "BARLEY",
    nome: "BARLEY",
    classe: "DETONADOR",
    raridade: "RARO",
    corFaixa: [50, 205, 50],
    saude: "2600",
    ataque: "680",
    superNome: "SAIDEIRA",
    descCurta: "Garrafas por cima das paredes",
    bio: "Um barman-robô projetado para preparar bebidas e entreter clientes, Barley faz questão de deixar o bar sempre brilhando. Se precisar, ele usa os baderneiros como pano de chão."
  }
];

function obterInfoBrawler(id) {
  return DADOS_BRAWLERS.find((b) => b.id === id) || DADOS_BRAWLERS[0];
}

// ==========================================
// TELA CHEIA PROPORCIONAL NO PC (TECLA ESC)
// ==========================================
function alternarTelaCheiaProporcional() {
  modoTelaCheia = !modoTelaCheia;
  aplicarEscalaProporcionalCanvas();
}

function aplicarEscalaProporcionalCanvas() {
  if (!cnv || !cnv.elt) return;

  if (modoTelaCheia) {
    let fatorEscala = min(window.innerWidth / width, window.innerHeight / height);
    let novaLargura = Math.floor(width * fatorEscala);
    let novaAltura = Math.floor(height * fatorEscala);

    cnv.elt.style.position = "fixed";
    cnv.elt.style.left = Math.floor((window.innerWidth - novaLargura) / 2) + "px";
    cnv.elt.style.top = Math.floor((window.innerHeight - novaAltura) / 2) + "px";
    cnv.elt.style.width = novaLargura + "px";
    cnv.elt.style.height = novaAltura + "px";
    cnv.elt.style.zIndex = "9990";
    cnv.elt.style.boxShadow = "0 0 0 9999px #080e1c";
  } else {
    cnv.elt.style.position = "";
    cnv.elt.style.left = "";
    cnv.elt.style.top = "";
    cnv.elt.style.width = width + "px";
    cnv.elt.style.height = height + "px";
    cnv.elt.style.zIndex = "";
    cnv.elt.style.boxShadow = "";
  }

  atualizarPosicaoElementosNickname();
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
  inputNickname.style("z-index", "9995");

  inputNickname.elt.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.preventDefault();
      alternarTelaCheiaProporcional();
      return;
    }
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
  btnConfirmarNome.style("z-index", "9995");
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

  window.addEventListener("resize", () => {
    aplicarEscalaProporcionalCanvas();
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.code === "Escape") {
      e.preventDefault();
      alternarTelaCheiaProporcional();
      return;
    }

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

  if (!ehMobile) {
    fill(165, 205, 255, 210);
    textAlign(RIGHT, CENTER);
    textSize(11);
    text(modoTelaCheia ? "ESC: Sair Tela Cheia" : "ESC: Tela Cheia", width - 16, 27);
    textAlign(CENTER, CENTER);
  }

  noStroke();
  fill(10, 25, 60, 140);
  ellipse(width / 2, 412, 225, 64);
  fill(255, 225, 70, 190);
  ellipse(width / 2, 407, 185, 48);
  fill(255, 245, 160, 220);
  ellipse(width / 2, 407, 130, 32);

  let infoAtual = obterInfoBrawler(personagemSelecionado);

  fill(0, 160);
  textSize(32);
  text(infoAtual.nome, width / 2 + 2, 104);
  fill(255);
  text(infoAtual.nome, width / 2, 102);

  fill(175, 215, 255);
  textSize(13);
  text(infoAtual.classe + " • " + infoAtual.descCurta, width / 2, 130);

  desenharBrawler3DFrontal(personagemSelecionado, width / 2, 305, 1.48);

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
  let subtituloMapa = modoSelecionado === "COMBATE" ? "Caverna Convulsiva (10)" : "Tiro de meta (2 min)";

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

function desenharBrawler3DFrontal(tipo, x, y, escala) {
  if (tipo === "ASH") {
    desenharAsh3DFrontal(x, y, escala);
  } else if (tipo === "COLT") {
    desenharColt3DFrontal(x, y, escala);
  } else if (tipo === "BARLEY") {
    desenharBarley3DFrontal(x, y, escala);
  } else if (tipo === "TRUNK") {
    desenharTrunk3DFrontal(x, y, escala);
  }
}

// ==========================================
// MODELO 3D FRONTAL DO ASH
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
// MODELO 3D FRONTAL DO COLT
// ==========================================
function desenharColt3DFrontal(x, y, escala) {
  push();
  translate(x, y);
  scale(escala);

  let respirar = sin(frameCount * 0.06) * 2.2;
  let balancoArma = sin(frameCount * 0.05) * 0.05;

  noStroke();
  fill(8, 22, 58, 175);
  ellipse(0, 74, 102, 24);

  fill(245, 195, 45);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  ellipse(-27, 62, 14, 14);
  line(-34, 62, -22, 62);

  fill(46, 36, 86);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-24, 34, 18, 24, 4);
  rect(6, 34, 18, 24, 4);

  fill(82, 54, 142);
  beginShape();
  vertex(-26, 52);
  vertex(-6, 52);
  vertex(-6, 70);
  vertex(-32, 70);
  vertex(-30, 62);
  endShape(CLOSE);

  beginShape();
  vertex(6, 52);
  vertex(26, 52);
  vertex(30, 62);
  vertex(32, 70);
  vertex(6, 70);
  endShape(CLOSE);

  noFill();
  stroke(135, 98, 205);
  strokeWeight(2);
  line(-22, 56, -16, 61);
  line(-16, 61, -10, 56);
  line(10, 56, 16, 61);
  line(16, 61, 22, 56);

  push();
  translate(0, respirar * 0.45);

  fill(118, 152, 232);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-26, -14, 52, 46, 10);

  fill(88, 62, 155);
  beginShape();
  vertex(-26, -14);
  vertex(-8, -14);
  vertex(-4, 8);
  vertex(-4, 32);
  vertex(-26, 32);
  endShape(CLOSE);

  beginShape();
  vertex(26, -14);
  vertex(8, -14);
  vertex(4, 8);
  vertex(4, 32);
  vertex(26, 32);
  endShape(CLOSE);

  fill(248, 206, 174);
  noStroke();
  triangle(-8, -14, 8, -14, 0, 5);

  fill(248, 202, 48);
  stroke(16, 20, 32);
  strokeWeight(1.8);
  ellipse(14, 4, 7, 7);
  ellipse(14, 16, 7, 7);

  fill(225, 42, 65);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  beginShape();
  vertex(-18, -16);
  vertex(18, -16);
  vertex(14, -6);
  vertex(0, -3);
  vertex(-14, -6);
  endShape(CLOSE);

  fill(142, 82, 42);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  rect(-28, 26, 56, 11, 4);

  beginShape();
  vertex(-34, 28);
  vertex(-22, 28);
  vertex(-20, 48);
  vertex(-32, 46);
  endShape(CLOSE);

  fill(165, 178, 198);
  rect(-10, 24, 20, 15, 3);
  fill(95, 108, 128);
  noStroke();
  rect(-5, 28, 10, 7, 1.5);

  fill(252, 212, 180);
  stroke(16, 20, 32);
  strokeWeight(3);
  beginShape();
  vertex(-24, -56);
  vertex(24, -56);
  vertex(25, -26);
  vertex(12, -13);
  vertex(-12, -13);
  vertex(-25, -26);
  endShape(CLOSE);

  fill(228, 42, 68);
  beginShape();
  vertex(-26, -48);
  vertex(-18, -46);
  vertex(-17, -24);
  vertex(-26, -26);
  endShape(CLOSE);

  beginShape();
  vertex(26, -48);
  vertex(18, -46);
  vertex(17, -24);
  vertex(26, -26);
  endShape(CLOSE);

  fill(228, 42, 68);
  stroke(16, 20, 32);
  strokeWeight(3);
  beginShape();
  vertex(-26, -48);
  bezierVertex(-32, -74, -12, -88, 4, -84);
  bezierVertex(18, -82, 30, -68, 26, -48);
  bezierVertex(18, -54, 6, -54, -4, -48);
  bezierVertex(-14, -54, -22, -52, -26, -48);
  endShape(CLOSE);

  noStroke();
  fill(252, 95, 115, 160);
  ellipse(-4, -72, 22, 10);

  fill(16, 20, 32);
  push();
  translate(-10, -45);
  rotate(0.2);
  rect(-8, -3, 16, 5.5, 2.5);
  pop();

  push();
  translate(11, -43);
  rotate(-0.22);
  rect(-7, -3, 14, 5.5, 2.5);
  pop();

  fill(255);
  stroke(16, 20, 32);
  strokeWeight(2.2);
  ellipse(-10, -35, 12, 14);
  ellipse(10, -34, 11, 13);

  fill(16, 20, 32);
  noStroke();
  ellipse(-10, -35, 6, 8);
  ellipse(9, -34, 5.5, 7.5);
  fill(255);
  ellipse(-11.5, -37, 2.2, 2.2);
  ellipse(7.5, -36, 2, 2);

  noFill();
  stroke(16, 20, 32);
  strokeWeight(2.2);
  arc(0, -24, 16, 9, 0.15, PI - 0.25);

  stroke(225, 158, 122);
  strokeWeight(2.2);
  line(-3, -18, 3, -14);
  line(3, -18, -3, -14);

  pop();

  push();
  translate(-32, -4 + respirar * 0.3);
  rotate(-0.12 + balancoArma);

  fill(118, 152, 232);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  rect(-14, -4, 14, 22, 6);

  fill(78, 96, 128);
  rect(-22, -38, 13, 30, 3);
  fill(125, 148, 185);
  noStroke();
  rect(-20, -36, 4, 24, 1.5);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  fill(52, 64, 88);
  ellipse(-15.5, -38, 12, 6);

  fill(252, 212, 180);
  ellipse(-12, -4, 14, 14);
  pop();

  push();
  translate(32, -4 + respirar * 0.3);
  rotate(0.12 - balancoArma);

  fill(118, 152, 232);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  rect(0, -4, 14, 22, 6);

  fill(78, 96, 128);
  rect(9, -38, 13, 30, 3);
  fill(125, 148, 185);
  noStroke();
  rect(11, -36, 4, 24, 1.5);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  fill(52, 64, 88);
  ellipse(15.5, -38, 12, 6);

  fill(252, 212, 180);
  ellipse(12, -4, 14, 14);
  pop();

  pop();
}

// ==========================================
// MODELO 3D FRONTAL DO BARLEY
// ==========================================
function desenharBarley3DFrontal(x, y, escala) {
  push();
  translate(x, y);
  scale(escala);

  let respirar = sin(frameCount * 0.06) * 2.2;
  let balancoGarrafa = sin(frameCount * 0.05) * 0.04;

  noStroke();
  fill(8, 22, 58, 175);
  ellipse(0, 74, 108, 24);

  fill(96, 68, 158);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-22, 32, 15, 24, 4);
  rect(7, 32, 15, 24, 4);

  fill(128, 98, 195);
  ellipse(-14.5, 42, 16, 10);
  ellipse(14.5, 42, 16, 10);

  fill(82, 54, 142);
  rect(-25, 52, 21, 18, 6);
  rect(4, 52, 21, 18, 6);

  push();
  translate(0, respirar * 0.45);

  fill(226, 202, 168);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  rect(-22, 14, 44, 20, 8);

  fill(226, 48, 62);
  stroke(16, 20, 32);
  strokeWeight(3);
  beginShape();
  vertex(-26, -14);
  vertex(26, -14);
  vertex(28, 18);
  vertex(0, 12);
  vertex(-28, 18);
  endShape(CLOSE);

  fill(175, 28, 42);
  triangle(-12, -13, 0, -7, -12, -1);
  triangle(12, -13, 0, -7, 12, -1);
  ellipse(0, -7, 7, 7);

  fill(168, 186, 212);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-26, -62, 52, 48, 22);

  fill(125, 142, 168);
  rect(-31, -44, 6, 14, 3);
  rect(25, -44, 6, 14, 3);

  fill(38, 62, 95);
  stroke(16, 20, 32);
  strokeWeight(3);
  ellipse(2, -38, 34, 32);

  fill(248, 232, 62);
  stroke(16, 20, 32);
  strokeWeight(2.4);
  ellipse(3, -38, 21, 21);

  noFill();
  stroke(16, 20, 32);
  strokeWeight(2.8);
  arc(3, -36, 10, 10, PI + 0.2, TWO_PI - 0.2);

  fill(218, 228, 245);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  beginShape();
  vertex(-24, -22);
  bezierVertex(-28, -8, -8, -4, 0, -14);
  bezierVertex(8, -4, 28, -8, 24, -22);
  bezierVertex(18, -28, 8, -25, 0, -21);
  bezierVertex(-8, -25, -18, -28, -24, -22);
  endShape(CLOSE);

  push();
  translate(-2, -62);
  rotate(-0.16);
  fill(126, 68, 165);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  rect(-16, -16, 32, 14, 8, 8, 2, 2);
  fill(78, 42, 108);
  rect(-16, -6, 32, 4);
  fill(126, 68, 165);
  ellipse(0, -1, 44, 9);
  pop();

  push();
  translate(-30, -4);
  rotate(balancoGarrafa);
  fill(145, 165, 192);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  rect(-10, -2, 12, 24, 5);

  push();
  translate(-6, 34);
  fill(72, 182, 72);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-18, -16, 36, 44, 10);

  rect(-7, -32, 14, 18, 3);
  fill(185, 122, 62);
  rect(-8, -37, 16, 7, 3);

  fill(238, 234, 208);
  noStroke();
  rect(-16, -2, 32, 18);

  stroke(16, 20, 32);
  strokeWeight(2.6);
  line(-10, 3, -3, 11);
  line(-3, 3, -10, 11);
  line(3, 3, 10, 11);
  line(10, 3, 3, 11);
  pop();

  fill(168, 186, 212);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  ellipse(-6, 12, 15, 12);
  pop();

  push();
  translate(28, -4);
  fill(145, 165, 192);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  beginShape();
  vertex(0, -2);
  vertex(14, 6);
  vertex(6, 20);
  vertex(-6, 12);
  endShape(CLOSE);

  fill(228, 208, 178);
  stroke(16, 20, 32);
  strokeWeight(2.6);
  beginShape();
  vertex(6, 4);
  vertex(22, 6);
  vertex(26, 42);
  vertex(16, 40);
  vertex(13, 45);
  vertex(4, 41);
  endShape(CLOSE);
  pop();

  pop();
  pop();
}

// ==========================================
// MODELO 3D FRONTAL DO TRUNK
// ==========================================
function desenharTrunk3DFrontal(x, y, escala) {
  push();
  translate(x, y);
  scale(escala);

  let respirar = sin(frameCount * 0.06) * 2.0;

  noStroke();
  fill(8, 22, 58, 175);
  ellipse(0, 74, 116, 26);

  fill(128, 72, 36);
  stroke(16, 20, 32);
  strokeWeight(3);
  beginShape();
  vertex(-26, 52);
  vertex(-10, 52);
  vertex(-8, 70);
  vertex(-30, 70);
  endShape(CLOSE);

  beginShape();
  vertex(10, 52);
  vertex(26, 52);
  vertex(30, 70);
  vertex(8, 70);
  endShape(CLOSE);

  push();
  translate(0, respirar * 0.4);

  push();
  rotate(-0.22);
  fill(132, 74, 38);
  stroke(16, 20, 32);
  strokeWeight(3);
  rect(-66, -42, 132, 28, 10);

  fill(78, 42, 20);
  ellipse(-62, -28, 18, 26);
  fill(35, 18, 10);
  ellipse(-62, -28, 10, 16);

  fill(215, 192, 92);
  rect(-48, -43, 8, 30, 3);
  rect(40, -43, 8, 30, 3);
  pop();

  fill(158, 94, 52);
  stroke(16, 20, 32);
  strokeWeight(3.2);
  beginShape();
  vertex(-42, -36);
  vertex(42, -36);
  vertex(34, 56);
  vertex(-34, 56);
  endShape(CLOSE);

  stroke(96, 52, 24);
  strokeWeight(2.4);
  line(-22, -16, -20, -2);
  line(24, -18, 22, -4);
  line(-18, 34, -16, 48);

  fill(18, 16, 22);
  stroke(75, 42, 18);
  strokeWeight(3);
  beginShape();
  vertex(-26, -4);
  vertex(-10, -10);
  vertex(0, -2);
  vertex(12, -10);
  vertex(26, -2);
  vertex(24, 22);
  vertex(0, 28);
  vertex(-24, 22);
  endShape(CLOSE);

  noStroke();
  fill(248, 232, 48);
  ellipse(-13, 8, 8, 7);
  ellipse(-6, 9, 8, 7);
  ellipse(10, 8, 8, 9);
  ellipse(17, 8, 8, 9);

  fill(18, 16, 22);
  ellipse(-13, 8, 3.2, 4);
  ellipse(-6, 9, 3.2, 4);
  ellipse(10, 8, 3.2, 4);
  ellipse(17, 8, 3.2, 4);

  fill(215, 196, 88);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  rect(-43, -24, 86, 9, 4);
  rect(-41, -16, 82, 8, 4);
  rect(-36, 32, 72, 9, 4);

  fill(112, 208, 62);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  beginShape();
  vertex(0, 26);
  bezierVertex(24, 24, 30, 48, 16, 62);
  vertex(0, 56);
  bezierVertex(-14, 48, -14, 28, 0, 26);
  endShape(CLOSE);
  stroke(58, 138, 32);
  strokeWeight(2);
  line(4, 32, 12, 54);

  push();
  translate(-22, -46);
  fill(28, 26, 36);
  stroke(16, 20, 32);
  strokeWeight(2.2);
  ellipse(0, 0, 14, 12);
  fill(248, 232, 48);
  noStroke();
  ellipse(-2.5, -1, 4, 4.5);
  ellipse(3, -1, 4, 4.5);
  fill(18, 16, 22);
  ellipse(-2.5, -1, 1.8, 2.2);
  ellipse(3, -1, 1.8, 2.2);
  pop();

  fill(88, 188, 48);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  beginShape();
  vertex(-26, -32);
  bezierVertex(-42, -55, -42, -78, -32, -88);
  bezierVertex(-14, -74, -6, -52, -8, -32);
  endShape(CLOSE);

  fill(118, 214, 65);
  beginShape();
  vertex(-46, -24);
  bezierVertex(-42, -46, -14, -50, -4, -34);
  bezierVertex(-16, -22, -32, -18, -46, -24);
  endShape(CLOSE);

  beginShape();
  vertex(48, -22);
  bezierVertex(44, -46, 14, -50, 4, -34);
  bezierVertex(16, -22, 34, -18, 48, -22);
  endShape(CLOSE);

  beginShape();
  vertex(-20, -34);
  bezierVertex(-10, -54, 14, -54, 22, -34);
  bezierVertex(12, -14, -10, -14, -20, -34);
  endShape(CLOSE);

  stroke(215, 196, 88);
  strokeWeight(6);
  line(-34, 34, -52, 42);
  stroke(16, 20, 32);
  strokeWeight(2.5);
  noFill();
  line(-34, 34, -52, 42);

  fill(238, 62, 138);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  ellipse(-56, 46, 28, 26);
  fill(255, 118, 178);
  noStroke();
  ellipse(-58, 42, 14, 10);

  fill(138, 56, 152);
  stroke(16, 20, 32);
  strokeWeight(2.8);
  ellipse(38, 10, 14, 18);

  pop();
  pop();
}

// ==========================================
// RETRATOS DOS ROSTOS NOS CARDS (CORRIGIDO)
// ==========================================
function desenharRetratoCardBrawler(id, x, y, w, h, raioCanto = 14) {
  let ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, raioCanto);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  let escalaRetrato = min(w / 245, h / 148);

  if (id === "ASH") {
    noStroke();
    fill(185, 42, 235);
    rect(x, y, w, h);

    push();
    translate(x + w * 0.44, y + h * 0.56);
    scale(escalaRetrato);

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
    translate(x + w * 0.44, y + h * 0.56);
    scale(escalaRetrato);

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
    translate(x + w * 0.44, y + h * 0.56);
    scale(escalaRetrato);

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
    fill(188, 36, 238);
    rect(x, y, w, h);

    push();
    translate(x + w * 0.44, y + h * 0.54);
    scale(escalaRetrato);

    fill(128, 72, 34);
    stroke(14, 16, 22);
    strokeWeight(4.5);
    beginShape();
    vertex(-20, -86);
    vertex(38, -86);
    vertex(28, -58);
    vertex(-20, -62);
    endShape(CLOSE);

    fill(158, 94, 50);
    stroke(14, 16, 22);
    strokeWeight(4.8);
    beginShape();
    vertex(-105, -86);
    vertex(8, -86);
    vertex(16, 84);
    vertex(-105, 84);
    endShape(CLOSE);

    stroke(102, 56, 26);
    strokeWeight(3.2);
    line(-76, -50, -76, -24);
    line(-42, -56, -42, -28);
    line(-68, 44, -68, 76);

    fill(218, 202, 102);
    stroke(14, 16, 22);
    strokeWeight(4);
    beginShape();
    vertex(-106, -54);
    bezierVertex(-60, -44, -18, -46, 12, -56);
    vertex(14, -38);
    bezierVertex(-18, -28, -60, -26, -106, -36);
    endShape(CLOSE);
    stroke(125, 110, 42);
    strokeWeight(2.5);
    line(-82, -51, -78, -32);
    line(-52, -47, -48, -29);
    line(-18, -48, -14, -31);

    fill(218, 202, 102);
    stroke(14, 16, 22);
    strokeWeight(4);
    beginShape();
    vertex(-106, 36);
    bezierVertex(-62, 46, -20, 46, 15, 34);
    vertex(16, 52);
    bezierVertex(-20, 64, -62, 64, -106, 54);
    endShape(CLOSE);
    stroke(125, 110, 42);
    strokeWeight(2.5);
    line(-80, 40, -76, 58);
    line(-46, 44, -42, 61);
    line(-12, 42, -8, 59);

    fill(218, 202, 102);
    stroke(14, 16, 22);
    strokeWeight(4);
    beginShape();
    vertex(2, -52);
    bezierVertex(24, -46, 36, -32, 34, -16);
    vertex(18, -14);
    bezierVertex(20, -26, 10, -34, -2, -38);
    endShape(CLOSE);

    fill(86, 212, 48);
    stroke(14, 16, 22);
    strokeWeight(4.5);
    beginShape();
    vertex(-88, -86);
    bezierVertex(-72, -56, -54, -42, -44, -38);
    bezierVertex(-24, -48, 2, -66, 16, -86);
    endShape(CLOSE);
    stroke(46, 145, 24);
    strokeWeight(3);
    line(-42, -84, -44, -42);

    fill(86, 212, 48);
    stroke(14, 16, 22);
    strokeWeight(4.5);
    beginShape();
    vertex(-92, 82);
    bezierVertex(-96, 46, -64, 34, -44, 46);
    bezierVertex(-22, 34, 8, 46, 4, 82);
    endShape(CLOSE);
    stroke(46, 145, 24);
    strokeWeight(3);
    line(-44, 48, -44, 80);

    fill(14, 12, 18);
    stroke(72, 38, 18);
    strokeWeight(4.5);
    beginShape();
    vertex(-88, -22);
    vertex(-66, -34);
    vertex(-44, -18);
    vertex(-8, -32);
    vertex(6, -8);
    vertex(4, 24);
    vertex(-22, 36);
    vertex(-44, 26);
    vertex(-68, 36);
    vertex(-90, 22);
    endShape(CLOSE);

    noStroke();
    fill(248, 238, 45);
    ellipse(-66, 6, 13, 12);
    ellipse(-55, 8, 13, 11);
    ellipse(-26, 7, 12, 11);
    ellipse(-15, 5, 13, 12);

    fill(14, 12, 18);
    ellipse(-65, 6, 5, 6);
    ellipse(-54, 8, 5, 5.5);
    ellipse(-25, 7, 5, 5.5);
    ellipse(-14, 5, 5, 6);

    push();
    translate(54, 12);
    rotate(-0.22);

    fill(128, 34, 96);
    stroke(14, 16, 22);
    strokeWeight(4.2);
    beginShape();
    vertex(-8, -38);
    vertex(6, -42);
    vertex(10, -24);
    vertex(-6, -24);
    endShape(CLOSE);

    fill(192, 66, 134);
    stroke(14, 16, 22);
    strokeWeight(4.5);
    ellipse(0, 12, 66, 70);

    noStroke();
    fill(218, 92, 158, 150);
    ellipse(8, 14, 42, 46);
    stroke(118, 32, 82);
    strokeWeight(2.2);
    line(-18, 16, -13, 21);
    line(-11, 23, -7, 26);

    fill(218, 202, 102);
    stroke(14, 16, 22);
    strokeWeight(4.2);
    rect(-33, -24, 66, 12, 6);

    fill(128, 34, 96);
    beginShape();
    vertex(-36, -12);
    bezierVertex(-34, -26, 34, -26, 36, -12);
    bezierVertex(20, -6, -20, -6, -36, -12);
    endShape(CLOSE);
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

    desenharRetratoCardBrawler(item.id, cxCard, cyCard, cardW, cardH, 14);

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
  vertex(0, 104);
  vertex(252, 94);
  vertex(236, 180);
  vertex(0, 190);
  endShape(CLOSE);

  fill(info.corFaixa[0], info.corFaixa[1], info.corFaixa[2]);
  stroke(20);
  strokeWeight(3);
  beginShape();
  vertex(-4, 98);
  vertex(248, 88);
  vertex(232, 174);
  vertex(-4, 184);
  endShape(CLOSE);

  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(32);
  stroke(15, 18, 28, 245);
  strokeWeight(5);
  fill(255);
  text(info.nome, 24, 122);

  fill(255);
  stroke(15, 18, 28, 245);
  strokeWeight(3);
  ellipse(34, 156, 18, 18);
  fill(info.corFaixa[0], info.corFaixa[1], info.corFaixa[2]);
  noStroke();
  ellipse(34, 156, 8, 8);

  textSize(16);
  stroke(15, 18, 28, 245);
  strokeWeight(3.5);
  fill(255);
  text(info.classe, 50, 156);
  noStroke();

  textSize(12);
  stroke(15, 18, 28, 245);
  strokeWeight(3);
  fill(info.raridade === "RARO" ? color(135, 255, 135) : color(235, 160, 255));
  text(info.raridade, 175, 180);
  noStroke();
  pop();

  push();
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(12.5);
  textLeading(17);
  stroke(12, 16, 26, 235);
  strokeWeight(3.2);
  fill(245, 250, 255);
  text(info.bio, 24, 206, 238, 275);
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

  desenharBrawler3DFrontal(info.id, width / 2 - 15, 342, 1.58);

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
// TELA DE APRESENTAÇÃO DO FUTE-BRAWL (3 SEGUNDOS)
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
    text(b.ehJogador ? b.nomeExibicao : b.tipo, p.x, p.y + 72);
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
  text("Tiro de meta\n3v3 • 2 Minutos (Prorrogação 1 min)", 582, 328);

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
      if (ehBotaoDireito || modoMira === "SUPER") {
        jogador.usarSuper();
      } else {
        jogador.atacar();
      }
    }
  } else if (estadoJogo === "FIM") {
    if (cx >= width / 2 - 125 && cx <= width / 2 + 125 && cy >= height - 74 && cy <= height - 18) {
      estadoJogo = "MENU";
    }
  }
}

// ==========================================
// CONTROLE DE ESTATÍSTICAS E FIM DE PARTIDA
// ==========================================
function registrarParticipantePartida(brawler) {
  if (!brawler) return;
  brawler.kills = 0;
  brawler.mortes = 0;
  brawler.danoCausado = 0;
  brawler.golsMarcados = 0;
  estatisticasPartida.push({
    ref: brawler,
    nome: brawler.ehJogador ? brawler.nomeExibicao : brawler.tipo,
    tipo: brawler.tipo,
    time: brawler.time,
    ehJogador: brawler.ehJogador,
    kills: 0,
    mortes: 0,
    danoCausado: 0,
    golsMarcados: 0
  });
}

function sincronizarEstatisticasBrawler(brawler) {
  if (!brawler) return;
  let item = estatisticasPartida.find((e) => e.ref === brawler);
  if (item) {
    item.kills = brawler.kills || 0;
    item.mortes = brawler.mortes || 0;
    item.danoCausado = brawler.danoCausado || 0;
    item.golsMarcados = brawler.golsMarcados || 0;
  }
}

function encerrarPartidaComTelaFim(tituloResultado, timeVencedor) {
  vencedor = tituloResultado;

  let todosAtuais = [jogador, ...aliados, ...inimigos];
  for (let b of todosAtuais) {
    sincronizarEstatisticasBrawler(b);
  }

  let melhor = null;
  let maiorScore = -Infinity;

  for (let p of estatisticasPartida) {
    let bonusVitoria = (timeVencedor && p.time === timeVencedor) ? 180 : 0;
    let score = p.kills * 120 + p.golsMarcados * 220 + p.danoCausado * 0.04 - p.mortes * 45 + bonusVitoria;
    p.scoreCraque = score;
    p.ehCraque = false;
    if (score > maiorScore) {
      maiorScore = score;
      melhor = p;
    }
  }

  if (melhor) {
    melhor.ehCraque = true;
  }

  estadoJogo = "FIM";
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
  estatisticasPartida = [];
  bola = null;
  placarAzul = 0;
  placarVermelho = 0;
  tempoFutebrawl = 7200; // 2 minutos
  prorrogacaoFutebrawl = false;
  tempoProrrogacaoFutebrawl = 3600; // 1 minuto
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
    registrarParticipantePartida(jogador);

    let poolBots = ["ASH", "TRUNK", "COLT", "BARLEY", "ASH", "TRUNK", "COLT", "BARLEY", "COLT"];
    for (let i = 1; i <= 9; i++) {
      let sp = spawnsEmbaralhados[i];
      let bot = new Brawler(sp.x, sp.y, poolBots[i - 1], "BOT" + i, false);
      bot.zonaPreferidaY = random(300, mundoAltura - 300);
      inimigos.push(bot);
      registrarParticipantePartida(bot);
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
    resetarPosicoesFutebrawl(true);

    camX = constrain(jogador.x - width / 2, 0, mundoLargura - width);
    camY = constrain(jogador.y - height / 2, 0, mundoAltura - height);

    timerIntroFutebrawl = 180; // 3 segundos
    estadoJogo = "INTRO_FUTEBRAWL";
  }
}

function resetarPosicoesFutebrawl(sortearBots = false) {
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

  if (sortearBots) {
    let poolDisponivel = DADOS_BRAWLERS.map((b) => b.id).filter((id) => id !== personagemSelecionado);
    let embaralhadoAzul = shuffle(poolDisponivel);

    let todosTipos = DADOS_BRAWLERS.map((b) => b.id);
    let embaralhadoVermelho = shuffle(todosTipos);

    jogador = new Brawler(430, meioY, personagemSelecionado, "AZUL", true, nicknameJogador);

    let aliado1 = new Brawler(300, 180, embaralhadoAzul[0], "AZUL", false);
    aliado1.zonaPreferidaY = 170;

    let aliado2 = new Brawler(300, mundoAltura - 180, embaralhadoAzul[1], "AZUL", false);
    aliado2.zonaPreferidaY = mundoAltura - 170;

    aliados = [aliado1, aliado2];

    let ini1 = new Brawler(mundoLargura - 430, meioY, embaralhadoVermelho[0], "VERMELHO", false);
    ini1.zonaPreferidaY = meioY;

    let ini2 = new Brawler(mundoLargura - 300, 180, embaralhadoVermelho[1], "VERMELHO", false);
    ini2.zonaPreferidaY = 170;

    let ini3 = new Brawler(mundoLargura - 300, mundoAltura - 180, embaralhadoVermelho[2], "VERMELHO", false);
    ini3.zonaPreferidaY = mundoAltura - 170;

    inimigos = [ini1, ini2, ini3];

    estatisticasPartida = [];
    registrarParticipantePartida(jogador);
    registrarParticipantePartida(aliado1);
    registrarParticipantePartida(aliado2);
    registrarParticipantePartida(ini1);
    registrarParticipantePartida(ini2);
    registrarParticipantePartida(ini3);
  } else {
    // Fim de rodada: reseta posição, vida, munição e zera a fúria do Ash, mas MANTÉM a porcentagem da Super!
    let posAzul = [
      { x: 430, y: meioY },
      { x: 300, y: 180 },
      { x: 300, y: mundoAltura - 180 }
    ];
    let equipeAzul = [jogador, ...aliados];
    for (let i = 0; i < equipeAzul.length; i++) {
      let b = equipeAzul[i];
      b.x = posAzul[i].x;
      b.y = posAzul[i].y;
      b.angulo = 0;
      b.vida = b.vidaMax;
      b.municao = 3;
      b.recarga = 0;
      b.cooldownAtaque = 0;
      b.respawnTimer = 0;
      b.dashTimer = 0;
      b.delayAtaqueTrunk = 0;
      b.giroTrunk = 0;
      b.filaDisparosColt = [];
      b.vxAtual = 0;
      b.vyAtual = 0;
      b.tempoComBola = 0;
      b.furia = 0;
      b.tempoSemFuria = 0;
    }

    let posVerm = [
      { x: mundoLargura - 430, y: meioY },
      { x: mundoLargura - 300, y: 180 },
      { x: mundoLargura - 300, y: mundoAltura - 180 }
    ];
    for (let i = 0; i < inimigos.length; i++) {
      let b = inimigos[i];
      b.x = posVerm[i].x;
      b.y = posVerm[i].y;
      b.angulo = PI;
      b.vida = b.vidaMax;
      b.municao = 3;
      b.recarga = 0;
      b.cooldownAtaque = 0;
      b.respawnTimer = 0;
      b.dashTimer = 0;
      b.delayAtaqueTrunk = 0;
      b.giroTrunk = 0;
      b.filaDisparosColt = [];
      b.vxAtual = 0;
      b.vyAtual = 0;
      b.tempoComBola = 0;
      b.furia = 0;
      b.tempoSemFuria = 0;
    }
  }

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
    autorBrawler.golsMarcados = (autorBrawler.golsMarcados || 0) + 1;
    sincronizarEstatisticasBrawler(autorBrawler);
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
    if (prorrogacaoFutebrawl && placarAzul !== placarVermelho) {
      let ganhou = placarAzul > placarVermelho;
      encerrarPartidaComTelaFim(ganhou ? "VITÓRIA!" : "DERROTA!", ganhou ? "AZUL" : "VERMELHO");
    } else if (placarVermelho >= 2) {
      encerrarPartidaComTelaFim("DERROTA!", "VERMELHO");
    } else if (placarAzul >= 2) {
      encerrarPartidaComTelaFim("VITÓRIA!", "AZUL");
    } else {
      resetarPosicoesFutebrawl(false);
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

  if (modoSelecionado === "FUTEBRAWL") {
    if (!prorrogacaoFutebrawl) {
      tempoFutebrawl--;
      if (tempoFutebrawl <= 0) {
        tempoFutebrawl = 0;
        if (placarAzul > placarVermelho) {
          encerrarPartidaComTelaFim("VITÓRIA!", "AZUL");
          return;
        } else if (placarVermelho > placarAzul) {
          encerrarPartidaComTelaFim("DERROTA!", "VERMELHO");
          return;
        } else {
          prorrogacaoFutebrawl = true;
          tempoProrrogacaoFutebrawl = 3600; // 1 minuto de prorrogação
          criarTextoDano(jogador.x, jogador.y - 80, "PRORROGAÇÃO (1:00)! PRÓXIMO GOL VENCE!", color(255, 220, 40), true);
        }
      }
    } else {
      tempoProrrogacaoFutebrawl--;
      if (tempoProrrogacaoFutebrawl <= 0) {
        tempoProrrogacaoFutebrawl = 0;
        encerrarPartidaComTelaFim("EMPATE!", null);
        return;
      }
    }
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
    encerrarPartidaComTelaFim("FIM DE JOGO • #" + colocacao + " DE 10", null);
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
      encerrarPartidaComTelaFim("VITÓRIA • #1 DE 10", "AZUL");
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
      // Curva de desaceleração mais suave para a bola manter um pouco mais de velocidade e força
      let velPasso = min(bola.alcanceRestante, max(2.2, bola.velInicial * (pow(proporcao, 1.15) * 0.82 + 0.18)));
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
// MIRA DO ATAQUE E SUPER
// ==========================================
function desenharMiraBrawl(b) {
  let superPronta = b.superCarga >= 100;
  let mostrandoSuper = modoMira === "SUPER";

  if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === b) {
    let alcanceChute = mostrandoSuper ? 410 : 230;
    let trajBola = calcularTrajetoriaBola(b, b.angulo, alcanceChute);

    let corRastroBola = mostrandoSuper
      ? (superPronta ? color(255, 215, 0, 95) : color(135, 140, 150, 65))
      : color(255, 255, 255, 70);
    let corLinhaBola = mostrandoSuper
      ? (superPronta ? color(255, 230, 50, 235) : color(160, 165, 175, 160))
      : color(255, 255, 255, 215);

    noFill();
    stroke(corRastroBola);
    strokeWeight(mostrandoSuper && superPronta ? 28 : 24);
    beginShape();
    for (let pt of trajBola.pontos) vertex(pt.x, pt.y);
    endShape();

    stroke(corLinhaBola);
    strokeWeight(mostrandoSuper && superPronta ? 3.2 : 2.5);
    beginShape();
    for (let pt of trajBola.pontos) vertex(pt.x, pt.y);
    endShape();

    for (let rc of trajBola.ricochetes) {
      fill(corLinhaBola);
      noStroke();
      ellipse(rc.x, rc.y, 10, 10);
    }

    let ultimoPonto = trajBola.pontos[trajBola.pontos.length - 1];
    fill(corLinhaBola);
    noStroke();
    ellipse(ultimoPonto.x, ultimoPonto.y, 14, 14);
    return;
  }

  push();
  translate(b.x, b.y);

  let podeDisparar = mostrandoSuper
    ? superPronta
    : (b.municao >= 1 && b.cooldownAtaque <= 0 && b.delayAtaqueTrunk <= 0);

  let corPreenchimento;
  let corBorda;

  if (mostrandoSuper) {
    if (superPronta) {
      corPreenchimento = color(255, 215, 0, 88);
      corBorda = color(255, 235, 65, 210);
    } else {
      corPreenchimento = color(95, 100, 110, 62);
      corBorda = color(155, 160, 170, 135);
    }
  } else {
    corPreenchimento = podeDisparar ? color(230, 235, 240, 65) : color(80, 85, 95, 55);
    corBorda = podeDisparar ? color(255, 255, 255, 140) : color(140, 145, 155, 100);
  }

  if (b.tipo === "ASH") {
    if (mostrandoSuper) {
      let alcanceGaiola = 115;
      if (b.ehJogador && !ehMobile) {
        let dMouse = dist(b.x, b.y, mouseX + camX, mouseY + camY);
        alcanceGaiola = constrain(dMouse, 40, 115);
      }
      let gx = cos(b.angulo) * alcanceGaiola;
      let gy = sin(b.angulo) * alcanceGaiola;

      stroke(corBorda);
      strokeWeight(2.2);
      line(0, 0, gx, gy);

      fill(corPreenchimento);
      ellipse(gx, gy, 92, 92);
    } else {
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
    }
  } else if (b.tipo === "TRUNK") {
    if (mostrandoSuper) {
      let trajDash = calcularTrajetoriaSimulada(b.x, b.y, b.angulo, 256, b.raio, true);
      noFill();
      stroke(corPreenchimento);
      strokeWeight(34);
      beginShape();
      for (let pt of trajDash.pontos) vertex(pt.x - b.x, pt.y - b.y);
      endShape();

      stroke(corBorda);
      strokeWeight(2.5);
      beginShape();
      for (let pt of trajDash.pontos) vertex(pt.x - b.x, pt.y - b.y);
      endShape();
    } else {
      fill(corPreenchimento);
      stroke(corBorda);
      strokeWeight(2);
      ellipse(0, 0, 115 * 2);

      noFill();
      stroke(255, 255, 255, podeDisparar ? 95 : 45);
      strokeWeight(1.5);
      ellipse(0, 0, (115 * 0.72) * 2);
    }
  } else if (b.tipo === "COLT") {
    rotate(b.angulo);
    fill(corPreenchimento);
    stroke(corBorda);
    strokeWeight(2);
    if (mostrandoSuper) {
      rect(22, -16, 430, 32, 6);
    } else {
      rect(22, -11, 345, 22, 4);
    }
  } else if (b.tipo === "BARLEY") {
    noFill();
    stroke(mostrandoSuper ? corBorda : color(255, 255, 255, 50));
    strokeWeight(1.5);
    ellipse(0, 0, 275 * 2);

    let alvo = b.calcularAlvoBarley();
    let dx = alvo.x - b.x;
    let dy = alvo.y - b.y;

    stroke(corBorda);
    strokeWeight(2);
    line(0, 0, dx, dy);

    if (mostrandoSuper) {
      let dirX = cos(b.angulo);
      let dirY = sin(b.angulo);
      let perpX = -sin(b.angulo);
      let perpY = cos(b.angulo);
      let distCentro = dist(b.x, b.y, alvo.x, alvo.y);
      let tAlcance = constrain((distCentro - 45) / (275 - 45), 0, 1);
      let fatorEspacamento = lerp(1.0, 1.32, pow(tAlcance, 1.15));

      let posicoes = [
        { frente: 50 * fatorEspacamento, lado: -48 * fatorEspacamento },
        { frente: 50 * fatorEspacamento, lado: 48 * fatorEspacamento },
        { frente: 0, lado: 0 },
        { frente: -50 * fatorEspacamento, lado: -48 * fatorEspacamento },
        { frente: -50 * fatorEspacamento, lado: 48 * fatorEspacamento }
      ];

      fill(corPreenchimento);
      stroke(corBorda);
      for (let pos of posicoes) {
        let px = dx + dirX * pos.frente + perpX * pos.lado;
        let py = dy + dirY * pos.frente + perpY * pos.lado;
        ellipse(px, py, 78 * 2);
      }
    } else {
      fill(podeDisparar ? color(100, 255, 120, 65) : color(120, 120, 120, 45));
      stroke(podeDisparar ? color(130, 255, 150, 170) : color(150, 150, 150, 100));
      ellipse(dx, dy, 58 * 2);
    }
  }
  pop();
}

// ==========================================
// ÍCONE DA FÚRIA DO ASH (3 ETAPAS VISUAIS)
// ==========================================
function desenharIconeFuriaAsh(cx, cy, furia, escala = 1.0) {
  let etapa = furia > 66 ? 3 : (furia > 33 ? 2 : 1);

  push();
  translate(cx, cy);
  scale(escala);

  noStroke();
  fill(32, 36, 46);
  rect(-7.5, -7.5, 15, 15, 3);

  if (etapa === 2) {
    fill(255, 185, 25);
    rect(-7.5, 0, 15, 7.5, 0, 0, 3, 3);
  } else if (etapa === 3) {
    fill(245, 50, 45);
    rect(-7.5, -7.5, 15, 15, 3);
  }

  noFill();
  stroke(12, 16, 24);
  strokeWeight(1.8);
  rect(-7.5, -7.5, 15, 15, 3);

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

  let alcanceCorda = giroAnim > 0 ? map(sin((giroAnim / TWO_PI) * PI), 0, 1, 22, 92) : (preparando ? 14 : 22);
  let anguloCorda = giroAnim > 0 ? -HALF_PI : (preparando ? -2.05 : -1.15);

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
  } else if (preparando) {
    fill(255, 180, 45);
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
  fill(70, 195, 75);
  stroke(25, 95, 30);
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

function formatarTempoRelogio(frames) {
  let totalSegundos = max(0, ceil(frames / 60));
  let min = floor(totalSegundos / 60);
  let seg = totalSegundos % 60;
  return nf(min, 2) + ":" + nf(seg, 2);
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
    text("AZUL: " + placarAzul, width / 2 - 155, 22);

    fill(24, 32, 54);
    stroke(prorrogacaoFutebrawl ? color(255, 185, 30) : color(95, 130, 185));
    strokeWeight(2);
    rect(width / 2 - 90, 6, 180, 33, 8);
    noStroke();

    if (prorrogacaoFutebrawl) {
      let poucoTempoProrrog = tempoProrrogacaoFutebrawl <= 600;
      fill(poucoTempoProrrog ? color(255, 85, 75) : color(255, 215, 45));
      textSize(12);
      text("PRORROG. " + formatarTempoRelogio(tempoProrrogacaoFutebrawl), width / 2, 22.5);
    } else {
      let poucoTempo = tempoFutebrawl <= 900;
      fill(poucoTempo ? color(255, 85, 75) : color(255, 255, 255));
      textSize(17);
      text(formatarTempoRelogio(tempoFutebrawl), width / 2, 22.5);
    }

    textSize(16);
    fill(255, 100, 100);
    text("VERMELHO: " + placarVermelho, width / 2 + 165, 22);
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
    let superPronta = jogador.superCarga >= 100;
    fill(15, 20, 35, 220);
    rect(badgeMiraX, height - 58, 130, 44, 10);
    fill(
      modoMira === "SUPER"
        ? (superPronta ? color(255, 215, 0) : color(155, 160, 170))
        : color(220, 235, 255)
    );
    textSize(10);
    text("DISPARO (SCROLL):", badgeMiraX + 10, height - 45);
    textSize(12);
    text(
      modoMira === "SUPER"
        ? (superPronta ? "SUPER (PRONTA)" : "SUPER (CINZA)")
        : "ATAQUE",
      badgeMiraX + 10,
      height - 29
    );

    textAlign(CENTER, CENTER);
  }

  if (!ehMobile) {
    fill(255, 230, 100);
    textSize(11);
    textAlign(RIGHT, CENTER);
    text("WASD: Mover | Esq: Disparar | Dir/Espaço: Super | Scroll: Trocar | ESC: Tela Cheia", width - 15, height - 22);
    textAlign(CENTER, CENTER);
  }

  desenharControlesMobile();
}

// ==========================================
// TELA DE VITÓRIA / DERROTA / EMPATE ESTILO BRAWL STARS
// ==========================================
function desenharIconeArminhaKill(cx, cy) {
  push();
  translate(cx, cy);
  noStroke();
  fill(255, 215, 65);
  rect(-7, -3, 12, 4.5, 1.5);
  rect(-7, -1, 4.5, 7, 1.5);
  fill(255, 245, 180);
  rect(5, -2.2, 3, 2.5, 1);
  pop();
}

function desenharIconeCaveiraMorte(cx, cy) {
  push();
  translate(cx, cy);
  noStroke();
  fill(220, 225, 235);
  ellipse(0, -1.5, 12, 10.5);
  rect(-4, 2.5, 8, 4.5, 1.5);
  fill(20, 26, 40);
  ellipse(-2.5, -1.5, 3, 3.5);
  ellipse(2.5, -1.5, 3, 3.5);
  rect(-2, 4, 1.2, 3);
  rect(0.8, 4, 1.2, 3);
  pop();
}

function desenharFim() {
  background(16, 36, 82);

  noStroke();
  fill(28, 68, 148, 170);
  ellipse(width / 2, height / 2, 760, 540);

  let ehVitoria = vencedor.indexOf("VITÓRIA") !== -1;
  let ehDerrota = vencedor.indexOf("DERROTA") !== -1;
  let corTitulo = ehVitoria ? color(255, 215, 0) : (ehDerrota ? color(255, 85, 85) : color(135, 215, 255));

  textStyle(BOLD);
  textSize(34);
  stroke(10, 14, 24, 245);
  strokeWeight(5);
  fill(corTitulo);
  text(vencedor, width / 2, 38);
  noStroke();

  if (modoSelecionado === "FUTEBRAWL") {
    fill(12, 22, 48, 220);
    rect(width / 2 - 125, 62, 250, 30, 8);
    textSize(16);
    fill(95, 200, 255);
    text("AZUL " + placarAzul, width / 2 - 55, 77);
    fill(255);
    text("X", width / 2, 77);
    fill(255, 105, 105);
    text(placarVermelho + " VERMELHO", width / 2 + 62, 77);
  }

  let craque = estatisticasPartida.find((p) => p.ehCraque);

  if (modoSelecionado === "FUTEBRAWL") {
    let timeAzulLista = estatisticasPartida.filter((p) => p.time === "AZUL");
    let timeVermelhoLista = estatisticasPartida.filter((p) => p.time === "VERMELHO");

    desenharPainelTimeFim(28, 106, 382, 315, "TIME AZUL", color(40, 155, 255), timeAzulLista);
    desenharPainelTimeFim(440, 106, 382, 315, "TIME VERMELHO", color(235, 65, 70), timeVermelhoLista);
  } else {
    let ordenado = [...estatisticasPartida].sort((a, b) => b.kills - a.kills);
    desenharPainelTimeFim(135, 95, 580, 330, "PLACAR DO COMBATE", color(255, 195, 35), ordenado.slice(0, 6));
  }

  if (craque) {
    let boxY = 434;
    noStroke();
    fill(12, 18, 36, 235);
    rect(width / 2 - 235, boxY, 470, 58, 12);
    stroke(255, 210, 35);
    strokeWeight(2.5);
    noFill();
    rect(width / 2 - 235, boxY, 470, 58, 12);

    noStroke();
    fill(255, 215, 0);
    textSize(13);
    text("★ MELHOR DA PARTIDA ★", width / 2, boxY + 17);

    fill(255);
    textSize(17);
    let infoExtra = modoSelecionado === "FUTEBRAWL"
      ? ("  •  Gols: " + craque.golsMarcados + "  |  Abates: " + craque.kills)
      : ("  •  Abates: " + craque.kills);
    text(craque.nome + " (" + craque.tipo + ")" + infoExtra, width / 2, boxY + 40);
  }

  let btnX = width / 2 - 125;
  let btnY = height - 74;
  let btnW = 250;
  let btnH = 54;
  let hoverBtn = mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH;

  noStroke();
  fill(155, 88, 0);
  rect(btnX, btnY + 5, btnW, btnH, 12);

  stroke(20);
  strokeWeight(3);
  fill(hoverBtn ? color(255, 225, 65) : color(255, 200, 15));
  rect(btnX, btnY, btnW, btnH, 12);

  noStroke();
  fill(255, 240, 130, 140);
  rect(btnX + 6, btnY + 4, btnW - 12, 12, 6);

  textSize(20);
  stroke(18, 22, 32, 235);
  strokeWeight(4);
  fill(255);
  text("VOLTAR AO LOBBY", width / 2, btnY + btnH / 2);
  noStroke();
}

function desenharPainelTimeFim(x, y, w, h, titulo, corCabecalho, listaJogadores) {
  noStroke();
  fill(12, 22, 46, 225);
  rect(x, y, w, h, 14);

  fill(corCabecalho);
  rect(x, y, w, 34, 14, 14, 0, 0);

  fill(255);
  textStyle(BOLD);
  textSize(15);
  text(titulo, x + w / 2, y + 17);

  let rowH = (h - 46) / max(1, listaJogadores.length);
  for (let i = 0; i < listaJogadores.length; i++) {
    let p = listaJogadores[i];
    let ry = y + 40 + i * rowH;

    let cardX = x + 10;
    let cardY = ry;
    let cardW = w - 20;
    let cardH = rowH - 8;

    fill(p.ehJogador ? color(38, 72, 132, 235) : color(22, 36, 72, 210));
    stroke(p.ehCraque ? color(255, 215, 0) : color(45, 68, 118));
    strokeWeight(p.ehCraque ? 2.2 : 1.2);
    rect(cardX, cardY, cardW, cardH, 10);
    noStroke();

    let avatarTam = cardH - 12;
    let avatarX = cardX + 8;
    let avatarY = cardY + 6;
    desenharRetratoCardBrawler(p.tipo, avatarX, avatarY, avatarTam, avatarTam, 8);

    noFill();
    stroke(14, 18, 28);
    strokeWeight(2);
    rect(avatarX, avatarY, avatarTam, avatarTam, 8);
    noStroke();

    textAlign(LEFT, CENTER);
    let textoX = avatarX + avatarTam + 12;
    fill(p.ehJogador ? color(95, 245, 125) : color(255));
    textSize(14);
    text(p.nome, textoX, cardY + cardH * 0.34);

    fill(175, 205, 245);
    textSize(11);
    let subTexto = p.ehCraque ? "★ MELHOR DA PARTIDA" : p.tipo;
    if (p.ehCraque) fill(255, 215, 0);
    text(subTexto, textoX, cardY + cardH * 0.68);

    let statsX = cardX + cardW - 102;
    let midY = cardY + cardH / 2;

    desenharIconeArminhaKill(statsX, midY);
    fill(255);
    textSize(15);
    text(p.kills, statsX + 14, midY);

    desenharIconeCaveiraMorte(statsX + 52, midY);
    fill(235, 240, 250);
    text(p.mortes, statsX + 65, midY);

    textAlign(CENTER, CENTER);
  }
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

    this.kills = 0;
    this.mortes = 0;
    this.danoCausado = 0;
    this.golsMarcados = 0;

    this.vxAtual = 0;
    this.vyAtual = 0;
    this.filaDisparosColt = [];
    this.anguloSuperTravado = 0;

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
      this.vidaMax = 4800;
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

  obterTempoRecarga() {
    if (this.tipo === "TRUNK") return 76;
    if (this.tipo === "ASH") return 62;
    if (this.tipo === "BARLEY") return 68;
    return 41; // COLT
  }

  estaAtacandoAgora() {
    if (this.cooldownAtaque > 0) return true;
    if (this.delayAtaqueTrunk > 0 || this.giroTrunk > 0) return true;
    if (this.filaDisparosColt && this.filaDisparosColt.length > 0) return true;
    if (this.dashTimer > 0) return true;
    return false;
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
      return this.estaNaTerraTrunk() ? this.velocidade * 1.08 : this.velocidade;
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

  calcularTempoVooBarley(distAlvo) {
    return Math.round(map(constrain(distAlvo, 45, 275), 45, 275, 16, 30));
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
    let dInicial = dist(this.x, this.y, alvo.x, alvo.y);
    let tempoVoo = this.calcularTempoVooBarley(dInicial);
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

  receberDano(qtd, corTexto = color(255, 255, 255), ehCritico = false, atacante = null) {
    if (this.vida <= 0) return;
    let danoReal = min(this.vida, qtd);
    this.vida -= qtd;
    this.tempoSemDano = 0;

    if (atacante && atacante !== this) {
      atacante.danoCausado = (atacante.danoCausado || 0) + danoReal;
    }

    if (this.vida <= 0) {
      this.mortes = (this.mortes || 0) + 1;
      sincronizarEstatisticasBrawler(this);

      if (atacante && atacante !== this) {
        atacante.kills = (atacante.kills || 0) + 1;
        sincronizarEstatisticasBrawler(atacante);
      }

      this.furia = 0;
      this.dashTimer = 0;
      this.delayAtaqueTrunk = 0;
      this.giroTrunk = 0;
      this.filaDisparosColt = [];
      this.respawnTimer = 180;
    } else if (this.tipo === "ASH") {
      this.ganharFuria(2);
    }

    criarTextoDano(this.x, this.y - 58, "-" + qtd, corTexto, ehCritico);
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

    if (this.tipo === "TRUNK" && this.giroTrunk > 0) {
      return;
    }

    if (this.tipo === "COLT" && this.filaDisparosColt.length > 0 && this.filaDisparosColt[0].ehSuper) {
      this.angulo = this.anguloSuperTravado;
      return;
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
      if (this.giroTrunk < 0) this.giroTrunk = 0;
      this.angulo += 0.52;
    }

    if (this.municao < 3) {
      if (!this.estaAtacandoAgora()) {
        this.recarga++;
        let tempoRecarga = this.obterTempoRecarga();

        if (this.recarga >= tempoRecarga) {
          this.municao++;
          this.recarga = 0;
        }
      }
    } else {
      this.recarga = 0;
    }

    if (this.tipo === "COLT" && this.filaDisparosColt.length > 0) {
      for (let i = this.filaDisparosColt.length - 1; i >= 0; i--) {
        let disp = this.filaDisparosColt[i];
        disp.delay--;
        if (disp.delay <= 0) {
          this.animAtaque = 0.75;
          let angDisparo = disp.ehSuper ? (this.anguloSuperTravado + disp.espalhamento) : disp.angulo;
          let canoLateral = disp.lado * 8;
          let px = this.x + cos(angDisparo) * 22 - sin(angDisparo) * canoLateral;
          let py = this.y + sin(angDisparo) * 22 + cos(angDisparo) * canoLateral;

          let estilo = disp.ehSuper ? "COLT_SUPER" : "COLT_BALA";
          let danoBala = disp.ehSuper ? 360 : this.danoBase;
          let proj = new Projetil(px, py, angDisparo, disp.ehSuper ? 10.8 : 10.8, disp.ehSuper ? 40 : 32, danoBala, this.time, estilo, this);

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
          criarTextoDano(this.x, this.y - 58, "+" + cura, color(80, 255, 120), false);

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
          alvo.receberDano(260, color(255, 130, 15), true, this);
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
      this.cooldownAtaque = 26;
      this.delayAtaqueTrunk = 13;
    } else if (this.tipo === "COLT") {
      this.cooldownAtaque = 36;
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
    this.cooldownAtaque = 26;

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
        if (circuloColideObstaculo(tx, ty, 22)) {
          break;
        }
        destX = tx;
        destY = ty;
      }

      this.animAtaque = 1.0;
      gaiolasAsh.push(new GaiolaRatosAsh(this.x, this.y, destX, destY, this.angulo, this.time, this));
    } else if (this.tipo === "TRUNK") {
      this.delayAtaqueTrunk = 0;
      this.giroTrunk = 0;
      this.dashTimer = 19;
      this.dashAngulo = this.angulo;
      this.contatoSuperTrunk = false;
      pocasTerra.push(new PocaTerraTrunk(this.x, this.y, 58, this.time));
    } else if (this.tipo === "COLT") {
      this.anguloSuperTravado = this.angulo;
      this.filaDisparosColt = [];
      for (let i = 0; i < 12; i++) {
        this.filaDisparosColt.push({
          delay: i * 2,
          angulo: this.anguloSuperTravado,
          lado: i % 2 === 0 ? -1 : 1,
          ehSuper: true,
          espalhamento: random(-0.035, 0.035)
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
        if (d > 0 && d < 95) {
          let forca = (95 - d) / 95;
          sepX += ((this.x - outro.x) / d) * forca * 42;
          sepY += ((this.y - outro.y) / d) * forca * 42;
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
      if (!(this.tipo === "TRUNK" && this.giroTrunk > 0)) {
        this.angulo = atan2(this.pontoPatrulhaY - this.y, this.pontoPatrulhaX - this.x);
      }
      this.moverBotPara(this.pontoPatrulhaX, this.pontoPatrulhaY, velBot * 0.78);
      return;
    }

    if (!(this.tipo === "COLT" && this.filaDisparosColt.length > 0 && this.filaDisparosColt[0].ehSuper) &&
        !(this.tipo === "TRUNK" && this.giroTrunk > 0)) {
      this.angulo = atan2(alvo.y - this.y, alvo.x - this.x);
    }

    let alcanceIdeal = 135;
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

    let alcanceAtaque = 165;
    if (this.tipo === "TRUNK") alcanceAtaque = 120;
    else if (this.tipo === "COLT") alcanceAtaque = 345;
    else if (this.tipo === "BARLEY") alcanceAtaque = 275;

    if (menorDist <= alcanceAtaque && this.municao >= 1 && this.cooldownAtaque <= 0) {
      this.delayReacao--;
      if (this.delayReacao <= 0) {
        this.delayReacao = Math.floor(random(28, 52));
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
      this.delayReacao = max(this.delayReacao, 10);
    }

    if (this.superCarga >= 100 && menorDist <= alcanceAtaque) {
      this.delaySuperBot--;
      if (this.delaySuperBot <= 0) {
        this.delaySuperBot = Math.floor(random(22, 44));
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

      if (distMeuGol < 340 && (inimigosPerto >= 1 || this.vida < this.vidaMax * 0.5) && this.tempoComBola > 8) {
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
      } else if (distGolAdv < 230) {
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

      if ((bloqueadoNaFrente || this.vida < this.vidaMax * 0.40 || this.tempoComBola > 55) && this.tempoComBola > 14) {
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
      this.moverBotPara(alvoConducaoX, alvoConducaoY, velBot * 0.88);
      return;
    }

    this.tempoComBola = 0;

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

    let alcanceTiro = 165;
    if (this.tipo === "TRUNK") alcanceTiro = 120;
    else if (this.tipo === "COLT") alcanceTiro = 300;
    else if (this.tipo === "BARLEY") alcanceTiro = 270;

    if (inimigoMaisPerto && distInimigo <= alcanceTiro) {
      if (!(this.tipo === "COLT" && this.filaDisparosColt.length > 0 && this.filaDisparosColt[0].ehSuper) &&
          !(this.tipo === "TRUNK" && this.giroTrunk > 0)) {
        this.angulo = atan2(inimigoMaisPerto.y - this.y, inimigoMaisPerto.x - this.x);
      }
      if (this.municao >= 1 && this.cooldownAtaque <= 0) {
        this.delayReacao--;
        if (this.delayReacao <= 0) {
          this.delayReacao = Math.floor(random(28, 52));
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
      if (this.superCarga >= 100 && distInimigo <= alcanceTiro) {
        this.delaySuperBot--;
        if (this.delaySuperBot <= 0) {
          this.delaySuperBot = Math.floor(random(20, 42));
          if (this.tipo === "BARLEY") {
            let miraPred = this.calcularAlvoPreditivoBarley(inimigoMaisPerto);
            this.angulo = miraPred.angulo;
          }
          this.usarSuper();
        }
      }
    }

    let aliadoComBola = bola.posse && bola.posse.time === this.time;
    let adversarioComBola = bola.posse && bola.posse.time !== this.time;
    let bolaPertoMeuGol = abs(bola.x - meuGolX) < 470;
    let vidaBaixa = this.vida < this.vidaMax * 0.32;

    let souMaisPertoDaBola = true;
    let minhaDistBola = dist(this.x, this.y, bola.x, bola.y);
    for (let comp of companheiros) {
      if (comp !== this && comp.vida > 0) {
        if (dist(comp.x, comp.y, bola.x, bola.y) + 25 < minhaDistBola) {
          souMaisPertoDaBola = false;
          break;
        }
      }
    }

    let destX = bola.x;
    let destY = bola.y;

    if (vidaBaixa && !bolaPertoMeuGol) {
      destX = constrain(meuGolX + dirAtaque * 150, 90, mundoLargura - 90);
      destY = constrain(this.zonaPreferidaY, 130, mundoAltura - 130);
    } else if (adversarioComBola || bolaPertoMeuGol) {
      if (souMaisPertoDaBola) {
        destX = bola.x;
        destY = bola.y;
      } else {
        destX = lerp(bola.x, meuGolX + dirAtaque * 75, 0.55);
        destY = lerp(bola.y, meioY, 0.45);
      }
    } else if (aliadoComBola) {
      let avancoX = constrain(bola.posse.x + dirAtaque * 190, 120, mundoLargura - 120);
      let faixaY = this.zonaPreferidaY < meioY ? 185 : (this.zonaPreferidaY > meioY ? mundoAltura - 185 : meioY);
      destX = avancoX;
      destY = faixaY;
    } else {
      if (souMaisPertoDaBola) {
        destX = bola.x;
        destY = bola.y;
      } else {
        destX = constrain(bola.x - dirAtaque * 80, 110, mundoLargura - 110);
        destY = this.zonaPreferidaY;
      }
    }

    if ((!inimigoMaisPerto || distInimigo > alcanceTiro) &&
        !(this.tipo === "TRUNK" && this.giroTrunk > 0)) {
      this.angulo = atan2(destY - this.y, destX - this.x);
    }
    this.moverBotPara(destX, destY, velBot * 0.85);
  }

  desenharRespawn() {
    noFill();
    stroke(this.time === "AZUL" ? color(0, 180, 255, 160) : color(255, 80, 80, 160));
    strokeWeight(3);
    let pontoX = this.time === "AZUL" ? 120 : mundoLargura - 120;
    let pontoY = this.ehJogador ? mundoAltura / 2 : (this.zonaPreferidaY || mundoAltura / 2);
    ellipse(pontoX, pontoY, 45);
    fill(255);
    noStroke();
    textSize(14);
    text(ceil(this.respawnTimer / 60), pontoX, pontoY);
  }

  desenhar() {
    if (this.ehJogador || this.time === "AZUL") {
      noFill();
      stroke(0, 220, 255, 130);
      strokeWeight(3);
      ellipse(this.x, this.y, 52);
    } else {
      noFill();
      stroke(255, 65, 65, 130);
      strokeWeight(3);
      ellipse(this.x, this.y, 52);
    }

    if (this.superCarga >= 100) {
      noFill();
      stroke(255, 220, 0, 170 + sin(frameCount * 0.2) * 85);
      strokeWeight(4);
      ellipse(this.x, this.y, 62 + sin(frameCount * 0.2) * 4);
    }

    if (this.tipo === "ASH") {
      let swing = this.animAtaque > 0 ? sin(this.animAtaque * PI) * 1.6 : 0;
      desenharSpriteAsh(this.x, this.y, this.angulo, 1.0, swing, this.furia);
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
      let swing = this.animAtaque > 0 ? sin(this.animAtaque * PI) * 1.4 : 0;
      desenharSpriteBarley(this.x, this.y, this.angulo, 1.0, swing, this.time);
    }

    let nomeMostrado = this.ehJogador ? this.nomeExibicao : this.tipo;
    fill(255);
    textSize(12);
    textStyle(BOLD);
    text(nomeMostrado, this.x, this.y - 46);

    let yBarraVida = this.y - 38;
    let larguraVida = 44;

    if (this.tipo === "ASH") {
      desenharIconeFuriaAsh(this.x - larguraVida / 2 - 11, yBarraVida + 3.5, this.furia, 1.0);
    }

    fill(20, 20, 20, 210);
    rect(this.x - larguraVida / 2, yBarraVida, larguraVida, 7, 3);
    fill(this.time === "AZUL" ? color(0, 230, 110) : color(255, 70, 70));
    rect(this.x - larguraVida / 2, yBarraVida, map(this.vida, 0, this.vidaMax, 0, larguraVida), 7, 3);

    let tempoRecargaTotal = this.obterTempoRecarga();
    for (let m = 0; m < 3; m++) {
      let bx = this.x - 21 + m * 15;
      let by = this.y - 29;
      fill(35, 35, 45, 220);
      rect(bx, by, 12, 4, 2);
      if (m < this.municao) {
        fill(255, 195, 20);
        rect(bx, by, 12, 4, 2);
      } else if (m === this.municao) {
        let prog = map(this.recarga, 0, tempoRecargaTotal, 0, 12);
        fill(200, 130, 20);
        rect(bx, by, prog, 4, 2);
      }
    }
  }
}

// ==========================================
// GAIOLA DE RATOS DO ASH (SUPER) - CORRIGIDO PARA NÃO PRENDER NAS PAREDES
// ==========================================
class GaiolaRatosAsh {
  constructor(origemX, origemY, destX, destY, angulo, time, dono) {
    this.origemX = origemX;
    this.origemY = origemY;
    this.destX = destX;
    this.destY = destY;
    this.x = origemX;
    this.y = origemY;
    this.angulo = angulo;
    this.time = time;
    this.dono = dono;
    this.tempo = 0;
    this.duracaoVoo = 16;
    this.finalizada = false;
  }

  atualizar() {
    this.tempo++;
    let t = constrain(this.tempo / this.duracaoVoo, 0, 1);
    this.x = lerp(this.origemX, this.destX, t);
    this.y = lerp(this.origemY, this.destY, t);

    if (t >= 1 && !this.finalizada) {
      this.finalizada = true;
      this.eclodirRatos();
    }
  }

  encontrarPosicaoLivreRato(baseX, baseY, anguloSaida) {
    let raioRato = 12;

    // 1. Verifica a posição inicial desejada fora de paredes e limites
    let candX = constrain(baseX, 38, mundoLargura - 38);
    let candY = constrain(baseY, 65, mundoAltura - 38);
    if (!circuloColideObstaculo(candX, candY, raioRato)) {
      return { x: candX, y: candY };
    }

    // 2. Procura em anéis ao redor do ponto de impacto para garantir local livre
    for (let distBusca = 12; distBusca <= 90; distBusca += 12) {
      for (let i = 0; i < 16; i++) {
        let ang = anguloSaida + (TWO_PI / 16) * i;
        let tx = constrain(this.destX + cos(ang) * distBusca, 38, mundoLargura - 38);
        let ty = constrain(this.destY + sin(ang) * distBusca, 65, mundoAltura - 38);
        if (!circuloColideObstaculo(tx, ty, raioRato)) {
          return { x: tx, y: ty };
        }
      }
    }

    // 3. Fallback seguro na posição do Ash que lançou a gaiola
    return {
      x: constrain(this.origemX, 38, mundoLargura - 38),
      y: constrain(this.origemY, 65, mundoAltura - 38)
    };
  }

  eclodirRatos() {
    let pontosGerados = [];
    for (let i = 0; i < 5; i++) {
      let ang = this.angulo + ((i - 2) * (TWO_PI / 5)) + random(-0.18, 0.18);
      let desejadoX = this.destX + cos(ang) * 28;
      let desejadoY = this.destY + sin(ang) * 28;
      let posLivre = this.encontrarPosicaoLivreRato(desejadoX, desejadoY, ang);
      let rx = posLivre.x;
      let ry = posLivre.y;

      pontosGerados.push({ x: rx, y: ry });
      projeteis.push(new Projetil(rx, ry, ang, 4.7, 360, 420, this.time, "RATO_ASH", this.dono));
    }

    let nuvens = [];
    for (let n = 0; n < 12; n++) {
      nuvens.push({
        ang: (TWO_PI / 12) * n + random(-0.2, 0.2),
        dist: random(22, 46),
        tam: random(20, 34)
      });
    }

    efeitosSpawnRatos.push({
      x: this.destX,
      y: this.destY,
      time: this.time,
      pontosRatos: pontosGerados,
      nuvens: nuvens,
      vida: 24,
      vidaMax: 24
    });

    for (let k = 0; k < 14; k++) {
      particulas.push({
        x: this.destX,
        y: this.destY,
        vx: random(-3.5, 3.5),
        vy: random(-3.5, 3.5),
        tam: random(5, 9),
        cor: this.time === "AZUL" ? color(100, 225, 255, 220) : color(255, 110, 80, 220),
        vida: 18
      });
    }
  }

  desenhar() {
    let t = constrain(this.tempo / this.duracaoVoo, 0, 1);
    let altura = sin(t * PI) * 55;

    noStroke();
    fill(0, 0, 0, 75);
    ellipse(this.x, this.y + 6, 26, 14);

    push();
    translate(this.x, this.y - altura);
    rotate(this.tempo * 0.35);

    fill(90, 110, 130);
    stroke(25);
    strokeWeight(2);
    rect(-12, -12, 24, 24, 5);

    stroke(210, 220, 235);
    strokeWeight(2);
    line(-6, -11, -6, 11);
    line(0, -11, 0, 11);
    line(6, -11, 6, 11);
    pop();
  }
}

class PocaTerraTrunk {
  constructor(x, y, raio, time) {
    this.x = x;
    this.y = y;
    this.raio = raio;
    this.time = time;
    this.vida = 540;
    this.vidaMax = 540;
    this.pedrinhas = [];
    for (let i = 0; i < 6; i++) {
      let a = (TWO_PI / 6) * i + random(-0.3, 0.3);
      let d = random(10, raio * 0.65);
      this.pedrinhas.push({
        dx: cos(a) * d,
        dy: sin(a) * d,
        tam: random(5, 9)
      });
    }
  }

  desenhar() {
    let opacidade = this.vida < 90 ? map(this.vida, 0, 90, 0, 1) : 1;
    let ehAzul = this.time === "AZUL";

    push();
    translate(this.x, this.y);
    noStroke();

    fill(ehAzul ? color(135, 75, 42, 175 * opacidade) : color(115, 45, 55, 175 * opacidade));
    ellipse(0, 0, this.raio * 2);

    fill(ehAzul ? color(175, 85, 225, 145 * opacidade) : color(220, 65, 95, 145 * opacidade));
    ellipse(0, 0, this.raio * 1.45);

    noFill();
    stroke(ehAzul ? color(195, 110, 255, 170 * opacidade) : color(245, 90, 115, 170 * opacidade));
    strokeWeight(2);
    ellipse(0, 0, this.raio * 1.9);

    noStroke();
    fill(ehAzul ? color(95, 55, 28, 210 * opacidade) : color(80, 30, 35, 210 * opacidade));
    for (let p of this.pedrinhas) {
      ellipse(p.dx, p.dy, p.tam, p.tam * 0.75);
    }

    pop();
  }
}

class OndaCircularTrunk {
  constructor(dono, raioMax, dano, naTerra = false) {
    this.dono = dono;
    this.x = dono.x;
    this.y = dono.y;
    this.raioMax = raioMax;
    this.raioAtual = 22;
    this.dano = dano;
    this.naTerra = naTerra;
    this.time = dono.time;
    this.vida = 14;
    this.vidaMax = 14;
    this.atingidos = [];
  }

  atualizar(todosBrawlers) {
    this.x = this.dono.x;
    this.y = this.dono.y;
    this.vida--;
    this.raioAtual = map(this.vida, this.vidaMax, 0, 25, this.raioMax);

    for (let b of todosBrawlers) {
      if (b.vida > 0 && b.time !== this.time && !this.atingidos.includes(b)) {
        let d = dist(this.x, this.y, b.x, b.y);
        if (d <= this.raioMax + b.raio) {
          this.atingidos.push(b);
          let ehCritico = d > this.raioMax * 0.65;
          let danoFinal = ehCritico ? Math.round(this.dano * 1.35) : this.dano;

          b.receberDano(danoFinal, ehCritico ? color(255, 120, 15) : color(255, 255, 255), ehCritico, this.dono);
          if (this.dono) {
            this.dono.superCarga = min(100, this.dono.superCarga + 12.5);
          }

          let angEmpurrao = atan2(b.y - this.y, b.x - this.x);
          b.aplicarMovimento(cos(angEmpurrao) * 14, sin(angEmpurrao) * 14);
        }
      }
    }
  }

  desenhar() {
    let opacidade = map(this.vida, 0, this.vidaMax, 0, 210);
    noFill();
    stroke(this.naTerra ? color(205, 115, 255, opacidade) : color(220, 175, 95, opacidade));
    strokeWeight(12);
    ellipse(this.x, this.y, this.raioAtual * 2);

    stroke(this.naTerra ? color(245, 185, 255, opacidade * 0.9) : color(255, 240, 175, opacidade * 0.9));
    strokeWeight(4);
    ellipse(this.x, this.y, this.raioAtual * 2);
  }
}

class GarrafaBarley {
  constructor(origemX, origemY, destX, destY, dano, raioExplosao, time, dono, ehSuper) {
    this.origemX = origemX;
    this.origemY = origemY;
    this.destX = destX;
    this.destY = destY;
    this.x = origemX;
    this.y = origemY;
    this.dano = dano;
    this.raioExplosao = raioExplosao;
    this.time = time;
    this.dono = dono;
    this.ehSuper = ehSuper;
    this.tempo = 0;

    let distVoo = dist(origemX, origemY, destX, destY);
    this.duracaoVoo = dono ? dono.calcularTempoVooBarley(distVoo) : 24;
    this.finalizada = false;
  }

  atualizar(todosBrawlers) {
    this.tempo++;
    let t = constrain(this.tempo / this.duracaoVoo, 0, 1);
    this.x = lerp(this.origemX, this.destX, t);
    this.y = lerp(this.origemY, this.destY, t);

    if (t >= 1 && !this.finalizada) {
      this.finalizada = true;
      pocas.push(new PocaBarley(this.destX, this.destY, this.raioExplosao, this.dano, this.time, this.dono, this.ehSuper));
      for (let k = 0; k < 10; k++) {
        particulas.push({
          x: this.destX,
          y: this.destY,
          vx: random(-3, 3),
          vy: random(-3, 3),
          tam: random(5, 10),
          cor: this.ehSuper ? color(255, 120, 20, 220) : color(80, 255, 100, 220),
          vida: 18
        });
      }
    }
  }

  desenhar() {
    let t = constrain(this.tempo / this.duracaoVoo, 0, 1);
    let altura = sin(t * PI) * 85;
    noStroke();
    fill(0, 0, 0, 70);
    ellipse(this.x, this.y + 6, 18, 10);

    push();
    translate(this.x, this.y - altura);
    rotate(this.tempo * 0.35);
    fill(this.ehSuper ? color(255, 100, 20) : color(65, 205, 75));
    stroke(20);
    strokeWeight(2);
    rect(-7, -11, 14, 22, 4);
    fill(230, 190, 120);
    rect(-4, -16, 8, 6, 2);
    pop();
  }
}

class PocaBarley {
  constructor(x, y, raio, dano, time, dono, ehSuper) {
    this.x = x;
    this.y = y;
    this.raio = raio;
    this.dano = dano;
    this.time = time;
    this.dono = dono;
    this.ehSuper = ehSuper;
    this.vida = ehSuper ? 220 : 125;
    this.timersDano = new Map();
  }

  atualizar(todosBrawlers) {
    this.vida--;
    for (let b of todosBrawlers) {
      if (b.vida > 0 && b.time !== this.time) {
        if (dist(this.x, this.y, b.x, b.y) < this.raio + b.raio) {
          let t = this.timersDano.get(b) || 0;
          if (t <= 0) {
            b.receberDano(this.dano, color(255, 255, 255), false, this.dono);
            if (this.dono && !this.ehSuper) {
              this.dono.superCarga = min(100, this.dono.superCarga + 17);
            }
            this.timersDano.set(b, 55);
          } else {
            this.timersDano.set(b, t - 1);
          }
        } else {
          this.timersDano.delete(b);
        }
      }
    }
  }

  desenhar() {
    noStroke();
    if (this.ehSuper) {
      fill(255, 90, 15, 115 + sin(frameCount * 0.25) * 25);
    } else {
      fill(65, 225, 85, 115 + sin(frameCount * 0.25) * 25);
    }
    ellipse(this.x, this.y, this.raio * 2);

    noFill();
    stroke(this.ehSuper ? color(255, 180, 40, 190) : color(140, 255, 150, 190));
    strokeWeight(3);
    ellipse(this.x, this.y, this.raio * 1.9);
  }
}

class Projetil {
  constructor(x, y, angulo, vel, vida, dano, time, estilo, dono = null) {
    this.x = x;
    this.y = y;
    this.angulo = angulo;
    this.vel = vel;
    this.vxExtra = 0;
    this.vyExtra = 0;
    this.vida = vida;
    this.dano = dano;
    this.time = time;
    this.estilo = estilo;
    this.dono = dono;
    this.atingidos = [];
    this.ladoContorno = random() > 0.5 ? 1 : -1;
    this.timerDesvio = 0;
    this.anguloDesvio = 0;
    this.framesPreso = 0;
    this.raioRato = 12;
  }

  colideParedeOuLimite(px, py) {
    if (px < 36 || px > mundoLargura - 36 || py < 62 || py > mundoAltura - 36) {
      return true;
    }
    return circuloColideObstaculo(px, py, this.raioRato);
  }

  atualizar(todosBrawlers) {
    this.vida--;

    if (this.estilo === "RATO_ASH") {
      // Se por qualquer motivo o rato estiver encostado/preso numa parede, empurra-o imediatamente para fora
      if (this.colideParedeOuLimite(this.x, this.y)) {
        let escapou = false;
        for (let rBusca = 6; rBusca <= 64 && !escapou; rBusca += 6) {
          for (let k = 0; k < 16; k++) {
            let a = (TWO_PI / 16) * k;
            let tx = constrain(this.x + cos(a) * rBusca, 38, mundoLargura - 38);
            let ty = constrain(this.y + sin(a) * rBusca, 65, mundoAltura - 38);
            if (!this.colideParedeOuLimite(tx, ty)) {
              this.x = tx;
              this.y = ty;
              escapou = true;
              break;
            }
          }
        }
      }

      let alvoMaisPerto = null;
      let menorDist = Infinity;
      for (let b of todosBrawlers) {
        if (b.vida > 0 && b.time !== this.time) {
          let d = dist(this.x, this.y, b.x, b.y);
          if (d < menorDist) {
            menorDist = d;
            alvoMaisPerto = b;
          }
        }
      }

      let angDesejado = this.angulo;
      if (alvoMaisPerto) {
        angDesejado = atan2(alvoMaisPerto.y - this.y, alvoMaisPerto.x - this.x);
      }

      if (this.timerDesvio > 0) {
        this.timerDesvio--;
        this.angulo = this.anguloDesvio;
      } else {
        this.angulo = angDesejado;
      }

      let antesX = this.x;
      let antesY = this.y;

      let nx = this.x + cos(this.angulo) * this.vel;
      let ny = this.y + sin(this.angulo) * this.vel;

      let bateuX = this.colideParedeOuLimite(nx, this.y);
      let bateuY = this.colideParedeOuLimite(this.x, ny);

      if (!bateuX) {
        this.x = nx;
      }
      if (!bateuY) {
        this.y = ny;
      }

      let deslocou = dist(antesX, antesY, this.x, this.y);

      if (bateuX || bateuY || deslocou < this.vel * 0.45) {
        this.framesPreso++;
        if (this.framesPreso >= 3) {
          this.framesPreso = 0;
          this.ladoContorno *= -1;
        }
        this.timerDesvio = 14;
        this.anguloDesvio = angDesejado + (HALF_PI * this.ladoContorno);

        // Desliza paralelamente à parede livre para nunca ficar travado
        let tangenteX = this.x + cos(this.anguloDesvio) * (this.vel * 0.85);
        let tangenteY = this.y + sin(this.anguloDesvio) * (this.vel * 0.85);
        if (!this.colideParedeOuLimite(tangenteX, this.y)) this.x = tangenteX;
        if (!this.colideParedeOuLimite(this.x, tangenteY)) this.y = tangenteY;
      } else {
        this.framesPreso = 0;
      }
    } else {
      this.x += cos(this.angulo) * this.vel + this.vxExtra;
      this.y += sin(this.angulo) * this.vel + this.vyExtra;
    }

    if (this.estilo !== "RATO_ASH" && this.estilo !== "ASH_ATAQUE") {
      if (circuloColideObstaculo(this.x, this.y, 4)) {
        this.vida = 0;
        return;
      }
    }

    for (let b of todosBrawlers) {
      if (b.vida > 0 && b.time !== this.time && !this.atingidos.includes(b)) {
        let raioHit = this.estilo === "ASH_ATAQUE" ? 30 : 12;
        if (dist(this.x, this.y, b.x, b.y) < b.raio + raioHit) {
          let ehCriticoAsh = this.estilo === "ASH_ATAQUE" && this.dono && this.dono.obterEtapaFuria() === 3;
          b.receberDano(this.dano, ehCriticoAsh ? color(255, 120, 15) : color(255, 255, 255), ehCriticoAsh, this.dono);

          if (this.dono) {
            if (this.estilo === "ASH_ATAQUE") {
              this.dono.superCarga = min(100, this.dono.superCarga + 14.3);
              this.dono.ganharFuria(25);
            } else if (this.estilo === "COLT_BALA") {
              this.dono.superCarga = min(100, this.dono.superCarga + 8.4);
            } else if (this.estilo === "RATO_ASH") {
              this.dono.ganharFuria(12);
            }
          }

          if (this.estilo === "ASH_ATAQUE") {
            this.atingidos.push(b);
          } else {
            this.vida = 0;
            break;
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
      let furiaAlta = this.dono && this.dono.obterEtapaFuria() === 3;
      noStroke();
      fill(furiaAlta ? color(255, 70, 30, 165) : color(100, 225, 255, 145));
      arc(0, 0, 56, 56, -0.8, 0.8);
      stroke(255);
      strokeWeight(3);
      noFill();
      arc(0, 0, 56, 56, -0.8, 0.8);
    } else if (this.estilo === "RATO_ASH") {
      fill(175, 185, 195);
      stroke(30);
      strokeWeight(2);
      ellipse(0, 0, 20, 14);
      fill(255, 80, 80);
      noStroke();
      ellipse(6, -3, 4, 4);
      ellipse(6, 3, 4, 4);
      stroke(235, 145, 165);
      strokeWeight(2);
      line(-10, 0, -18, sin(frameCount * 0.5) * 4);
    } else if (this.estilo === "COLT_BALA") {
      fill(255, 225, 45);
      stroke(180, 90, 0);
      strokeWeight(1.5);
      rect(-9, -4, 18, 8, 4);
    } else if (this.estilo === "COLT_SUPER") {
      fill(255, 120, 20);
      stroke(255, 240, 120);
      strokeWeight(2);
      rect(-14, -6, 28, 12, 5);
    }
    pop();
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
    fill(0, 0, 0, 75);
    rect(this.x + 6, this.y + 8, this.w, this.h, 8);
    fill(145, 92, 48);
    stroke(65, 38, 18);
    strokeWeight(3);
    rect(this.x, this.y, this.w, this.h, 8);
    fill(175, 118, 68);
    noStroke();
    rect(this.x + 5, this.y + 5, this.w - 10, this.h - 12, 5);
  }
}

// =========================================================================
// CONTROLES MOBILE (TOUCHSCREEN AUTOMÁTICO +JOYSTICKS DINÂMICOS E DISPARO)
// =========================================================================
let ehMobile = false;

let joyEsq = {
  ativo: false,
  id: null,
  baseX: 115,
  baseY: 485,
  knobX: 115,
  knobY: 485,
  dx: 0,
  dy: 0,
  raioMax: 52
};

let joyDir = {
  ativo: false,
  id: null,
  baseX: 730,
  baseY: 470,
  knobX: 730,
  knobY: 470,
  dx: 0,
  dy: 0,
  raioMax: 50,
  arrastou: false
};

let joySuper = {
  ativo: false,
  id: null,
  baseX: 615,
  baseY: 515,
  knobX: 615,
  knobY: 515,
  dx: 0,
  dy: 0,
  raioMax: 42,
  arrastou: false
};

function detectarDispositivoMobile() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

function registrarEventosTouchCanvas() {
  ehMobile = detectarDispositivoMobile();
  if (!cnv || !cnv.elt) return;

  let el = cnv.elt;

  el.addEventListener("touchstart", function (e) {
    e.preventDefault();
    ehMobile = true;

    for (let i = 0; i < e.changedTouches.length; i++) {
      let t = e.changedTouches[i];
      let pt = converterCoordenadasToque(t);

      if (estadoJogo !== "JOGANDO") {
        ultimoToqueY = pt.y;
        tratarCliqueCanvas({ button: 0 }, pt.x, pt.y);
        continue;
      }

      if (celebracaoGol.ativo || !jogador || jogador.vida <= 0) continue;

      if (pt.x < width * 0.45) {
        if (!joyEsq.ativo) {
          joyEsq.ativo = true;
          joyEsq.id = t.identifier;
          joyEsq.baseX = constrain(pt.x, 65, width * 0.40);
          joyEsq.baseY = constrain(pt.y, 120, height - 65);
          joyEsq.knobX = joyEsq.baseX;
          joyEsq.knobY = joyEsq.baseY;
          joyEsq.dx = 0;
          joyEsq.dy = 0;
        }
      } else {
        let distBtnSuper = dist(pt.x, pt.y, 615, 515);
        if (distBtnSuper <= 52 && !joySuper.ativo) {
          joySuper.ativo = true;
          joySuper.id = t.identifier;
          joySuper.baseX = 615;
          joySuper.baseY = 515;
          joySuper.knobX = 615;
          joySuper.knobY = 515;
          joySuper.dx = 0;
          joySuper.dy = 0;
          joySuper.arrastou = false;
          modoMira = "SUPER";
        } else if (!joyDir.ativo) {
          joyDir.ativo = true;
          joyDir.id = t.identifier;
          joyDir.baseX = constrain(pt.x, width * 0.55, width - 65);
          joyDir.baseY = constrain(pt.y, 120, height - 65);
          joyDir.knobX = joyDir.baseX;
          joyDir.knobY = joyDir.baseY;
          joyDir.dx = 0;
          joyDir.dy = 0;
          joyDir.arrastou = false;
          modoMira = "ATAQUE";
        }
      }
    }
  }, { passive: false });

  el.addEventListener("touchmove", function (e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      let t = e.changedTouches[i];
      let pt = converterCoordenadasToque(t);

      if (estadoJogo === "SELECAO_BRAWLER") {
        let dyScroll = ultimoToqueY - pt.y;
        ultimoToqueY = pt.y;
        let totalLinhas = ceil(DADOS_BRAWLERS.length / 3);
        let maxScroll = max(0, totalLinhas * 172 - 480);
        scrollBrawlers = constrain(scrollBrawlers + dyScroll, 0, maxScroll);
        continue;
      }

      if (joyEsq.ativo && t.identifier === joyEsq.id) {
        atualizarJoystick(joyEsq, pt.x, pt.y);
      } else if (joyDir.ativo && t.identifier === joyDir.id) {
        atualizarJoystick(joyDir, pt.x, pt.y);
        if (dist(joyDir.baseX, joyDir.baseY, joyDir.knobX, joyDir.knobY) > 10) {
          joyDir.arrastou = true;
        }
      } else if (joySuper.ativo && t.identifier === joySuper.id) {
        atualizarJoystick(joySuper, pt.x, pt.y);
        if (dist(joySuper.baseX, joySuper.baseY, joySuper.knobX, joySuper.knobY) > 10) {
          joySuper.arrastou = true;
        }
      }
    }
  }, { passive: false });

  function finalizarToques(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      let t = e.changedTouches[i];

      if (joyEsq.ativo && t.identifier === joyEsq.id) {
        joyEsq.ativo = false;
        joyEsq.id = null;
        joyEsq.dx = 0;
        joyEsq.dy = 0;
        joyEsq.baseX = 115;
        joyEsq.baseY = 485;
        joyEsq.knobX = 115;
        joyEsq.knobY = 485;
      } else if (joyDir.ativo && t.identifier === joyDir.id) {
        if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
          if (!joyDir.arrastou) {
            mirarNoAlvoMaisProximoMobile();
          }
          jogador.atacar();
        }
        joyDir.ativo = false;
        joyDir.id = null;
        joyDir.dx = 0;
        joyDir.dy = 0;
        joyDir.baseX = 730;
        joyDir.baseY = 470;
        joyDir.knobX = 730;
        joyDir.knobY = 470;
      } else if (joySuper.ativo && t.identifier === joySuper.id) {
        if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
          if (!joySuper.arrastou) {
            mirarNoAlvoMaisProximoMobile();
          }
          jogador.usarSuper();
        }
        modoMira = "ATAQUE";
        joySuper.ativo = false;
        joySuper.id = null;
        joySuper.dx = 0;
        joySuper.dy = 0;
        joySuper.baseX = 615;
        joySuper.baseY = 515;
        joySuper.knobX = 615;
        joySuper.knobY = 515;
      }
    }
  }

  el.addEventListener("touchend", finalizarToques, { passive: false });
  el.addEventListener("touchcancel", finalizarToques, { passive: false });
}

function converterCoordenadasToque(t) {
  let rect = cnv.elt.getBoundingClientRect();
  return {
    x: ((t.clientX - rect.left) / rect.width) * width,
    y: ((t.clientY - rect.top) / rect.height) * height
  };
}

function atualizarJoystick(joy, tx, ty) {
  let vx = tx - joy.baseX;
  let vy = ty - joy.baseY;
  let distancia = sqrt(vx * vx + vy * vy);

  if (distancia > joy.raioMax) {
    vx = (vx / distancia) * joy.raioMax;
    vy = (vy / distancia) * joy.raioMax;
  }

  joy.knobX = joy.baseX + vx;
  joy.knobY = joy.baseY + vy;
  joy.dx = vx / joy.raioMax;
  joy.dy = vy / joy.raioMax;
}

function mirarNoAlvoMaisProximoMobile() {
  if (!jogador) return;

  if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === jogador) {
    jogador.angulo = atan2(mundoAltura / 2 - jogador.y, (mundoLargura - 25) - jogador.x);
    return;
  }

  let maisPerto = null;
  let menorDist = 420;
  for (let ini of inimigos) {
    if (ini.vida > 0) {
      let d = dist(jogador.x, jogador.y, ini.x, ini.y);
      if (d < menorDist) {
        menorDist = d;
        maisPerto = ini;
      }
    }
  }

  if (maisPerto) {
    jogador.angulo = atan2(maisPerto.y - jogador.y, maisPerto.x - jogador.x);
  }
}

function desenharControlesMobile() {
  if (!ehMobile || estadoJogo !== "JOGANDO" || !jogador || jogador.vida <= 0) return;

  push();

  noStroke();
  fill(255, 255, 255, joyEsq.ativo ? 55 : 28);
  ellipse(joyEsq.baseX, joyEsq.baseY, joyEsq.raioMax * 2);
  stroke(255, 255, 255, 110);
  strokeWeight(2);
  noFill();
  ellipse(joyEsq.baseX, joyEsq.baseY, joyEsq.raioMax * 2);

  fill(80, 190, 255, joyEsq.ativo ? 210 : 140);
  stroke(255);
  strokeWeight(2.5);
  ellipse(joyEsq.knobX, joyEsq.knobY, 44);

  let temBola = modoSelecionado === "FUTEBRAWL" && bola && bola.posse === jogador;
  let podeAtacar = temBola || (jogador.municao >= 1 && jogador.cooldownAtaque <= 0 && jogador.delayAtaqueTrunk <= 0);

  noStroke();
  fill(podeAtacar ? color(255, 95, 75, joyDir.ativo ? 75 : 42) : color(120, 120, 120, 35));
  ellipse(joyDir.baseX, joyDir.baseY, joyDir.raioMax * 2);
  stroke(podeAtacar ? color(255, 130, 110, 160) : color(160, 160, 160, 100));
  strokeWeight(2.5);
  noFill();
  ellipse(joyDir.baseX, joyDir.baseY, joyDir.raioMax * 2);

  fill(podeAtacar ? color(255, 80, 60, 220) : color(110, 115, 125, 170));
  stroke(255);
  strokeWeight(2.5);
  ellipse(joyDir.knobX, joyDir.knobY, 48);

  noStroke();
  fill(255);
  textStyle(BOLD);
  textSize(10);
  text(temBola ? "CHUTE" : "ATAQUE", joyDir.knobX, joyDir.knobY + 1);

  let superPronta = jogador.superCarga >= 100;

  noFill();
  stroke(40, 45, 55, 180);
  strokeWeight(5);
  ellipse(joySuper.baseX, joySuper.baseY, 74);

  if (jogador.superCarga > 0) {
    stroke(superPronta ? color(255, 220, 30) : color(255, 150, 20));
    strokeWeight(5);
    let angFim = -HALF_PI + map(jogador.superCarga, 0, 100, 0, TWO_PI);
    arc(joySuper.baseX, joySuper.baseY, 74, 74, -HALF_PI, angFim);
  }

  noStroke();
  fill(superPronta ? color(255, 205, 15, joySuper.ativo ? 245 : 210) : color(75, 80, 95, 165));
  stroke(superPronta ? color(255) : color(140, 145, 160));
  strokeWeight(2.5);
  ellipse(joySuper.knobX, joySuper.knobY, 56);

  noStroke();
  fill(superPronta ? color(25) : color(210));
  textSize(10);
  text("SUPER", joySuper.knobX, joySuper.knobY + 1);

  pop();
}

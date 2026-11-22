let estadoJogo = "NOME_INICIAL"; // NOME_INICIAL, MENU, SELECAO_BRAWLER, DETALHES_BRAWLER, SELECAO_MODO, INTRO_FUTEBRAWL, JOGANDO, FIM
let modoSelecionado = "COMBATE"; // COMBATE, FUTEBRAWL
let personagemSelecionado = "ASH"; // ASH, TRUNK, COLT, BARLEY
let brawlerInspecionado = "ASH";
let scrollBrawlers = 0;
let vencedor = "";
let estatisticasPartida = [];

// Controle de passo fixo (60Hz) para evitar velocidade 2X em telas 90Hz/120Hz/144Hz
let acumuladorTempo = 0;
const PASSO_FIXO_MS = 1000 / 60;

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
let ratosAsh = [];
let efeitosSpawnRatos = [];
let pocas = [];
let pocasTerra = [];
let ondasCirculares = [];
let ondasChoqueAsh = [];
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
  alvoCamY: 0
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
    descCurta: "Terra dá +dano e +vel • Super atropela",
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
    ataque: "560",
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
  frameRate(60);
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

  let dt = (typeof deltaTime === "number" && deltaTime > 0) ? min(deltaTime, 100) : PASSO_FIXO_MS;

  if (estadoJogo === "NOME_INICIAL") {
    acumuladorTempo = 0;
    desenharTelaNickname();
  } else if (estadoJogo === "MENU") {
    acumuladorTempo = 0;
    desenharMenu();
  } else if (estadoJogo === "SELECAO_BRAWLER") {
    acumuladorTempo = 0;
    desenharTelaBrawlers();
  } else if (estadoJogo === "DETALHES_BRAWLER") {
    acumuladorTempo = 0;
    desenharTelaDetalhesBrawler();
  } else if (estadoJogo === "SELECAO_MODO") {
    acumuladorTempo = 0;
    desenharTelaModos();
  } else if (estadoJogo === "INTRO_FUTEBRAWL") {
    acumuladorTempo += dt;
    let passos = 0;
    while (acumuladorTempo >= PASSO_FIXO_MS && passos < 3) {
      acumuladorTempo -= PASSO_FIXO_MS;
      passos++;
      timerIntroFutebrawl--;
      if (timerIntroFutebrawl <= 0) {
        estadoJogo = "JOGANDO";
        break;
      }
    }
    if (acumuladorTempo > PASSO_FIXO_MS * 2) acumuladorTempo = 0;
    desenharIntroFutebrawl();
  } else if (estadoJogo === "JOGANDO") {
    acumuladorTempo += dt;
    let passos = 0;
    while (acumuladorTempo >= PASSO_FIXO_MS && passos < 3 && estadoJogo === "JOGANDO") {
      acumuladorTempo -= PASSO_FIXO_MS;
      passos++;
      atualizarJogo();
    }
    if (acumuladorTempo > PASSO_FIXO_MS * 2) acumuladorTempo = 0;
    if (estadoJogo === "JOGANDO") {
      desenharJogo();
    } else if (estadoJogo === "FIM") {
      desenharFim();
    }
  } else if (estadoJogo === "FIM") {
    acumuladorTempo = 0;
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
// RETRATOS DOS ROSTOS NOS CARDS (ESTILO BRAWL STARS)
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
  let centroX = w > h * 1.15 ? x + w * 0.36 : x + w * 0.48;
  let centroY = y + h * 0.54;

  if (id === "ASH") {
    noStroke();
    fill(185, 38, 235);
    rect(x, y, w, h);

    push();
    translate(centroX, centroY);
    scale(escalaRetrato);
    rotate(-0.07);

    fill(44, 172, 228);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-98, -72);
    vertex(58, -82);
    vertex(76, 86);
    vertex(-98, 86);
    endShape(CLOSE);

    noStroke();
    fill(92, 206, 248);
    beginShape();
    vertex(-92, -66);
    vertex(-74, -67);
    vertex(-68, 80);
    vertex(-92, 80);
    endShape(CLOSE);

    fill(124, 156, 204);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-38, -86);
    vertex(74, -92);
    vertex(64, -34);
    vertex(-28, -42);
    endShape(CLOSE);

    noFill();
    stroke(54, 78, 116);
    strokeWeight(4.5);
    ellipse(4, -66, 34, 30);
    ellipse(40, -68, 34, 30);
    line(21, -67, 23, -67);

    fill(198, 226, 248);
    stroke(12, 16, 24);
    strokeWeight(4);
    rect(-12, -48, 36, 18, 6);
    fill(125, 166, 204);
    rect(-1, -48, 10, 18);
    rect(12, -48, 10, 18);

    fill(22, 92, 152);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    rect(-72, -32, 122, 106, 22);

    fill(10, 12, 18);
    noStroke();
    rect(-60, -20, 98, 86, 16);

    fill(14, 52, 92);
    ellipse(-64, -14, 7, 7);
    ellipse(-64, 52, 7, 7);
    ellipse(42, -14, 7, 7);
    ellipse(42, 52, 7, 7);

    fill(255);
    stroke(10, 12, 18);
    strokeWeight(3.2);
    beginShape();
    vertex(-48, -4);
    vertex(-10, 11);
    vertex(-12, 30);
    vertex(-45, 28);
    vertex(-52, 12);
    endShape(CLOSE);

    beginShape();
    vertex(32, 0);
    vertex(0, 12);
    vertex(2, 30);
    vertex(30, 28);
    vertex(36, 14);
    endShape(CLOSE);

    fill(10, 12, 18);
    noStroke();
    ellipse(-39, 12, 9, 13);
    ellipse(9, 15, 8, 12);

    fill(255);
    stroke(10, 12, 18);
    strokeWeight(3.8);
    beginShape();
    vertex(-38, 62);
    vertex(-34, 43);
    vertex(-12, 40);
    vertex(-4, 44);
    vertex(6, 41);
    vertex(24, 45);
    vertex(26, 62);
    endShape(CLOSE);

    stroke(110, 145, 180);
    strokeWeight(2.6);
    line(-16, 41, -16, 61);
    line(4, 42, 4, 61);
    pop();
  } else if (id === "TRUNK") {
    noStroke();
    fill(188, 36, 238);
    rect(x, y, w, h);

    push();
    translate(centroX, centroY);
    scale(escalaRetrato);

    fill(128, 72, 34);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-18, -84);
    vertex(42, -84);
    vertex(30, -54);
    vertex(-18, -58);
    endShape(CLOSE);

    fill(158, 94, 50);
    stroke(12, 16, 24);
    strokeWeight(4.8);
    beginShape();
    vertex(-88, -84);
    vertex(10, -84);
    vertex(16, 82);
    vertex(-88, 82);
    endShape(CLOSE);

    stroke(102, 56, 26);
    strokeWeight(3);
    line(-66, -48, -66, -24);
    line(-34, -54, -34, -28);
    line(-58, 46, -58, 74);

    fill(218, 202, 102);
    stroke(12, 16, 24);
    strokeWeight(4);
    beginShape();
    vertex(-90, -52);
    bezierVertex(-52, -42, -16, -44, 14, -54);
    vertex(15, -36);
    bezierVertex(-16, -26, -52, -24, -90, -34);
    endShape(CLOSE);
    stroke(125, 110, 42);
    strokeWeight(2.5);
    line(-68, -49, -64, -30);
    line(-40, -45, -36, -27);
    line(-12, -46, -8, -29);

    fill(218, 202, 102);
    stroke(12, 16, 24);
    strokeWeight(4);
    beginShape();
    vertex(-90, 34);
    bezierVertex(-52, 44, -16, 44, 16, 32);
    vertex(17, 50);
    bezierVertex(-16, 62, -52, 62, -90, 52);
    endShape(CLOSE);
    stroke(125, 110, 42);
    strokeWeight(2.5);
    line(-66, 38, -62, 56);
    line(-36, 42, -32, 59);
    line(-8, 40, -4, 57);

    fill(218, 202, 102);
    stroke(12, 16, 24);
    strokeWeight(4);
    beginShape();
    vertex(4, -50);
    bezierVertex(26, -44, 38, -30, 36, -14);
    vertex(20, -12);
    bezierVertex(22, -24, 12, -32, 0, -36);
    endShape(CLOSE);

    fill(86, 212, 48);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-74, -84);
    bezierVertex(-60, -54, -44, -40, -36, -36);
    bezierVertex(-18, -46, 4, -64, 16, -84);
    endShape(CLOSE);
    stroke(46, 145, 24);
    strokeWeight(3);
    line(-35, -82, -36, -40);

    fill(86, 212, 48);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-78, 80);
    bezierVertex(-80, 46, -54, 34, -36, 46);
    bezierVertex(-16, 34, 8, 46, 4, 80);
    endShape(CLOSE);
    stroke(46, 145, 24);
    strokeWeight(3);
    line(-36, 48, -36, 78);

    fill(12, 12, 18);
    stroke(72, 38, 18);
    strokeWeight(4.5);
    beginShape();
    vertex(-78, -20);
    vertex(-56, -32);
    vertex(-36, -16);
    vertex(-4, -30);
    vertex(8, -6);
    vertex(6, 22);
    vertex(-18, 34);
    vertex(-36, 24);
    vertex(-58, 34);
    vertex(-78, 20);
    endShape(CLOSE);

    noStroke();
    fill(248, 238, 45);
    ellipse(-56, 6, 12, 11);
    ellipse(-45, 8, 12, 10);
    ellipse(-20, 7, 11, 10);
    ellipse(-9, 5, 12, 11);

    fill(12, 12, 18);
    ellipse(-55, 6, 4.5, 5.5);
    ellipse(-44, 8, 4.5, 5);
    ellipse(-19, 7, 4.5, 5);
    ellipse(-8, 5, 4.5, 5.5);

    push();
    translate(54, 12);
    rotate(-0.22);

    fill(128, 34, 96);
    stroke(12, 16, 24);
    strokeWeight(4.2);
    beginShape();
    vertex(-8, -38);
    vertex(6, -42);
    vertex(10, -24);
    vertex(-6, -24);
    endShape(CLOSE);

    fill(192, 66, 134);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    ellipse(0, 12, 64, 68);

    noStroke();
    fill(218, 92, 158, 150);
    ellipse(8, 14, 40, 44);
    stroke(118, 32, 82);
    strokeWeight(2.2);
    line(-18, 16, -13, 21);
    line(-11, 23, -7, 26);

    fill(218, 202, 102);
    stroke(12, 16, 24);
    strokeWeight(4.2);
    rect(-32, -24, 64, 12, 6);

    fill(128, 34, 96);
    beginShape();
    vertex(-35, -12);
    bezierVertex(-33, -26, 33, -26, 35, -12);
    bezierVertex(20, -6, -20, -6, -35, -12);
    endShape(CLOSE);
    pop();

    pop();
  } else if (id === "COLT") {
    noStroke();
    fill(42, 208, 42);
    rect(x, y, w, h);

    push();
    translate(centroX, centroY);
    scale(escalaRetrato);

    fill(102, 130, 224);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-82, 42);
    vertex(12, 64);
    vertex(-4, 92);
    vertex(-88, 92);
    endShape(CLOSE);

    fill(222, 38, 65);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    ellipse(-28, -22, 126, 122);

    fill(245, 202, 168);
    ellipse(-68, -10, 24, 34);

    fill(252, 214, 182);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-46, -44);
    vertex(38, -44);
    vertex(44, 20);
    vertex(14, 64);
    vertex(-24, 54);
    vertex(-48, 18);
    endShape(CLOSE);

    fill(232, 42, 68);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    beginShape();
    vertex(-76, -30);
    bezierVertex(-80, -84, 32, -92, 58, -64);
    bezierVertex(50, -38, 24, -30, -14, -36);
    bezierVertex(-34, -38, -54, -20, -76, -30);
    endShape(CLOSE);

    fill(232, 42, 68);
    beginShape();
    vertex(-62, -20);
    vertex(-42, -16);
    vertex(-36, 34);
    vertex(-56, 30);
    endShape(CLOSE);

    fill(12, 16, 24);
    noStroke();
    push();
    translate(-10, -22);
    rotate(0.22);
    rect(-15, -5.5, 30, 10, 5);
    pop();

    push();
    translate(26, -16);
    rotate(-0.28);
    rect(-13, -5.5, 26, 10, 5);
    pop();

    fill(255);
    stroke(12, 16, 24);
    strokeWeight(3);
    ellipse(-10, -1, 23, 28);
    ellipse(24, 3, 19, 24);

    fill(12, 16, 24);
    noStroke();
    ellipse(-11, -1, 10, 15);
    ellipse(21, 3, 9, 13);

    noFill();
    stroke(165, 115, 88);
    strokeWeight(2.5);
    line(7, 6, 13, 17);
    line(13, 17, 4, 19);

    stroke(12, 16, 24);
    strokeWeight(3);
    arc(3, 23, 28, 16, 0.25, PI - 0.35);

    stroke(235, 165, 128);
    strokeWeight(3.8);
    line(10, 42, 19, 51);
    line(19, 42, 10, 51);
    pop();
  } else if (id === "BARLEY") {
    noStroke();
    fill(42, 208, 42);
    rect(x, y, w, h);

    push();
    translate(centroX, centroY);
    scale(escalaRetrato);

    fill(218, 48, 62);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    ellipse(-10, 74, 160, 106);

    fill(92, 98, 112);
    ellipse(-26, 55, 34, 24);
    ellipse(14, 57, 34, 24);
    ellipse(-6, 55, 17, 17);

    fill(165, 182, 208);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    rect(-66, -66, 108, 108, 40);

    fill(125, 142, 168);
    ellipse(-52, -14, 20, 34);

    fill(128, 72, 168);
    stroke(12, 16, 24);
    strokeWeight(4);
    beginShape();
    vertex(-72, -62);
    vertex(30, -86);
    vertex(36, -70);
    vertex(-66, -46);
    endShape(CLOSE);

    fill(42, 68, 102);
    stroke(12, 16, 24);
    strokeWeight(4.5);
    ellipse(-6, -22, 84, 76);

    fill(248, 232, 65);
    stroke(12, 16, 24);
    strokeWeight(3.5);
    ellipse(-4, -22, 50, 48);

    noFill();
    stroke(12, 16, 24);
    strokeWeight(5.2);
    arc(-4, -18, 22, 22, PI + 0.25, TWO_PI - 0.25);

    fill(215, 226, 244);
    stroke(12, 16, 24);
    strokeWeight(4);
    beginShape();
    vertex(-52, 16);
    bezierVertex(-60, 44, -22, 52, -6, 33);
    bezierVertex(10, 52, 50, 44, 42, 16);
    bezierVertex(34, 2, 12, 8, -6, 16);
    bezierVertex(-24, 8, -44, 2, -52, 16);
    endShape(CLOSE);
    pop();
  }

  ctx.restore();
}

// ==========================================
// SUBTELA 1: LISTA DE BRAWLERS (CARDS LIMPOS)
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
    fill(10, 14, 24, 240);
    rect(cxCard, cyCard + 6, cardW, cardH, 14);

    desenharRetratoCardBrawler(item.id, cxCard, cyCard, cardW, cardH, 14);

    noFill();
    strokeWeight(4);
    stroke(12, 16, 24);
    rect(cxCard, cyCard, cardW, cardH, 14);

    if (selecionado || hover) {
      strokeWeight(2.5);
      stroke(selecionado ? color(85, 255, 125) : color(255, 225, 65));
      rect(cxCard + 2, cyCard + 2, cardW - 4, cardH - 4, 12);
    }

    if (selecionado) {
      noStroke();
      fill(45, 225, 95);
      stroke(12, 16, 24);
      strokeWeight(2);
      rect(cxCard + cardW - 96, cyCard + 9, 86, 20, 6);
      noStroke();
      fill(12, 24, 16);
      textStyle(BOLD);
      textSize(10);
      text("SELECIONADO", cxCard + cardW - 53, cyCard + 19);
    }

    textAlign(RIGHT, BOTTOM);
    textStyle(BOLD);
    textSize(23);
    stroke(10, 14, 22, 255);
    strokeWeight(5);
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
  acumuladorTempo = 0;
  projeteis = [];
  garrafas = [];
  gaiolasAsh = [];
  ratosAsh = [];
  efeitosSpawnRatos = [];
  pocas = [];
  pocasTerra = [];
  ondasCirculares = [];
  ondasChoqueAsh = [];
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
  ratosAsh = [];
  efeitosSpawnRatos = [];
  pocas = [];
  pocasTerra = [];
  ondasCirculares = [];
  ondasChoqueAsh = [];
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
    let posAzul = [
      { x: 430, y: meioY },
      { x: 300, y: 180 },
      { x: 300, y: mundoAltura - 180 }
    ];
    let equipeAzul = [jogador, ...aliados];
    for (let i = 0; i < equipeAzul.length; i++) {
      equipeAzul[i].resetarParaRodada(posAzul[i].x, posAzul[i].y, 0);
    }

    let posVerm = [
      { x: mundoLargura - 430, y: meioY },
      { x: mundoLargura - 300, y: 180 },
      { x: mundoLargura - 300, y: mundoAltura - 180 }
    ];
    for (let i = 0; i < inimigos.length; i++) {
      inimigos[i].resetarParaRodada(posVerm[i].x, posVerm[i].y, PI);
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
    gf.atualizar();
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

  for (let i = ratosAsh.length - 1; i >= 0; i--) {
    let rt = ratosAsh[i];
    rt.atualizar(todosBrawlers);
    if (rt.vida <= 0) {
      ratosAsh.splice(i, 1);
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

  for (let i = ondasChoqueAsh.length - 1; i >= 0; i--) {
    ondasChoqueAsh[i].vida--;
    if (ondasChoqueAsh[i].vida <= 0) {
      ondasChoqueAsh.splice(i, 1);
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

  // Rachaduras no chão do Ash (mais visíveis e com borda de terra quebrada)
  for (let rc of rachadurasChao) {
    let opacidade = map(rc.vida, 0, rc.vidaMax, 0, 235);
    push();
    translate(rc.x, rc.y);
    rotate(rc.angulo);

    stroke(24, 18, 12, opacidade * 0.9);
    strokeWeight(7);
    noFill();
    beginShape();
    vertex(0, 0);
    vertex(rc.comprimento * 0.3, -7);
    vertex(rc.comprimento * 0.62, 6);
    vertex(rc.comprimento, -2);
    endShape();

    stroke(rc.furiaAlta ? color(255, 110, 45, opacidade) : color(135, 235, 255, opacidade * 0.9));
    strokeWeight(3);
    beginShape();
    vertex(2, 0);
    vertex(rc.comprimento * 0.3, -7);
    vertex(rc.comprimento * 0.62, 6);
    vertex(rc.comprimento * 0.96, -2);
    endShape();

    line(rc.comprimento * 0.25, -5, rc.comprimento * 0.45, -17);
    line(rc.comprimento * 0.55, 5, rc.comprimento * 0.78, 18);
    line(rc.comprimento * 0.8, -1, rc.comprimento * 0.98, -12);
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

  // Onda de choque frontal saindo do chão no ataque do Ash
  for (let oca of ondasChoqueAsh) {
    desenharOndaChoqueAsh(oca);
  }

  if (modoSelecionado === "FUTEBRAWL" && bola) {
    desenharBolaAnimada();
  }

  for (let rt of ratosAsh) {
    rt.desenhar();
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

function desenharOndaChoqueAsh(oca) {
  let progresso = 1 - oca.vida / oca.vidaMax;
  let distAtual = lerp(22, oca.alcance, progresso);
  let larguraArco = lerp(42, 78, progresso);
  let opacidade = map(oca.vida, 0, oca.vidaMax, 0, 240);

  push();
  translate(oca.x + cos(oca.angulo) * distAtual, oca.y + sin(oca.angulo) * distAtual);
  rotate(oca.angulo);

  // Sombra de poeira no chão
  noFill();
  stroke(65, 45, 25, opacidade * 0.65);
  strokeWeight(14);
  arc(-6, 0, larguraArco * 0.7, larguraArco * 1.45, -HALF_PI * 0.85, HALF_PI * 0.85);

  // Onda principal de choque
  stroke(oca.furiaAlta ? color(255, 95, 35, opacidade) : color(115, 225, 255, opacidade));
  strokeWeight(8);
  arc(0, 0, larguraArco * 0.65, larguraArco * 1.35, -HALF_PI * 0.85, HALF_PI * 0.85);

  // Núcleo branco brilhante da onda
  stroke(255, 255, 255, opacidade * 0.9);
  strokeWeight(3.5);
  arc(3, 0, larguraArco * 0.55, larguraArco * 1.2, -HALF_PI * 0.78, HALF_PI * 0.78);
  pop();
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
      let trajDash = calcularTrajetoriaSimulada(b.x, b.y, b.angulo, 275, b.raio, true);
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
      fill(podeDisparar ? color(96, 26, 158, 84) : color(120, 120, 120, 45));
      stroke(podeDisparar ? color(155, 75, 215, 195) : color(150, 150, 150, 100));
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
  fill(time === "AZUL" ? color(78, 18, 142) : color(175, 26, 44));
  stroke(20);
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
    let acertosTexto = "7 acertos";
    if (jogador.tipo === "TRUNK") acertosTexto = "6 críticos";
    else if (jogador.tipo === "COLT") acertosTexto = "12 balas";

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
    this.anguloAtaqueTravado = 0;
    this.anguloSuperTravado = 0;

    this.furia = 0;
    this.tempoSemFuria = 0;

    this.tempoSemDano = 0;
    this.timerCura = 0;

    this.dashTimer = 0;
    this.dashAngulo = 0;
    this.tickEngancheTrunk = 0;

    this.estadoIA = "PATRULHAR";
    this.desvioTimer = 0;
    this.anguloDesvio = 0;
    this.ladoContornoBot = random() > 0.5 ? 1 : -1;
    this.framesPreso = 0;
    this.pontoPatrulhaX = x;
    this.pontoPatrulhaY = y;
    this.timerPatrulha = 0;
    this.delayReacao = Math.floor(random(18, 40));
    this.delaySuperBot = Math.floor(random(16, 38));
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
      this.danoBase = 560;
    }
    this.vida = this.vidaMax;
  }

  resetarParaRodada(x, y, angulo) {
    this.x = x;
    this.y = y;
    this.angulo = angulo;
    this.vida = this.vidaMax;
    this.municao = 3;
    this.recarga = 0;
    this.cooldownAtaque = 0;
    this.respawnTimer = 0;
    this.dashTimer = 0;
    this.delayAtaqueTrunk = 0;
    this.giroTrunk = 0;
    this.filaDisparosColt = [];
    this.vxAtual = 0;
    this.vyAtual = 0;
    this.tempoComBola = 0;
    this.furia = 0;
    this.tempoSemFuria = 0;
  }

  obterTempoRecarga() {
    if (this.tipo === "TRUNK") return 62; // 1,04s
    if (this.tipo === "ASH") return 62;   // 1,03s
    if (this.tipo === "BARLEY") return 68;// 1,13s
    return 48; // COLT 0,80s
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

  calcularAnguloPreditivoColt(alvo) {
    let d = dist(this.x, this.y, alvo.x, alvo.y);
    let velBala = this.superCarga >= 100 ? 12.4 : 9.6;
    let tempoVoo = d / velBala;
    let predX = alvo.x + (alvo.vxAtual || 0) * (tempoVoo * 0.9);
    let predY = alvo.y + (alvo.vyAtual || 0) * (tempoVoo * 0.9);
    return atan2(predY - this.y, predX - this.x) + random(-0.05, 0.05);
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

    // Mantém o Colt travado na direção para onde estava mirando ao iniciar a rajada
    if (this.tipo === "COLT" && this.filaDisparosColt.length > 0) {
      this.angulo = this.filaDisparosColt[0].ehSuper ? this.anguloSuperTravado : this.anguloAtaqueTravado;
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

  dispararBalaColt(itemDisparo) {
    let angDisparo = itemDisparo.ehSuper ? this.anguloSuperTravado : this.anguloAtaqueTravado;
    let frenteX = cos(angDisparo) * 16;
    let frenteY = sin(angDisparo) * 16;
    let perpX = -sin(angDisparo) * itemDisparo.offsetLateral;
    let perpY = cos(angDisparo) * itemDisparo.offsetLateral;

    projeteis.push(
      new Projetil(
        this.x + frenteX + perpX,
        this.y + frenteY + perpY,
        angDisparo,
        itemDisparo.vel,
        itemDisparo.alcance,
        itemDisparo.dano,
        this.time,
        itemDisparo.estilo,
        this
      )
    );
    this.animAtaque = 0.85;
  }

  atualizar() {
    if (this.animAtaque > 0) this.animAtaque -= 0.12;
    if (this.giroTrunk > 0) this.giroTrunk = max(0, this.giroTrunk - 0.55);

    if (this.delayAtaqueTrunk > 0) {
      this.delayAtaqueTrunk--;
      if (this.delayAtaqueTrunk === 0 && this.vida > 0) {
        this.executarGolpeTrunk();
      }
    }

    // Cadência uniforme e contínua do Colt
    if (this.tipo === "COLT" && this.filaDisparosColt.length > 0) {
      let prox = this.filaDisparosColt[0];
      prox.espera--;
      if (prox.espera <= 0) {
        this.filaDisparosColt.shift();
        this.dispararBalaColt(prox);
      }
    }

    if (this.tipo === "ASH" && this.furia > 0) {
      this.tempoSemFuria++;
      if (this.tempoSemFuria > 138) { // Fúria começa a cair após 2,3s (138 frames)
        this.furia = max(0, this.furia - 0.15);
      }
    }

    if (this.vida > 0 && this.vida < this.vidaMax) {
      if (this.estaAtacandoAgora()) {
        this.tempoSemDano = 0;
        this.timerCura = 0;
      } else {
        this.tempoSemDano++;
        if (this.tempoSemDano >= 180) {
          this.timerCura++;
          if (this.timerCura >= 45) {
            this.timerCura = 0;
            let cura = Math.round(this.vidaMax * 0.12);
            this.vida = min(this.vidaMax, this.vida + cura);
            criarTextoDano(this.x, this.y - 58, "+" + cura, color(80, 255, 110));
          }
        }
      }
    } else {
      this.tempoSemDano = 0;
      this.timerCura = 0;
    }

    // Super do Trunk: continua trajetória; fica bem lento ao passar por cima de inimigo dando dano; senão mantém velocidade
    if (this.dashTimer > 0) {
      this.dashTimer--;
      let todos = [jogador, ...aliados, ...inimigos];

      let inimigosNoCaminho = [];
      for (let a of todos) {
        if (a !== this && a.time !== this.time && a.vida > 0) {
          if (dist(this.x, this.y, a.x, a.y) <= this.raio + a.raio + 4) {
            inimigosNoCaminho.push(a);
          }
        }
      }

      let velDash = inimigosNoCaminho.length > 0 ? 2.2 : 8.6;
      let dirX = cos(this.dashAngulo);
      let dirY = sin(this.dashAngulo);

      let nx = this.x + dirX * velDash;
      if (this.colideObstaculo(nx, this.y) || nx < 32 || nx > mundoLargura - 32) {
        dirX *= -1;
        this.dashAngulo = atan2(dirY, dirX);
      } else {
        this.x = nx;
      }

      let ny = this.y + dirY * velDash;
      if (this.colideObstaculo(this.x, ny) || ny < 65 || ny > mundoAltura - 32) {
        dirY *= -1;
        this.dashAngulo = atan2(dirY, dirX);
      } else {
        this.y = ny;
      }

      this.vxAtual = cos(this.dashAngulo) * velDash;
      this.vyAtual = sin(this.dashAngulo) * velDash;
      this.angulo = this.dashAngulo;

      if (this.dashTimer % 3 === 0) {
        pocasTerra.push(new PocaTerraTrunk(this.x, this.y, 44, this.time));
      }

      for (let rt of ratosAsh) {
        if (rt.time !== this.time && rt.vida > 0 && dist(this.x, this.y, rt.x, rt.y) <= this.raio + rt.raio) {
          rt.receberDano(300, this);
        }
      }

      if (inimigosNoCaminho.length > 0) {
        if (this.tickEngancheTrunk <= 0) {
          for (let alvo of inimigosNoCaminho) {
            alvo.receberDano(260, color(255, 130, 15), true, this);
            for (let k = 0; k < 4; k++) {
              particulas.push({
                x: alvo.x + random(-10, 10),
                y: alvo.y + random(-10, 10),
                vx: random(-3, 3),
                vy: random(-3, 3),
                tam: random(4, 7),
                cor: color(255, 155, 35, 220),
                vida: 12
              });
            }
          }
          this.tickEngancheTrunk = 5;
        } else {
          this.tickEngancheTrunk--;
        }
      } else {
        this.tickEngancheTrunk = 0;
      }
    }

    // Recarga pausada enquanto o Brawler estiver atacando (vale para jogador e bots)
    if (this.municao < 3) {
      if (!this.estaAtacandoAgora()) {
        let tempoRec = this.obterTempoRecarga();
        this.recarga++;
        if (this.recarga >= tempoRec) {
          this.municao++;
          this.recarga = 0;
        }
      }
    } else {
      this.recarga = 0;
    }

    if (this.cooldownAtaque > 0) this.cooldownAtaque--;
    if (this.delayReacao > 0) this.delayReacao--;
    if (this.delaySuperBot > 0) this.delaySuperBot--;
  }

  atacar(alvoBot = null) {
    if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === this) {
      lancaBolaComAlcance(this, this.angulo, 230, 10.5, false);
      this.cooldownAtaque = 12;
      return;
    }

    if (this.municao < 1 || this.cooldownAtaque > 0 || this.delayAtaqueTrunk > 0) return;

    this.municao--;
    this.animAtaque = 1.0;

    if (this.tipo === "ASH") {
      this.cooldownAtaque = 18;
      let danoAtual = this.calcularDanoAtual();
      let todos = [jogador, ...aliados, ...inimigos];

      // 3 rachaduras divergentes no chão quebrado
      let angulosRachadura = [this.angulo - 0.22, this.angulo, this.angulo + 0.22];
      for (let aRach of angulosRachadura) {
        rachadurasChao.push({
          x: this.x + cos(aRach) * 20,
          y: this.y + sin(aRach) * 20,
          angulo: aRach,
          comprimento: 128,
          furiaAlta: this.furia > 66,
          vida: 34,
          vidaMax: 34
        });
      }

      // Onda de choque frontal saindo do chão
      ondasChoqueAsh.push({
        x: this.x,
        y: this.y,
        angulo: this.angulo,
        alcance: 145,
        furiaAlta: this.furia > 66,
        vida: 13,
        vidaMax: 13
      });

      // Estilhaços de terra e poeira voando para frente
      for (let p = 0; p < 12; p++) {
        let dFrente = random(28, 140);
        let dLado = random(-22, 22);
        let px = this.x + cos(this.angulo) * dFrente - sin(this.angulo) * dLado;
        let py = this.y + sin(this.angulo) * dFrente + cos(this.angulo) * dLado;
        particulas.push({
          x: px,
          y: py,
          vx: cos(this.angulo) * random(1.2, 3.2) + random(-0.8, 0.8),
          vy: sin(this.angulo) * random(1.2, 3.2) + random(-0.8, 0.8),
          tam: random(4.5, 8.5),
          cor: this.furia > 66 ? color(255, 110, 45, 225) : color(135, 215, 255, 215),
          vida: 15
        });
      }

      let acertouAlguem = false;
      for (let b of todos) {
        if (b !== this && b.time !== this.time && b.vida > 0) {
          let d = dist(this.x, this.y, b.x, b.y);
          let angParaAlvo = atan2(b.y - this.y, b.x - this.x);
          let diffAng = abs(atan2(sin(angParaAlvo - this.angulo), cos(angParaAlvo - this.angulo)));
          if (d < 145 && diffAng < 0.55) {
            b.receberDano(danoAtual, color(255, 255, 255), this.furia > 66, this);
            this.superCarga = min(100, this.superCarga + 15);
            acertouAlguem = true;
          }
        }
      }

      for (let rt of ratosAsh) {
        if (rt.time !== this.time && rt.vida > 0) {
          let d = dist(this.x, this.y, rt.x, rt.y);
          let angParaAlvo = atan2(rt.y - this.y, rt.x - this.x);
          let diffAng = abs(atan2(sin(angParaAlvo - this.angulo), cos(angParaAlvo - this.angulo)));
          if (d < 145 && diffAng < 0.55) {
            rt.receberDano(danoAtual, this);
            acertouAlguem = true;
          }
        }
      }

      if (acertouAlguem) {
        this.ganharFuria(20);
      }
    } else if (this.tipo === "TRUNK") {
      this.cooldownAtaque = 34;
      this.delayAtaqueTrunk = 30;
    } else if (this.tipo === "COLT") {
      this.cooldownAtaque = 26;
      this.anguloAtaqueTravado = this.angulo;
      this.filaDisparosColt = [];
      this.dispararBalaColt({
        offsetLateral: -7,
        vel: 9.6,
        alcance: 345,
        dano: this.danoBase,
        estilo: "COLT_NORMAL",
        ehSuper: false
      });
      for (let i = 1; i < 6; i++) {
        let lado = i % 2 === 0 ? -7 : 7;
        this.filaDisparosColt.push({
          espera: 2,
          offsetLateral: lado,
          vel: 9.6,
          alcance: 345,
          dano: this.danoBase,
          estilo: "COLT_NORMAL",
          ehSuper: false
        });
      }
    } else if (this.tipo === "BARLEY") {
      this.cooldownAtaque = 18;
      let alvo;
      if (!this.ehJogador && alvoBot) {
        let pred = this.calcularAlvoPreditivoBarley(alvoBot);
        this.angulo = pred.angulo;
        alvo = { x: pred.x, y: pred.y };
      } else {
        alvo = this.calcularAlvoBarley();
      }
      let distAlvo = dist(this.x, this.y, alvo.x, alvo.y);
      let tempoVoo = this.calcularTempoVooBarley(distAlvo);
      garrafas.push(new GarrafaBarley(this.x, this.y, alvo.x, alvo.y, this.danoBase, this.time, false, 58, tempoVoo, this));
    }
  }

  usarSuper() {
    if (this.superCarga < 100) return;

    if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === this) {
      this.superCarga = 0;
      lancaBolaComAlcance(this, this.angulo, 410, 15.5, true);
      this.cooldownAtaque = 12;
      return;
    }

    this.superCarga = 0;

    if (this.tipo === "ASH") {
      let alcanceGaiola = 115;
      if (this.ehJogador && !ehMobile) {
        let dMouse = dist(this.x, this.y, mouseX + camX, mouseY + camY);
        alcanceGaiola = constrain(dMouse, 40, 115);
      } else if (!this.ehJogador) {
        alcanceGaiola = 105;
      }

      let alvoX = constrain(this.x + cos(this.angulo) * alcanceGaiola, 45, mundoLargura - 45);
      let alvoY = constrain(this.y + sin(this.angulo) * alcanceGaiola, 75, mundoAltura - 45);
      gaiolasAsh.push(new GaiolaRatosAsh(this.x, this.y, alvoX, alvoY, this.time, this));
    } else if (this.tipo === "TRUNK") {
      this.dashTimer = 32;
      this.dashAngulo = this.angulo;
      this.tickEngancheTrunk = 0;
    } else if (this.tipo === "COLT") {
      this.cooldownAtaque = 28;
      this.anguloSuperTravado = this.angulo;
      this.filaDisparosColt = [];
      this.dispararBalaColt({
        offsetLateral: -9,
        vel: 12.4,
        alcance: 430,
        dano: 350,
        estilo: "COLT_SUPER",
        ehSuper: true
      });
      for (let i = 1; i < 12; i++) {
        let lado = i % 2 === 0 ? -9 : 9;
        this.filaDisparosColt.push({
          espera: 1,
          offsetLateral: lado,
          vel: 12.4,
          alcance: 430,
          dano: 350,
          estilo: "COLT_SUPER",
          ehSuper: true
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

      for (let i = 0; i < posicoes.length; i++) {
        let gx = constrain(centro.x + dirX * posicoes[i].frente + perpX * posicoes[i].lado, 45, mundoLargura - 45);
        let gy = constrain(centro.y + dirY * posicoes[i].frente + perpY * posicoes[i].lado, 75, mundoAltura - 45);
        let dGarrafa = dist(this.x, this.y, gx, gy);
        let tempoVoo = this.calcularTempoVooBarley(dGarrafa) + i * 2;
        garrafas.push(new GarrafaBarley(this.x, this.y, gx, gy, 440, this.time, true, 78, tempoVoo, this));
      }
    }
  }

  temLinhaDeVisao(tx, ty) {
    let passos = 14;
    for (let i = 1; i < passos; i++) {
      let px = lerp(this.x, tx, i / passos);
      let py = lerp(this.y, ty, i / passos);
      for (let o of obstaculos) {
        if (px > o.x && px < o.x + o.w && py > o.y && py < o.y + o.h) {
          return false;
        }
      }
    }
    return true;
  }

  // Esquiva inteligente de projéteis e garrafas inimigas
  calcularVetorEsquiva() {
    let ex = 0;
    let ey = 0;

    for (let p of projeteis) {
      if (p.time === this.time || p.vida <= 0) continue;
      let dx = this.x - p.x;
      let dy = this.y - p.y;
      let d = sqrt(dx * dx + dy * dy);
      if (d > 155 || d < 1) continue;

      let dirBalaX = cos(p.angulo);
      let dirBalaY = sin(p.angulo);
      let projFrente = dx * dirBalaX + dy * dirBalaY;
      if (projFrente > 0) {
        let distPerp = abs(-dx * dirBalaY + dy * dirBalaX);
        if (distPerp < this.raio + 22) {
          let lado = (-dx * dirBalaY + dy * dirBalaX) >= 0 ? 1 : -1;
          ex += -dirBalaY * lado * 1.15;
          ey += dirBalaX * lado * 1.15;
        }
      }
    }

    for (let gf of garrafas) {
      if (gf.time === this.time || gf.finalizada) continue;
      let dAlvo = dist(this.x, this.y, gf.xAlvo, gf.yAlvo);
      if (dAlvo < 95 && dAlvo > 1) {
        ex += ((this.x - gf.xAlvo) / dAlvo) * 1.1;
        ey += ((this.y - gf.yAlvo) / dAlvo) * 1.1;
      }
    }

    return { x: ex, y: ey };
  }

  // Decisão tática da Super dos bots
  deveUsarSuperBot(alvo, menorDist, temVisao, temBola = false, golInimigoX = 0, alvoGolY = 0) {
    if (this.superCarga < 100 || this.delaySuperBot > 0) return false;

    if (temBola) {
      let distGol = dist(this.x, this.y, golInimigoX, alvoGolY);
      return distGol < 395 && this.temLinhaDeVisao(golInimigoX, alvoGolY);
    }

    if (!alvo) return false;

    if (this.tipo === "ASH") {
      return menorDist < 245;
    } else if (this.tipo === "TRUNK") {
      return menorDist < 255 && temVisao;
    } else if (this.tipo === "COLT") {
      if (modoSelecionado === "FUTEBRAWL" && !this.temLinhaDeVisao(golInimigoX, alvoGolY) && dist(this.x, this.y, golInimigoX, alvoGolY) < 420) {
        this.angulo = atan2(alvoGolY - this.y, golInimigoX - this.x);
        return true;
      }
      return menorDist < 395 && temVisao;
    } else if (this.tipo === "BARLEY") {
      return menorDist < 275;
    }
    return false;
  }

  navegarPara(destX, destY, vel) {
    let angAlvo = atan2(destY - this.y, destX - this.x);
    let esquiva = this.calcularVetorEsquiva();

    if (this.desvioTimer > 0) {
      this.desvioTimer--;
      let vx = cos(this.anguloDesvio) * vel;
      let vy = sin(this.anguloDesvio) * vel;
      let andou = this.aplicarMovimento(vx, vy);
      if (andou < vel * 0.25) {
        this.anguloDesvio += (HALF_PI * 0.7) * this.ladoContornoBot;
      }
      return;
    }

    let frenteX = this.x + cos(angAlvo) * 38;
    let frenteY = this.y + sin(angAlvo) * 38;

    if (this.colideObstaculo(frenteX, frenteY)) {
      let achouRota = false;
      for (let passo = 1; passo <= 4; passo++) {
        let offset = passo * 0.42;
        let ang1 = angAlvo + offset * this.ladoContornoBot;
        if (!this.colideObstaculo(this.x + cos(ang1) * 44, this.y + sin(ang1) * 44)) {
          this.anguloDesvio = ang1;
          this.desvioTimer = 18;
          achouRota = true;
          break;
        }
        let ang2 = angAlvo - offset * this.ladoContornoBot;
        if (!this.colideObstaculo(this.x + cos(ang2) * 44, this.y + sin(ang2) * 44)) {
          this.anguloDesvio = ang2;
          this.desvioTimer = 18;
          achouRota = true;
          break;
        }
      }
      if (!achouRota) {
        this.ladoContornoBot *= -1;
        this.anguloDesvio = angAlvo + PI * 0.75 * this.ladoContornoBot;
        this.desvioTimer = 22;
      }
      this.aplicarMovimento(cos(this.anguloDesvio) * vel, sin(this.anguloDesvio) * vel);
    } else {
      let dirX = cos(angAlvo) + esquiva.x;
      let dirY = sin(angAlvo) + esquiva.y;
      let mag = sqrt(dirX * dirX + dirY * dirY);
      if (mag > 0.01) {
        dirX /= mag;
        dirY /= mag;
      }
      let andou = this.aplicarMovimento(dirX * vel, dirY * vel);
      if (andou < vel * 0.22) {
        this.framesPreso++;
        if (this.framesPreso > 10) {
          this.ladoContornoBot *= -1;
          this.anguloDesvio = angAlvo + HALF_PI * this.ladoContornoBot;
          this.desvioTimer = 20;
          this.framesPreso = 0;
        }
      } else {
        this.framesPreso = 0;
      }
    }
  }

  iaCombate(todos) {
    let alvo = null;
    let menorDist = Infinity;
    for (let b of todos) {
      if (b !== this && b.time !== this.time && b.vida > 0) {
        let d = dist(this.x, this.y, b.x, b.y);
        if (d < menorDist) {
          menorDist = d;
          alvo = b;
        }
      }
    }

    let velAtual = this.calcularVelocidadeAtual();

    let distCentro = dist(this.x, this.y, mundoLargura / 2, mundoAltura / 2);
    if (distCentro > venenoRaio - 90) {
      this.estadoIA = "FUGIR_VENENO";
      this.navegarPara(mundoLargura / 2, mundoAltura / 2, velAtual);
      if (alvo && menorDist < 340) {
        this.angulo = this.tipo === "COLT"
          ? this.calcularAnguloPreditivoColt(alvo)
          : atan2(alvo.y - this.y, alvo.x - this.x);
        if (this.delayReacao <= 0) {
          this.atacar(alvo);
          this.delayReacao = Math.floor(random(22, 42));
        }
      }
      return;
    }

    if (alvo && this.vida < this.vidaMax * 0.32 && menorDist < 380) {
      this.estadoIA = "FUGIR_E_CURAR";
      let angFuga = atan2(this.y - alvo.y, this.x - alvo.x);
      let fugaX = constrain(this.x + cos(angFuga) * 180, 80, mundoLargura - 80);
      let fugaY = constrain(this.y + sin(angFuga) * 180, 100, mundoAltura - 80);
      this.navegarPara(fugaX, fugaY, velAtual);
      this.angulo = atan2(alvo.y - this.y, alvo.x - this.x);
      if (this.delayReacao <= 0 && menorDist < 280) {
        this.atacar(alvo);
        this.delayReacao = Math.floor(random(24, 42));
      }
      return;
    }

    if (alvo && menorDist < 540) {
      this.estadoIA = "COMBATE";
      let temVisao = this.temLinhaDeVisao(alvo.x, alvo.y);
      let alcanceIdeal = (this.tipo === "ASH" || this.tipo === "TRUNK") ? 105 : 250;

      if (!temVisao && this.tipo !== "BARLEY") {
        this.navegarPara(alvo.x, alvo.y, velAtual);
      } else if (menorDist > alcanceIdeal) {
        this.navegarPara(alvo.x, alvo.y, velAtual);
      } else if (menorDist < alcanceIdeal - 65) {
        let angFuga = atan2(this.y - alvo.y, this.x - alvo.x);
        this.navegarPara(this.x + cos(angFuga) * 100, this.y + sin(angFuga) * 100, velAtual);
      } else {
        let angStrafe = atan2(alvo.y - this.y, alvo.x - this.x) + HALF_PI * this.ladoContornoBot;
        if (frameCount % 95 === 0) this.ladoContornoBot *= -1;
        this.navegarPara(this.x + cos(angStrafe) * 70, this.y + sin(angStrafe) * 70, velAtual * 0.72);
      }

      if (this.tipo !== "TRUNK" || this.giroTrunk <= 0) {
        this.angulo = this.tipo === "COLT"
          ? this.calcularAnguloPreditivoColt(alvo)
          : atan2(alvo.y - this.y, alvo.x - this.x);
      }

      if (this.deveUsarSuperBot(alvo, menorDist, temVisao)) {
        this.usarSuper();
        this.delaySuperBot = Math.floor(random(20, 40));
      } else if (this.delayReacao <= 0 && (temVisao || this.tipo === "BARLEY")) {
        this.atacar(alvo);
        this.delayReacao = Math.floor(random(22, 42));
      }
    } else {
      this.estadoIA = "PATRULHAR";
      this.timerPatrulha--;
      if (this.timerPatrulha <= 0 || dist(this.x, this.y, this.pontoPatrulhaX, this.pontoPatrulhaY) < 60) {
        let maxR = max(250, venenoRaio - 220);
        let angRand = random(TWO_PI);
        let distRand = random(150, maxR);
        this.pontoPatrulhaX = constrain(mundoLargura / 2 + cos(angRand) * distRand, 120, mundoLargura - 120);
        this.pontoPatrulhaY = constrain(mundoAltura / 2 + sin(angRand) * distRand, 140, mundoAltura - 120);
        this.timerPatrulha = Math.floor(random(90, 180));
      }
      this.navegarPara(this.pontoPatrulhaX, this.pontoPatrulhaY, velAtual * 0.85);
      this.angulo = atan2(this.pontoPatrulhaY - this.y, this.pontoPatrulhaX - this.x);
    }
  }

  iaFutebrawl(bolaObj, meuTime, timeInimigo) {
    let golInimigoX = this.time === "AZUL" ? mundoLargura - 30 : 30;
    let meuGolX = this.time === "AZUL" ? 30 : mundoLargura - 30;
    let meioY = mundoAltura / 2;
    let velAtual = this.calcularVelocidadeAtual();

    let alvo = null;
    let menorDist = Infinity;
    for (let ini of timeInimigo) {
      if (ini.vida > 0) {
        let d = dist(this.x, this.y, ini.x, ini.y);
        if (d < menorDist) {
          menorDist = d;
          alvo = ini;
        }
      }
    }

    if (bolaObj && bolaObj.posse === this) {
      this.estadoIA = "ATACAR_GOL";
      this.tempoComBola++;
      let alvoGolY = meioY + constrain((this.y - meioY) * 0.5, -65, 65);
      this.navegarPara(golInimigoX, alvoGolY, velAtual);
      this.angulo = atan2(alvoGolY - this.y, golInimigoX - this.x);

      let distGol = dist(this.x, this.y, golInimigoX, alvoGolY);
      if (this.deveUsarSuperBot(alvo, menorDist, true, true, golInimigoX, alvoGolY)) {
        this.usarSuper();
      } else if (distGol < 235 || (menorDist < 95 && this.tempoComBola > 22)) {
        this.atacar();
      }
      return;
    }

    this.tempoComBola = 0;

    let maisPertoBola = true;
    let minhaDistBola = bolaObj ? dist(this.x, this.y, bolaObj.x, bolaObj.y) : Infinity;
    for (let comp of meuTime) {
      if (comp !== this && comp.vida > 0 && bolaObj) {
        if (dist(comp.x, comp.y, bolaObj.x, bolaObj.y) < minhaDistBola - 15) {
          maisPertoBola = false;
          break;
        }
      }
    }

    if (bolaObj && !bolaObj.posse && maisPertoBola) {
      this.estadoIA = "BUSCAR_BOLA";
      this.navegarPara(bolaObj.x, bolaObj.y, velAtual);
    } else if (bolaObj && bolaObj.posse && bolaObj.posse.time === this.time) {
      this.estadoIA = "APOIAR_ATAQUE";
      let avancoX = this.time === "AZUL" ? min(mundoLargura - 180, bolaObj.x + 120) : max(180, bolaObj.x - 120);
      this.navegarPara(avancoX, this.zonaPreferidaY, velAtual * 0.9);
    } else {
      this.estadoIA = "DEFENDER";
      let targetX = bolaObj ? lerp(meuGolX, bolaObj.x, 0.45) : (this.time === "AZUL" ? 360 : mundoLargura - 360);
      let targetY = bolaObj ? lerp(this.zonaPreferidaY, bolaObj.y, 0.5) : this.zonaPreferidaY;
      this.navegarPara(targetX, targetY, velAtual * 0.85);
    }

    if (alvo && menorDist < 420) {
      let temVisao = this.temLinhaDeVisao(alvo.x, alvo.y);
      if (this.tipo !== "TRUNK" || this.giroTrunk <= 0) {
        this.angulo = this.tipo === "COLT"
          ? this.calcularAnguloPreditivoColt(alvo)
          : atan2(alvo.y - this.y, alvo.x - this.x);
      }
      if (this.deveUsarSuperBot(alvo, menorDist, temVisao, false, golInimigoX, meioY)) {
        this.usarSuper();
        this.delaySuperBot = Math.floor(random(20, 40));
      } else if (this.delayReacao <= 0 && (temVisao || this.tipo === "BARLEY")) {
        this.atacar(alvo);
        this.delayReacao = Math.floor(random(22, 42));
      }
    } else if (bolaObj) {
      if (this.tipo !== "TRUNK" || this.giroTrunk <= 0) {
        this.angulo = atan2(bolaObj.y - this.y, bolaObj.x - this.x);
      }
    }
  }

  desenharRespawn() {
    noFill();
    stroke(this.time === "AZUL" ? color(0, 180, 255, 160) : color(255, 80, 80, 160));
    strokeWeight(3);
    ellipse(this.x, this.y, 44);
    fill(255);
    noStroke();
    textSize(14);
    text(ceil(this.respawnTimer / 60) + "s", this.x, this.y);
  }

  desenhar() {
    let ehAliado = this.time === "AZUL";
    let corRing = ehAliado ? color(0, 190, 255) : color(255, 65, 65);

    if (this.superCarga >= 100) {
      noFill();
      stroke(255, 220, 40, 180 + sin(frameCount * 0.25) * 70);
      strokeWeight(4);
      ellipse(this.x, this.y, 58 + sin(frameCount * 0.2) * 4);
    }

    noFill();
    stroke(corRing);
    strokeWeight(3.5);
    ellipse(this.x, this.y, 48);

    if (this.tipo === "ASH") {
      let swing = this.animAtaque > 0 ? sin(this.animAtaque * PI) * 1.4 : 0;
      desenharSpriteAsh(this.x, this.y, this.angulo, 1.0, swing, this.furia);
    } else if (this.tipo === "TRUNK") {
      let angVisual = this.giroTrunk > 0 ? this.angulo + this.giroTrunk : this.angulo;
      desenharSpriteTrunk(
        this.x,
        this.y,
        angVisual,
        1.0,
        this.dashTimer > 0,
        this.giroTrunk,
        this.estaNaTerraTrunk(),
        this.delayAtaqueTrunk > 0
      );
    } else if (this.tipo === "COLT") {
      desenharSpriteColt(this.x, this.y, this.angulo, 1.0, this.animAtaque);
    } else if (this.tipo === "BARLEY") {
      let swing = this.animAtaque > 0 ? sin(this.animAtaque * PI) * 1.1 : 0;
      desenharSpriteBarley(this.x, this.y, this.angulo, 1.0, swing, this.time);
    }

    noStroke();
    fill(255);
    textSize(11);
    textStyle(BOLD);
    let labelNome = this.ehJogador ? this.nomeExibicao : this.tipo;
    text(labelNome, this.x, this.y - 52);

    fill(20);
    rect(this.x - 24, this.y - 43, 48, 7, 3);
    fill(ehAliado ? color(50, 230, 80) : color(255, 65, 65));
    rect(this.x - 24, this.y - 43, map(max(0, this.vida), 0, this.vidaMax, 0, 48), 7, 3);

    if (this.tipo === "ASH") {
      desenharIconeFuriaAsh(this.x - 34, this.y - 39.5, this.furia, 0.92);
    }

    let tempoRec = this.obterTempoRecarga();
    for (let i = 0; i < 3; i++) {
      let bx = this.x - 24 + i * 16.5;
      fill(20);
      rect(bx, this.y - 34, 15, 5, 2);

      if (i < Math.floor(this.municao)) {
        fill(255, 165, 0);
        rect(bx, this.y - 34, 15, 5, 2);
      } else if (i === Math.floor(this.municao)) {
        fill(255, 215, 80, 190);
        rect(bx, this.y - 34, map(this.recarga, 0, tempoRec, 0, 15), 5, 2);
      }
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
    fill(0, 0, 0, 60);
    noStroke();
    rect(this.x + 5, this.y + 8, this.w, this.h, 8);

    fill(140, 85, 45);
    stroke(80, 45, 20);
    strokeWeight(3);
    rect(this.x, this.y, this.w, this.h, 8);

    fill(165, 105, 55);
    noStroke();
    rect(this.x + 6, this.y + 6, this.w - 12, this.h - 12, 4);
  }
}

class PocaTerraTrunk {
  constructor(x, y, raio, time) {
    this.x = x;
    this.y = y;
    this.raio = raio;
    this.time = time;
    this.vida = 540; // 9 segundos
    this.vidaMax = 540;
  }

  desenhar() {
    let opacidade = map(this.vida, 0, 60, 0, 185);
    opacidade = constrain(opacidade, 0, 185);

    push();
    noStroke();
    fill(120, 45, 175, opacidade * 0.85);
    ellipse(this.x, this.y, this.raio * 2, this.raio * 1.85);

    fill(155, 70, 215, opacidade * 0.7);
    ellipse(this.x - 6, this.y + 4, this.raio * 1.4, this.raio * 1.3);

    fill(90, 30, 135, opacidade);
    ellipse(this.x + 12, this.y - 8, 8, 6);
    ellipse(this.x - 14, this.y + 10, 7, 5);
    ellipse(this.x + 6, this.y + 14, 6, 5);
    pop();
  }
}

class OndaCircularTrunk {
  constructor(dono, raioMax, dano, naTerra) {
    this.dono = dono;
    this.x = dono.x;
    this.y = dono.y;
    this.raioMax = raioMax;
    this.raioAtual = 28;
    this.dano = dano;
    this.naTerra = naTerra;
    this.vida = 12;
    this.vidaMax = 12;
    this.atingidos = [];
  }

  atualizar(todos) {
    this.x = this.dono.x;
    this.y = this.dono.y;
    this.vida--;
    let progresso = 1 - this.vida / this.vidaMax;
    this.raioAtual = lerp(28, this.raioMax, progresso);

    for (let b of todos) {
      if (b !== this.dono && b.time !== this.dono.time && b.vida > 0 && !this.atingidos.includes(b)) {
        let d = dist(this.x, this.y, b.x, b.y);
        if (d <= this.raioAtual + b.raio) {
          this.atingidos.push(b);
          let ehCritico = d > this.raioMax * 0.72;
          let danoFinal = ehCritico ? this.dano * 2 : this.dano;

          b.receberDano(danoFinal, color(255, 255, 255), ehCritico, this.dono);
          this.dono.superCarga = min(100, this.dono.superCarga + (ehCritico ? 17 : 10));
        }
      }
    }

    for (let rt of ratosAsh) {
      if (rt.time !== this.dono.time && rt.vida > 0 && !this.atingidos.includes(rt)) {
        if (dist(this.x, this.y, rt.x, rt.y) <= this.raioAtual + rt.raio) {
          this.atingidos.push(rt);
          rt.receberDano(this.dano, this.dono);
        }
      }
    }
  }

  desenhar() {
    let opacidade = map(this.vida, 0, this.vidaMax, 0, 220);
    noFill();
    stroke(this.naTerra ? color(210, 120, 255, opacidade) : color(255, 210, 90, opacidade));
    strokeWeight(12);
    ellipse(this.x, this.y, this.raioAtual * 2);

    stroke(255, 255, 255, opacidade * 0.8);
    strokeWeight(3);
    ellipse(this.x, this.y, this.raioAtual * 2);
  }
}

class GaiolaRatosAsh {
  constructor(x0, y0, xAlvo, yAlvo, time, dono) {
    this.x0 = x0;
    this.y0 = y0;
    this.xAlvo = xAlvo;
    this.yAlvo = yAlvo;
    this.x = x0;
    this.y = y0;
    this.time = time;
    this.dono = dono;
    this.tempoTotal = 18;
    this.tempoAtual = 0;
    this.finalizada = false;
  }

  atualizar() {
    this.tempoAtual++;
    let t = constrain(this.tempoAtual / this.tempoTotal, 0, 1);
    this.x = lerp(this.x0, this.xAlvo, t);
    this.y = lerp(this.y0, this.yAlvo, t);

    if (t >= 1) {
      this.finalizada = true;

      let pontosSpawn = [];
      let nuvensSpawn = [];

      for (let i = 0; i < 4; i++) {
        let ang = (TWO_PI / 4) * i + 0.35;
        let rx = constrain(this.xAlvo + cos(ang) * 24, 35, mundoLargura - 35);
        let ry = constrain(this.yAlvo + sin(ang) * 24, 65, mundoAltura - 35);
        ratosAsh.push(new RatoAsh(rx, ry, this.time, this.dono));
        pontosSpawn.push({ x: rx, y: ry });
      }

      for (let k = 0; k < 14; k++) {
        let angN = (TWO_PI / 14) * k + random(-0.2, 0.2);
        nuvensSpawn.push({
          ang: angN,
          dist: random(16, 44),
          tam: random(18, 34)
        });
      }

      efeitosSpawnRatos.push({
        x: this.xAlvo,
        y: this.yAlvo,
        time: this.time,
        pontosRatos: pontosSpawn,
        nuvens: nuvensSpawn,
        vida: 30,
        vidaMax: 30
      });

      for (let k = 0; k < 16; k++) {
        particulas.push({
          x: this.xAlvo + random(-14, 14),
          y: this.yAlvo + random(-14, 14),
          vx: random(-3.2, 3.2),
          vy: random(-3.2, 3.2),
          tam: random(6, 11),
          cor: color(255, 195, 70, 225),
          vida: 20
        });
      }
    }
  }

  desenhar() {
    let t = constrain(this.tempoAtual / this.tempoTotal, 0, 1);
    let alturaArco = sin(t * PI) * 58;

    noStroke();
    fill(0, 0, 0, 75);
    ellipse(this.x, this.y + 8, 22, 12);

    push();
    translate(this.x, this.y - alturaArco);
    rotate(t * TWO_PI * 1.4);

    fill(95, 145, 220);
    stroke(20, 30, 50);
    strokeWeight(2);
    rect(-12, -10, 24, 20, 4);

    stroke(230, 240, 255);
    strokeWeight(1.8);
    line(-6, -9, -6, 9);
    line(0, -9, 0, 9);
    line(6, -9, 6, 9);

    noStroke();
    fill(255, 210, 50);
    ellipse(-3, 0, 4, 4);
    ellipse(3, 0, 4, 4);
    pop();
  }
}

class RatoAsh {
  constructor(x, y, time, dono) {
    this.x = x;
    this.y = y;
    this.time = time;
    this.dono = dono;
    this.raio = 13;
    this.vida = 300;
    this.vidaMax = 300;
    this.velocidade = 4.25;
    this.angulo = random(TWO_PI);
    this.desvioTimer = 0;
    this.anguloDesvio = 0;
  }

  receberDano(qtd, atacante = null) {
    this.vida -= qtd;
    criarTextoDano(this.x, this.y - 22, "-" + qtd, color(255, 230, 120));
    if (this.vida <= 0) {
      this.explodir(false, atacante);
    }
  }

  explodir(acertouInimigo = false, atacanteDireto = null) {
    this.vida = 0;
    for (let k = 0; k < 10; k++) {
      particulas.push({
        x: this.x,
        y: this.y,
        vx: random(-3.5, 3.5),
        vy: random(-3.5, 3.5),
        tam: random(4, 8),
        cor: acertouInimigo ? color(255, 140, 30, 230) : color(180, 210, 240, 200),
        vida: 15
      });
    }
    if (acertouInimigo && this.dono && this.dono.vida > 0) {
      this.dono.superCarga = min(100, this.dono.superCarga + 12);
    }
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

  atualizar(todos) {
    if (this.vida <= 0) return;

    let alvo = null;
    let menorDist = Infinity;
    for (let b of todos) {
      if (b.time !== this.time && b.vida > 0) {
        let d = dist(this.x, this.y, b.x, b.y);
        if (d < menorDist) {
          menorDist = d;
          alvo = b;
        }
      }
    }

    if (alvo) {
      let angAlvo = atan2(alvo.y - this.y, alvo.x - this.x);

      if (this.desvioTimer > 0) {
        this.desvioTimer--;
        this.angulo = this.anguloDesvio;
      } else {
        let frenteX = this.x + cos(angAlvo) * 24;
        let frenteY = this.y + sin(angAlvo) * 24;
        if (this.colideObstaculo(frenteX, frenteY)) {
          let angEsq = angAlvo - 1.1;
          let angDir = angAlvo + 1.1;
          if (!this.colideObstaculo(this.x + cos(angEsq) * 28, this.y + sin(angEsq) * 28)) {
            this.anguloDesvio = angEsq;
          } else {
            this.anguloDesvio = angDir;
          }
          this.desvioTimer = 14;
          this.angulo = this.anguloDesvio;
        } else {
          this.angulo = angAlvo;
        }
      }

      let nx = constrain(this.x + cos(this.angulo) * this.velocidade, 28, mundoLargura - 28);
      if (!this.colideObstaculo(nx, this.y)) this.x = nx;

      let ny = constrain(this.y + sin(this.angulo) * this.velocidade, 58, mundoAltura - 28);
      if (!this.colideObstaculo(this.x, ny)) this.y = ny;

      if (dist(this.x, this.y, alvo.x, alvo.y) <= this.raio + alvo.raio + 4) {
        alvo.receberDano(300, color(255, 220, 60), false, this.dono);
        this.explodir(true);
      }
    }
  }

  desenhar() {
    if (this.vida <= 0) return;
    let ehAzul = this.time === "AZUL";

    noFill();
    stroke(ehAzul ? color(60, 200, 255, 190) : color(255, 80, 70, 190));
    strokeWeight(2);
    ellipse(this.x, this.y, 28);

    push();
    translate(this.x, this.y);
    rotate(this.angulo);

    noStroke();
    fill(0, 0, 0, 60);
    ellipse(-1, 3, 22, 18);

    noFill();
    stroke(235, 130, 150);
    strokeWeight(2.5);
    arc(-13, 0, 12, 8, HALF_PI, PI + HALF_PI);

    fill(ehAzul ? color(105, 165, 235) : color(225, 95, 95));
    stroke(25, 30, 42);
    strokeWeight(1.8);
    ellipse(0, 0, 22, 16);

    fill(235, 155, 175);
    ellipse(-3, -8, 7, 7);
    ellipse(-3, 8, 7, 7);

    fill(255, 230, 50);
    noStroke();
    ellipse(6, -3, 3.5, 3.5);
    ellipse(6, 3, 3.5, 3.5);
    pop();
  }
}

class GarrafaBarley {
  constructor(x0, y0, xAlvo, yAlvo, dano, time, ehSuper, raioPoca = 58, tempoTotal = 24, dono = null) {
    this.x0 = x0;
    this.y0 = y0;
    this.xAlvo = xAlvo;
    this.yAlvo = yAlvo;
    this.x = x0;
    this.y = y0;
    this.dano = dano;
    this.time = time;
    this.ehSuper = ehSuper;
    this.raioPoca = raioPoca;
    this.tempoTotal = tempoTotal;
    this.dono = dono;
    this.tempoAtual = 0;
    this.finalizada = false;
  }

  atualizar() {
    this.tempoAtual++;
    let t = constrain(this.tempoAtual / this.tempoTotal, 0, 1);
    this.x = lerp(this.x0, this.xAlvo, t);
    this.y = lerp(this.y0, this.yAlvo, t);

    if (t >= 1) {
      this.finalizada = true;
      pocas.push(
        new PocaBarley(
          this.xAlvo,
          this.yAlvo,
          this.dano,
          this.time,
          this.ehSuper ? 220 : 120,
          this.raioPoca,
          this.dono
        )
      );
    }
  }

  desenhar() {
    let t = constrain(this.tempoAtual / this.tempoTotal, 0, 1);
    let alturaArco = sin(t * PI) * 85;
    let ehAzul = this.time === "AZUL";

    noStroke();
    fill(0, 0, 0, 65);
    ellipse(this.x, this.y + 6, 16, 10);

    push();
    translate(this.x, this.y - alturaArco);
    rotate(t * TWO_PI * 1.8);
    fill(ehAzul ? color(82, 18, 148) : color(182, 26, 44));
    stroke(20);
    strokeWeight(1.8);
    rect(-6, -10, 12, 20, 4);
    fill(235, 190, 110);
    rect(-3, -15, 6, 6, 1);
    pop();
  }
}

class PocaBarley {
  constructor(x, y, danoTick, time, duracao, raio = 58, dono = null) {
    this.x = x;
    this.y = y;
    this.danoTick = danoTick;
    this.time = time;
    this.vida = duracao;
    this.raio = raio;
    this.dono = dono;
    this.tickTimer = 0;
  }

  atualizar(todos) {
    this.vida--;
    this.tickTimer--;

    if (this.tickTimer <= 0) {
      this.tickTimer = 45;

      for (let b of todos) {
        if (b.time !== this.time && b.vida > 0) {
          if (dist(this.x, this.y, b.x, b.y) <= this.raio + b.raio * 0.5) {
            b.receberDano(this.danoTick, color(255, 255, 255), false, this.dono);
            if (this.dono && this.dono.vida > 0) {
              this.dono.superCarga = min(100, this.dono.superCarga + 14);
            }
          }
        }
      }

      for (let rt of ratosAsh) {
        if (rt.time !== this.time && rt.vida > 0) {
          if (dist(this.x, this.y, rt.x, rt.y) <= this.raio + rt.raio) {
            rt.receberDano(this.danoTick, this.dono);
          }
        }
      }
    }
  }

  desenhar() {
    let opacidade = map(this.vida, 0, 30, 0, 175);
    opacidade = constrain(opacidade, 0, 175);
    let ehAzul = this.time === "AZUL";

    push();
    noStroke();
    fill(ehAzul ? color(82, 16, 145, opacidade) : color(182, 24, 42, opacidade));
    ellipse(this.x, this.y, this.raio * 2);

    fill(ehAzul ? color(128, 36, 198, opacidade * 0.85) : color(228, 52, 68, opacidade * 0.85));
    ellipse(this.x + sin(frameCount * 0.1 + this.x) * 8, this.y - 6, this.raio * 0.9);
    ellipse(this.x - 10, this.y + cos(frameCount * 0.1 + this.y) * 8, this.raio * 0.7);
    pop();
  }
}

class Projetil {
  constructor(x, y, angulo, vel, alcance, dano, time, estilo = "NORMAL", dono = null) {
    this.x0 = x;
    this.y0 = y;
    this.x = x;
    this.y = y;
    this.angulo = angulo;
    this.vel = vel;
    this.alcance = alcance;
    this.dano = dano;
    this.time = time;
    this.estilo = estilo;
    this.dono = dono;
    this.vida = 1;
    this.atingidos = [];
  }

  atualizar(todos) {
    this.x += cos(this.angulo) * this.vel;
    this.y += sin(this.angulo) * this.vel;

    if (dist(this.x0, this.y0, this.x, this.y) > this.alcance) {
      this.vida = 0;
      return;
    }

    for (let i = obstaculos.length - 1; i >= 0; i--) {
      let o = obstaculos[i];
      if (this.x > o.x && this.x < o.x + o.w && this.y > o.y && this.y < o.y + o.h) {
        if (this.estilo === "COLT_SUPER") {
          obstaculos.splice(i, 1);
          for (let k = 0; k < 8; k++) {
            particulas.push({
              x: this.x,
              y: this.y,
              vx: random(-3, 3),
              vy: random(-3, 3),
              tam: random(5, 9),
              cor: color(160, 100, 50),
              vida: 18
            });
          }
        } else {
          this.vida = 0;
          return;
        }
      }
    }

    for (let rt of ratosAsh) {
      if (rt.time !== this.time && rt.vida > 0 && !this.atingidos.includes(rt)) {
        if (dist(this.x, this.y, rt.x, rt.y) < rt.raio + 7) {
          rt.receberDano(this.dano, this.dono);
          if (this.estilo === "COLT_SUPER") {
            this.atingidos.push(rt);
          } else {
            this.vida = 0;
            return;
          }
        }
      }
    }

    for (let b of todos) {
      if (b.time !== this.time && b.vida > 0 && !this.atingidos.includes(b)) {
        if (dist(this.x, this.y, b.x, b.y) < b.raio + 8) {
          b.receberDano(this.dano, color(255, 255, 255), false, this.dono);
          if (this.dono && this.dono.vida > 0) {
            this.dono.superCarga = min(100, this.dono.superCarga + 8.4);
          }
          if (this.estilo === "COLT_SUPER") {
            this.atingidos.push(b);
          } else {
            this.vida = 0;
            return;
          }
        }
      }
    }
  }

  desenhar() {
    push();
    translate(this.x, this.y);
    rotate(this.angulo);
    noStroke();

    if (this.estilo === "COLT_SUPER") {
      fill(255, 195, 20, 110);
      rect(-24, -7, 36, 14, 7);
      fill(255, 245, 140);
      rect(-12, -4, 24, 8, 4);
    } else {
      fill(255, 220, 40, 120);
      rect(-15, -4, 20, 8, 4);
      fill(255, 250, 180);
      rect(-6, -3, 14, 6, 3);
    }
    pop();
  }
}

// ==========================================
// CONTROLES MOBILE TOUCH (DUAL JOYSTICK)
// ==========================================
let ehMobile = false;

let joyEsq = {
  ativo: false,
  touchId: null,
  baseX: 115,
  baseY: 485,
  knobX: 115,
  knobY: 485,
  raioMax: 52,
  dx: 0,
  dy: 0
};

let joyDir = {
  ativo: false,
  touchId: null,
  baseX: 730,
  baseY: 480,
  knobX: 730,
  knobY: 480,
  raioMax: 50,
  dx: 0,
  dy: 0,
  arrastou: false
};

let joySuper = {
  ativo: false,
  touchId: null,
  baseX: 605,
  baseY: 505,
  knobX: 605,
  knobY: 505,
  raioMax: 42,
  dx: 0,
  dy: 0,
  arrastou: false
};

function detectarDispositivoMobile() {
  ehMobile =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 920;
}

function registrarEventosTouchCanvas() {
  detectarDispositivoMobile();
  window.addEventListener("resize", detectarDispositivoMobile);

  if (!cnv || !cnv.elt) return;

  function obterPosicaoNoCanvas(touch) {
    let rect = cnv.elt.getBoundingClientRect();
    let escalaX = width / rect.width;
    let escalaY = height / rect.height;
    return {
      x: (touch.clientX - rect.left) * escalaX,
      y: (touch.clientY - rect.top) * escalaY
    };
  }

  cnv.elt.addEventListener(
    "touchstart",
    function (e) {
      if (estadoJogo === "NOME_INICIAL") {
        return;
      }
      e.preventDefault();
      ehMobile = true;

      for (let i = 0; i < e.changedTouches.length; i++) {
        let t = e.changedTouches[i];
        let pos = obterPosicaoNoCanvas(t);

        if (estadoJogo === "SELECAO_BRAWLER") {
          ultimoToqueY = pos.y;
          tratarCliqueCanvas(null, pos.x, pos.y);
          continue;
        }

        if (estadoJogo !== "JOGANDO") {
          tratarCliqueCanvas(null, pos.x, pos.y);
          continue;
        }

        if (celebracaoGol.ativo || !jogador || jogador.vida <= 0) continue;

        if (dist(pos.x, pos.y, joySuper.baseX, joySuper.baseY) <= 58 && !joySuper.ativo) {
          joySuper.ativo = true;
          joySuper.touchId = t.identifier;
          joySuper.knobX = pos.x;
          joySuper.knobY = pos.y;
          joySuper.arrastou = false;
          modoMira = "SUPER";
          atualizarKnobJoystick(joySuper, pos.x, pos.y);
          continue;
        }

        if (dist(pos.x, pos.y, joyDir.baseX, joyDir.baseY) <= 72 && !joyDir.ativo) {
          joyDir.ativo = true;
          joyDir.touchId = t.identifier;
          joyDir.knobX = pos.x;
          joyDir.knobY = pos.y;
          joyDir.arrastou = false;
          modoMira = "ATAQUE";
          atualizarKnobJoystick(joyDir, pos.x, pos.y);
          continue;
        }

        if (pos.x < width * 0.52 && !joyEsq.ativo) {
          joyEsq.ativo = true;
          joyEsq.touchId = t.identifier;
          joyEsq.baseX = constrain(pos.x, 70, 220);
          joyEsq.baseY = constrain(pos.y, 350, height - 70);
          joyEsq.knobX = joyEsq.baseX;
          joyEsq.knobY = joyEsq.baseY;
          joyEsq.dx = 0;
          joyEsq.dy = 0;
          continue;
        }

        if (!joyDir.ativo) {
          joyDir.ativo = true;
          joyDir.touchId = t.identifier;
          joyDir.knobX = pos.x;
          joyDir.knobY = pos.y;
          joyDir.arrastou = false;
          modoMira = "ATAQUE";
          atualizarKnobJoystick(joyDir, pos.x, pos.y);
        }
      }
    },
    { passive: false }
  );

  cnv.elt.addEventListener(
    "touchmove",
    function (e) {
      if (estadoJogo === "NOME_INICIAL") return;
      e.preventDefault();

      for (let i = 0; i < e.changedTouches.length; i++) {
        let t = e.changedTouches[i];
        let pos = obterPosicaoNoCanvas(t);

        if (estadoJogo === "SELECAO_BRAWLER") {
          let deltaY = ultimoToqueY - pos.y;
          ultimoToqueY = pos.y;
          let totalLinhas = ceil(DADOS_BRAWLERS.length / 3);
          let maxScroll = max(0, totalLinhas * 172 - 480);
          scrollBrawlers = constrain(scrollBrawlers + deltaY, 0, maxScroll);
          continue;
        }

        if (joyEsq.ativo && t.identifier === joyEsq.touchId) {
          atualizarKnobJoystick(joyEsq, pos.x, pos.y);
        }

        if (joyDir.ativo && t.identifier === joyDir.touchId) {
          atualizarKnobJoystick(joyDir, pos.x, pos.y);
          if (abs(joyDir.dx) > 0.22 || abs(joyDir.dy) > 0.22) {
            joyDir.arrastou = true;
            if (jogador && jogador.vida > 0) {
              jogador.angulo = atan2(joyDir.dy, joyDir.dx);
            }
          }
        }

        if (joySuper.ativo && t.identifier === joySuper.touchId) {
          atualizarKnobJoystick(joySuper, pos.x, pos.y);
          if (abs(joySuper.dx) > 0.22 || abs(joySuper.dy) > 0.22) {
            joySuper.arrastou = true;
            if (jogador && jogador.vida > 0) {
              jogador.angulo = atan2(joySuper.dy, joySuper.dx);
            }
          }
        }
      }
    },
    { passive: false }
  );

  function finalizarToque(e) {
    if (estadoJogo === "NOME_INICIAL") return;
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      let t = e.changedTouches[i];

      if (joyEsq.ativo && t.identifier === joyEsq.touchId) {
        joyEsq.ativo = false;
        joyEsq.touchId = null;
        joyEsq.dx = 0;
        joyEsq.dy = 0;
        joyEsq.baseX = 115;
        joyEsq.baseY = 485;
        joyEsq.knobX = joyEsq.baseX;
        joyEsq.knobY = joyEsq.baseY;
      }

      if (joyDir.ativo && t.identifier === joyDir.touchId) {
        if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
          if (!joyDir.arrastou) {
            mirarInimigoMaisProximoMobile();
          }
          jogador.atacar();
        }
        joyDir.ativo = false;
        joyDir.touchId = null;
        joyDir.dx = 0;
        joyDir.dy = 0;
        joyDir.knobX = joyDir.baseX;
        joyDir.knobY = joyDir.baseY;
        joyDir.arrastou = false;
        modoMira = "ATAQUE";
      }

      if (joySuper.ativo && t.identifier === joySuper.touchId) {
        if (estadoJogo === "JOGANDO" && !celebracaoGol.ativo && jogador && jogador.vida > 0) {
          if (!joySuper.arrastou) {
            mirarInimigoMaisProximoMobile();
          }
          jogador.usarSuper();
        }
        joySuper.ativo = false;
        joySuper.touchId = null;
        joySuper.dx = 0;
        joySuper.dy = 0;
        joySuper.knobX = joySuper.baseX;
        joySuper.knobY = joySuper.baseY;
        joySuper.arrastou = false;
        modoMira = "ATAQUE";
      }
    }
  }

  cnv.elt.addEventListener("touchend", finalizarToque, { passive: false });
  cnv.elt.addEventListener("touchcancel", finalizarToque, { passive: false });
}

function atualizarKnobJoystick(joy, toqueX, toqueY) {
  let vx = toqueX - joy.baseX;
  let vy = toqueY - joy.baseY;
  let d = sqrt(vx * vx + vy * vy);

  if (d > joy.raioMax) {
    vx = (vx / d) * joy.raioMax;
    vy = (vy / d) * joy.raioMax;
  }

  joy.knobX = joy.baseX + vx;
  joy.knobY = joy.baseY + vy;
  joy.dx = vx / joy.raioMax;
  joy.dy = vy / joy.raioMax;
}

function mirarInimigoMaisProximoMobile() {
  if (!jogador) return;

  if (modoSelecionado === "FUTEBRAWL" && bola && bola.posse === jogador) {
    let golInimigoX = mundoLargura - 30;
    let meioY = mundoAltura / 2;
    jogador.angulo = atan2(meioY - jogador.y, golInimigoX - jogador.x);
    return;
  }

  let maisProximo = null;
  let menorDist = 480;

  for (let ini of inimigos) {
    if (ini.vida > 0) {
      let d = dist(jogador.x, jogador.y, ini.x, ini.y);
      if (d < menorDist) {
        menorDist = d;
        maisProximo = ini;
      }
    }
  }

  if (maisProximo) {
    jogador.angulo = atan2(maisProximo.y - jogador.y, maisProximo.x - jogador.x);
  }
}

function desenharControlesMobile() {
  if (!ehMobile || estadoJogo !== "JOGANDO" || celebracaoGol.ativo || !jogador || jogador.vida <= 0) {
    return;
  }

  push();

  noStroke();
  fill(20, 30, 50, joyEsq.ativo ? 130 : 85);
  ellipse(joyEsq.baseX, joyEsq.baseY, joyEsq.raioMax * 2.1);

  stroke(255, 255, 255, joyEsq.ativo ? 170 : 95);
  strokeWeight(3);
  noFill();
  ellipse(joyEsq.baseX, joyEsq.baseY, joyEsq.raioMax * 2.1);

  fill(80, 185, 255, joyEsq.ativo ? 235 : 175);
  stroke(255, 255, 255, 220);
  strokeWeight(2.5);
  ellipse(joyEsq.knobX, joyEsq.knobY, 44);

  fill(20, 30, 50, joyDir.ativo ? 140 : 95);
  stroke(255, 95, 75, joyDir.ativo ? 230 : 140);
  strokeWeight(3.5);
  ellipse(joyDir.baseX, joyDir.baseY, joyDir.raioMax * 2.1);

  fill(235, 65, 55, joyDir.ativo ? 245 : 195);
  stroke(255, 240, 220, 230);
  strokeWeight(2.5);
  ellipse(joyDir.knobX, joyDir.knobY, 50);

  noStroke();
  fill(255);
  textStyle(BOLD);
  textSize(11);
  text("ATK", joyDir.knobX, joyDir.knobY);

  let superPronta = jogador.superCarga >= 100;

  fill(20, 30, 50, superPronta ? 150 : 90);
  stroke(
    superPronta
      ? color(255, 215, 0, 220 + sin(frameCount * 0.25) * 35)
      : color(140, 145, 155, 120)
  );
  strokeWeight(superPronta ? 4 : 2.5);
  ellipse(joySuper.baseX, joySuper.baseY, joySuper.raioMax * 2.1);

  fill(superPronta ? color(255, 195, 15, 235) : color(95, 100, 110, 175));
  stroke(superPronta ? color(255, 250, 180) : color(180, 185, 195, 160));
  strokeWeight(2.5);
  ellipse(joySuper.knobX, joySuper.knobY, 42);

  noStroke();
  fill(superPronta ? 25 : 230);
  textSize(10);
  text(superPronta ? "SUPER" : Math.floor(jogador.superCarga) + "%", joySuper.knobX, joySuper.knobY);

  if (jogador.tipo === "ASH") {
    let etapa = jogador.obterEtapaFuria();
    fill(15, 20, 35, 210);
    rect(16, 54, 150, 28, 8);
    fill(etapa === 3 ? color(255, 90, 75) : color(255, 220, 55));
    textAlign(LEFT, CENTER);
    textSize(11);
    text("FÚRIA: " + Math.round(jogador.furia) + "% (E" + etapa + ")", 24, 68);
    textAlign(CENTER, CENTER);
  }

  pop();
}

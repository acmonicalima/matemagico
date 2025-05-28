// Variáveis principais
let placarJogador1 = 0;
let placarJogador2 = 0;
let vezDoJogador = 1;
let tempoRestante = 240;
let intervaloCronometro;
let contaAtual = null;
let tabuleiroLiberado = false;

// Função principal para iniciar o jogo
function iniciarJogo() {
  const nome1 = document.getElementById("nome-jogador1").value.trim();
  const nome2 = document.getElementById("nome-jogador2").value.trim();

  if (!nome1 || !nome2) {
    alert("Por favor, preencha os nomes dos dois jogadores.");
    return;
  }

  // Esconde tela inicial e mostra o jogo
  document.getElementById("tela-inicial").style.display = "none";
  document.getElementById("jogo").style.display = "block";

  // Define jogador da vez
  document.getElementById("vez-jogador").textContent = `Vez do ${nome1}`;
  document.getElementById("placar-texto").textContent = `${nome1}: 0 | ${nome2}: 0`;

  // Gera cartas e tabuleiro
  criarMonteCartas();
  criarTabuleiro();

  // Inicia cronômetro
  atualizarCronometro();
  intervaloCronometro = setInterval(atualizarCronometro, 1000);
}

// Atualiza o cronômetro regressivo
function atualizarCronometro() {
  const minutos = Math.floor(tempoRestante / 60);
  const segundos = tempoRestante % 60;
  document.getElementById("cronometro").textContent = `⏰ Tempo restante: ${minutos}:${segundos < 10 ? "0" : ""}${segundos}s`;
  if (tempoRestante <= 0) {
    clearInterval(intervaloCronometro);
    finalizarJogo();
  } else {
    tempoRestante--;
  }
}

// Finaliza o jogo por tempo esgotado
function finalizarJogo() {
  const nome1 = document.getElementById("nome-jogador1").value || "Jogador 1";
  const nome2 = document.getElementById("nome-jogador2").value || "Jogador 2";
  let resultado = "";

  if (placarJogador1 > placarJogador2) {
    resultado = `🏆 ${nome1} venceu!\n${nome1}: ${placarJogador1}\n${nome2}: ${placarJogador2}`;
  } else if (placarJogador2 > placarJogador1) {
    resultado = `🏆 ${nome2} venceu!\n${nome1}: ${placarJogador1}\n${nome2}: ${placarJogador2}`;
  } else {
    resultado = `🤝 Empate!\n${nome1}: ${placarJogador1}\n${nome2}: ${placarJogador2}`;
  }

  alert(`⏱️ Tempo esgotado!\n\n${resultado}`);
  reiniciarJogo();
}

// Cria a carta "?"
function criarMonteCartas() {
  const monte = document.getElementById("monte-cartas");
  monte.innerHTML = "";
  const carta = document.createElement("div");
  carta.classList.add("monte-cartas");
  carta.textContent = "?";
  carta.onclick = () => virarCarta();
  monte.appendChild(carta);
}

// Gera uma conta matemática aleatória
function virarCarta() {
  const tipos = ["+", "-", "*", "/"];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const faixaNumeros = 10;
  let a = Math.floor(Math.random() * (faixaNumeros * 2 + 1)) - faixaNumeros;
  let b = Math.floor(Math.random() * (faixaNumeros * 2 + 1)) - faixaNumeros;

  // Evita divisão por zero e resultados decimais
  if (tipo === "/") {
    while (b === 0 || a % b !== 0) {
      b = Math.floor(Math.random() * (faixaNumeros * 2 + 1)) - faixaNumeros;
    }
  }

  // Calcula a conta
  switch (tipo) {
    case "+": contaAtual = a + b; break;
    case "-": contaAtual = a - b; break;
    case "*": contaAtual = a * b; break;
    case "/": contaAtual = Math.floor(a / b); break;
  }

  // Garante que a conta não seja zero ou null
  if (contaAtual === 0 || contaAtual === null) {
    return virarCarta(); // Gera outra conta
  }

  // Exibe o tipo da operação acima da conta
  const tipoOperacao = {
    "+": "Adição",
    "-": "Subtração",
    "*": "Multiplicação",
    "/": "Divisão"
  }[tipo];

  document.getElementById("conta").innerHTML = `
    <strong>${tipoOperacao}</strong><br>
    ${a} ${tipo} (${b}) = ?
  `;

  // Carta virada com tipo e conta
  const monte = document.getElementById("monte-cartas");
  monte.innerHTML = "";
  const cartaVirada = document.createElement("div");
  cartaVirada.classList.add("monte-cartas", "carta-virada");

  cartaVirada.innerHTML = `
    <strong>${tipoOperacao}</strong><br>
    ${a} ${tipo} (${b})
  `;

  monte.appendChild(cartaVirada);

  document.getElementById("tabuleiro").style.pointerEvents = "auto";
  tabuleiroLiberado = true;
}

// Verifica se a resposta está certa
function verificarResposta() {
  const resposta = parseInt(document.getElementById("resposta").value);
  const feedback = document.getElementById("feedback");

  if (!resposta && resposta !== 0) {
    feedback.textContent = "⚠️ Digite uma resposta!";
    feedback.style.color = "#d32f2f";
    return;
  }

  if (resposta === contaAtual) {
    feedback.textContent = "✅ Correto! Agora selecione uma posição.";
    feedback.style.color = "green";
    tocarSom("certo");

    // Adiciona ponto ao jogador da vez
    if (vezDoJogador === 1) {
      placarJogador1++;
    } else {
      placarJogador2++;
    }

    atualizarPlacar();

    setTimeout(() => {
      feedback.textContent = "";
      document.getElementById("resposta").value = "";
      document.getElementById("tabuleiro").style.pointerEvents = "auto";
      tabuleiroLiberado = true;
    }, 1500);
  } else {
    feedback.textContent = `❌ Errou! A resposta era ${contaAtual}.`;
    feedback.style.color = "red";
    tocarSom("contaerrada");

    setTimeout(() => {
      feedback.textContent = "";
      document.getElementById("resposta").value = "";
      document.getElementById("tabuleiro").style.pointerEvents = "none";
      proximoJogador();
      criarMonteCartas();
      tabuleiroLiberado = false;
    }, 1500);
  }

  contaAtual = null;
}

// Cria o tabuleiro de batalha naval
function criarTabuleiro() {
  const tabuleiro = document.getElementById("tabuleiro");
  tabuleiro.innerHTML = "";
  const letras = "ABCDEFGHIJKLMNOPQRST".split("");

  for (let i = 0; i < 420; i++) {
    const linhaIndex = Math.floor(i / 21);
    const letra = letras[linhaIndex];
    const numero = i % 21;
    const celula = document.createElement("div");
    celula.classList.add("celula");
    celula.id = `celula-${letra}${numero}`;
    celula.setAttribute("data-coord", JSON.stringify([letra, numero]));
    celula.addEventListener("click", () => atacarCelula(letra, numero));
    tabuleiro.appendChild(celula);
  }

  gerarNavios();
}

// Posiciona navios aleatoriamente
function gerarNavios() {
  const letras = "ABCDEFGHIJKLMNOPQRST".split("");
  const numeros = [...Array(21).keys()];
  const quantidadeNavios = Math.floor(420 * 0.4); // 40% de navios
  const navios = [];

  while (navios.length < quantidadeNavios) {
    const letra = letras[Math.floor(Math.random() * letras.length)];
    const numero = numeros[Math.floor(Math.random() * numeros.length)];
    if (!navios.some(nav => nav[0] === letra && nav[1] === numero)) {
      navios.push([letra, numero]);
    }
  }

  localStorage.setItem("navios", JSON.stringify(navios));
}

// Ataca uma célula do tabuleiro
function atacarCelula(letra, numero) {
  const navios = JSON.parse(localStorage.getItem("navios")) || [];
  const index = navios.findIndex(nav => nav[0] === letra && nav[1] === numero);
  const feedback = document.getElementById("feedback");

  if (!tabuleiroLiberado) {
    alert("Primeiro escolha uma carta e responda a conta!");
    return;
  }

  if (index > -1) {
    navios.splice(index, 1);
    localStorage.setItem("navios", JSON.stringify(navios));

    document.querySelector(`[data-coord='["${letra}",${numero}]']`).style.backgroundColor = "red";
    document.querySelector(`[data-coord='["${letra}",${numero}]']`).textContent = "💥";
    feedback.textContent = "💥 Acertou um navio!";
    feedback.style.color = "green";

    // Adiciona 10 pontos ao jogador da vez
    if (vezDoJogador === 1) {
      placarJogador1 += 10;
    } else {
      placarJogador2 += 10;
    }

    atualizarPlacar();
    tocarSom("acerto");
  } else {
    document.querySelector(`[data-coord='["${letra}",${numero}]']`).style.backgroundColor = "blue";
    document.querySelector(`[data-coord='["${letra}",${numero}]']`).textContent = "💦";
    feedback.textContent = "💦 Errou...";
    feedback.style.color = "red";
    tocarSom("tabuleiro_erro");
  }

  document.getElementById("tabuleiro").style.pointerEvents = "none";
  document.getElementById("btn-verificar").disabled = false;
  document.getElementById("resposta").value = "";
  tabuleiroLiberado = false;
  proximoJogador();
  criarMonteCartas();
}

// Passa a vez pro próximo jogador
function proximoJogador() {
  vezDoJogador = vezDoJogador === 1 ? 2 : 1;
  const nome = vezDoJogador === 1
    ? document.getElementById("nome-jogador1").value || "Jogador 1"
    : document.getElementById("nome-jogador2").value || "Jogador 2";
  document.getElementById("vez-jogador").textContent = `Vez do ${nome}`;
}

// Atualiza o placar com nomes reais
function atualizarPlacar() {
  const nome1 = document.getElementById("nome-jogador1").value || "Jogador 1";
  const nome2 = document.getElementById("nome-jogador2").value || "Jogador 2";
  document.getElementById("placar-texto").textContent = `${nome1}: ${placarJogador1} | ${nome2}: ${placarJogador2}`;
}

// Reinicia o jogo
function reiniciarJogo() {
  placarJogador1 = 0;
  placarJogador2 = 0;
  vezDoJogador = 1;
  tempoRestante = 240;
  document.getElementById("vez-jogador").textContent = "Vez do Jogador 1";
  document.getElementById("placar-texto").textContent = "Jogador 1: 0 | Jogador 2: 0";
  document.getElementById("resposta").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("tabuleiro").style.pointerEvents = "none";
  document.getElementById("jogo").style.display = "none";
  document.getElementById("tela-inicial").style.display = "block";
  localStorage.removeItem("navios");
}

// Toca sons diferentes conforme a ação
function tocarSom(tipo) {
  const somAcertoConta = document.getElementById("som-acerto-conta");
  const somErroConta = document.getElementById("som-conta-errada");
  const somAcertoTabuleiro = document.getElementById("som-acerto-tabuleiro");
  const somErroTabuleiro = document.getElementById("som-erro-tabuleiro");

  somAcertoConta.pause(); somAcertoConta.currentTime = 0;
  somErroConta.pause(); somErroConta.currentTime = 0;
  somAcertoTabuleiro.pause(); somAcertoTabuleiro.currentTime = 0;
  somErroTabuleiro.pause(); somErroTabuleiro.currentTime = 0;

  let som = null;

  switch (tipo) {
    case "certo":
      som = somAcertoConta;
      break;
    case "contaerrada":
      som = somErroConta;
      break;
    case "acerto":
      som = somAcertoTabuleiro;
      break;
    case "tabuleiro_erro":
      som = somErroTabuleiro;
      break;
  }

  if (som) {
    som.play().catch(err => console.log("Erro ao tocar som:", err));
  }
}

// Abre pop-up das regras
function mostrarRegras() {
  document.getElementById("popup-regras").style.display = "block";
}

// Fecha pop-up das regras
function fecharRegras() {
  document.getElementById("popup-regras").style.display = "none";
}

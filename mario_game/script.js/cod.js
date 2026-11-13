// ================== ELEMENTOS ==================
const board = document.querySelector('.game-board');
const mario = document.querySelector('.mario');
const floor = document.querySelector('.floor');

const pontosEl = document.getElementById('pontos');
const recordeEl = document.getElementById('recorde');
const nivelEl = document.getElementById('nivel');
const dificuldadeAtualEl = document.getElementById('dificuldade-atual');
const avisoEl = document.getElementById('aviso');
const btnSom = document.getElementById('btn-som');
const capaProntaEl = document.getElementById('capa-pronta');
const ceuNoiteEl = document.getElementById('ceu-noite');
const rankingMenuEl = document.getElementById('ranking-menu');
const rankingFimEl = document.getElementById('ranking-fim');
const formPlacar = document.getElementById('form-placar');
const nomePlacarEl = document.getElementById('nome-placar');
const statusPlacarEl = document.getElementById('status-placar');
const nuvens = document.querySelectorAll('.clouds1, .clouds2, .clouds3');

const telaInicio = document.getElementById('tela-inicio');
const telaPausa = document.getElementById('tela-pausa');
const telaFim = document.getElementById('tela-fim');
const fimPontosEl = document.getElementById('fim-pontos');
const novoRecordeEl = document.getElementById('novo-recorde');

const somTema = new Audio('./soung/audio_theme.mp3');
somTema.loop = true;
somTema.volume = 0.4;
const somFim = new Audio('./soung/audio_gameover.mp3');
somFim.volume = 0.6;

// ================== CONFIGURAÇÃO ==================
const CHAO = 29;                 // altura do chão (px)
const MARIO_X = 20;              // posição horizontal do Mario
const MARIO_ALTURA = 115;        // altura da caixa de colisão do Mario
const GRAVIDADE = 4700;          // px/s²
const FORCA_PULO = 1400;         // velocidade inicial do pulo (px/s)
const CANO_LARGURA = 80;
const CANO_ALTURA = CANO_LARGURA * (375 / 293); // proporção da imagem pipe.png
const MISSIL_ALTURA_BAIXA = 5;   // míssil baixo: precisa pular
const MARIO_ALTURA_AGACHADO = 60; // altura da caixa de colisão agachado
const MISSIL_ALTURA_ALTA = 85;   // míssil alto: passe por baixo AGACHADO (↓)
const AVISO_MISSIL = 0.7;        // segundos que o "!" pisca antes do míssil
const PONTOS_POR_PIXEL = 0.02;   // quanto o placar sobe por pixel percorrido
const PONTOS_POR_NIVEL = 300;
const PONTOS_PISAR = 50;         // bônus por pisar numa tartaruga

// Chuck que pula: salta quando o Mario chega perto (passe AGACHADO por baixo ou pule antes)
const CHUCK_PULO_ALTURA = 110;   // altura máxima do pulo (px): passa por cima do Mario agachado
const CHUCK_PULO_GRAVIDADE = 2500;
const CHUCK_PULO_FORCA = Math.sqrt(2 * CHUCK_PULO_GRAVIDADE * CHUCK_PULO_ALTURA);
const CHUCK_PULO_TEMPO_PICO = CHUCK_PULO_FORCA / CHUCK_PULO_GRAVIDADE; // ~0,28s
const MARIO_CENTRO = MARIO_X + 73; // meio da caixa de colisão do Mario

// Planta piranha: sobe de dentro do cano e deixa o obstáculo alto demais para um pulo só
const PLANTA_ESPERA = 0.15;      // segundos depois do cano aparecer até ela começar a subir
const PLANTA_SUBIDA = 0.4;       // segundos para sair do cano
const PLANTA_DENTRO = 15;        // quanto do caule fica escondido no cano (px)

// Koopa voador: sobe e desce no ar enquanto vem na sua direção
const KOOPA_VOO_CENTRO = 75;     // altura do meio do voo (px)
const KOOPA_VOO_AMPLITUDE = 70;  // quanto sobe e desce a partir do meio
const KOOPA_VOO_PERIODO = 1.4;   // segundos para subir e descer uma vez

// Pena e capa: pegue a pena e o próximo pulo duplo vira voo
const VOO_DURACAO = 5;           // segundos voando
const VOO_AVISO_FIM = 1.2;       // nos últimos segundos o Mario pisca
const VOO_SUBIDA = 520;          // velocidade subindo (segurando o pulo)
const VOO_DESCIDA = 260;         // velocidade planando para baixo (soltou o pulo)
const PENA_ALTURA = 150;         // altura da pena (precisa pular para pegar)
const PENA_LARGURA = 48;
const PENA_PRIMEIRA = [8, 15];   // segundos até a primeira pena
const PENA_INTERVALO = [15, 28]; // segundos entre uma pena e outra

// Dia e noite: segundos de jogo em cada fase (o ciclo se repete)
const CICLO_DIA = 35;
const CICLO_NOITE = 25;
const CICLO_TRANSICAO = 4;       // pôr do sol / amanhecer
// as cores do céu de cada mundo ficam em MUNDOS (mundos.js)

const IMG_MARIO = './img/mario.gif';
const IMG_MARIO_AGACHADO = './img/agachado.png';
const IMG_MARIO_CAPA = './img/mario-capa.gif';
const IMG_PENA = './img/pena.png';
const IMAGENS_MARIO = { normal: IMG_MARIO, agachado: IMG_MARIO_AGACHADO, voando: IMG_MARIO_CAPA };

// Cada dificuldade muda velocidade, aceleração, espaço entre obstáculos e quais aparecem
const DIFICULDADES = {
    facil: {
        nome: 'FACIL',
        velInicial: 460,
        aceleracao: 7,
        velMax: 880,
        intervalo: [1.1, 2.0],
        padroes: ['simples', 'simples', 'simples', 'tartaruga'],
    },
    normal: {
        nome: 'NORMAL',
        velInicial: 600,
        aceleracao: 12,
        velMax: 1150,
        intervalo: [0.85, 1.5],
        padroes: ['simples', 'simples', 'dupla', 'alta', 'dupla-alta', 'tartaruga', 'tartaruga', 'missil-baixo', 'missil-alto', 'chuck',
                  'chuck-pula', 'cano-planta', 'koopa-voador'],
    },
    dificil: {
        nome: 'DIFICIL',
        velInicial: 730,
        aceleracao: 16,
        velMax: 1350,
        intervalo: [0.75, 1.3],
        padroes: ['simples', 'dupla', 'alta', 'dupla-alta', 'tartaruga', 'tartaruga-dupla',
                  'missil-baixo', 'missil-alto', 'chuck', 'chuck-pula', 'cano-planta', 'koopa-voador'],
    },
    insano: {
        nome: 'INSANO',
        velInicial: 1320,
        aceleracao: 33,
        velMax: 2400,
        intervalo: [0.5, 0.85],
        padroes: ['simples', 'dupla', 'alta', 'dupla-alta', 'gigante', 'tartaruga', 'tartaruga-dupla-larga',
                  'simples', 'dupla', 'tripla', 'tripla', 'dupla-alta', 'gigante', // mais canos no insano
                  'missil-baixo', 'missil-baixo', 'missil-alto', 'missil-alto', 'chuck', 'chuck', 'tartaruga-dupla-larga',
                  'chuck-pula', 'chuck-pula', 'cano-planta', 'cano-planta', 'koopa-voador', 'koopa-voador'],
    },
};

// Formatos de obstáculos: peças colocadas lado a lado
const PADROES = {
    'simples': [{ tipo: 'cano', escala: 1 }],
    'dupla': [{ tipo: 'cano', escala: 1 }, { tipo: 'cano', escala: 1 }],
    'tripla': [{ tipo: 'cano', escala: 1 }, { tipo: 'cano', escala: 1 }, { tipo: 'cano', escala: 1 }],
    'alta': [{ tipo: 'cano', escala: 1.3 }],
    'dupla-alta': [{ tipo: 'cano', escala: 1 }, { tipo: 'cano', escala: 1.3 }],
    'gigante': [{ tipo: 'cano', escala: 1.45 }],
    'tartaruga': [{ tipo: 'tartaruga' }],
    'tartaruga-dupla': [{ tipo: 'tartaruga' }, { tipo: 'tartaruga' }],
    // folga: espaço entre as duas (em segundos de corrida), para dar dois pulos
    'tartaruga-dupla-larga': [{ tipo: 'tartaruga', folga: 0.3 }, { tipo: 'tartaruga' }],
    'missil-baixo': [{ tipo: 'missil', altura: MISSIL_ALTURA_BAIXA }],
    'missil-alto': [{ tipo: 'missil', altura: MISSIL_ALTURA_ALTA }],
    'chuck': [{ tipo: 'chuck' }],
    'chuck-pula': [{ tipo: 'chuckPula' }],
    'cano-planta': [{ tipo: 'cano', escala: 1, planta: true }], // precisa do pulo duplo
    'koopa-voador': [{ tipo: 'koopaVoador' }],
};

// ================== IMAGENS DOS INIMIGOS ==================
// largura: tamanho na tela (px) · proporcao: altura / largura da imagem
// vazio: fração de espaço transparente em volta do desenho (para a colisão ser justa)
const SPRITES = {
    tartaruga: {
        src: './img/koopa.gif',
        largura: 60,
        proporcao: 200 / 119,
        vazio: { lados: 0.08, topo: 0.08, baixo: 0 },
    },
    missil: {
        src: './img/bullet-bill-2.png',
        largura: 110,
        proporcao: 1,
        vazio: { lados: 0.04, topo: 0.04, baixo: 0.04 },
    },
    chuck: {
        src: './img/charginchuck.gif',
        largura: 100,
        proporcao: 519 / 500,
        vazio: { lados: 0.08, topo: 0.05, baixo: 0.02 },
    },
    chuckPula: {
        src: './img/charginchuck-pula.gif',
        largura: 135,
        proporcao: 361 / 500,
        vazio: { lados: 0.21, topo: 0.12, baixo: 0.12 },
        encostarNoChao: true, // a imagem tem espaço vazio embaixo: desce para os pés tocarem o chão
    },
    planta: {
        src: './img/planta-piranha.png',
        largura: 70,
        proporcao: 557 / 279,
        vazio: { lados: 0.12, topo: 0.05, baixo: 0 },
    },
    koopaVoador: {
        src: './img/koopa-voador.webp',
        largura: 150,
        proporcao: 1,
        vazio: { lados: 0.26, topo: 0.07, baixo: 0.22 },
    },
};

// carrega as imagens antes, para não piscar na primeira vez que aparecem
[IMG_MARIO_AGACHADO, IMG_MARIO_CAPA, IMG_PENA, ...Object.values(SPRITES).map(s => s.src)]
    .forEach(src => { new Image().src = src; });

// Telas estreitas (celular) têm menos espaço para reagir: a velocidade diminui
const escalaTela = () => Math.max(0.6, Math.min(1, board.clientWidth / 900));

// ================== ESTADO ==================
let estado = 'menu';             // menu | jogando | pausado | fim
let dificuldade = 'normal';
let somLigado = true;
let obstaculos = [];
let alertas = [];                // avisos "!" de míssil chegando
let velocidade = 0;
let tempo = 0;
let distancia = 0;
let bonus = 0;
let pontos = 0;
let nivel = 1;
let proximoObstaculo = 0;
let marioY = 0;                  // altura do Mario acima do chão
let marioVel = 0;
let segurandoPulo = false;
let descendoRapido = false;
let puloDuploGasto = false;      // já usou o pulo extra no ar
let agachado = false;            // ↓ no chão = agacha
let spriteMario = 'normal';      // imagem atual do Mario: normal | agachado | voando | morto
let temCapa = false;             // pegou a pena: o próximo pulo duplo vira voo
let voando = false;
let tempoVoo = 0;
let pena = null;                 // pena na tela (só uma por vez)
let tempoPena = 0;               // segundos até a próxima pena
let chaoOffset = 0;
let ultimoFrame = 0;
let fimEm = 0;
let recordeAtual = 0;
let audioCtx = null;

// ================== RECORDE (salvo no navegador) ==================
const chaveRecorde = dif => `mario-jump-recorde-${dif}`;

function lerRecorde(dif) {
    try {
        return Number(localStorage.getItem(chaveRecorde(dif))) || 0;
    } catch {
        return 0;
    }
}

function salvarRecorde(dif, valor) {
    try {
        localStorage.setItem(chaveRecorde(dif), String(valor));
    } catch {
        // navegador bloqueou o armazenamento: o recorde vale só nesta sessão
    }
}

const formatar = n => String(Math.min(n, 99999)).padStart(5, '0');
const sortear = lista => lista[Math.floor(Math.random() * lista.length)];

// ================== SONS ==================
function tocar(audio) {
    if (!somLigado) return;
    audio.play().catch(() => {});
}

// Bip curto (a cada 100 pontos, igual ao dino do Chrome, e ao pisar na tartaruga)
function bip(freq1 = 880, freq2 = 1320) {
    if (!somLigado) return;
    try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const ganho = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq1, audioCtx.currentTime);
        osc.frequency.setValueAtTime(freq2, audioCtx.currentTime + 0.07);
        ganho.gain.setValueAtTime(0.06, audioCtx.currentTime);
        ganho.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.connect(ganho).connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
    } catch {
        // sem Web Audio: segue sem bip
    }
}

function alternarSom() {
    somLigado = !somLigado;
    btnSom.textContent = somLigado ? 'SOM: ON' : 'SOM: OFF';
    if (!somLigado) {
        pararTrilha();
        somFim.pause();
    } else if (estado === 'jogando') {
        tocarTrilha();
    }
}

// ================== DIFICULDADE ==================
function escolherDificuldade(dif) {
    if (!DIFICULDADES[dif]) return;
    dificuldade = dif;
    document.querySelectorAll('.dificuldades button').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.dif === dif);
    });
    dificuldadeAtualEl.textContent = DIFICULDADES[dif].nome;
    recordeEl.textContent = formatar(lerRecorde(dif));
    atualizarRankingMenu();
}

// ================== OBSTÁCULOS ==================
function criarElemento(classe, src, largura) {
    const el = document.createElement('img');
    el.src = src;
    el.className = classe;
    el.alt = '';
    el.style.width = `${largura}px`;
    board.appendChild(el);
    return el;
}

function criarCano(x, escala) {
    const largura = CANO_LARGURA * escala;
    return {
        tipo: 'cano',
        el: criarElemento('pipe', './img/pipe.png', largura),
        x, y: 0, largura, altura: CANO_ALTURA * escala,
        velExtra: 0, margemX: 8, margemTopo: 14, margemBaixo: 0,
    };
}

// Monta o inimigo a partir da imagem, com a colisão ignorando a parte transparente
function criarInimigo(tipo, x, y) {
    const sprite = SPRITES[tipo];
    const largura = sprite.largura;
    const altura = largura * sprite.proporcao;
    const inimigo = {
        tipo,
        el: criarElemento('inimigo', sprite.src, largura),
        x, y, largura, altura,
        margemX: largura * sprite.vazio.lados + 4,
        margemTopo: altura * sprite.vazio.topo + 4,
        margemBaixo: altura * sprite.vazio.baixo,
    };
    if (sprite.encostarNoChao) {
        // desce a imagem o tamanho do vazio de baixo: o desenho passa a começar em "y"
        inimigo.el.style.marginBottom = `${-inimigo.margemBaixo}px`;
        inimigo.margemTopo += inimigo.margemBaixo;
        inimigo.margemBaixo = 0;
    }
    return inimigo;
}

function criarTartaruga(x) {
    const tartaruga = criarInimigo('tartaruga', x, 0);
    tartaruga.velExtra = 70;
    return tartaruga;
}

// Chargin Chuck: corre mais rápido que o cenário e não dá para pisar, só pular
function criarChuck(x) {
    const chuck = criarInimigo('chuck', x, 0);
    chuck.velExtra = velocidade * 0.45;
    return chuck;
}

// Chuck que pula: vem andando e salta quando o Mario chega perto
function criarChuckPula(x) {
    const chuck = criarInimigo('chuckPula', x, 0);
    chuck.velExtra = velocidade * 0.15;
    chuck.velY = 0;
    chuck.decidiu = false; // já decidiu se pula ou não
    return chuck;
}

function atualizarChuckPula(o, dt) {
    if (!o.decidiu) {
        // pula na hora certa para estar no alto quando passar pelo Mario
        const tempoAteMario = (o.x + o.largura / 2 - MARIO_CENTRO) / (velocidade + o.velExtra);
        if (tempoAteMario <= CHUCK_PULO_TEMPO_PICO) {
            o.decidiu = true;
            // se o Mario já está no ar, o Chuck fica no chão e o Mario passa por cima
            if (marioY === 0) o.velY = CHUCK_PULO_FORCA;
        }
    }
    if (o.y > 0 || o.velY > 0) {
        o.velY -= CHUCK_PULO_GRAVIDADE * dt;
        o.y = Math.max(0, o.y + o.velY * dt);
        if (o.y === 0) o.velY = 0;
        o.el.style.bottom = `${CHAO + o.y}px`;
    }
}

// Planta piranha: nasce escondida dentro do cano (atrás dele) e depois sobe
function criarPlanta(cano) {
    const sprite = SPRITES.planta;
    const x = cano.x + (cano.largura - sprite.largura) / 2;
    const planta = criarInimigo('planta', x, 0);
    planta.el.classList.add('planta');
    planta.velExtra = 0;
    planta.yEscondida = cano.altura - planta.altura;          // topo rente à boca do cano
    planta.yFora = cano.altura - PLANTA_DENTRO;               // quase toda para fora
    planta.y = planta.yEscondida;
    planta.tempo = -PLANTA_ESPERA;
    atualizarPlanta(planta, 0);
    return planta;
}

function atualizarPlanta(o, dt) {
    o.tempo += dt;
    const progresso = Math.min(1, Math.max(0, o.tempo / PLANTA_SUBIDA));
    const suave = 1 - (1 - progresso) ** 2; // desacelera no fim da subida
    o.y = o.yEscondida + (o.yFora - o.yEscondida) * suave;
    o.el.style.bottom = `${CHAO + o.y}px`;
}

// Koopa voador: sobe e desce enquanto vem. Dá para pisar nele (+50), passar por baixo
// quando ele está no alto, agachar quando está no meio ou pular quando está baixo
function criarKoopaVoador(x) {
    const koopa = criarInimigo('koopaVoador', x, 0);
    koopa.velExtra = velocidade * 0.2;
    koopa.fase = Math.random() * Math.PI * 2; // cada um começa numa altura diferente
    atualizarKoopaVoador(koopa, 0);
    return koopa;
}

function atualizarKoopaVoador(o, dt) {
    if (o.pisada) {
        o.y = Math.max(0, o.y - 900 * dt); // pisado: cai no chão
    } else {
        o.fase += dt * Math.PI * 2 / KOOPA_VOO_PERIODO;
        o.y = KOOPA_VOO_CENTRO + KOOPA_VOO_AMPLITUDE * Math.sin(o.fase);
    }
    o.el.style.bottom = `${CHAO + o.y}px`;
}

// "altura" é onde fica a parte de baixo do míssil desenhado (sem a borda transparente)
function criarMissil(altura) {
    const sprite = SPRITES.missil;
    const vazioBaixo = sprite.largura * sprite.proporcao * sprite.vazio.baixo;
    const missil = criarInimigo('missil', board.clientWidth, altura - vazioBaixo);
    missil.el.style.bottom = `${CHAO + missil.y}px`;
    missil.velExtra = velocidade * 0.3;
    return missil;
}

function avisarMissil(altura) {
    const el = document.createElement('div');
    el.className = 'alerta';
    el.textContent = '!';
    el.style.bottom = `${CHAO + altura}px`;
    board.appendChild(el);
    alertas.push({ el, altura, tempo: AVISO_MISSIL });
}

function criarObstaculo() {
    const config = DIFICULDADES[dificuldade];
    const pecas = PADROES[sortear(config.padroes)];
    const [min, max] = config.intervalo;
    const espaco = velocidade * (min + Math.random() * (max - min));

    // míssil: primeiro pisca o aviso, depois ele aparece
    if (pecas[0].tipo === 'missil') {
        avisarMissil(pecas[0].altura);
        proximoObstaculo = velocidade * AVISO_MISSIL + espaco;
        return;
    }

    let x = board.clientWidth;
    pecas.forEach(peca => {
        const obstaculo = CRIAR[peca.tipo](x, peca);
        obstaculos.push(obstaculo);
        posicionar(obstaculo);
        if (peca.planta) {
            const planta = criarPlanta(obstaculo);
            obstaculos.push(planta);
            posicionar(planta);
        }
        x += obstaculo.largura + (peca.tipo === 'cano' ? -4 : peca.folga ? velocidade * peca.folga : 25);
    });

    // inimigos andam na sua direção; a planta pede pulo duplo (mais tempo no ar)
    const extra = pecas[0].planta ? 1.3 : (ESPACO_EXTRA[pecas[0].tipo] || 1);
    proximoObstaculo = (x - board.clientWidth) + espaco * extra;
}

// como criar cada peça dos padrões
const CRIAR = {
    cano: (x, peca) => criarCano(x, peca.escala),
    tartaruga: criarTartaruga,
    chuck: criarChuck,
    chuckPula: criarChuckPula,
    koopaVoador: criarKoopaVoador,
};

// quanto espaço a mais deixar depois de cada tipo (multiplica o espaço normal)
const ESPACO_EXTRA = { tartaruga: 1.2, chuck: 1.4, chuckPula: 1.4, koopaVoador: 1.2 };

// inimigos que se mexem sozinhos a cada quadro
const ATUALIZAR = {
    chuckPula: atualizarChuckPula,
    planta: atualizarPlanta,
    koopaVoador: atualizarKoopaVoador,
};

// inimigos em que dá para pisar
const PISAVEIS = ['tartaruga', 'koopaVoador'];

function posicionar(o) {
    // a planta "morde": alterna entre normal e um pouco achatada
    const mordendo = o.tipo === 'planta' && Math.floor(o.tempo / 0.18) % 2 === 1;
    o.el.style.transform = `translateX(${o.x}px)`
        + (o.tipo === 'koopaVoador' ? ' scaleX(-1)' : '') // a imagem olha para o outro lado
        + (o.pisada ? ' scaleY(0.4)' : '')
        + (mordendo ? ' scale(1.06, 0.96)' : '');
}

function limparObstaculos() {
    obstaculos.forEach(o => o.el.remove());
    alertas.forEach(a => a.el.remove());
    obstaculos = [];
    alertas = [];
}

// parte de baixo e de cima da caixa de colisão do Mario (muda agachado e voando)
function caixaMario() {
    if (voando) return [marioY + 25, marioY + 130]; // o desenho voando fica mais no alto da imagem
    return [marioY, marioY + (agachado ? MARIO_ALTURA_AGACHADO : MARIO_ALTURA)];
}

function bateu(o) {
    // caixas de colisão um pouco menores que as imagens, para ser justo
    const marioEsq = MARIO_X + 35;
    const marioDir = MARIO_X + 112;
    const [marioBaixo, marioCima] = caixaMario();
    return marioDir > o.x + o.margemX
        && marioEsq < o.x + o.largura - o.margemX
        && marioBaixo < o.y + o.altura - o.margemTopo
        && marioCima > o.y + o.margemBaixo;
}

function pisarTartaruga(o) {
    o.pisada = true;
    o.velExtra = 0;
    o.el.classList.add('pisada');
    marioVel = FORCA_PULO * 0.75; // quica para cima
    puloDuploGasto = false;       // pisar devolve o pulo extra
    bonus += PONTOS_PISAR;
    bip(660, 990);
    textoFlutuante(`+${PONTOS_PISAR}`, o.x + o.largura / 2, o.y + o.altura + 20);
}

// ================== PENA E CAPA ==================
const sortearEntre = ([min, max]) => min + Math.random() * (max - min);

function criarPena() {
    const el = criarElemento('item-pena', IMG_PENA, PENA_LARGURA);
    pena = { el, x: board.clientWidth, y: PENA_ALTURA, t: 0 };
}

function removerPena() {
    if (!pena) return;
    pena.el.remove();
    pena = null;
    tempoPena = sortearEntre(PENA_INTERVALO);
}

function atualizarPena(dt, passo) {
    if (!pena) {
        // só aparece pena nova se o Mario ainda não tem a capa
        if (temCapa || voando) return;
        tempoPena -= dt;
        if (tempoPena <= 0) criarPena();
        return;
    }
    pena.x -= passo;
    pena.t += dt;
    pena.y = PENA_ALTURA + Math.sin(pena.t * 4) * 12; // flutua
    pena.el.style.bottom = `${CHAO + pena.y}px`;
    pena.el.style.transform = `translateX(${pena.x}px) rotate(${Math.sin(pena.t * 3) * 15}deg)`;

    // pegou?
    const [marioBaixo, marioCima] = caixaMario();
    if (MARIO_X + 112 > pena.x && MARIO_X + 35 < pena.x + PENA_LARGURA
        && marioBaixo < pena.y + PENA_LARGURA && marioCima > pena.y) {
        pegarPena();
    } else if (pena.x + PENA_LARGURA < 0) {
        removerPena();
    }
}

function pegarPena() {
    textoFlutuante('CAPA!', pena.x + PENA_LARGURA / 2, pena.y + 40);
    removerPena();
    temCapa = true;
    capaProntaEl.hidden = false;
    bip(990, 1480);
}

function iniciarVoo() {
    temCapa = false;
    capaProntaEl.hidden = true;
    voando = true;
    tempoVoo = VOO_DURACAO;
    marioVel = VOO_SUBIDA;
    bip(520, 1040);
}

function terminarVoo() {
    voando = false;
    puloDuploGasto = true;               // a capa acabou: cai normalmente
    marioVel = Math.min(marioVel, 0);
    mario.classList.remove('voo-acabando');
}

// teto do voo: não deixa o Mario sair por cima da tela
const tetoVoo = () => Math.max(150, board.clientHeight - CHAO - 230);

function fisicaVoo(dt) {
    tempoVoo -= dt;
    // segurando o pulo sobe, soltando plana para baixo, ↓ desce rápido
    const alvo = descendoRapido ? -900 : segurandoPulo ? VOO_SUBIDA : -VOO_DESCIDA;
    marioVel += (alvo - marioVel) * Math.min(1, dt * 6);
    marioY = Math.min(tetoVoo(), Math.max(0, marioY + marioVel * dt));
    if (marioY === 0 && marioVel < 0) marioVel = 0;
    mario.classList.toggle('voo-acabando', tempoVoo < VOO_AVISO_FIM);
    if (tempoVoo <= 0) terminarVoo();
}

// troca a imagem do Mario só quando muda (para o GIF não reiniciar)
function atualizarSpriteMario() {
    const novo = voando ? 'voando' : agachado ? 'agachado' : 'normal';
    if (novo === spriteMario) return;
    spriteMario = novo;
    mario.src = IMAGENS_MARIO[novo];
    mario.classList.toggle('agachado', novo === 'agachado');
    mario.classList.toggle('voando', novo === 'voando');
}

function textoFlutuante(texto, x, y) {
    const el = document.createElement('div');
    el.className = 'flutuante';
    el.textContent = texto;
    el.style.left = `${x}px`;
    el.style.bottom = `${CHAO + y}px`;
    el.addEventListener('animationend', () => el.remove());
    board.appendChild(el);
}

// ================== CONTROLES ==================
function pular() {
    if (estado !== 'jogando') return;
    segurandoPulo = true;
    if (voando) return; // voando, segurar o pulo faz subir (ver fisicaVoo)
    if (marioY === 0) {
        marioVel = FORCA_PULO;
    } else if (!puloDuploGasto) {
        // pulo duplo: um toque extra no ar (com a capa, vira voo)
        puloDuploGasto = true;
        if (temCapa) iniciarVoo();
        else marioVel = FORCA_PULO * 0.9;
    }
}

function soltarPulo() {
    segurandoPulo = false;
    // soltar cedo = pulo mais baixo
    if (marioVel > FORCA_PULO * 0.6) {
        marioVel = FORCA_PULO * 0.6;
    }
}

// ================== DIA E NOITE ==================
let noiteAtual = -1; // último valor aplicado (evita mexer no visual à toa)

// 0 = dia, 1 = noite, valores no meio = pôr do sol / amanhecer
function quantoNoite(t) {
    const total = CICLO_DIA + CICLO_TRANSICAO + CICLO_NOITE + CICLO_TRANSICAO;
    let m = t % total;
    if (m < CICLO_DIA) return 0;
    m -= CICLO_DIA;
    if (m < CICLO_TRANSICAO) return m / CICLO_TRANSICAO;
    m -= CICLO_TRANSICAO;
    if (m < CICLO_NOITE) return 1;
    m -= CICLO_NOITE;
    return 1 - m / CICLO_TRANSICAO;
}

// cores: [dia, pôr do sol, noite] do mundo atual (ou uma cor só, nos mundos sem ciclo)
function corDoCeu(cores, n) {
    if (cores.length === 1) return `rgb(${cores[0].join(', ')})`;
    // mistura as duas cores mais próximas da lista
    const pos = n * (cores.length - 1);
    const i = Math.min(Math.floor(pos), cores.length - 2);
    const f = pos - i;
    const [r, g, b] = cores[i].map((c, k) => Math.round(c + (cores[i + 1][k] - c) * f));
    return `rgb(${r}, ${g}, ${b})`;
}

function aplicarCeu(n) {
    const m = mundo();
    if (!m.ciclo) n = 0; // subterrâneo, castelo e Bowser não têm dia e noite
    if (n === noiteAtual || (Math.abs(n - noiteAtual) < 0.005 && n > 0 && n < 1)) return;
    noiteAtual = n;
    board.style.backgroundColor = corDoCeu(m.ceu, n);
    // estrelas e lua só depois do pôr do sol (na pista arco-íris, estrelas o tempo todo)
    ceuNoiteEl.style.opacity = m.estrelas ? 1 : m.ciclo ? Math.max(0, n * 2 - 1) : 0;
    nuvens.forEach(nuvem => { nuvem.style.filter = `brightness(${1 - 0.5 * n})`; });
    floor.style.filter = `brightness(${1 - 0.35 * n})`;
    Object.values(camadasEl).forEach(el => { el.style.filter = `brightness(${1 - 0.45 * n})`; });
    decoracaoEl.style.opacity = 1 - n; // o sol do deserto some à noite
}

function criarEstrelas() {
    for (let i = 0; i < 45; i++) {
        const estrela = document.createElement('div');
        estrela.className = 'estrela' + (Math.random() < 0.2 ? ' grande' : '');
        estrela.style.left = `${Math.random() * 100}%`;
        estrela.style.top = `${8 + Math.random() * 52}%`;
        estrela.style.animationDelay = `${-Math.random() * 1.6}s`;
        ceuNoiteEl.appendChild(estrela);
    }
}

// ================== PLACAR ONLINE ==================
// Fala com a função api/placar.js (Vercel). Abrindo o jogo direto do arquivo,
// sem servidor, o placar online só não aparece; o recorde local continua valendo.
const API_PLACAR = './api/placar';
const TAMANHO_TOP = 10;
const TAMANHO_NOME = 16;         // igual ao api/placar.js
const CHAVE_NOME = 'mario-jump-nome';

let partidaAtual = 0;            // muda a cada partida (ignora respostas atrasadas)
let ultimaPartida = null;        // { pontos, tempo, dificuldade } da partida que acabou

async function buscarTop(dif, limite = TAMANHO_TOP) {
    const resposta = await fetch(`${API_PLACAR}?dificuldade=${dif}&limite=${limite}`, { cache: 'no-store' });
    if (!resposta.ok) throw new Error(`placar respondeu ${resposta.status}`);
    return (await resposta.json()).top;
}

// desenha a lista; "destaque" marca a linha do jogador que acabou de enviar
function desenharRanking(caixa, dif, top, destaque) {
    caixa.querySelector('.ranking-dif').textContent = DIFICULDADES[dif].nome;
    const lista = caixa.querySelector('.ranking-lista');
    lista.replaceChildren();
    if (top.length === 0) {
        const li = document.createElement('li');
        li.className = 'vazio';
        li.textContent = 'NINGUEM AINDA. SEJA O PRIMEIRO!';
        lista.appendChild(li);
    }
    let destacou = false;
    for (const linha of top) {
        const li = document.createElement('li');
        const nome = document.createElement('span');
        nome.className = 'nome';
        nome.textContent = linha.nome;
        const pts = document.createElement('span');
        pts.textContent = formatar(linha.pontos);
        li.append(nome, pts);
        if (!destacou && destaque && linha.nome === destaque.nome && linha.pontos === destaque.pontos) {
            li.classList.add('voce');
            destacou = true;
        }
        lista.appendChild(li);
    }
    caixa.hidden = false;
}

async function atualizarRankingMenu() {
    const dif = dificuldade;
    try {
        const top = await buscarTop(dif, 5);
        if (dif === dificuldade) desenharRanking(rankingMenuEl, dif, top);
    } catch {
        rankingMenuEl.hidden = true; // sem servidor: segue sem placar online
    }
}

function mostrarStatusPlacar(texto) {
    statusPlacarEl.textContent = texto;
    statusPlacarEl.hidden = !texto;
}

async function mostrarPlacarFim() {
    const partida = partidaAtual;
    formPlacar.hidden = true;
    rankingFimEl.hidden = true;
    mostrarStatusPlacar('CARREGANDO PLACAR...');
    try {
        const top = await buscarTop(ultimaPartida.dificuldade);
        if (partida !== partidaAtual) return; // já começou outra partida
        mostrarStatusPlacar('');
        desenharRanking(rankingFimEl, ultimaPartida.dificuldade, top);

        const entrou = ultimaPartida.pontos > 0
            && (top.length < TAMANHO_TOP || ultimaPartida.pontos > top[top.length - 1].pontos);
        if (entrou) {
            formPlacar.hidden = false;
            formPlacar.querySelector('button').disabled = false;
            try { nomePlacarEl.value = localStorage.getItem(CHAVE_NOME) || ''; } catch { /* sem storage */ }
            nomePlacarEl.focus();
            nomePlacarEl.select();
        }
    } catch {
        if (partida === partidaAtual) mostrarStatusPlacar('');
    }
}

async function enviarPlacar(e) {
    e.preventDefault();
    const nome = nomePlacarEl.value
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim().slice(0, TAMANHO_NOME);
    if (!nome) {
        nomePlacarEl.focus();
        return;
    }
    const botao = formPlacar.querySelector('button');
    botao.disabled = true;
    mostrarStatusPlacar('ENVIANDO...');
    try {
        const resposta = await fetch(API_PLACAR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, ...ultimaPartida }),
        });
        if (resposta.status === 429) throw new Error('ESPERE UM POUCO PARA ENVIAR DE NOVO');
        if (!resposta.ok) throw new Error('NAO FOI POSSIVEL ENVIAR');
        const { posicao, top } = await resposta.json();
        try { localStorage.setItem(CHAVE_NOME, nome); } catch { /* sem storage */ }
        formPlacar.hidden = true;
        nomePlacarEl.blur(); // libera o espaço para jogar de novo
        mostrarStatusPlacar(`VOCE FICOU EM ${posicao}o LUGAR!`);
        desenharRanking(rankingFimEl, ultimaPartida.dificuldade, top, { nome, pontos: ultimaPartida.pontos });
    } catch (erro) {
        botao.disabled = false;
        mostrarStatusPlacar(erro.message.startsWith('ESPERE') || erro.message.startsWith('NAO')
            ? erro.message : 'PLACAR ONLINE INDISPONIVEL');
    }
}

// ================== FLUXO DO JOGO ==================
function iniciar() {
    const config = DIFICULDADES[dificuldade];
    limparObstaculos();

    velocidade = config.velInicial * escalaTela();
    tempo = 0;
    distancia = 0;
    bonus = 0;
    pontos = 0;
    nivel = 1;
    marioY = 0;
    marioVel = 0;
    segurandoPulo = false;
    descendoRapido = false;
    puloDuploGasto = false;
    agachado = false;
    temCapa = false;
    voando = false;
    removerPena();
    tempoPena = sortearEntre(PENA_PRIMEIRA);
    capaProntaEl.hidden = true;
    // toda partida começa de dia, no primeiro mundo e com a música do começo
    pararTrilha();
    reiniciarChiptune();
    trocandoMundo = false;
    transicaoEl.classList.remove('ativa');
    avisoEl.classList.remove('aviso-bowser');
    offsetCenario = 0;
    aplicarMundo(0);
    resetarBowser();
    partidaAtual++;
    formPlacar.hidden = true;
    nomePlacarEl.blur();
    proximoObstaculo = velocidade * 1.2;

    spriteMario = 'normal';
    mario.src = IMG_MARIO;
    mario.classList.remove('morto', 'agachado', 'voando', 'voo-acabando');
    mario.style.transform = 'translateY(0)';

    recordeAtual = lerRecorde(dificuldade);
    pontosEl.textContent = formatar(0);
    nivelEl.textContent = '1';
    recordeEl.textContent = formatar(recordeAtual);
    document.activeElement?.blur(); // evita que o espaço "clique" no botão focado

    telaInicio.hidden = true;
    telaFim.hidden = true;
    telaPausa.hidden = true;
    board.classList.remove('parado');

    somFim.pause();
    somFim.currentTime = 0;
    somTema.currentTime = 0;
    tocarTrilha();

    estado = 'jogando';
    ultimoFrame = performance.now();
    requestAnimationFrame(loop);
}

function fimDeJogo() {
    estado = 'fim';
    fimEm = performance.now();
    board.classList.add('parado');

    spriteMario = 'morto';
    mario.src = './img/game-over.png';
    mario.classList.remove('agachado', 'voando', 'voo-acabando');
    mario.classList.add('morto');
    mario.style.transform = `translateY(${-marioY}px)`; // tira o espelhamento do agachado

    pararTrilha();
    pausarBowser();
    tocar(somFim);

    const novoRecorde = pontos > recordeAtual;
    if (novoRecorde) {
        salvarRecorde(dificuldade, pontos);
        recordeEl.textContent = formatar(pontos);
    }

    fimPontosEl.textContent = formatar(pontos);
    novoRecordeEl.hidden = !novoRecorde;
    telaFim.hidden = false;

    ultimaPartida = { pontos, tempo: Math.round(tempo * 100) / 100, dificuldade };
    mostrarPlacarFim();
}

function pausar() {
    if (estado === 'jogando') {
        estado = 'pausado';
        board.classList.add('parado');
        telaPausa.hidden = false;
        pararTrilha();
        pausarBowser();
    } else if (estado === 'pausado') {
        estado = 'jogando';
        board.classList.remove('parado');
        telaPausa.hidden = true;
        tocarTrilha();
        ultimoFrame = performance.now();
        requestAnimationFrame(loop);
    }
}

function mostrarAviso(texto) {
    avisoEl.hidden = true;
    avisoEl.textContent = texto;
    void avisoEl.offsetWidth; // reinicia a animação
    avisoEl.hidden = false;
}

function piscarPlacar() {
    pontosEl.classList.remove('piscar');
    void pontosEl.offsetWidth;
    pontosEl.classList.add('piscar');
}

// ================== LOOP PRINCIPAL ==================
function loop(agora) {
    if (estado !== 'jogando') return;

    const dt = Math.min((agora - ultimoFrame) / 1000, 0.05);
    ultimoFrame = agora;
    const config = DIFICULDADES[dificuldade];

    // velocidade aumenta com o tempo
    tempo += dt;
    velocidade = Math.min(config.velMax, config.velInicial + config.aceleracao * tempo) * escalaTela();
    const passo = velocidade * dt;

    // pontuação
    distancia += passo;
    const novosPontos = Math.floor(distancia * PONTOS_POR_PIXEL) + bonus;
    if (Math.floor(novosPontos / 100) > Math.floor(pontos / 100)) {
        piscarPlacar();
        bip();
    }
    pontos = novosPontos;
    pontosEl.textContent = formatar(pontos);

    if (pontos > recordeAtual) {
        recordeEl.textContent = formatar(pontos);
    }

    const novoNivel = 1 + Math.floor(pontos / PONTOS_POR_NIVEL);
    if (novoNivel !== nivel) {
        nivel = novoNivel;
        nivelEl.textContent = nivel;
        mostrarAviso(`NIVEL ${nivel}!`);
    }

    // muda de mundo quando os pontos passam da faixa (mundos.js)
    atualizarMundo(pontos);

    // física do pulo (ou do voo com a capa)
    if (voando) {
        fisicaVoo(dt);
    } else if (marioY > 0 || marioVel > 0) {
        const g = descendoRapido ? GRAVIDADE * 3 : GRAVIDADE;
        marioVel -= g * dt;
        marioY += marioVel * dt;
        if (marioY <= 0) {
            marioY = 0;
            marioVel = 0;
            puloDuploGasto = false;
            // segurando o botão, pula de novo ao tocar o chão
            if (segurandoPulo && !descendoRapido) marioVel = FORCA_PULO;
        }
    }
    agachado = descendoRapido && marioY === 0 && !voando;
    atualizarSpriteMario();
    // a imagem do Mario agachado olha para o outro lado: espelha
    mario.style.transform = `translateY(${-marioY}px)` + (agachado ? ' scaleX(-1)' : '');

    aplicarCeu(quantoNoite(tempo));

    // chão rolando
    chaoOffset = (chaoOffset + passo) % 1500;
    floor.style.backgroundPositionX = `${-chaoOffset}px`;
    moverCenario(passo); // fundos do mundo (parallax)

    // avisos de míssil: quando o tempo acaba, o míssil aparece
    alertas = alertas.filter(alerta => {
        alerta.tempo -= dt;
        if (alerta.tempo > 0) return true;
        alerta.el.remove();
        const missil = criarMissil(alerta.altura);
        obstaculos.push(missil);
        posicionar(missil);
        return false;
    });

    // novos obstáculos
    proximoObstaculo -= passo;
    if (proximoObstaculo <= 0) criarObstaculo();

    for (const o of obstaculos) {
        o.x -= passo + o.velExtra * dt;
        ATUALIZAR[o.tipo]?.(o, dt);
        posicionar(o);
    }

    atualizarPena(dt, passo);
    atualizarBowser(dt); // Bowser no canto cuspindo fogo (bowser.js)
    obstaculos = obstaculos.filter(o => {
        if (o.x + o.largura < -20) {
            o.el.remove();
            return false;
        }
        return true;
    });

    // colisões
    for (const o of obstaculos) {
        if (o.pisada || !bateu(o)) continue;

        // caindo em cima de uma tartaruga (no chão ou voando) = pisou nela
        if (PISAVEIS.includes(o.tipo) && marioVel < 0 && marioY > o.y + o.altura * 0.35) {
            pisarTartaruga(o);
            continue;
        }

        fimDeJogo();
        return;
    }

    requestAnimationFrame(loop);
}

// ================== EVENTOS ==================
const TECLAS_PULO = ['Space', 'ArrowUp', 'KeyW'];

document.addEventListener('keydown', e => {
    // digitando o nome do placar: as teclas não controlam o jogo (Esc sai do campo)
    if (e.target === nomePlacarEl) {
        if (e.code === 'Escape') nomePlacarEl.blur();
        return;
    }
    if (TECLAS_PULO.includes(e.code) || e.code === 'ArrowDown') e.preventDefault();

    if (e.code === 'KeyM') return alternarSom();
    if (e.code === 'KeyP' || e.code === 'Escape') return pausar();

    if (estado === 'menu' || estado === 'fim') {
        const numero = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
        if (numero >= 0) return escolherDificuldade(Object.keys(DIFICULDADES)[numero]);

        // pequena espera após o game over para não reiniciar sem querer
        const podeComecar = estado === 'menu' || performance.now() - fimEm > 600;
        if ((TECLAS_PULO.includes(e.code) || e.code === 'Enter') && podeComecar && !e.repeat) {
            iniciar();
        }
        return;
    }

    if (TECLAS_PULO.includes(e.code) && !e.repeat) pular();
    if (e.code === 'ArrowDown' || e.code === 'KeyS') descendoRapido = true;
});

document.addEventListener('keyup', e => {
    if (TECLAS_PULO.includes(e.code)) soltarPulo();
    if (e.code === 'ArrowDown' || e.code === 'KeyS') descendoRapido = false;
});

// toque / clique na tela também pula
board.addEventListener('pointerdown', e => {
    if (estado !== 'jogando' || e.target.closest('button')) return;
    pular();
});
document.addEventListener('pointerup', soltarPulo);

// botão ↓ na tela (celular): segure para agachar
const btnAgachar = document.getElementById('btn-agachar');
btnAgachar.addEventListener('pointerdown', () => { descendoRapido = true; });
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
    btnAgachar.addEventListener(ev, () => { descendoRapido = false; }));

document.querySelectorAll('.dificuldades button').forEach(btn => {
    btn.addEventListener('click', () => escolherDificuldade(btn.dataset.dif));
});
document.getElementById('btn-start').addEventListener('click', iniciar);
formPlacar.addEventListener('submit', enviarPlacar);
// só letras, números e espaço no nome (sem acento: a fonte não desenha bem)
nomePlacarEl.addEventListener('input', () => {
    nomePlacarEl.value = nomePlacarEl.value
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, TAMANHO_NOME);
});
document.getElementById('btn-reiniciar').addEventListener('click', iniciar);
btnSom.addEventListener('click', e => {
    alternarSom();
    e.currentTarget.blur(); // evita que o espaço "clique" no botão
});

// pausa sozinho se trocar de aba
document.addEventListener('visibilitychange', () => {
    if (document.hidden && estado === 'jogando') pausar();
});

// ================== INÍCIO ==================
board.classList.add('parado');
criarEstrelas();
aplicarMundo(0);
escolherDificuldade('normal');

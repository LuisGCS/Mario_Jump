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

const telaInicio = document.getElementById('tela-inicio');
const telaPausa = document.getElementById('tela-pausa');
const telaFim = document.getElementById('tela-fim');
const fimPontosEl = document.getElementById('fim-pontos');
const novoRecordeEl = document.getElementById('novo-recorde');

const somTema = new Audio('./SOUNG/audio_theme.mp3');
somTema.loop = true;
somTema.volume = 0.4;
const somFim = new Audio('./SOUNG/audio_gameover.mp3');
somFim.volume = 0.6;

// ================== CONFIGURAÇÃO ==================
const CHAO = 29;                 // altura do chão (px)
const MARIO_X = 20;              // posição horizontal do Mario
const MARIO_ALTURA = 115;        // altura da caixa de colisão do Mario
const GRAVIDADE = 4700;          // px/s²
const FORCA_PULO = 1400;         // velocidade inicial do pulo (px/s)
const CANO_LARGURA = 80;
const CANO_ALTURA = CANO_LARGURA * (375 / 293); // proporção da imagem pipe.png
const MISSIL_ALTURA_BAIXA = 15;  // míssil baixo: precisa pular
const MARIO_ALTURA_AGACHADO = 60; // altura da caixa de colisão agachado
const MISSIL_ALTURA_ALTA = 85;   // míssil alto: passe por baixo AGACHADO (↓)
const AVISO_MISSIL = 0.7;        // segundos que o "!" pisca antes do míssil
const PONTOS_POR_PIXEL = 0.02;   // quanto o placar sobe por pixel percorrido
const PONTOS_POR_NIVEL = 300;
const PONTOS_PISAR = 50;         // bônus por pisar numa tartaruga

// Cada dificuldade muda velocidade, aceleração, espaço entre obstáculos e quais aparecem
const DIFICULDADES = {
    facil: {
        nome: 'FÁCIL',
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
        padroes: ['simples', 'simples', 'dupla', 'alta', 'dupla-alta', 'tartaruga', 'tartaruga', 'missil-baixo', 'missil-alto', 'chuck'],
    },
    dificil: {
        nome: 'DIFÍCIL',
        velInicial: 730,
        aceleracao: 16,
        velMax: 1350,
        intervalo: [0.75, 1.3],
        padroes: ['simples', 'dupla', 'alta', 'dupla-alta', 'tartaruga', 'tartaruga-dupla',
                  'missil-baixo', 'missil-alto', 'chuck'],
    },
    insano: {
        nome: 'INSANO',
        velInicial: 1320,
        aceleracao: 33,
        velMax: 2400,
        intervalo: [0.7, 1.1],
        padroes: ['simples', 'dupla', 'alta', 'dupla-alta', 'gigante', 'tartaruga', 'tartaruga-dupla',
                  'missil-baixo', 'missil-alto', 'missil-alto', 'chuck', 'chuck'],
    },
};

// Formatos de obstáculos: peças colocadas lado a lado
const PADROES = {
    'simples': [{ tipo: 'cano', escala: 1 }],
    'dupla': [{ tipo: 'cano', escala: 1 }, { tipo: 'cano', escala: 1 }],
    'alta': [{ tipo: 'cano', escala: 1.3 }],
    'dupla-alta': [{ tipo: 'cano', escala: 1 }, { tipo: 'cano', escala: 1.3 }],
    'gigante': [{ tipo: 'cano', escala: 1.45 }],
    'tartaruga': [{ tipo: 'tartaruga' }],
    'tartaruga-dupla': [{ tipo: 'tartaruga' }, { tipo: 'tartaruga' }],
    'missil-baixo': [{ tipo: 'missil', altura: MISSIL_ALTURA_BAIXA }],
    'missil-alto': [{ tipo: 'missil', altura: MISSIL_ALTURA_ALTA }],
    'chuck': [{ tipo: 'chuck' }],
};

// ================== IMAGENS DOS INIMIGOS ==================
// largura: tamanho na tela (px) · proporcao: altura / largura da imagem
// vazio: fração de espaço transparente em volta do desenho (para a colisão ser justa)
const SPRITES = {
    tartaruga: {
        src: './IMG/koopa.gif',
        largura: 60,
        proporcao: 200 / 119,
        vazio: { lados: 0.08, topo: 0.08, baixo: 0 },
    },
    missil: {
        src: './IMG/bullet-bill-mario.gif',
        largura: 170,
        proporcao: 200 / 192,
        vazio: { lados: 0.1, topo: 0.3, baixo: 0.26 },
    },
    chuck: {
        src: './IMG/CharginChuck.gif',
        largura: 100,
        proporcao: 519 / 500,
        vazio: { lados: 0.08, topo: 0.05, baixo: 0.02 },
    },
};

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
let agachado = false;            // ↓ no chão = agacha
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
        somTema.pause();
        somFim.pause();
    } else if (estado === 'jogando') {
        tocar(somTema);
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
        el: criarElemento('pipe', './IMG/pipe.png', largura),
        x, y: 0, largura, altura: CANO_ALTURA * escala,
        velExtra: 0, margemX: 8, margemTopo: 14, margemBaixo: 0,
    };
}

// Monta o inimigo a partir da imagem, com a colisão ignorando a parte transparente
function criarInimigo(tipo, x, y) {
    const sprite = SPRITES[tipo];
    const largura = sprite.largura;
    const altura = largura * sprite.proporcao;
    return {
        tipo,
        el: criarElemento('inimigo', sprite.src, largura),
        x, y, largura, altura,
        margemX: largura * sprite.vazio.lados + 4,
        margemTopo: altura * sprite.vazio.topo + 4,
        margemBaixo: altura * sprite.vazio.baixo,
    };
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
        const obstaculo = peca.tipo === 'cano' ? criarCano(x, peca.escala)
            : peca.tipo === 'chuck' ? criarChuck(x) : criarTartaruga(x);
        obstaculos.push(obstaculo);
        posicionar(obstaculo);
        x += obstaculo.largura + (peca.tipo === 'cano' ? -4 : 25);
    });

    // tartarugas e Chuck andam na sua direção, então ganham mais espaço
    const extra = pecas[0].tipo === 'tartaruga' ? 1.2 : pecas[0].tipo === 'chuck' ? 1.4 : 1;
    proximoObstaculo = (x - board.clientWidth) + espaco * extra;
}

function posicionar(o) {
    o.el.style.transform = `translateX(${o.x}px)` + (o.pisada ? ' scaleY(0.4)' : '');
}

function limparObstaculos() {
    obstaculos.forEach(o => o.el.remove());
    alertas.forEach(a => a.el.remove());
    obstaculos = [];
    alertas = [];
}

function bateu(o) {
    // caixas de colisão um pouco menores que as imagens, para ser justo
    const marioEsq = MARIO_X + 35;
    const marioDir = MARIO_X + 112;
    return marioDir > o.x + o.margemX
        && marioEsq < o.x + o.largura - o.margemX
        && marioY < o.y + o.altura - o.margemTopo
        && marioY + (agachado ? MARIO_ALTURA_AGACHADO : MARIO_ALTURA) > o.y + o.margemBaixo;
}

function pisarTartaruga(o) {
    o.pisada = true;
    o.velExtra = 0;
    o.el.classList.add('pisada');
    marioVel = FORCA_PULO * 0.75; // quica para cima
    bonus += PONTOS_PISAR;
    bip(660, 990);
    textoFlutuante(`+${PONTOS_PISAR}`, o.x + o.largura / 2, o.altura + 20);
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
    if (marioY === 0) {
        marioVel = FORCA_PULO;
    }
}

function soltarPulo() {
    segurandoPulo = false;
    // soltar cedo = pulo mais baixo
    if (marioVel > FORCA_PULO * 0.6) {
        marioVel = FORCA_PULO * 0.6;
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
    agachado = false;
    proximoObstaculo = velocidade * 1.2;

    mario.src = './IMG/mario.gif';
    mario.classList.remove('morto');
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
    tocar(somTema);

    estado = 'jogando';
    ultimoFrame = performance.now();
    requestAnimationFrame(loop);
}

function fimDeJogo() {
    estado = 'fim';
    fimEm = performance.now();
    board.classList.add('parado');

    mario.src = './IMG/game-over.png';
    mario.classList.add('morto');

    somTema.pause();
    tocar(somFim);

    const novoRecorde = pontos > recordeAtual;
    if (novoRecorde) {
        salvarRecorde(dificuldade, pontos);
        recordeEl.textContent = formatar(pontos);
    }

    fimPontosEl.textContent = formatar(pontos);
    novoRecordeEl.hidden = !novoRecorde;
    telaFim.hidden = false;
}

function pausar() {
    if (estado === 'jogando') {
        estado = 'pausado';
        board.classList.add('parado');
        telaPausa.hidden = false;
        somTema.pause();
    } else if (estado === 'pausado') {
        estado = 'jogando';
        board.classList.remove('parado');
        telaPausa.hidden = true;
        tocar(somTema);
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
        mostrarAviso(`NÍVEL ${nivel}!`);
    }

    // física do pulo
    if (marioY > 0 || marioVel > 0) {
        const g = descendoRapido ? GRAVIDADE * 3 : GRAVIDADE;
        marioVel -= g * dt;
        marioY += marioVel * dt;
        if (marioY <= 0) {
            marioY = 0;
            marioVel = 0;
            // segurando o botão, pula de novo ao tocar o chão
            if (segurandoPulo && !descendoRapido) marioVel = FORCA_PULO;
        }
    }
    agachado = descendoRapido && marioY === 0;
    mario.style.transform = `translateY(${-marioY}px)` + (agachado ? ' scaleY(0.55)' : '');

    // chão rolando
    chaoOffset = (chaoOffset + passo) % 1500;
    floor.style.backgroundPositionX = `${-chaoOffset}px`;

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
        posicionar(o);
    }
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

        // caindo em cima da tartaruga = pisou nela
        if (o.tipo === 'tartaruga' && marioVel < 0 && marioY > o.altura * 0.35) {
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
escolherDificuldade('normal');

// ================== MUNDOS ==================
// A cada faixa de pontos o cenário e a música mudam. Tudo é desenhado aqui em
// pixel art (SVG gerado no código), sem arquivos de imagem.
//
// pontos: a partir de quantos pontos (no NORMAL) o mundo começa; as outras
//         dificuldades usam MUNDO_MULTIPLICADOR (no insano os pontos sobem mais rápido)
// ceu:    [dia, pôr do sol, noite] (com ciclo) ou [cor única] (sem ciclo)
// musica: 'tema' = audio_theme.mp3 · os outros são chiptunes do musica.js

const MUNDO_MULTIPLICADOR = { facil: 0.8, normal: 1, dificil: 1.3, insano: 2 };
const PARALLAX = { teto: 1, longe: 0.15, perto: 0.4 };

// ---------- ferramentas de desenho ----------
const ret = (x, y, w, h, cor) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}"/>`;

function imagemSvg(largura, altura, conteudo) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" `
        + `shape-rendering="crispEdges">${conteudo}</svg>`;
    return { url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, largura, altura };
}

// triângulo em degraus (montanha, pirâmide, pinheiro, telhado)
function degraus(cx, base, largura, altura, cor, passo = 8) {
    let s = '';
    for (let y = 0; y < altura; y += passo) {
        const w = Math.max(passo, Math.round(largura * (1 - y / altura) / passo) * passo);
        s += ret(cx - w / 2, base - y - passo, w, passo, cor);
    }
    return s;
}

// meia elipse em degraus (duna, monte de neve)
function morro(cx, base, largura, altura, cor, passo = 6) {
    let s = '';
    for (let y = 0; y < altura; y += passo) {
        const w = Math.round(largura * Math.sqrt(1 - (y / altura) ** 2) / passo) * passo;
        if (w > 0) s += ret(cx - w / 2, base - y - passo, w, passo, cor);
    }
    return s;
}

// fileira de tijolos (deslocada em linhas alternadas)
function tijolos(largura, altura, tijL, tijA, cor, rejunte, brilho) {
    let s = ret(0, 0, largura, altura, rejunte);
    for (let linha = 0, y = 0; y < altura; linha++, y += tijA) {
        for (let x = linha % 2 ? -tijL / 2 : 0; x < largura; x += tijL) {
            s += ret(x + 1, y + 1, tijL - 2, tijA - 2, cor);
            if (brilho) s += ret(x + 1, y + 1, tijL - 2, 2, brilho);
        }
    }
    return s;
}

// ---------- desenhos de cada mundo ----------
const DESENHOS = {
    subterraneo: {
        teto: imagemSvg(64, 52, tijolos(64, 44, 32, 22, '#23478f', '#0a1633', '#3a68c4')
            + ret(6, 44, 6, 4, '#16306a') + ret(8, 48, 2, 4, '#16306a') + ret(40, 44, 8, 6, '#16306a')),
        longe: imagemSvg(256, 220,
            [40, 172].map((x, i) => {
                const w = i ? 32 : 48;
                let s = ret(x, 0, w, 220, '#0f1f44');
                for (let y = 0; y < 220; y += 16) s += ret(x, y, w, 2, '#081330');
                return s;
            }).join('')),
        perto: imagemSvg(320, 60,
            degraus(60, 60, 40, 40, '#16285a', 6) + degraus(78, 60, 24, 24, '#16285a', 6)
            + degraus(230, 60, 32, 52, '#122250', 6)),
        chao: imagemSvg(60, 34, tijolos(60, 34, 30, 17, '#2b57b5', '#0a1633', '#4a7be0')),
    },

    deserto: {
        longe: imagemSvg(480, 200,
            morro(90, 200, 320, 70, '#e2a85f') + morro(390, 200, 300, 90, '#e2a85f')
            + degraus(250, 170, 150, 110, '#c98d47') + degraus(277, 170, 96, 70, '#b07a3b')
            + degraus(360, 175, 80, 56, '#c98d47')
            + ret(0, 170, 480, 30, '#e2a85f')),
        perto: imagemSvg(360, 120,
            morro(80, 120, 260, 44, '#f0c27a') + morro(300, 120, 200, 36, '#f0c27a')
            // cactos
            + ret(200, 40, 12, 80, '#3f8a3f') + ret(186, 58, 14, 8, '#3f8a3f') + ret(186, 44, 6, 22, '#3f8a3f')
            + ret(212, 66, 14, 8, '#3f8a3f') + ret(220, 52, 6, 22, '#3f8a3f') + ret(202, 40, 3, 80, '#57a857')
            + ret(40, 84, 8, 36, '#3f8a3f') + ret(30, 92, 10, 6, '#3f8a3f') + ret(30, 84, 4, 14, '#3f8a3f')),
        chao: imagemSvg(60, 34,
            ret(0, 0, 60, 34, '#e7b45c') + ret(0, 0, 60, 4, '#f5d391')
            + ret(6, 12, 10, 2, '#d9a14d') + ret(34, 20, 14, 2, '#d9a14d') + ret(14, 27, 8, 2, '#d9a14d')
            + ret(48, 9, 2, 2, '#c8913e') + ret(24, 17, 2, 2, '#c8913e') + ret(4, 22, 2, 2, '#c8913e')
            + ret(42, 29, 2, 2, '#c8913e')),
        decoracao: 'sol',
    },

    neve: {
        longe: imagemSvg(480, 220,
            [[110, 260, 190], [300, 300, 220], [440, 200, 150]].map(([cx, w, h]) =>
                degraus(cx, 220, w, h, '#6f8fb3') + degraus(cx, 220 - h * 0.62, w * 0.38, h * 0.38, '#f2f8ff')
            ).join('')),
        perto: imagemSvg(300, 140,
            morro(150, 140, 300, 22, '#e8f4fb')
            + [[60, 90], [190, 120], [250, 76]].map(([cx, h]) =>
                ret(cx - 5, 126, 10, 14, '#5a3b22')
                + degraus(cx, 128, h * 0.62, h, '#2c6e4f', 8)
                + degraus(cx, 128 - h * 0.55, h * 0.3, h * 0.45, '#f4fbff', 8)
            ).join('')),
        chao: imagemSvg(60, 34,
            ret(0, 0, 60, 34, '#8fc6e3') + ret(0, 0, 60, 12, '#f4fbff')
            + ret(8, 12, 12, 4, '#f4fbff') + ret(38, 12, 10, 3, '#f4fbff')
            + ret(4, 22, 20, 2, '#c3e4f5') + ret(32, 28, 18, 2, '#c3e4f5')),
        particulas: 'neve',
    },

    castelo: {
        longe: imagemSvg(256, 260, (() => {
            let s = tijolos(256, 200, 32, 16, '#2b2738', '#221f2e');
            s = `<g transform="translate(0,60)">${s}</g>`;
            for (let x = 0; x < 256; x += 48) s += ret(x, 36, 24, 24, '#2b2738');  // ameias
            for (const x of [44, 172]) {                                          // janelas em arco acesas
                s += ret(x, 104, 32, 52, '#16131f')                                // moldura
                    + ret(x + 8, 100, 16, 4, '#16131f') + ret(x + 4, 102, 24, 4, '#16131f')
                    + ret(x + 4, 112, 24, 40, '#f0a030')                           // vidro
                    + ret(x + 8, 106, 16, 6, '#f0a030')                            // arco
                    + ret(x + 8, 116, 16, 32, '#ffd27a')                           // luz de dentro
                    + ret(x + 15, 106, 2, 46, '#16131f') + ret(x + 4, 128, 24, 2, '#16131f'); // grade
            }
            return s;
        })()),
        perto: imagemSvg(384, 200,
            [40, 232].map(x =>
                ret(x, 40, 40, 160, '#3d3850') + ret(x - 6, 32, 52, 10, '#4a4560') + ret(x + 6, 40, 4, 160, '#4a4560')
                // tocha
                + ret(x + 52, 104, 6, 18, '#5a4a3a') + ret(x + 50, 92, 10, 12, '#ff8c1a') + ret(x + 52, 86, 6, 10, '#ffd23f')
            ).join('')),
        chao: imagemSvg(60, 34, tijolos(60, 34, 30, 17, '#6d6a7c', '#393647', '#8a879a')),
    },

    bowser: {
        longe: imagemSvg(480, 260, (() => {
            // vulcão com topo achatado, cratera acesa e dois rios de lava descendo em degraus
            let s = '';
            for (let y = 0; y < 170; y += 10) {                                    // corpo com topo reto
                const w = Math.round((340 - 260 * (y / 170)) / 10) * 10;
                s += ret(150 - w / 2, 250 - y, w, 10, '#64201a');
            }
            s += ret(118, 86, 64, 8, '#ff5a1f') + ret(126, 82, 48, 6, '#ffb02e');  // cratera
            for (let k = 0; k < 9; k++) {
                s += ret(124 - k * 7, 94 + k * 18, 8, 18, k % 2 ? '#e8401a' : '#ff5a1f');
                s += ret(170 + k * 6, 94 + k * 18, 6, 18, k % 2 ? '#ff5a1f' : '#e8401a');
            }
            s += degraus(390, 260, 220, 150, '#3e0e0b', 10) + degraus(462, 260, 120, 96, '#4a120e', 10);
            return s;
        })()),
        perto: imagemSvg(400, 220,
            [[70, 150], [300, 190]].map(([x, h]) =>
                ret(x, 220 - h, 50, h, '#1c0606')
                + degraus(x + 25, 220 - h, 64, 46, '#140404', 8)
                + ret(x + 18, 220 - h + 30, 14, 18, '#ff3b1f') + ret(x + 18, 220 - h + 80, 14, 18, '#c42a14')
            ).join('')
            + degraus(190, 220, 60, 50, '#1c0606', 6) + degraus(214, 220, 30, 30, '#1c0606', 6)),
        // chão de pedra escura com rachaduras de lava irregulares (150px para não repetir tanto)
        chao: imagemSvg(150, 34, (() => {
            let s = ret(0, 0, 150, 34, '#2a1414') + ret(0, 0, 150, 3, '#3d1e1e');
            // pedras soltas um pouco mais claras
            for (const [x, y, w] of [[14, 22, 10], [64, 26, 8], [104, 18, 12], [132, 28, 6]]) {
                s += ret(x, y, w, 4, '#3a1c1c');
            }
            // cada rachadura: lista de trechos [x, y, largura, altura]
            const rachaduras = [
                [[6, 3, 2, 6], [8, 9, 6, 2], [14, 9, 2, 8], [16, 17, 8, 2]],
                [[52, 3, 2, 4], [50, 7, 2, 7], [52, 14, 10, 2], [62, 14, 2, 12], [64, 26, 5, 2]],
                [[96, 3, 2, 9], [98, 12, 4, 2], [102, 12, 2, 5]],
                [[124, 3, 2, 5], [126, 8, 8, 2], [134, 8, 2, 10], [130, 18, 4, 2]],
            ];
            for (const trechos of rachaduras) {
                for (const [x, y, w, h] of trechos) s += ret(x, y, w, h, '#ff6a00');
            }
            // poças de lava brilhando
            s += ret(20, 24, 10, 4, '#ff6a00') + ret(22, 25, 6, 2, '#ffd23f')
               + ret(84, 22, 12, 4, '#ff6a00') + ret(87, 23, 6, 2, '#ffd23f');
            return s;
        })()),
        particulas: 'brasas',
        decoracao: 'brilho-lava',
    },

    arcoiris: {
        // espaço: planeta com anel, estrelas coloridas e um pedaço de pista arco-íris ao longe
        longe: imagemSvg(520, 300, (() => {
            const cores = ['#ff4d4d', '#ff9f1c', '#ffe14d', '#3ddc84', '#3d9bff', '#a259ff'];
            let s = '';
            // pista ao longe: arco em degraus com as seis cores
            cores.forEach((cor, i) => {
                for (let k = 0; k < 16; k++) {
                    const x = 250 + k * 16;
                    const y = 210 - Math.round(Math.sin(k / 15 * Math.PI) * 90) + i * 5;
                    s += ret(x, y, 16, 5, cor);
                }
            });
            // planeta com anel
            for (let y = -40; y < 40; y += 8) {
                const w = Math.round(Math.sqrt(1600 - (y + 4) ** 2) / 4) * 8;
                s += ret(110 - w / 2, 90 + y, w, 8, y < 0 ? '#7b5cff' : '#5a3fd6');
            }
            s += ret(50, 92, 120, 6, '#ffd36e') + ret(40, 96, 20, 4, '#ffd36e') + ret(160, 88, 20, 4, '#ffd36e');
            // estrelinhas coloridas
            for (const [x, y, c] of [[30, 30, '#fff'], [200, 40, '#ffe14d'], [330, 20, '#fff'], [460, 60, '#3d9bff'],
                [400, 130, '#fff'], [20, 200, '#ff9f1c'], [190, 160, '#fff'], [480, 250, '#a259ff']]) {
                s += ret(x, y, 4, 4, c) + ret(x - 4, y, 12, 1, c + '88') + ret(x + 1, y - 4, 1, 12, c + '88');
            }
            return s;
        })()),
        // chão: a pista com as seis faixas e a borda branca tracejada
        chao: imagemSvg(60, 34, (() => {
            const cores = ['#ff4d4d', '#ff9f1c', '#ffe14d', '#3ddc84', '#3d9bff', '#a259ff'];
            let s = ret(0, 0, 60, 34, '#ffffff') + ret(30, 0, 30, 4, '#c9c9ff');
            cores.forEach((cor, i) => { s += ret(0, 4 + i * 5, 60, 5, cor); });
            s += ret(0, 4, 2, 30, '#ffffff55'); // emenda clarinha: dá a sensação de velocidade
            return s;
        })()),
    },
};

const MUNDOS = [
    { id: 'campo', nome: 'CAMPO', pontos: 0, musica: 'tema', ciclo: true, nuvens: true,
      ceu: [[65, 105, 225], [240, 138, 93], [11, 19, 64]] },
    { id: 'subterraneo', nome: 'SUBTERRANEO', pontos: 1000, musica: 'subterraneo', ciclo: false, nuvens: false,
      ceu: [[2, 4, 14]], canos: 'hue-rotate(95deg) saturate(0.8)' },
    { id: 'deserto', nome: 'DESERTO', pontos: 2500, musica: 'deserto', ciclo: true, nuvens: true,
      ceu: [[250, 200, 120], [230, 110, 60], [30, 20, 60]] },
    { id: 'neve', nome: 'NEVE', pontos: 4500, musica: 'neve', ciclo: true, nuvens: true,
      ceu: [[150, 200, 235], [200, 150, 210], [16, 28, 60]], canos: 'saturate(0.75) brightness(1.08)' },
    { id: 'castelo', nome: 'CASTELO', pontos: 7000, musica: 'castelo', ciclo: false, nuvens: false,
      ceu: [[26, 20, 38]], canos: 'grayscale(0.55) brightness(0.9)' },
    { id: 'bowser', nome: 'MUNDO DO BOWSER', pontos: 10000, musica: 'bowser', ciclo: false, nuvens: false,
      ceu: [[42, 6, 8]], canos: 'hue-rotate(-115deg) saturate(1.4) brightness(0.85)', chefe: true },
    // o último: quem chega fica nele até o fim da partida (canos trocam de cor pelo CSS)
    { id: 'arcoiris', nome: 'PISTA ARCO-IRIS', pontos: 15000, musica: 'arcoiris', ciclo: false, nuvens: false,
      ceu: [[8, 6, 30]], estrelas: true },
];

// ---------- estado ----------
let mundoAtual = 0;
let trocandoMundo = false;
let offsetCenario = 0;
const mundo = () => MUNDOS[mundoAtual];

const camadasEl = {
    teto: document.getElementById('fundo-teto'),
    longe: document.getElementById('fundo-longe'),
    perto: document.getElementById('fundo-perto'),
};
const decoracaoEl = document.getElementById('decoracao-ceu');
const particulasEl = document.getElementById('particulas');
const transicaoEl = document.getElementById('transicao-mundo');
const mundoAtualEl = document.getElementById('mundo-atual');

// em qual mundo esses pontos caem (na dificuldade atual)
function mundoDosPontos(pts) {
    const mult = MUNDO_MULTIPLICADOR[dificuldade] || 1;
    let indice = 0;
    MUNDOS.forEach((m, i) => { if (pts >= m.pontos * mult) indice = i; });
    return indice;
}

function criarParticulas(tipo) {
    particulasEl.replaceChildren();
    if (!tipo) return;
    const quantidade = tipo === 'neve' ? 45 : 30;
    for (let i = 0; i < quantidade; i++) {
        const p = document.createElement('div');
        p.className = `particula ${tipo}`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${(tipo === 'neve' ? 5 : 3) + Math.random() * 4}s`;
        p.style.animationDelay = `${-Math.random() * 8}s`;
        if (Math.random() < 0.3) p.classList.add('grande');
        particulasEl.appendChild(p);
    }
}

// troca tudo de uma vez (sem animação)
function aplicarMundo(indice) {
    mundoAtual = indice;
    const m = mundo();
    const desenho = DESENHOS[m.id] || {};
    MUNDOS.forEach(outro => board.classList.toggle(`mundo-${outro.id}`, outro === m));
    board.classList.toggle('sem-nuvens', !m.nuvens);

    for (const [nome, el] of Object.entries(camadasEl)) {
        const img = desenho[nome];
        el.hidden = !img;
        if (img) {
            el.style.backgroundImage = img.url;
            el.style.height = `${img.altura}px`;
        }
    }
    floor.style.backgroundImage = desenho.chao ? desenho.chao.url : '';
    floor.style.backgroundSize = desenho.chao ? `${desenho.chao.largura}px ${desenho.chao.altura}px` : '';
    decoracaoEl.className = `decoracao-ceu ${desenho.decoracao || ''}`;
    criarParticulas(desenho.particulas);
    document.documentElement.style.setProperty('--filtro-canos', m.canos || 'none');
    mundoAtualEl.textContent = m.nome;

    noiteAtual = -1; // força redesenhar o céu com as cores do mundo novo
    aplicarCeu(m.ciclo ? quantoNoite(tempo) : 0);
    moverCenario(0);
}

// anda as camadas de fundo (cada uma numa velocidade: parallax)
function moverCenario(passo) {
    offsetCenario += passo;
    const desenho = DESENHOS[mundo().id] || {};
    for (const [nome, el] of Object.entries(camadasEl)) {
        const img = desenho[nome];
        if (img) el.style.backgroundPositionX = `${-((offsetCenario * PARALLAX[nome]) % img.largura)}px`;
    }
}

// chamada a cada quadro: muda de mundo quando os pontos passam da faixa
function atualizarMundo(pts) {
    if (trocandoMundo) return;
    const alvo = mundoDosPontos(pts);
    if (alvo > mundoAtual) trocarMundo(alvo);
}

function trocarMundo(indice) {
    trocandoMundo = true;
    transicaoEl.classList.add('ativa');
    pararTrilha(true);
    setTimeout(() => {
        aplicarMundo(indice);
        const m = mundo();
        mostrarAviso(m.chefe ? m.nome : `MUNDO ${indice + 1}: ${m.nome}`);
        avisoEl.classList.toggle('aviso-bowser', !!m.chefe);
        if (estado === 'jogando') tocarTrilha();
        transicaoEl.classList.remove('ativa');
        trocandoMundo = false;
    }, 280);
}

// ---------- trilha sonora do mundo ----------
function tocarTrilha() {
    if (!somLigado) return;
    const m = mundo();
    if (m.musica === 'tema') {
        pararChiptune();
        tocar(somTema);
    } else {
        somTema.pause();
        tocarChiptune(m.musica);
    }
}

function pararTrilha(suave = false) {
    somTema.pause();
    pararChiptune(suave);
}

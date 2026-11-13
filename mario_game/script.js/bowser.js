// ================== BOWSER NO CANTO ==================
// De vez em quando o Bowser aparece no canto de cima, grita "TOASTY!" e cospe
// uma bola de fogo que cai e vem quicando pelo chão (pule por cima!).
//
// Usa a imagem img/bowser.gif. Enquanto ela não existir, nada disso acontece.
// A voz é sintetizada pelo navegador (não é o áudio original do meme).

const BOWSER_IMAGEM = './img/bowser.gif';
const BOWSER_ESPELHAR = false;          // true se o GIF olhar para a direita (ele precisa olhar para o Mario)
const BOWSER_INTERVALO = [25, 45];      // segundos entre uma aparição e outra
const BOWSER_INTERVALO_MUNDO = [12, 20]; // no Mundo do Bowser ele aparece mais
const BOWSER_PRIMEIRA = 10;             // não aparece antes disso (segundos de partida)
const FOGO_GRAVIDADE = 1500;
const FOGO_QUIQUE = 520;                // velocidade para cima a cada quique (sobe ~90px)
const FOGO_LARGURA = 30;
const FOGO_QUEDA = 0.55;                // segundos caindo até tocar o chão
const FOGO_REACAO = 0.3;                // tempo mínimo entre o 1º quique e chegar no Mario
const FOGO_REACAO_MINIMA = 0.22;        // abaixo disso não cospe (tela estreita + muito rápido)

// linha do tempo de uma aparição (segundos)
const CAMEO = { entra: 0, fala: 0.3, cospe: 0.9, sai: 1.8, fim: 2.2 };

// bola de fogo em pixel art (desenhada aqui)
const IMG_FOGO = (() => {
    const p = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" shape-rendering="crispEdges">'
        + p(5, 1, 6, 14, '#e8401a') + p(3, 3, 10, 10, '#e8401a') + p(1, 5, 14, 6, '#e8401a')
        + p(5, 3, 6, 10, '#ff8c1a') + p(3, 5, 10, 6, '#ff8c1a')
        + p(6, 5, 4, 6, '#ffd23f') + p(5, 6, 6, 4, '#ffd23f') + p(7, 6, 2, 2, '#fff6c0')
        + '</svg>';
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
})();

SPRITES.bolaFogo = { src: IMG_FOGO, largura: FOGO_LARGURA, proporcao: 1, vazio: { lados: 0.12, topo: 0.12, baixo: 0.06 } };
new Image().src = IMG_FOGO; // carrega antes, para a bola já aparecer na primeira vez
ATUALIZAR.bolaFogo = atualizarBolaFogo;

const bowserEl = document.getElementById('bowser-cameo');
const bowserImgEl = bowserEl.querySelector('img');
const bowser = {
    disponivel: false,   // a imagem carregou?
    proxima: 0,          // segundos até a próxima aparição
    cameo: null,         // { t, cuspiu } durante uma aparição
};

function carregarImagemBowser(src = BOWSER_IMAGEM) {
    const img = new Image();
    img.onload = () => {
        bowser.disponivel = true;
        bowserImgEl.src = src;
        bowserImgEl.classList.toggle('espelhado', BOWSER_ESPELHAR);
    };
    img.src = src;
}

const sortearIntervaloBowser = () =>
    sortearEntre(mundo().id === 'bowser' ? BOWSER_INTERVALO_MUNDO : BOWSER_INTERVALO);

// nova partida: esconde e volta a contar
function resetarBowser() {
    bowser.cameo = null;
    bowser.proxima = BOWSER_PRIMEIRA + sortearIntervaloBowser() * 0.5;
    bowserEl.className = 'bowser-cameo';
    bowserEl.hidden = true;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function falarToasty() {
    if (!somLigado || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance('Toasty!');
    fala.lang = 'en-US';
    fala.pitch = 1.9;   // agudo
    fala.rate = 1.15;   // rapidinho
    fala.volume = 0.9;
    speechSynthesis.speak(fala);
}

// chamada a cada quadro pelo loop do jogo
function atualizarBowser(dt) {
    if (!bowser.disponivel) return;

    if (!bowser.cameo) {
        bowser.proxima -= dt;
        if (bowser.proxima <= 0) {
            bowser.cameo = { t: 0, falou: false, cuspiu: false };
            bowserEl.hidden = false;
            bowserEl.className = 'bowser-cameo entrando';
        }
        return;
    }

    const c = bowser.cameo;
    c.t += dt;
    if (!c.falou && c.t >= CAMEO.fala) {
        c.falou = true;
        bowserEl.classList.add('falando');
        falarToasty();
    }
    if (!c.cuspiu && c.t >= CAMEO.cospe) {
        c.cuspiu = true;
        cuspirFogo();
    }
    if (c.t >= CAMEO.sai) bowserEl.className = 'bowser-cameo saindo';
    if (c.t >= CAMEO.fim) {
        bowser.cameo = null;
        bowserEl.hidden = true;
        bowser.proxima = sortearIntervaloBowser();
    }
}

// a bola sai da boca do Bowser e é jogada para tocar o chão antes de chegar no Mario
function cuspirFogo() {
    // posição final do Bowser no canto (não depende de a animação de entrada já ter terminado)
    const caixaBoard = board.getBoundingClientRect();
    const caixaImg = bowserImgEl.getBoundingClientRect();
    const margemDireita = parseFloat(getComputedStyle(bowserEl).right) || 0;
    const x0 = caixaBoard.width - margemDireita - caixaImg.width;            // lado esquerdo do Bowser
    const y0 = caixaBoard.bottom - CHAO - (caixaImg.top + caixaImg.height * 0.45); // altura da boca

    // onde tocar o chão: longe o bastante do Mario para dar tempo de pular depois do quique
    const vChao = velocidade * 1.15;          // no chão ela rola junto com o cenário (e um pouco mais rápida)
    const fimMario = MARIO_X + 112;
    let xChao = fimMario + vChao * FOGO_REACAO;
    if (xChao > x0 - 20) {
        xChao = x0 - 20;                      // cai quase reto
        if ((xChao - fimMario) / vChao < FOGO_REACAO_MINIMA) return; // sem espaço: só o grito
    }

    const fogo = criarInimigo('bolaFogo', x0, Math.max(0, y0));
    fogo.el.classList.add('bola-fogo');
    // no ar ela anda pela TELA (sai da boca do Bowser, que fica parado no canto)
    fogo.vxTela = (x0 - xChao) / FOGO_QUEDA;
    fogo.velExtra = fogo.vxTela - velocidade; // o loop soma a velocidade do cenário; aqui desconta
    fogo.noChao = false;
    // altura(t) = y0 + vy·t − g·t²/2 = 0 no tempo FOGO_QUEDA  →  vy = g·t/2 − y0/t
    fogo.vy = FOGO_GRAVIDADE * FOGO_QUEDA / 2 - fogo.y / FOGO_QUEDA;

    fogo.el.style.bottom = `${CHAO + fogo.y}px`;
    obstaculos.push(fogo);
    posicionar(fogo);
    bip(330, 165);

    // dá um respiro antes do próximo obstáculo normal
    proximoObstaculo = Math.max(proximoObstaculo, velocidade * 0.9);
}

function atualizarBolaFogo(o, dt) {
    o.vy -= FOGO_GRAVIDADE * dt;
    o.y += o.vy * dt;
    if (o.y <= 0) {
        o.y = 0;
        o.vy = FOGO_QUIQUE; // quica
        if (!o.noChao) {
            o.noChao = true;
            o.velExtra = velocidade * 0.15; // a partir daqui rola junto com o cenário
        }
    }
    if (!o.noChao) o.velExtra = o.vxTela - velocidade; // a velocidade do cenário muda com o tempo
    o.el.style.bottom = `${CHAO + o.y}px`;
}

// pausa: a voz para junto
function pausarBowser() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
}

carregarImagemBowser();

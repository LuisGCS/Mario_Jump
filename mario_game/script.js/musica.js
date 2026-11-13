// ================== MÚSICA 8-BIT (chiptune) ==================
// Toca as trilhas originais de cada mundo usando Web Audio (sem arquivos de áudio).
//
// Partitura: cada palavra é uma semicolcheia (1/4 de tempo).
//   "C5"  toca a nota (dó da 5ª oitava) · "Eb4" / "F#3" com bemol/sustenido
//   "-"   segura a nota anterior        · "."  silêncio
// Bateria: "k" bumbo · "s" caixa · "h" chimbal · "." nada
//
// Todas as melodias são composições originais feitas para este jogo.

const MUSICAS = {
    // Subterrâneo: lá menor, notas curtas e espaçadas, clima de caverna
    subterraneo: {
        bpm: 112,
        canais: [
            { onda: 'square', volume: 0.5, curta: true, notas: `
                A4 . . C5 . . E5 . D5 . . C5 . B4 . .
                A4 . . . E4 . . . G4 . A4 . . . . .
                A4 . . C5 . . E5 . F5 . . E5 . D5 . .
                E5 . . . B4 . . . C5 . B4 . A4 . . .` },
            { onda: 'triangle', volume: 0.9, notas: `
                A2 . . . A2 . . . A2 . . . G2 . . .
                F2 . . . F2 . . . E2 . . . E2 . . .
                A2 . . . A2 . . . D3 . . . D3 . . .
                E2 . . . E2 . . . A2 . . . . . . .` },
        ],
        bateria: 'h . . . s . . . h . . . s . h .',
    },

    // Deserto: escala "árabe" (frígio dominante em mi), ritmo de tambor
    deserto: {
        bpm: 126,
        canais: [
            { onda: 'square', volume: 0.45, notas: `
                E5 . F5 . G#5 - - . F5 . E5 - - . . .
                D5 . E5 . F5 . E5 . D5 . C5 . B4 - - .
                E5 . F5 . G#5 . A5 . B5 - - . A5 . G#5 .
                F5 . E5 . D5 . F5 . E5 - - - - - . .` },
            { onda: 'triangle', volume: 0.9, notas: `
                E2 . . E3 . . E2 . E2 . . E3 . . E2 .
                D2 . . D3 . . D2 . C2 . . C3 . . C2 .
                E2 . . E3 . . E2 . A2 . . A3 . . A2 .
                F2 . . F3 . . E2 . E2 . . E3 . . . .` },
        ],
        bateria: 'k . . h k . s . k . . h k . s .',
    },

    // Neve: fá maior, sininhos lentos e um arpejo suave
    neve: {
        bpm: 96,
        canais: [
            { onda: 'triangle', volume: 0.8, notas: `
                A5 - - . C6 - - . B5 . A5 . G5 - - .
                F5 - - . G5 . A5 . E5 - - - - - . .
                A5 - - . C6 - - . D6 . C6 . B5 - - .
                A5 . G5 . F5 . E5 . F5 - - - - - . .` },
            { onda: 'square', volume: 0.18, curta: true, notas: `
                F4 A4 C5 A4 F4 A4 C5 A4 C4 E4 G4 E4 C4 E4 G4 E4
                D4 F4 A4 F4 D4 F4 A4 F4 C4 E4 G4 E4 C4 E4 G4 E4
                F4 A4 C5 A4 F4 A4 C5 A4 G4 B4 D5 B4 G4 B4 D5 B4
                C4 E4 G4 E4 C4 E4 G4 E4 F4 A4 C5 A4 F4 . . .` },
            { onda: 'triangle', volume: 0.7, notas: `
                F3 . . . C4 . . . F3 . . . C4 . . .
                D3 . . . A3 . . . C3 . . . G3 . . .
                F3 . . . C4 . . . G3 . . . D4 . . .
                C3 . . . G3 . . . F3 . . . . . . .` },
        ],
        bateria: 'h . . . . . . . h . . . . . . .',
    },

    // Castelo: ré menor, duas vozes como um órgão e baixo martelando
    castelo: {
        bpm: 132,
        canais: [
            { onda: 'square', volume: 0.4, notas: `
                D5 - - . A4 - - . D5 . E5 . F5 - - .
                E5 - - . C5 - - . A4 - - - - - . .
                D5 - - . A4 - - . F5 . G5 . A5 - - .
                G5 . F5 . E5 . C#5 . D5 - - - - - . .` },
            { onda: 'square', volume: 0.25, notas: `
                F4 - - . F4 - - . A4 . A4 . A4 - - .
                C5 - - . A4 - - . E4 - - - - - . .
                F4 - - . F4 - - . D5 . D5 . D5 - - .
                Bb4 . A4 . G4 . E4 . F4 - - - - - . .` },
            { onda: 'triangle', volume: 0.9, curta: true, notas: `
                D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .
                A1 . A2 . A1 . A2 . A1 . A2 . A1 . A2 .
                Bb1 . Bb2 . Bb1 . Bb2 . G1 . G2 . G1 . G2 .
                A1 . A2 . A1 . A2 . D2 . D3 . D2 . . .` },
        ],
        bateria: 'k . h . s . h . k . h . s . h .',
    },

    // Mundo do Bowser: dó menor com trítono, baixo pesado e rápido, clima de chefe final
    bowser: {
        bpm: 152,
        canais: [
            { onda: 'square', volume: 0.4, notas: `
                C5 - - - . . Eb5 - G5 - - - F#5 - . .
                F5 - Eb5 - D5 - Eb5 - C5 - - - - - . .
                Ab5 - - - G5 - - - F5 - Eb5 - D5 - . .
                G5 - - - B4 - - - C5 - D5 - Eb5 - B4 -` },
            { onda: 'sawtooth', volume: 0.35, curta: true, notas: `
                C2 C2 . C2 Eb2 . C2 . F#2 . F2 . Eb2 . . .
                C2 C2 . C2 Eb2 . C2 . F#2 . F2 . Eb2 . . .
                Ab1 Ab1 . Ab1 C2 . Ab1 . D2 . Db2 . C2 . . .
                G1 G1 . G1 Bb1 . G1 . B1 . . . G1 . . .` },
        ],
        bateria: 'k . h k s . h . k k h . s . s s',
    },

    // Pista Arco-Íris: sol maior, rápida e animada, arpejos de corrida no espaço
    arcoiris: {
        bpm: 144,
        canais: [
            { onda: 'square', volume: 0.38, notas: `
                G5 . B5 . D6 . B5 . A5 . F#5 . D5 - - .
                E5 . G5 . B5 . A5 . G5 - - - - - . .
                C6 . B5 . A5 . G5 . A5 . B5 . D6 - - .
                C6 . A5 . F#5 . A5 . G5 - - - - - . .` },
            { onda: 'square', volume: 0.14, curta: true, notas: `
                G4 B4 D5 B4 G4 B4 D5 B4 D5 F#5 A5 F#5 D5 F#5 A5 F#5
                E4 G4 B4 G4 E4 G4 B4 G4 E4 G4 B4 G4 E4 G4 B4 G4
                C5 E5 G5 E5 C5 E5 G5 E5 D5 F#5 A5 F#5 D5 F#5 A5 F#5
                D5 F#5 A5 F#5 D5 F#5 A5 F#5 G4 B4 D5 B4 G4 B4 D5 B4` },
            { onda: 'triangle', volume: 0.9, curta: true, notas: `
                G2 . G3 . G2 . G3 . D2 . D3 . D2 . D3 .
                E2 . E3 . E2 . E3 . E2 . E3 . B1 . B2 .
                C2 . C3 . C2 . C3 . D2 . D3 . D2 . D3 .
                D2 . D3 . D2 . D3 . G2 . G3 . G2 . . .` },
        ],
        bateria: 'k . h . s . h h k . h . s . h .',
    },
};

const VOLUME_MUSICA = 0.14;

// ---------- leitura da partitura ----------
const SEMITOM = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function frequenciaDaNota(nome) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(nome);
    if (!m) return null;
    const midi = 12 * (Number(m[3]) + 1) + SEMITOM[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return 440 * 2 ** ((midi - 69) / 12);
}

// transforma o texto em uma lista de { passo, duracao (em passos), freq }
function lerPartitura(texto) {
    const passos = texto.trim().split(/\s+/);
    const notas = [];
    passos.forEach((p, i) => {
        if (p === '-' && notas.length && notas[notas.length - 1].fim === i) {
            notas[notas.length - 1].fim = i + 1; // segura a nota
        } else if (p !== '.' && p !== '-') {
            notas.push({ passo: i, fim: i + 1, freq: frequenciaDaNota(p) });
        }
    });
    return { total: passos.length, notas: notas.map(n => ({ ...n, duracao: n.fim - n.passo })) };
}

// as partituras são lidas uma vez só
const PARTITURAS = Object.fromEntries(Object.entries(MUSICAS).map(([id, m]) => {
    const canais = m.canais.map(c => ({ ...c, ...lerPartitura(c.notas) }));
    const bateria = m.bateria.trim().split(/\s+/);
    const total = Math.max(...canais.map(c => c.total));
    return [id, { bpm: m.bpm, canais, bateria, total }];
}));

// ---------- tocador ----------
const tocador = {
    musica: null,      // id da música atual
    passo: 0,          // próximo passo a agendar
    tempoPasso: 0,     // quando (no relógio do áudio) toca o próximo passo
    timer: null,
    saida: null,       // volume geral da música
    ruido: null,       // ruído branco para a bateria
};

function contextoAudio() {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function prepararSaida() {
    const ctx = contextoAudio();
    if (!tocador.saida) {
        tocador.saida = ctx.createGain();
        tocador.saida.connect(ctx.destination);
        // 1 segundo de ruído branco, reaproveitado por todas as batidas
        tocador.ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const dados = tocador.ruido.getChannelData(0);
        for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    }
    return ctx;
}

function tocarNota(ctx, canal, freq, inicio, duracao) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = canal.onda;
    osc.frequency.setValueAtTime(freq, inicio);
    const pico = canal.volume;
    const soltar = canal.curta ? Math.min(duracao, 0.09) : duracao * 0.92;
    env.gain.setValueAtTime(0, inicio);
    env.gain.linearRampToValueAtTime(pico, inicio + 0.005);
    env.gain.setValueAtTime(pico * 0.7, inicio + 0.03);
    env.gain.linearRampToValueAtTime(0, inicio + soltar);
    osc.connect(env).connect(tocador.saida);
    osc.start(inicio);
    osc.stop(inicio + soltar + 0.02);
}

function tocarBatida(ctx, tipo, inicio) {
    if (tipo === 'k') {
        // bumbo: um seno que cai de grave rapidinho
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.frequency.setValueAtTime(150, inicio);
        osc.frequency.exponentialRampToValueAtTime(40, inicio + 0.12);
        env.gain.setValueAtTime(1, inicio);
        env.gain.exponentialRampToValueAtTime(0.001, inicio + 0.15);
        osc.connect(env).connect(tocador.saida);
        osc.start(inicio);
        osc.stop(inicio + 0.16);
        return;
    }
    // caixa e chimbal: ruído filtrado
    const fonte = ctx.createBufferSource();
    fonte.buffer = tocador.ruido;
    const filtro = ctx.createBiquadFilter();
    const env = ctx.createGain();
    const caixa = tipo === 's';
    filtro.type = caixa ? 'bandpass' : 'highpass';
    filtro.frequency.value = caixa ? 1800 : 7000;
    const dur = caixa ? 0.12 : 0.04;
    env.gain.setValueAtTime(caixa ? 0.6 : 0.25, inicio);
    env.gain.exponentialRampToValueAtTime(0.001, inicio + dur);
    fonte.connect(filtro).connect(env).connect(tocador.saida);
    fonte.start(inicio, Math.random() * 0.5);
    fonte.stop(inicio + dur + 0.01);
}

// agenda as notas que tocam nos próximos instantes (roda a cada 25ms)
function agendar() {
    const ctx = audioCtx;
    const p = PARTITURAS[tocador.musica];
    if (!ctx || !p) return;
    const duracaoPasso = 60 / p.bpm / 4;
    while (tocador.tempoPasso < ctx.currentTime + 0.12) {
        const passo = tocador.passo % p.total;
        for (const canal of p.canais) {
            for (const n of canal.notas) {
                if (n.passo === passo % canal.total && n.freq) {
                    tocarNota(ctx, canal, n.freq, tocador.tempoPasso, n.duracao * duracaoPasso);
                }
            }
        }
        const batida = p.bateria[passo % p.bateria.length];
        if (batida && batida !== '.') tocarBatida(ctx, batida, tocador.tempoPasso);
        tocador.passo++;
        tocador.tempoPasso += duracaoPasso;
    }
}

// começa (ou continua, se for a mesma) a música de um mundo
function tocarChiptune(id) {
    if (!PARTITURAS[id]) return;
    const ctx = prepararSaida();
    if (tocador.musica !== id) tocador.passo = 0;
    tocador.musica = id;
    tocador.tempoPasso = ctx.currentTime + 0.05;
    tocador.saida.gain.cancelScheduledValues(ctx.currentTime);
    tocador.saida.gain.setValueAtTime(VOLUME_MUSICA, ctx.currentTime);
    clearInterval(tocador.timer);
    tocador.timer = setInterval(agendar, 25);
    agendar();
}

// para a música; com "suave", abaixa o volume antes (troca de mundo)
function pararChiptune(suave = false) {
    clearInterval(tocador.timer);
    tocador.timer = null;
    if (!tocador.saida || !audioCtx) return;
    const agora = audioCtx.currentTime;
    tocador.saida.gain.cancelScheduledValues(agora);
    tocador.saida.gain.setValueAtTime(tocador.saida.gain.value, agora);
    tocador.saida.gain.linearRampToValueAtTime(0, agora + (suave ? 0.4 : 0.03));
}

// volta para o começo da música (nova partida)
function reiniciarChiptune() {
    tocador.musica = null;
    tocador.passo = 0;
}

// Placar online do Mario Jump (função da Vercel)
//
//   GET  /api/placar?dificuldade=normal&limite=10  → { top: [{ nome, pontos }] }
//   POST /api/placar  { nome, pontos, dificuldade, tempo }  → { ok, posicao, top }
//
// O banco é um Postgres (Neon) ligado pelo painel da Vercel em Storage.
// A Vercel cria a variável DATABASE_URL sozinha; a tabela é criada no primeiro uso.

import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';

// Mesmos números do DIFICULDADES em script.js/cod.js — se mudar lá, mude aqui também.
// Servem para recusar pontuações impossíveis para o tempo jogado.
const DIFICULDADES = {
    facil:   { velInicial: 460,  aceleracao: 7,  velMax: 880 },
    normal:  { velInicial: 600,  aceleracao: 12, velMax: 1150 },
    dificil: { velInicial: 730,  aceleracao: 16, velMax: 1350 },
    insano:  { velInicial: 1320, aceleracao: 33, velMax: 2400 },
};
const PONTOS_POR_PIXEL = 0.02;
const PONTOS_PISAR = 50;
const MAX_PISADAS_POR_SEGUNDO = 1;   // folga generosa: tartarugas são só parte dos obstáculos
const TEMPO_MAXIMO = 60 * 60;        // 1 hora de partida
const ENVIOS_POR_MINUTO = 5;         // por jogador (IP)
const TAMANHO_TOP = 10;
const TAMANHO_NOME = 16;             // se mudar, mude também o VARCHAR(16) abaixo e o cod.js

const urlBanco = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = urlBanco ? neon(urlBanco) : null;

let tabelaPronta = null;
function criarTabela() {
    tabelaPronta ??= (async () => {
        await sql`
            CREATE TABLE IF NOT EXISTS placar (
                id          SERIAL PRIMARY KEY,
                nome        VARCHAR(16) NOT NULL,
                pontos      INTEGER NOT NULL CHECK (pontos BETWEEN 1 AND 99999),
                dificuldade VARCHAR(10) NOT NULL,
                tempo       REAL NOT NULL,
                ip_hash     CHAR(16),
                criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
            )`;
        await sql`CREATE INDEX IF NOT EXISTS placar_ranking ON placar (dificuldade, pontos DESC, criado_em)`;
        // tabelas criadas antes aceitavam só 10 letras: amplia (não apaga nada; se já for 16, não muda)
        await sql`ALTER TABLE placar ALTER COLUMN nome TYPE VARCHAR(16)`;
    })().catch(erro => { tabelaPronta = null; throw erro; });
    return tabelaPronta;
}

// Maior pontuação possível em "tempo" segundos: a velocidade sobe até o máximo,
// então a distância é a área embaixo dessa curva; mais o bônus de pisar.
function pontosMaximos(dif, tempo) {
    const { velInicial: v0, aceleracao: a, velMax } = DIFICULDADES[dif];
    const tempoAteMax = (velMax - v0) / a;
    const distancia = tempo <= tempoAteMax
        ? v0 * tempo + a * tempo * tempo / 2
        : v0 * tempoAteMax + a * tempoAteMax * tempoAteMax / 2 + velMax * (tempo - tempoAteMax);
    const bonus = PONTOS_PISAR * Math.ceil(tempo * MAX_PISADAS_POR_SEGUNDO);
    return Math.floor(distancia * PONTOS_POR_PIXEL) + bonus + 5;
}

// Nome estilo fliperama: só letras sem acento, números e espaço, até TAMANHO_NOME
function limparNome(nome) {
    return String(nome ?? '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // tira acentos
        .toUpperCase()
        .replace(/[^A-Z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, TAMANHO_NOME);
}

// Guarda só um resumo do IP (não o IP), para limitar envios repetidos
function resumoIp(req) {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
    return createHash('sha256').update(`mario-jump:${ip}`).digest('hex').slice(0, 16);
}

async function buscarTop(dif, limite) {
    return sql`
        SELECT nome, pontos FROM placar
        WHERE dificuldade = ${dif}
        ORDER BY pontos DESC, criado_em ASC
        LIMIT ${limite}`;
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (!sql) {
        return res.status(503).json({ erro: 'Banco de dados não configurado (DATABASE_URL).' });
    }

    try {
        await criarTabela();

        if (req.method === 'GET') {
            const dif = String(req.query.dificuldade || 'normal');
            if (!DIFICULDADES[dif]) return res.status(400).json({ erro: 'Dificuldade inválida.' });
            const limite = Math.min(TAMANHO_TOP, Math.max(1, Number(req.query.limite) || TAMANHO_TOP));
            return res.status(200).json({ top: await buscarTop(dif, limite) });
        }

        if (req.method === 'POST') {
            const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
            const nome = limparNome(corpo.nome);
            const pontos = Math.floor(Number(corpo.pontos));
            const tempo = Number(corpo.tempo);
            const dif = String(corpo.dificuldade);

            if (!nome) return res.status(400).json({ erro: 'Nome inválido.' });
            if (!DIFICULDADES[dif]) return res.status(400).json({ erro: 'Dificuldade inválida.' });
            if (!Number.isFinite(tempo) || tempo < 1 || tempo > TEMPO_MAXIMO) {
                return res.status(400).json({ erro: 'Tempo inválido.' });
            }
            if (!Number.isInteger(pontos) || pontos < 1 || pontos > 99999 || pontos > pontosMaximos(dif, tempo)) {
                return res.status(400).json({ erro: 'Pontuação inválida.' });
            }

            const ipHash = resumoIp(req);
            const [{ envios }] = await sql`
                SELECT count(*)::int AS envios FROM placar
                WHERE ip_hash = ${ipHash} AND criado_em > now() - interval '1 minute'`;
            if (envios >= ENVIOS_POR_MINUTO) {
                return res.status(429).json({ erro: 'Muitos envios. Espere um pouco.' });
            }

            await sql`
                INSERT INTO placar (nome, pontos, dificuldade, tempo, ip_hash)
                VALUES (${nome}, ${pontos}, ${dif}, ${tempo}, ${ipHash})`;

            const [{ acima }] = await sql`
                SELECT count(*)::int AS acima FROM placar
                WHERE dificuldade = ${dif} AND pontos > ${pontos}`;

            return res.status(201).json({ ok: true, posicao: acima + 1, top: await buscarTop(dif, TAMANHO_TOP) });
        }

        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ erro: 'Método não permitido.' });
    } catch (erro) {
        console.error('Erro no placar:', erro);
        return res.status(500).json({ erro: 'Erro no servidor do placar.' });
    }
}

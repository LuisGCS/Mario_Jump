# 🍄 Mario Jump

Jogo de corrida infinita no navegador, feito por fã, no estilo do dino do Chrome com o Mario. Pule, agache e voe para desviar de canos e inimigos, atravesse sete mundos e coloque seu nome no placar online.

### ▶️ [Jogar agora: mariojump-mariogame.vercel.app](https://mariojump-mariogame.vercel.app)

Funciona no computador e no celular, sem instalar nada.

## Controles

| Tecla | Ação |
|---|---|
| Espaço / ↑ / W (ou toque na tela) | Pular · de novo no ar = **pulo duplo** · segure para pular mais alto |
| ↓ / S (ou botão ↓ no celular) | Agachar · no ar, desce mais rápido |
| 1 a 4 | Escolher a dificuldade (no menu) |
| P / Esc | Pausar |
| M | Ligar/desligar o som |

## O que tem no jogo

### Dificuldades
**Fácil, Normal, Difícil e Insano** mudam a velocidade, a aceleração, o espaço entre os obstáculos e quais inimigos aparecem. Cada dificuldade tem seu próprio recorde e seu próprio placar online. O jogo acelera com o tempo e sobe de nível a cada 300 pontos.

### Mundos
O cenário e a música mudam conforme a pontuação:

| Mundo | Normal | Insano | Clima |
|---|---|---|---|
| 1. Campo | 0 | 0 | céu azul, com dia e noite |
| 2. Subterrâneo | 1.000 | 2.000 | caverna de tijolos azuis |
| 3. Deserto | 2.500 | 5.000 | pirâmides, dunas e cactos |
| 4. Neve | 4.500 | 9.000 | montanhas, pinheiros e neve caindo |
| 5. Castelo | 7.000 | 14.000 | muralha com janelas acesas e tochas |
| 6. Mundo do Bowser | 10.000 | 20.000 | vulcão, torres e brasas |
| 7. Pista Arco-Íris | 15.000 | 30.000 | pista colorida no espaço |

No Fácil os mundos chegam um pouco antes (×0,8) e no Difícil um pouco depois (×1,3).

### Obstáculos e inimigos

| Obstáculo | Como passar |
|---|---|
| Canos (simples, duplos, altos, triplos) | Pular |
| Cano com **planta piranha** | Alto demais para um pulo só: **pulo duplo** |
| **Tartaruga** | Pular ou pisar nela (+50) |
| **Koopa voador** | Sobe e desce: passe por baixo, agache ou pise nele (+50) |
| **Míssil** (avisado por um "!") | Baixo: pule · alto: agache |
| **Chargin' Chuck** | Corre na sua direção: pule |
| **Chuck que pula** | Salta quando você chega perto: agache para ele passar por cima |
| **Bowser no canto** | De vez em quando aparece, grita "TOASTY!" e solta uma bola de fogo que vem quicando: pule |

### Pena e capa
De vez em quando aparece uma **pena**. Pegando, o próximo **pulo duplo vira voo de 5 segundos** com a capa: segure o pulo para subir, solte para planar e use ↓ para descer. No final o Mario pisca, avisando que a capa vai acabar.

### Placar online
No game over, se a pontuação entrar no **top 10** da dificuldade, o jogo pede um nome de até 16 letras. Cada nome guarda **só o melhor resultado** em cada dificuldade. O menu mostra o top 5.

O servidor recusa pontuações impossíveis para o tempo jogado e limita os envios por minuto, para dificultar trapaça.

## Tecnologias

- **HTML, CSS e JavaScript** puros, sem framework e sem etapa de build
- **Web Audio** para as músicas 8-bit dos mundos e os efeitos sonoros
- **Função serverless da Vercel** (`api/placar.js`) com banco **Postgres (Neon)** para o placar online
- Cenários dos mundos desenhados em pixel art no próprio código (SVG gerado em JavaScript)

## Estrutura

```
Mario_Jump/
└── mario_game/              # pasta publicada (Root Directory na Vercel)
    ├── index.html
    ├── style.css
    ├── package.json         # dependência da função do placar
    ├── api/
    │   └── placar.js        # placar online: GET (top 10) e POST (enviar pontuação)
    ├── script.js/
    │   ├── musica.js        # tocador de chiptune e as músicas de cada mundo
    │   ├── mundos.js        # mundos: cores, cenários, troca por pontuação
    │   ├── cod.js           # lógica principal do jogo
    │   └── bowser.js        # Bowser no canto e a bola de fogo
    ├── img/                 # sprites, GIFs e ícones
    └── soung/               # áudios do tema e do game over
```

## Como rodar no seu computador

1. Clone o repositório:
   ```bash
   git clone https://github.com/LuisGCS/Mario_Jump.git
   ```
2. Abra `mario_game/index.html` no navegador.

Assim o jogo funciona por completo, menos o placar online, que precisa do servidor. Sem ele, o quadro do ranking simplesmente não aparece e o recorde local continua valendo.

Para rodar **com** o placar, use a CLI da Vercel dentro de `mario_game`, com a variável `DATABASE_URL` apontando para um Postgres:
```bash
cd mario_game
npm install
npx vercel dev
```

## Publicação

O site é publicado na **Vercel** a cada merge na `main`:

- **Root Directory:** `mario_game` · **Framework Preset:** Other (sem build)
- **Banco:** Neon (Postgres) ligado pela aba **Storage** do projeto, que cria a variável `DATABASE_URL`. A tabela `placar` é criada sozinha no primeiro acesso.
- Cada pull request ganha um link de pré-visualização.

## Testando sem jogar até o fim

Com uma partida rodando, abra o console do navegador (F12 → Console):

```js
distancia = 10000 / PONTOS_POR_PIXEL   // pula para os pontos do Mundo do Bowser (Normal)
bowser.proxima = 0                     // faz o Bowser aparecer agora
temCapa = true; capaProntaEl.hidden = false   // ganha a capa
DIFICULDADES.normal.padroes = ['koopa-voador'] // só um tipo de obstáculo (antes do START)
```

## Onde ajustar

| O quê | Onde |
|---|---|
| Velocidade, obstáculos de cada dificuldade | `DIFICULDADES` e `PADROES` no `cod.js` |
| Tamanho e colisão dos inimigos | `SPRITES` no `cod.js` |
| Pontos, cores e cenário de cada mundo | `MUNDOS` e `DESENHOS` no `mundos.js` |
| Músicas | `MUSICAS` no `musica.js` (partitura em texto) |
| Frequência do Bowser e da bola de fogo | constantes no começo do `bowser.js` |
| Duração do dia e da noite | `CICLO_*` no `cod.js` |
| Regras do placar online | constantes no começo do `api/placar.js` |

## Créditos e aviso

Projeto de fã, **sem fins comerciais**, feito para estudo e diversão. Mario, Bowser e os demais personagens são marcas e criações da **Nintendo**; este projeto não tem ligação com a Nintendo.

As músicas dos mundos 2 a 7 são **composições originais** em 8-bit, e os cenários foram desenhados para o projeto. O "TOASTY!" do Bowser usa a voz sintetizada do próprio navegador.

## Autor

Feito por [Luis Guilherme](https://github.com/LuisGCS).

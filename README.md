# 🍄 Mario Jump

Jogo no navegador inspirado em Mario. Aperte qualquer tecla para o Mario pular e desviar do cano. Se bater, é game over.

<!-- Coloque aqui um print ou GIF do jogo: ![Mario Jump](img/print.gif) -->

## Tecnologias

- HTML5
- CSS3 (animações do cano, das nuvens e do pulo)
- JavaScript

## Controles

| Tecla | Ação |
|---|---|
| Espaço / ↑ / W (ou toque na tela) | Pular (segure para pular mais alto) |
| ↓ / S | Descer mais rápido |
| 1 a 4 | Escolher a dificuldade (no menu) |
| P / Esc | Pausar |
| M | Ligar/desligar o som |

## Como funciona

- Placar no estilo do dino do Chrome: pontos com 5 dígitos, recorde (`HI`) salvo no navegador e o placar pisca com um bip a cada 100 pontos.
- 4 dificuldades (Fácil, Normal, Difícil, Insano): mudam a velocidade inicial, a aceleração, o espaço entre os canos e os tipos de obstáculo (canos duplos, altos e gigantes). Cada dificuldade tem seu próprio recorde.
- Inimigos: **tartarugas** andam no chão (pule por cima ou pise nelas para ganhar +50) e **mísseis** voam mais rápido, com um "!" piscando antes de chegar. O míssil baixo precisa ser pulado; o alto passa por cima, então não pule. As imagens são `IMG/koopa.gif` e `IMG/bullet-bill-mario.gif`, configuradas em `SPRITES` no `COD.JS`.
- O jogo acelera com o tempo e a cada 300 pontos sobe de nível.
- A física do pulo (gravidade) e o movimento dos canos e do chão rodam em JavaScript com `requestAnimationFrame`.

## Estrutura

```
Mario_Jump/
└── MARIO_GAME/
    ├── IMG/            # imagens e GIF do Mario
    ├── SCRIPT.JS/
    │   └── COD.JS      # lógica do jogo
    ├── SOUNG/          # áudios do jogo
    ├── INDEX.HTML
    └── STYLE.CSS
```

## Como rodar

1. Clone o repositório:
   ```bash
   git clone https://github.com/LuisGCS/Mario_Jump.git
   ```
2. Abra `MARIO_GAME/INDEX.HTML` no navegador.

## Próximos passos

- [x] Adicionar pontuação
- [x] Tocar os áudios que já estão na pasta `SOUNG`
- [ ] Publicar online com GitHub Pages para jogar sem baixar

## Autor

Feito por [Luis Guilherme](https://github.com/LuisGCS).

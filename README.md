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
- Inimigos: **tartarugas** andam no chão (pule por cima ou pise nelas para ganhar +50) e **mísseis** voam mais rápido, com um "!" piscando antes de chegar. O míssil baixo precisa ser pulado; o alto passa por cima, então não pule. As imagens são `img/koopa.gif` e `img/bullet-bill-2.png`, configuradas em `SPRITES` no `cod.js`.
- **Chargin' Chuck** corre na sua direção mais rápido que o cenário (só dá para pular). O **Chuck que pula** salta quando o Mario chega perto: passe **agachado (↓)** por baixo dele ou pule antes que ele salte. Ao agachar, o Mario troca para a imagem `img/agachado.png`.
- O **Koopa voador** (`img/koopa-voador.webp`) sobe e desce no ar: passe por baixo quando ele estiver alto, agache ou pule quando estiver baixo. Dá para pisar nele (+50).
- De vez em quando aparece uma **pena** (`img/pena.png`). Pegando, o próximo **pulo duplo vira voo de 5s** com a capa (`img/mario-capa.gif`): segure o pulo para subir, solte para planar e ↓ para descer. No fim o Mario pisca, avisando que a capa vai acabar.
- **Dia e noite:** a cada 35s de dia o céu passa pelo pôr do sol e vira noite (com lua e estrelas) por 25s, depois amanhece. Os tempos e cores ficam nas constantes `CICLO_*` e `CORES_CEU` do `cod.js`.
- Em alguns canos sobe uma **planta piranha** (`img/planta-piranha.png`), deixando o obstáculo alto demais para um pulo só: use o **pulo duplo**.
- O jogo acelera com o tempo e a cada 300 pontos sobe de nível.
- A física do pulo (gravidade) e o movimento dos canos e do chão rodam em JavaScript com `requestAnimationFrame`.

## Estrutura

```
Mario_Jump/
└── mario_game/
    ├── img/            # imagens e GIFs
    ├── script.js/
    │   └── cod.js      # lógica do jogo
    ├── soung/          # áudios do jogo
    ├── index.html
    └── style.css
```

## Como rodar

1. Clone o repositório:
   ```bash
   git clone https://github.com/LuisGCS/Mario_Jump.git
   ```
2. Abra `mario_game/index.html` no navegador.

## Próximos passos

- [x] Adicionar pontuação
- [x] Tocar os áudios que já estão na pasta `soung`
- [ ] Publicar online com GitHub Pages para jogar sem baixar

## Autor

Feito por [Luis Guilherme](https://github.com/LuisGCS).

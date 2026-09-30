# 🍄 Mario Jump

Jogo no navegador inspirado em Mario. Aperte qualquer tecla para o Mario pular e desviar do cano. Se bater, é game over.

<!-- Coloque aqui um print ou GIF do jogo: ![Mario Jump](img/print.gif) -->

## Tecnologias

- HTML5
- CSS3 (animações do cano, das nuvens e do pulo)
- JavaScript

## Como funciona

- O pulo é feito adicionando uma classe CSS ao Mario por 500 ms.
- A cada 10 ms o JavaScript compara a posição do cano com a altura do Mario.
- Se o cano chega perto e o Mario está baixo, o jogo para, a animação congela e a imagem muda para "game over".

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

- [ ] Adicionar pontuação
- [ ] Tocar os áudios que já estão na pasta `SOUNG`
- [ ] Publicar online com GitHub Pages para jogar sem baixar

## Autor

Feito por [Luis Guilherme](https://github.com/LuisGCS).

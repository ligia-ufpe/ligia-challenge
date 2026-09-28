# Converge Challenge — Apresentação Institucional

Deck institucional do **Converge Challenge**, um hackathon de AI Agents
realizado no CIn-UFPE por Ligia, Canastra Ventures e TAIL (UFPB), reunindo
talentos de Recife e João Pessoa.

- **Quando:** data a definir
- **Onde:** CIn-UFPE, Recife, PE
- **Vagas:** 70 builders selecionados

## Como ver

O deck é um único arquivo HTML, sem dependências ou build. Abra `index.html`
no navegador, ou acesse a versão publicada no GitHub Pages.

### Navegação

| Ação | Tecla |
|---|---|
| Próximo slide | `→` &nbsp; `↓` &nbsp; `Espaço` |
| Slide anterior | `←` &nbsp; `↑` |
| Primeiro / último | `Home` / `End` |

Scroll do mouse e swipe no touch também funcionam. `F11` para tela cheia.

## PDF

Uma versão em PDF do deck (10 páginas, 16:9) está em
[`converge-challenge-institucional.pdf`](converge-challenge-institucional.pdf).

Para regerar depois de editar o `index.html`:

```sh
google-chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf=converge-challenge-institucional.pdf index.html
```

## Estrutura

Os 10 slides ficam em `index.html` como elementos `<section class="slide">`,
dimensionados num palco fixo de 1920×1080 que escala para qualquer janela.

Todas as logos estão embutidas como um sprite SVG (`<symbol>` + `<use>`) no
topo do `<body>`, então o deck funciona offline e sem imagens quebradas. Cada
símbolo tem um comentário HTML com a URL de origem da logo. O wordmark
"Converge Challenge" foi recortado do letterhead oficial (a paleta navy do
`:root` também vem de lá).

## Contato

[ligia@cin.ufpe.br](mailto:ligia@cin.ufpe.br)

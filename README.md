# Converge Challenge

Site oficial do **Converge Challenge powered by Tako**, o hackathon de AI Agents
do Nordeste: **https://convergechallenge.cin.ufpe.br**

- **Quando:** 7 e 8 de novembro de 2026, das 09h às 17h
- **Onde:** Porto Digital (Cais do Apolo, 222), Recife, PE
- **Quem:** 80 participantes, estudantes e profissionais de tecnologia,
  empreendedorismo e design, selecionados a partir das inscrições
  (17 a 30 de outubro, pelo Luma). O evento é gratuito.
- **Organização:** Ligia (CIn-UFPE) e TAIL (UFPB)
- **Parceiros:** Canastra Ventures, Porto Digital, CIn-UFPE e CESAR · **Apoio:** AWS e Featherless

Os dados do evento usados no site ficam em
[`site/src/config.js`](site/src/config.js); se algo mudar, comece por lá.

## Repositório

| Caminho | O que é |
|---|---|
| [`site/`](site/) | O site do evento (Vite + React). Como rodar e editar: [`site/README.md`](site/README.md). |
| [`.github/workflows/pages.yml`](.github/workflows/pages.yml) | Build e deploy no GitHub Pages a cada push na `main`. |

## Deploy

Cada push na `main` faz o build do site e publica no GitHub Pages, com o site
em `/site/`. O proxy do CIn serve esse caminho em
`convergechallenge.cin.ufpe.br`, então o site precisa continuar em `/site/`. A
raiz do Pages (`automlsummerschool.cin.ufpe.br/ligia-challenge/`) só redireciona
para o domínio oficial. O andamento de cada deploy aparece na aba **Actions**.

## Histórico

O deck institucional em HTML e seus PDFs ficavam na raiz do repositório e foram
removidos em outubro de 2026, quando o site passou a ser a referência. Eles
continuam no histórico do git:

```sh
git show 84a0d84:index.html > deck-antigo.html
```

## Contato

[ligia@cin.ufpe.br](mailto:ligia@cin.ufpe.br) ·
[@ligia.ufpe](https://www.instagram.com/ligia.ufpe/)

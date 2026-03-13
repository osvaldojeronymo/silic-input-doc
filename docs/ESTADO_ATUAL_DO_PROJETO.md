# Estado Atual do Projeto

Este documento consolida o estado oficial do repositório `silic-input-doc` apos a limpeza de arquivos legados.

## Stack Oficial

- Frontend: TypeScript + Vite
- UI adicional: React (modulo `form-renderer`)
- Build: `tsc && vite build`
- Base de deploy: `/silic-input-doc/`

## Entrypoints Oficiais

Conforme `vite.config.ts`, os entrypoints de build sao:

- `index.html` (aplicacao principal)
- `form-renderer.html` (modulo Form Renderer)

## Codigo Fonte Ativo

Principais diretorios/arquivos em uso:

- `src/init.ts` (bootstrap da app principal)
- `src/main.ts` (logica principal)
- `src/utils/sapDataLoader.ts` (carga de dados SAP/JSON)
- `src/styles/style.css` (estilos principais)
- `src/form-renderer/` (app React para renderer de formulario)

## Scripts Oficiais

Em `package.json`:

- `npm run dev` -> inicia servidor Vite
- `npm run build` -> typecheck + build de producao
- `npm run preview` -> preview do build
- `npm run typecheck` -> verificacao de tipos
- `npm run deploy` -> build + publicacao em `gh-pages`
- `npm run convert:excel` -> converte planilha SAP para JSON
- `npm run gerar:dados` -> gera dados mockados via Python

## Dados e Integracao SAP

- Entrada esperada: `public/rel-SAP.xlsx` (arquivo local, nao versionado)
- Saida usada pelo app: `public/dados-sap.json`
- Conversao: `scripts/converter-excel-para-json.py` e `scripts/excel-para-json.sh`

## Limpeza Realizada

Foram removidos artefatos nao utilizados no fluxo oficial:

- Arquivos de teste/debug/diagnostico na raiz (`debug_*`, `diagnostico_*`, `teste_*`)
- Legado de portal (`portal*`)
- Legado JS da raiz (`script.js`, `style.css`, `script_backup.js`)
- Utilitarios isolados sem uso (`InputDocumentos`, `abrir_sem_cache.sh`, `init-project.sh`)

## Observacoes

- Documentos em `docs/` que descrevem fases antigas foram mantidos como historico, com ajustes de referencia quando necessario.
- O fluxo oficial de evolucao deve considerar apenas a base TypeScript/Vite em `src/`.

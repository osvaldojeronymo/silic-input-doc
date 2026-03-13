# Backlog Tecnico - Portfolio e Perfis de Gestores

Documento tecnico para implementacao incremental no frontend TypeScript/Vite (`src/`).

## 1. Objetivo tecnico

Implementar uma nova camada de navegacao e visoes:

1. Home com `Portfolio - Indicadores Rapidos`, `Portfolio` e `Perfis de Gestao`.
2. Jornadas por perfil com foco em fases do Gestor Operacional.
3. Paginacao reduzida e remocao da lista geral do fluxo principal.

## 2. Macro-entregas

1. E1 - Fundacao de rotas e estado global de filtros.
2. E2 - Home reestruturada (Portfolio + Perfis).
3. E3 - Jornada do Gestor Operacional por abas.
4. E4 - Jornadas de Contratacao e Formal.
5. E5 - Detalhe de contrato unificado e hardening.

## 3. Estrutura tecnica sugerida

## 3.1 Rotas

1. `/` - HomePortfolioPage
2. `/perfil/operacional` - PerfilOperacionalPage
3. `/perfil/contratacao` - PerfilContratacaoPage
4. `/perfil/formal` - PerfilFormalPage
5. `/contrato/:id` - ContratoDetailPage

## 3.2 Componentes (sugestao de pasta)

`src/features/portfolio/`

1. `PortfolioIndicators.ts`
2. `PortfolioTable.ts`
3. `PortfolioFilters.ts`
4. `PerfisGestaoCards.ts`

`src/features/perfis/`

1. `PerfilHeader.ts`
2. `KpiStrip.ts`
3. `FaseTabs.ts`
4. `FaseFilters.ts`
5. `FaseTable.ts`
6. `FavoriteToggleCell.ts`

`src/features/contrato/`

1. `ContratoDetailDrawer.ts` ou reaproveito do modal atual

`src/shared/`

1. `Pagination.ts`
2. `EmptyState.ts`
3. `LoadingState.ts`
4. `ErrorState.ts`

## 3.3 Tipos TypeScript (novos)

Arquivo sugerido: `src/types/perfis.ts`

```ts
export type PerfilGestor = "operacional" | "contratacao" | "formal";

export type FaseOperacionalId =
  | "fase_1_aviso_vencimento"
  | "fase_2_decisao_prorrogacao"
  | "fase_3_laudo_avaliacao"
  | "fase_4_negociacao"
  | "fase_5_demandar_sucot"
  | "fase_6_1_contratacao"
  | "fase_6_2_renovacao"
  | "fase_7_aguardar_notificacao";

export interface ColumnDef {
  key: string;
  label: string;
  type?:
    | "text"
    | "date"
    | "currency"
    | "badge"
    | "boolean"
    | "action"
    | "favorite";
  sortable?: boolean;
  width?: string;
}

export interface FilterDef {
  key: string;
  label: string;
  type: "text" | "date" | "select";
  options?: Array<{ label: string; value: string }>;
  advanced?: boolean;
}

export interface FaseDefinition {
  id: FaseOperacionalId;
  titulo: string;
  owner: "Gestao Formal" | "Demandante" | "Contratacao";
  filters: FilterDef[];
  columns: ColumnDef[];
  allowFavorite?: boolean;
}
```

## 3.4 Mocks e adaptadores

Arquivos sugeridos:

1. `src/data/mock/perfis-kpis.json`
2. `src/data/mock/fases-operacional.json`
3. `src/features/perfis/faseConfig.ts`
4. `src/features/perfis/faseMapper.ts`

Regras:

1. O mapper converte o modelo atual (`PainelVencimentosContrato`) para linhas por fase.
2. Campos ausentes devem ser preenchidos com `null` + badge `Nao informado`.
3. `lupa` abre detalhe por `contratoId`.

## 4. Backlog detalhado (historias tecnicas)

## BT-01 - Introduzir camada de pagina/rotas

Prioridade: P0
Estimativa: 5 pts

Escopo:

1. Criar roteamento para 5 rotas alvo.
2. Manter compatibilidade com inicializacao atual (`SistemaSILIC`).
3. Definir shell com header e conteudo dinamico.

Criterios de aceite:

1. Todas as rotas respondem com tela valida.
2. Navegacao entre Home e perfis funcionando.

## BT-02 - Refatorar Home para novo desenho

Prioridade: P0
Estimativa: 8 pts

Escopo:

1. Manter `Portfolio - Indicadores Rapidos`.
2. Renomear secao para `Portfolio`.
3. Remover `Portfolio - Lista Geral` da home.
4. Implementar cards de `Perfis de Gestao`.

Criterios de aceite:

1. Home exibe 3 blocos: indicadores, portfolio, perfis.
2. Clique no card de perfil direciona para rota correta.

## BT-03 - Paginacao reduzida do Portfolio

Prioridade: P0
Estimativa: 3 pts

Escopo:

1. Default de pagina: 10 itens.
2. Opcoes de pagina: 10, 20, 50.
3. Atualizar resumo de resultados paginados.

Criterios de aceite:

1. Primeira carga sempre em 10 itens.
2. Controles de paginacao atualizam tabela e total.

## BT-04 - Implementar Jornada Operacional com abas

Prioridade: P0
Estimativa: 13 pts

Escopo:

1. Criar componente `FaseTabs` com 8 abas.
2. Carregar filtros dinamicos por fase.
3. Renderizar tabela dinamica por fase.
4. Acao `lupa` em todas as fases.
5. Favorito apenas nas fases 6.1 e 6.2.

Criterios de aceite:

1. Mudanca de aba atualiza filtros e colunas corretamente.
2. Sem recarregar pagina.
3. Favorito aparece apenas onde previsto.

## BT-05 - Persistencia de filtros por fase

Prioridade: P1
Estimativa: 5 pts

Escopo:

1. Persistir filtros em `sessionStorage` por `perfil+fase`.
2. Restaurar filtros ao voltar para a rota.
3. Botao `Limpar` por fase.

Criterios de aceite:

1. Usuario sai e retorna para a fase sem perder contexto.
2. Botao limpar restaura estado inicial da fase.

## BT-06 - Telas base de Contratacao e Formal

Prioridade: P1
Estimativa: 8 pts

Escopo:

1. Implementar pagina inicial dos perfis `contratacao` e `formal`.
2. Exibir filtros/tabelas com colunas principais.
3. Reaproveitar componentes compartilhados.

Criterios de aceite:

1. Rotas de perfil carregam sem erro.
2. Estrutura e semantica coerentes com blueprint.

## BT-07 - Contrato detalhe unificado

Prioridade: P1
Estimativa: 5 pts

Escopo:

1. Reaproveitar modal atual em formato de detalhe por rota ou drawer.
2. Garantir abertura por `lupa` em todas as tabelas.
3. Exibir dados com fallback para campos ausentes.

Criterios de aceite:

1. Todas as lupas abrem detalhe do item correto.
2. Nao ocorre quebra quando campo estiver ausente.

## BT-08 - Testes e qualidade

Prioridade: P1
Estimativa: 5 pts

Escopo:

1. Testes unitarios para mapper de fases.
2. Testes de render para `FaseTabs` e `FaseTable`.
3. Teste E2E basico de navegacao entre home/perfil/fase.

Criterios de aceite:

1. Suite minima executa em CI.
2. Navegacao critica coberta por teste automatizado.

## 5. Sequencia recomendada por sprint

## Sprint 1 (MVP navegavel)

1. BT-01
2. BT-02
3. BT-03

## Sprint 2 (Operacional completo)

1. BT-04
2. BT-05

## Sprint 3 (demais perfis e robustez)

1. BT-06
2. BT-07
3. BT-08

## 6. Definicao de pronto (DoD)

1. Build passa com `npm run build`.
2. Sem erros de TypeScript no `npm run typecheck`.
3. Todas as rotas previstas acessiveis.
4. Tabelas com paginacao funcionando.
5. Acoes de `lupa` e `favorito` obedecem regra de fase.
6. Documentacao tecnica atualizada nos artefatos de handoff.

## 7. Riscos e mitigacao

1. Risco: alto volume de colunas em 6.1/6.2 gerar poluicao visual.
   Mitigacao: filtros avancados recolhidos + colunas configuraveis.
2. Risco: dados incompletos entre SAP e SICLG.
   Mitigacao: mapper com fallback e badges de ausencia.
3. Risco: regressao na home atual por acoplamento em `main.ts`.
   Mitigacao: extrair componentes por feature e adicionar testes de smoke.

## 8. Observacao de compatibilidade

A base atual usa TS sem framework unico para a tela principal e React no modulo `form-renderer`.
Sugestao de decisao arquitetural antes do BT-01:

1. Opcao A: manter stack atual e modularizar em TS vanilla.
2. Opcao B: migrar gradualmente Home/Perfis para React, mantendo bootstrap atual.

Se nao houver decisao formal, executar Opcao A no MVP para menor risco e menor prazo.

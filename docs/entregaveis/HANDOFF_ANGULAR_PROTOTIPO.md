# Handoff Angular do Protótipo TS

Objetivo: maximizar o reaproveitamento conceitual do protótipo atual sem migrar framework, isolando contratos, delimitando regras e reduzindo ambiguidade para a implementação Angular em produção.

## 1. Resultado da refatoração de transferência

### 1.1 Contratos de domínio já consolidados

Arquivo-base: `src/types/index.ts`

Contratos que devem ser preservados como modelos canônicos da aplicação:

1. `Imovel`
2. `Locador`
3. `PainelVencimentosContrato`
4. `PainelAcoesRenovatoriasRow`
5. `PainelAvisoVencimentoRow`
6. `Pagamento`
7. `ParticipacaoLocadorImovel`
8. `TermoAditivo`

Esses contratos já representam o núcleo funcional do protótipo e são o melhor ponto de partida para DTOs, adapters e view models no Angular.

### 1.2 Contratos operacionais extraídos da tela

Arquivo-base: `src/transfer/operationalContracts.ts`

Contratos extraídos do controlador de tela para uso como referência de handoff:

1. `Fase1OperacionalRow` até `Fase7OperacionalRow`
2. `EstadoPainelAvisoPersistido`
3. `EtapaRtaRegistro`
4. `EtapaLaudoRegistro`
5. `EtapaNegociacaoRegistro`
6. `ContratoBuscaResultado`
7. `ContratoBuscaParams`
8. `ContratoBuscaResponse`
9. `ContratoBuscaUiState`

Decisão de handoff:

1. `src/types/index.ts` continua sendo a camada de contratos do domínio e read models.
2. `src/transfer/operationalContracts.ts` passa a ser a camada de contratos de workflow e estados de formulário, útil para traduzir o protótipo em componentes Angular sem depender de DOM imperativo.

### 1.3 Serviços puros já extraídos do controlador

Arquivos-base:

1. `src/transfer/prazoRules.ts`
2. `src/transfer/panelFilters.ts`
3. `src/transfer/panelBuilders.ts`

Na segunda rodada da refatoração de transferência, o protótipo passou a expor serviços TS puros para as regras que antes estavam concentradas em `src/main.ts`:

1. classificação de prazo, janela legal, criticidade e utilidades de data do aviso de vencimento
2. filtros puros dos painéis e das fases operacionais
3. montagem dos read models do painel de vencimentos
4. montagem do painel de aviso de vencimento
5. montagem e merge do painel A-III com dados DIJUR

Decisão de handoff:

1. esses três arquivos devem ser tratados como embriões de `domain services`, `facades` ou `use cases` na implementação Angular
2. `src/main.ts` passa a ter papel mais próximo de controlador/adaptador de tela, mantendo DOM, eventos, paginação, modalização e persistência transitória

### 1.4 Regras que continuam embutidas no controlador

Arquivo-base: `src/main.ts`

Após a segunda rodada, os pontos abaixo ainda permanecem no controlador e continuam candidatos a extração adicional no Angular:

1. montagem das fases B-a a B-h
2. persistência local das decisões do aviso de vencimento
3. persistência local das edições do gestor formal
4. persistência local das etapas `RTA`, `Laudo` e `Negociação`
5. busca de contratos, favoritos e recentes da jornada operacional
6. paginação, exportação e sincronização de badges/KPIs

## 2. Dependências externas e pontos de integração

### 2.1 Fontes de dados

1. SAP: `src/utils/sapDataLoader.ts`
   - ambiente local: `http://localhost:3333/api`
   - fallback estático: `/silic-input-doc/dados-sap.json`
2. DIJUR: `src/utils/dijurDataLoader.ts`
   - fonte estática atual: `/silic-input-doc/dados-dijur.json`
   - compatibilidade retroativa com `contrato_sap`

### 2.2 Persistência local no navegador

Chaves ativas mapeadas no protótipo:

1. `silic.formal.edicoes.v1`
2. `silic.aviso.operacional.v1`
3. `silic.operacional.etapa.rta.v1`
4. `silic.operacional.etapa.laudo.v1`
5. `silic.operacional.etapa.negociacao.v1`
6. `silic.operacional.contrato.recentes.v1`
7. `silic.operacional.contrato.favoritos.v1`
8. `silic-favoritos-fase61`
9. `silic-favoritos-fase62`

### 2.3 Dependências técnicas do navegador

1. `localStorage` para rascunhos, filtros e favoritos
2. `window.prompt` para justificativas e prazo formal de laudo
3. `Blob`, `URL.createObjectURL` e download por link para exportação
4. `document.getElementById`, `querySelector`, `querySelectorAll` para binding imperativo

### 2.4 Dependências de biblioteca

1. `xlsx` carregado sob demanda para exportação Excel
2. `vite` e `typescript` apenas para o protótipo atual

Decisão de handoff:

1. manter adapters SAP e DIJUR como referência de integração
2. substituir `localStorage` por state store persistido ou serviço de draft no Angular
3. substituir `window.prompt` por modal/dialog de fluxo auditável

## 3. Estados por tela e por fluxo

### 3.1 Dashboard e portfólio

Estados relevantes:

1. carregando dados
2. usando dados demo versus dados SAP
3. paginação da lista geral
4. paginação do painel de vencimentos
5. filtros ativos e rótulo de filtros
6. expandido/recolhido do bloco de filtros

### 3.2 Gestor Formal

Estados relevantes:

1. painel ativo em `acoes-renovatorias`
2. lista filtrada
3. paginação do painel formal
4. modal de detalhes/edição aberto ou fechado
5. edições persistidas do gestor formal (`radarSucot`, `notas`)
6. origem dos dados após merge SAP + DIJUR + input manual

### 3.3 Gestor Operacional - Aviso de Vencimento

Estados relevantes:

1. painel operacional ativo (`passos-jornada` ou `aviso-vencimento`)
2. lista filtrada do aviso
3. paginação do aviso
4. drawer de contexto aberto ou fechado
5. filtro por faixa de prazo ativo
6. filtro de risco AR87 ativo
7. composição expandida dos KPIs
8. decisões persistidas (`decisaoProrrogar`, `decisaoAcaoRenovatoria`)
9. protocolo formal, protocolo de contratação e metadados de laudo persistidos

### 3.4 Gestor Operacional - Informações do imóvel

Estados relevantes:

1. aba superior ativa: `Informacoes do imovel` ou `Aviso de Vencimento`
2. subtab ativa: `RTA`, `Laudo de avaliacao`, `Negociacao`
3. contrato selecionado na busca operacional
4. resultados recentes e favoritos da busca de contratos
5. rascunho persistido por etapa (`RTA`, `Laudo`, `Negociação`)
6. contexto de negociação com ou sem contrato
7. obrigatoriedades dinâmicas por alteração contratual, carência, AR em andamento e aluguel acima do laudo

### 3.5 Fases operacionais B-a a B-h

Estados relevantes:

1. coleção completa por fase
2. coleção filtrada por fase
3. favoritos nas fases 6.1 e 6.2
4. chip de prazo selecionado nas fases 6.1 e 6.2
5. filtros de sessão por UF, vigência, protocolo, objeto, responsável e datas

## 4. Inventário de filtros

### 4.1 Painel de Vencimentos

Filtros:

1. `Imóvel (SAP)`
2. `Contrato (SICLG)`
3. `Locador`
4. `CPF/CNPJ`
5. `Situação`
6. `Vigência de`
7. `Vigência até`
8. `Data Últ. Pgto de`
9. `Data Últ. Pgto até`
10. `Últ. Valor Pago de`
11. `Últ. Valor Pago até`

### 4.2 Ações Renovatórias

Filtros:

1. `Código SIJUR`
2. `Imóvel (SAP)`
3. `Contrato (SICLG)`
4. `Protocolo Formal (SICLG)`
5. `Unidade`
6. `Processo (SICLG)`
7. `Vigência até`
8. `Situação SICLG`
9. `Situação SIJUR`
10. `Situação CEFOR`

### 4.3 Aviso de Vencimento

Filtros:

1. `Imóvel (SAP)`
2. `Contrato (SICLG)`
3. `Situação do instrumento (SICLG)`
4. `Fim da vigência até`
5. `Último pagamento até`
6. `Decisão de prorrogar`
7. `Ação renovatória`
8. `Fase do tratamento`
9. `Tipo de demanda (SICLG)`
10. `Instância colegiada`
11. `Janela de vencimento`
12. `Limite legal AR até`
13. chips de faixa de prazo
14. KPI clicável de risco AR87

### 4.4 Fases do workflow operacional

Fase 1:

1. `Procurar`

Fase 2:

1. `UF`
2. `Fim da Vigência`

Fase 3:

1. `UF`
2. `Fim da Vigência`

Fase 4:

1. `UF`
2. `Fim da Vigência`

Fase 5:

1. `UF`
2. `Fim da Vigência`
3. `Decisão`

Fase 6.1:

1. `UF`
2. `Fim da Vigência`
3. `Demandante`
4. `Equipe`
5. `Responsável`
6. `Situação`
7. `Modalidade`
8. `Protocolo`
9. `Objeto`
10. `Incluído de`
11. `Incluído até`
12. `Concluído de`
13. `Concluído até`
14. chip de prazo

Fase 6.2:

1. `UF`
2. `Fim da Vigência`
3. `Gestor`
4. `Fornecedor`
5. `Protocolo`
6. `Situação`
7. `Tipo de demanda`
8. `Objeto`
9. `Incluído de`
10. `Incluído até`
11. `Concluído de`
12. `Concluído até`
13. chip de prazo

Fase 7:

1. `UF`
2. `Fim da Vigência`

## 5. Inventário de eventos e efeitos

### 5.1 Eventos transversais

1. clique em navegação de topo muda o painel ativo
2. `Enter` em campos de filtro aplica a busca
3. clique em `Limpar` reseta filtros e paginação
4. clique em `Exportar CSV/Excel` serializa o read model atual
5. clique em lupa abre modal ou drawer de detalhe

### 5.2 Eventos do Gestor Formal

1. abrir modal de detalhe da linha
2. fechar modal pelo botão ou backdrop
3. salvar edição formal persistindo `radarSucot` e `notas`

### 5.3 Eventos do Aviso de Vencimento

1. clique em card de faixa de prazo alterna filtro
2. clique em KPI de risco AR87 alterna filtro
3. clique no gatilho de composição expande ou recolhe KPI
4. clique na linha abre drawer contextual
5. alteração de decisão pode exigir justificativa de reabertura
6. reset de sessão remove decisões persistidas e recompõe o painel

### 5.4 Eventos das etapas documentais

1. seleção/busca de contrato atualiza o contexto do formulário
2. salvar `RTA`, `Laudo` e `Negociação` persiste rascunho por contrato
3. validações dinâmicas bloqueiam persistência quando anexos e condicionantes obrigatórios não foram preenchidos

### 5.5 Eventos das fases 6.1 e 6.2

1. clique em favorito alterna persistência local da linha
2. clique em chip de prazo filtra por criticidade
3. filtros de data atuam sobre `incluidoEmDate` e `concluidoEmDate`

## 6. Matriz protótipo TS -> componente Angular

| Superfície no protótipo             | Componente/página Angular sugerido                                                                          | Serviço/facade sugerido       | Contratos principais                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| Dashboard inicial e cards de perfis | `HomePortfolioPageComponent`                                                                                | `PortfolioFacade`             | `DashboardStats`, `Imovel`, `Locador`                                  |
| Lista geral do portfólio            | `PortfolioListPageComponent` + `PortfolioFiltersComponent` + `PortfolioTableComponent`                      | `PortfolioFacade`             | `Imovel`, `FiltroImoveis`, `PaginationConfig`                          |
| Painel de vencimentos               | `PainelVencimentosPageComponent` + `PainelVencimentosFiltersComponent` + `PainelVencimentosTableComponent`  | `PainelVencimentosFacade`     | `PainelVencimentosContrato`                                            |
| Ações renovatórias                  | `AcoesRenovatoriasPageComponent` + `AcoesRenovatoriasFiltersComponent` + `AcoesRenovatoriasTableComponent`  | `AcoesRenovatoriasFacade`     | `PainelAcoesRenovatoriasRow`                                           |
| Modal de edição formal              | `FormalEditDialogComponent`                                                                                 | `FormalDraftService`          | `PainelAcoesRenovatoriasRow` + estado persistido formal                |
| Aviso de vencimento                 | `AvisoVencimentoPageComponent` + `AvisoKpiStripComponent` + `AvisoFiltersComponent` + `AvisoTableComponent` | `AvisoVencimentoFacade`       | `PainelAvisoVencimentoRow`, `EstadoPainelAvisoPersistido`              |
| Drawer de contexto do aviso         | `AvisoContextDrawerComponent`                                                                               | `AvisoVencimentoFacade`       | `PainelAvisoVencimentoRow`                                             |
| Aba `Informacoes do imovel`         | `InformacoesImovelPageComponent`                                                                            | `OperacionalWorkflowFacade`   | contratos da busca + contratos das etapas                              |
| Subtab `RTA`                        | `RtaFormComponent`                                                                                          | `EtapaRtaDraftService`        | `EtapaRtaRegistro`                                                     |
| Subtab `Laudo de avaliacao`         | `LaudoFormComponent`                                                                                        | `EtapaLaudoDraftService`      | `EtapaLaudoRegistro`                                                   |
| Subtab `Negociacao`                 | `NegociacaoFormComponent`                                                                                   | `EtapaNegociacaoDraftService` | `EtapaNegociacaoRegistro`, `NegociacaoLocadorPercentualEdit`           |
| Busca de contrato operacional       | `ContratoLookupComponent`                                                                                   | `ContratoLookupService`       | `ContratoBuscaParams`, `ContratoBuscaResponse`, `ContratoBuscaUiState` |
| Workflow por fases B-a a B-h        | `WorkflowOperacionalPageComponent` + um componente por fase                                                 | `WorkflowOperacionalFacade`   | `Fase1OperacionalRow` a `Fase7OperacionalRow`                          |
| Fases 6.1 e 6.2 com favoritos       | `Fase61TableComponent`, `Fase62TableComponent`                                                              | `WorkflowFavoritosService`    | `Fase61OperacionalRow`, `Fase62OperacionalRow`                         |

## 7. Arquitetura Angular recomendada para absorção

### 7.1 Camadas sugeridas

1. `data-access`
   - adapters SAP, SICLG e DIJUR
   - mappers de DTO -> modelo canônico
2. `domain`
   - motores de regra de prazo, conciliação, montagem de painéis e fases
3. `feature`
   - páginas, facades, stores e componentes por módulo
4. `shared`
   - tabela, paginação, filtros, badges, modal, drawer, upload e exportação

### 7.2 O que deve virar serviço ou facade imediatamente

1. montagem de `PainelVencimentosContrato`
2. montagem de `PainelAcoesRenovatoriasRow`
3. montagem de `PainelAvisoVencimentoRow`
4. montagem das fases 1 a 7
5. persistência de drafts operacionais e do gestor formal
6. classificação de prazo AR e criticidade
7. regras de filtros, labels e ordenação dinâmica

### 7.3 O que não deve ser portado literalmente

1. acesso direto ao DOM via `document.getElementById`
2. persistência espalhada por chave de `localStorage`
3. `window.prompt` para justificativa e prazo formal
4. montagem manual de HTML em `innerHTML`

## 8. Checklist de handoff para o time Angular

1. preservar `imovel_sap` como chave canônica do SAP
2. manter distinção semântica entre `Imóvel (SAP)`, `Contrato (SICLG)` e `Processo (SICLG)`
3. portar primeiro os read models dos painéis antes da composição visual final
4. tratar drafts locais como estado de aplicação, não como detalhe de componente
5. transformar filtros em objetos tipados por tela antes de ligar ao backend real
6. centralizar exportação, paginação e badges em componentes compartilhados
7. substituir prompts por diálogos versionáveis e auditáveis

## 9. Ordem recomendada de absorção no Angular

1. `PainelVencimentosContrato` e painel A-II
2. `PainelAcoesRenovatoriasRow` e painel A-III
3. `PainelAvisoVencimentoRow` e workflow operacional do aviso
4. contratos das etapas `RTA`, `Laudo` e `Negociação`
5. workflow por fases 1 a 7
6. favoritos, exportações e persistência local avançada

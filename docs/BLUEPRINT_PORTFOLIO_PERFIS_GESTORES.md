# Blueprint de Telas - Portfolio e Perfis de Gestores

Documento orientado a handoff para UX, Analista e Desenvolvimento.
Escopo: reorganizacao da experiencia do Portfolio com entrada por perfil e jornada por fases do Gestor Operacional.

## 1. Decisoes de Produto (validadas)

1. Manter `Portfolio - Indicadores Rapidos`.
2. Remover `Portfolio - Lista Geral` da navegacao principal.
3. Renomear `Portfolio - Painel de Vencimentos` para `Portfolio`.
4. Exibir menos contratos por pagina no Portfolio (default 10) com paginacao.
5. Criar tres cards de perfis de gestores na entrada:
   - Gestor Operacional
   - Gestor Contratacao
   - Gestor Formal
6. Ao clicar em `Gestor Operacional`, abrir tela dedicada com abas por fase (1, 2, 3, 4, 5, 6.1, 6.2, 7).

## 2. Arquitetura de Informacao

### 2.1 Mapa de navegacao

1. Dashboard Principal
   - Secao `Portfolio - Indicadores Rapidos`
   - Secao `Portfolio` (lista paginada de contratos)
   - Secao `Perfis de Gestao` (3 cards)
2. Jornada por Perfil
   - Gestor Operacional -> Tela com abas por fase
   - Gestor Contratacao -> Tela com backlog de fases responsaveis
   - Gestor Formal -> Tela com backlog de fases responsaveis
3. Detalhe de Contrato
   - Abertura por icone `lupa` em qualquer tabela

### 2.2 Titulos de tela recomendados

1. `Gestao de Imoveis`
2. `Portfolio`
3. `Perfis de Gestao`
4. `Jornada do Gestor Operacional`

## 3. Blueprint de Telas

### 3.1 Tela A - Dashboard Principal

Objetivo: oferecer visao executiva e porta de entrada por perfil.

Blocos:

1. Indicadores Rapidos
   - Total de contratos
   - No prazo
   - Em alerta
   - Vencidos
2. Portfolio (lista compacta)
   - Tabela reduzida com contratos prioritarios
   - Filtros minimos
   - Paginacao
3. Perfis de Gestao
   - 3 cards clicaveis
   - Cada card com 2-3 KPIs

Estados:

1. Sem dados
2. Carregando
3. Com dados
4. Erro de carga

### 3.2 Tela B - Jornada do Gestor Operacional

Objetivo: concentrar a operacao em fases com filtros e tabela por contexto.

Estrutura fixa:

1. Header da jornada (nome do perfil, resumo KPI)
2. Abas de fase
3. Bloco de filtros da fase selecionada
4. Tabela da fase selecionada
5. Acoes de linha (lupa e, quando aplicavel, favorito)

Abas:

1. Fase 1 - Aviso de Vencimento
2. Fase 2 - Decisao de Prorrogacao
3. Fase 3 - Laudo de Avaliacao
4. Fase 4 - Negociacao
5. Fase 5 - Demandar SUCOT
6. Fase 6.1 - Contratacao
7. Fase 6.2 - Renovacao
8. Fase 7 - Aguardar Notificacao

### 3.3 Tela C - Gestor Contratacao

Objetivo: acompanhamento da carteira de contratacao.

Blocos:

1. Indicadores da carteira
2. Filtros avancados
3. Tabela por demanda
4. Favoritos por linha

### 3.4 Tela D - Gestor Formal

Objetivo: acompanhamento de renovacoes e governanca formal.

Blocos:

1. Indicadores da carteira
2. Filtros avancados
3. Tabela por instrumento/protocolo
4. Favoritos por linha

## 4. Fases do Gestor Operacional (filtros e colunas)

## 4.1 Fase 1 - Aviso de Vencimento (Gestao Formal)

Filtros:

1. Procurar

Tabela:

1. Data da Notificacao
2. Contratos na Lista A
3. Contratos na Lista B
4. Contratos na Lista C
5. Contratos na Lista D
6. Total
7. Lupa (icone)

## 4.2 Fase 2 - Decisao de Prorrogacao (Demandante)

Filtros:

1. Fim da Vigencia
2. UF

Tabela:

1. Contrato (SAP)
2. Vigencia (SAP)
3. Contrato (SICLG)
4. Vigencia (SICLG)
5. Fornecedor
6. Descricao
7. Limite AR G.O.
8. Lupa (icone)

## 4.3 Fase 3 - Laudo de Avaliacao (Demandante)

Filtros:

1. Fim da Vigencia
2. UF

Tabela:

1. Contrato (SAP - SICLG)
2. Fornecedor
3. Descricao Contrato
4. Inicio Vigencia
5. Fim Vigencia
6. Situacao Laudo
7. Lupa (icone)

## 4.4 Fase 4 - Negociacao (Demandante)

Filtros:

1. Fim da Vigencia
2. UF

Tabela:

1. Contrato (SAP - SICLG)
2. Fornecedor
3. Descricao Contrato (SAP)
4. Inicio Vigencia
5. Fim Vigencia
6. Valor Maximo
7. Incluir no SICLG?
8. Limite AR (6 meses) G.O.
9. Lupa (icone)

## 4.5 Fase 5 - Demandar SUCOT (Demandante)

Filtros:

1. Fim da Vigencia
2. UF
3. Decisao Operacional

Tabela:

1. Contrato
2. Fornecedor
3. Descricao Contrato
4. Inicio Vigencia
5. Fim Vigencia
6. Decisao Operacional
7. Houve Acordo?
8. Incluir no SICLG?
9. Situacao AR

## 4.6 Fase 6.1 - Contratacao (Contratacao)

Filtros:

1. Demandante
2. Equipe Remota
3. Responsavel
4. Situacao Demanda
5. Modalidade
6. Progresso Atual
7. Situacao Prazo
8. Protocolo SICLG
9. Processo/Ano
10. Numero do Pregao
11. Objeto
12. Incluido a partir de
13. Incluido ate
14. Concluido a partir de
15. Concluido ate
16. Vencimento Contrato Anterior
17. Contrato Anterior
18. Municipio do Loterico
19. Radar SUCOT

Tabela (com coluna de favorito):

1. Protocolo (SICLG)
2. Item
3. Objeto
4. Gestor Demandante
5. Valor
6. Tempo Decorrido
7. Vencimento Contrato Atual
8. Situacao Demanda
9. Modalidade
10. Equipe Remota
11. Progresso
12. Notas

## 4.7 Fase 6.2 - Renovacao (Gestao Formal)

Filtros:

1. Vice-Presidencia
2. Gestor Operacional
3. Instrumento Contratual (Contrato) [SICLG]
4. Fornecedor
5. Protocolo (SICLG)
6. Situacao
7. Tipo de Demanda
8. Fase Atual
9. Fase Acompanhamento
10. Objeto
11. Equipe
12. Responsavel Demanda
13. Incluido a partir de
14. Incluido ate
15. Concluido a partir de
16. Concluido ate
17. Responsavel Fase
18. Radar SUCOT

Tabela (com coluna de favorito):

1. VP
2. Gestor
3. Contrato SICLG
4. Nome Fornecedor
5. Vigencia Final
6. Valor Ato
7. Protocolo
8. Inclusao (data)
9. Tipo de Demanda
10. Situacao
11. Objeto
12. Equipe
13. Fase Atual

## 4.8 Fase 7 - Aguardar Notificacao (Demandante)

Filtros:

1. Fim da Vigencia
2. UF

Tabela:

1. Contrato SAP
2. Vigencia SAP
3. Contrato SICLG
4. Vigencia SICLG
5. Fornecedor SAP
6. Descricao
7. Limite AR G.O.

## 5. Regras de UX e usabilidade

1. Filtros avancados recolhidos por padrao nas fases 6.1 e 6.2.
2. Persistencia de filtros por aba (session/local storage).
3. Ordenacao em colunas criticas: vigencia, prazo, situacao, protocolo.
4. Paginacao padrao: 10 registros; opcoes 10/20/50.
5. Lupa sempre visivel como acao primaria de detalhe.
6. Favorito habilitado apenas em 6.1 e 6.2.

## 6. Contratos de navegacao (rotas propostas)

1. `/` -> Dashboard principal com Portfolio e Perfis.
2. `/perfil/operacional` -> Jornada do Gestor Operacional.
3. `/perfil/contratacao` -> Jornada do Gestor Contratacao.
4. `/perfil/formal` -> Jornada do Gestor Formal.
5. `/contrato/:id` -> Detalhe do contrato.

## 7. Impacto esperado

1. Menor carga cognitiva na tela principal.
2. Navegacao orientada por responsabilidade funcional.
3. Escalabilidade para novas fases sem poluir o dashboard.
4. Melhor aderencia ao fluxo de negocio da US-001.

## 8. Fora de escopo desta iteracao

1. Integracao backend definitiva.
2. Regras de permissao por IAM/SSO.
3. SLA automatizado com notificacoes externas.
4. Exportacoes complexas multi-formato.

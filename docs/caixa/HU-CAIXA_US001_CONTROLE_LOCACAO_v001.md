# HU-CAIXA - Modulo Controle de Locacao (v001)

## 1. Identificacao

- Codigo: HU-CAIXA-US001
- Modulo: Controle de Locacao
- Versao: 001
- Status: Em elaboracao para handoff (UX -> Analista de Requisitos -> Desenvolvimento)
- Origem: Adaptacao ao padrao CAIXA, sem substituir a historia existente `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`

## 2. Objetivo da HU

Implementar o modulo de Controle de Locacao no SILIC 2.0 para consolidar dados SAP e SICLG, apoiar decisao operacional por perfil e gerir renovacoes contratuais por fase, incluindo trilha para integracao DIJUR.

## 3. Narrativa

Sendo um usuario com perfil de Gestao Formal ou Gestao Operacional,
preciso consultar e operar contratos de locacao em uma visao consolidada,
para acompanhar vencimentos, reduzir inconsistencias de conciliacao e conduzir a renovacao contratual dentro dos prazos estabelecidos.

## 4. Perfis envolvidos

- Gestor Formal
- Gestor Operacional
- Demandante
- Contratacao
- Auditor (consulta)

## 5. Pre-condicoes

1. Dados de contratos disponiveis nas fontes SAP e SICLG.
2. Chave de conciliacao por contrato definida em `contrato_sap`.
3. Ambiente com carga de dados ativa (`public/dados-sap.json` no prototipo).
4. Estrutura de rastreabilidade de origem de dados habilitada.
5. Escopo funcional e regras oficiais alinhados ao dicionario de dados v1.

## 6. Escopo funcional da HU

### 6.1 A-I - Conciliacao SAP/SICLG

- Exibir status por contrato: `conciliado`, `pendente`, `inconsistente`, `sem_par`.
- Sinalizar divergencias (fornecedor, descricao, vigencia).
- Permitir filtros e rastreabilidade por origem.

### 6.2 A-II - Painel de Vencimento

- Exibir contratos por vigencia de referencia.
- Permitir filtros por UF, prazo e status de conciliacao.
- Exibir decisao operacional, fase e situacao de processo AR.

### 6.3 A-III - Acoes Renovatorias (com DIJUR API)

- Exibir informacoes juridicas por contrato (`codigo_sijur`, `situacao_sijur`, `situacao_cefor`).
- Mostrar status de sincronizacao (`last_sync_at`).
- Integrar com workflow operacional para tomada de decisao.

### 6.4 B-a a B-h - Controle de Renovacoes por fase

- Sustentar progressao de fase de renovacao contratual.
- Exibir fase atual, prazo, tempo decorrido e sinais de alerta.
- Relacionar fase com dados operacionais e juridicos.

## 7. Regras de negocio obrigatorias

1. Chave principal de conciliacao: `contrato_sap`.
2. Regra de prazo oficial: `limite_ar_go = fim_vigencia_sap - 6 meses`.
3. Campos por perfil:
   - Gestor Operacional: `decisao_operacional`, `houve_acordo`, `incluir_no_siclg`
   - Gestor Formal: `radar_sucot`, `notas`
4. Campos fora de escopo (nao implementar):
   - `pago_ultimos_12_meses`
   - `ultimo_pagamento`
   - `fase_operacional`
   - `situacao_colegiado`
5. Rastreabilidade de origem obrigatoria para dados exibidos.

## 8. Dados e integracoes

### 8.1 Fontes de dados

- SAP
- SICLG
- DIJUR API (etapa de integracao A-III)
- Inputs manuais por perfil

### 8.2 Entidades canonicas de referencia

- `core_contrato`
- `core_fornecedor`
- `bridge_contrato_fornecedor`
- `core_conciliacao`
- `workflow_operacional`
- `integracao_dijur`
- `fact_renovacao_fases`

## 9. Criterios de aceite (Given/When/Then)

### CA-01 Conciliacao SAP/SICLG

- Given contratos carregados de SAP e SICLG
- When o usuario acessar A-I
- Then o sistema deve apresentar status de conciliacao por contrato e divergencias identificadas

### CA-02 Painel de vencimento

- Given contratos com vigencia SAP e/ou SICLG
- When o usuario aplicar filtros de A-II
- Then o sistema deve retornar lista por contrato, UF, locador, decisao operacional, demanda e situacao SICLG

### CA-03 Input do Gestor Operacional

- Given contrato elegivel para tratamento
- When o Gestor Operacional registrar `decisao_operacional`, `houve_acordo` e `incluir_no_siclg`
- Then o sistema deve persistir com auditoria (`updated_by`, `updated_at`)

### CA-04 Input do Gestor Formal

- Given contrato em acompanhamento
- When o Gestor Formal registrar `radar_sucot` e `notas`
- Then o sistema deve persistir com auditoria e refletir nos paineis de renovacao

### CA-05 Integracao DIJUR

- Given API DIJUR disponivel
- When ocorrer sincronizacao
- Then `codigo_sijur`, `situacao_sijur` e `situacao_cefor` devem ser atualizados e exibidos no A-III

### CA-06 Regra D-180

- Given `fim_vigencia_sap` preenchida
- When o sistema calcular prazo operacional
- Then deve calcular `limite_ar_go` e classificar `status_prazo_ar_go` em `no_prazo`, `alerta` ou `vencido`

### CA-07 Origem rastreavel

- Given campo exibido no modulo
- When usuario/auditor inspecionar o dado
- Then a origem deve ser identificavel (`SAP`, `SICLG`, `DIJUR_API`, `INPUT_GESTOR_OPERACIONAL`, `INPUT_GESTOR_FORMAL`, `CALCULADO`)

## 10. Requisitos nao funcionais

1. Auditoria de alteracoes manuais obrigatoria.
2. Logs de erro e retentativa para integracoes externas.
3. Suporte a internacionalizacao futura (rotulos, formatos e locale).
4. Estrutura orientada a API-first para evolucao do prototipo para produto.

## 11. Fora de escopo desta HU

- Integracoes de pagamento SAP dos ultimos 12 meses.
- Regras detalhadas de colegiado.
- Regras juridicas alem da janela D-180 no escopo atual.

## 12. Dependencias

1. Disponibilidade de dados SAP e SICLG consistentes.
2. Contrato de API DIJUR (campos minimos definidos).
3. Validacao funcional de telas de alta fidelidade pelo UX.
4. Consolidacao formal de requisitos pelo Analista de Requisitos.

## 13. Definicao de pronto (DoD)

1. Dados modelados conforme `docs/DICIONARIO_DADOS_V1.md`.
2. Criterios de aceite CA-01 a CA-07 validados.
3. Perfis e permissoes aplicados aos campos manuais.
4. Logs/auditoria ativos para alteracoes e integracoes.
5. Rastreabilidade entre HU, backlog e entrega tecnica registrada.

## 14. Rastreabilidade documental

- Historia base ja existente: `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
- Backlog: `docs/BACKLOG_US001_SUBHISTORIAS.md`
- Dicionario de dados: `docs/DICIONARIO_DADOS_V1.md`
- Estado atual: `docs/ESTADO_ATUAL_DO_PROJETO.md`
- Documento CAIXA de referencia: `docs/caixa/02 - HU - Módulo Consultar Contrato - Ficha do Instrumento v001.docx`

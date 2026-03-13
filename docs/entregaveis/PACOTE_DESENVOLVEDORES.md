# Pacote de Envio - Desenvolvedores

Objetivo: permitir implementacao do modulo com contexto funcional, dados e prioridade de entrega.

## O que enviar para Desenvolvedores

1. Documento de requisitos final (emitido pelo Analista de Requisitos).
2. Link Figma final aprovado.
3. `docs/DICIONARIO_DADOS_V1.md`
4. `docs/BACKLOG_US001_SUBHISTORIAS.md`
5. `docs/ESTADO_ATUAL_DO_PROJETO.md`
6. `docs/INTEGRACAO_SAP.md`
7. `docs/GUIA_DADOS.md`

## Ordem recomendada de implementacao (MVP)

1. US-001.1 Ingestao e normalizacao SAP/SICLG
2. US-001.2 Motor de conciliacao
3. US-001.3 Tela A-I
4. US-001.4 Workflow operacional
5. US-001.5 Regra D-180
6. US-001.6 Tela A-II
7. US-001.7 Integracao DIJUR API
8. US-001.8 Tela A-III

## Definicoes tecnicas minimas para iniciar

1. Modelo canônico:
   - `core_contrato`
   - `core_fornecedor`
   - `core_conciliacao`
   - `workflow_operacional`
   - `integracao_dijur`
   - `fact_renovacao_fases`
2. Contratos de API/adapters:
   - `sapAdapter`
   - `siclgAdapter`
   - `dijurAdapter`
3. Engines:
   - `conciliationEngine`
   - `renewalRulesEngine`
4. Logs e auditoria:
   - `updated_by`
   - `updated_at`
   - `last_sync_at`

## Criterios de pronto para kickoff tecnico

1. Figma aprovado e versionado.
2. Requisitos assinados pelo Analista.
3. Criterios de aceite em formato testavel.
4. Dependencias externas identificadas (DIJUR API e dados SICLG).

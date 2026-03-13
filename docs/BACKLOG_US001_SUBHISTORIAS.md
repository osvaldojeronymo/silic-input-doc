# Backlog de Sub-Historias - US-001

Documento de planejamento tatico para execucao da historia principal:

- `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`

Referencia de dados:

- `docs/DICIONARIO_DADOS_V1.md`

## Legenda

- Prioridade: `P0` (critica), `P1` (alta), `P2` (media)
- Estimativa: pontos relativos (Fibonacci)
- Dependencias: IDs de sub-historias

## Sub-historias

### US-001.1 - Ingestao e normalizacao SAP/SICLG

- Objetivo: carregar SAP e SICLG em modelo canônico minimo (`core_contrato`, `core_fornecedor`).
- Prioridade: P0
- Estimativa: 8
- Dependencias: nenhuma
- Criterios de aceite:
  1. Campos obrigatorios do dicionario v1 carregados e normalizados.
  2. Documento fiscal sem mascara.
  3. Datas no formato `YYYY-MM-DD`.

### US-001.2 - Motor de conciliacao SAP/SICLG

- Objetivo: gerar `core_conciliacao` com status e flags de divergencia.
- Prioridade: P0
- Estimativa: 8
- Dependencias: US-001.1
- Criterios de aceite:
  1. Status `conciliado|pendente|inconsistente|sem_par` calculado por contrato.
  2. Divergencias de fornecedor, descricao e vigencia sinalizadas.

### US-001.3 - Tela A-I Conciliacao SAP/SICLG

- Objetivo: publicar painel de conciliacao com filtros acordados.
- Prioridade: P0
- Estimativa: 5
- Dependencias: US-001.2
- Criterios de aceite:
  1. Filtros de A-I funcionando.
  2. Lista com status de conciliacao e origem rastreavel.

### US-001.4 - Workflow Operacional (inputs por perfil)

- Objetivo: persistir `decisao_operacional`, `houve_acordo`, `incluir_no_siclg`, `radar_sucot`, `notas` com auditoria.
- Prioridade: P0
- Estimativa: 8
- Dependencias: US-001.1
- Criterios de aceite:
  1. Permissao por perfil aplicada (Gestor Operacional vs Gestor Formal).
  2. Campos salvos com `updated_by` e `updated_at`.

### US-001.5 - Regra de prazo AR (D-180)

- Objetivo: calcular `limite_ar_go` e `status_prazo_ar_go`.
- Prioridade: P0
- Estimativa: 3
- Dependencias: US-001.1
- Criterios de aceite:
  1. `limite_ar_go = fim_vigencia_sap - 6 meses`.
  2. Classificacao `no_prazo|alerta|vencido` implementada.

### US-001.6 - Tela A-II Painel de Vencimento

- Objetivo: entregar painel de vencimento sem campos removidos do escopo.
- Prioridade: P1
- Estimativa: 8
- Dependencias: US-001.4, US-001.5
- Criterios de aceite:
  1. Filtros de A-II implementados (sem `ultimo_pagamento`, `fase_operacional`, `situacao_colegiado`).
  2. Exibicao de decisao operacional e situacao SICLG.

### US-001.7 - Integracao DIJUR API

- Objetivo: sincronizar `codigo_sijur`, `situacao_sijur`, `situacao_cefor`.
- Prioridade: P1
- Estimativa: 8
- Dependencias: US-001.1
- Criterios de aceite:
  1. Adapter DIJUR com `last_sync_at`.
  2. Falhas de API com retentativa e log.

### US-001.8 - Tela A-III Acoes Renovatorias

- Objetivo: publicar painel A-III com filtros e colunas de processo juridico.
- Prioridade: P1
- Estimativa: 5
- Dependencias: US-001.7, US-001.4
- Criterios de aceite:
  1. Filtros de A-III implementados.
  2. Dados DIJUR exibidos por contrato.

### US-001.9 - Base de fases B-a..B-h

- Objetivo: estruturar `fact_renovacao_fases` e navegação por fase.
- Prioridade: P1
- Estimativa: 8
- Dependencias: US-001.4, US-001.5
- Criterios de aceite:
  1. `fase_atual` persistida e consultavel.
  2. `tempo_decorrido_operacional` calculado.

### US-001.10 - Telas B-b, B-d, B-e, B-h (prioridade operacional)

- Objetivo: disponibilizar fases com foco em decisao e prazo AR.
- Prioridade: P1
- Estimativa: 13
- Dependencias: US-001.9
- Criterios de aceite:
  1. Filtros e colunas conforme especificacao funcional.
  2. Uso de `limite_ar_go` e `status_prazo_ar_go` nas visoes.

### US-001.11 - Telas B-f e B-g (contratacao/renovacao)

- Objetivo: suportar acompanhamento de demanda, radar SUCOT e notas.
- Prioridade: P2
- Estimativa: 13
- Dependencias: US-001.9, US-001.7
- Criterios de aceite:
  1. Colunas de acompanhamento e favoritos por linha.
  2. Inputs de Gestor Formal refletidos nas tabelas.

### US-001.12 - Governanca e qualidade

- Objetivo: consolidar validacoes, trilha de auditoria e checklist de release.
- Prioridade: P1
- Estimativa: 5
- Dependencias: US-001.3, US-001.6, US-001.8
- Criterios de aceite:
  1. Validacao de payload por schema.
  2. Checklist de release documentado.
  3. Erros de integracao rastreaveis em log.

## Sequencia recomendada (MVP)

1. US-001.1
2. US-001.2
3. US-001.3
4. US-001.4
5. US-001.5
6. US-001.6
7. US-001.7
8. US-001.8

## Sequencia recomendada (expansao)

1. US-001.9
2. US-001.10
3. US-001.11
4. US-001.12

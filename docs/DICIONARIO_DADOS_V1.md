# Dicionario de Dados v1 - SILIC 2.0

Documento base para integracao e uso de dados no dominio de locacao, considerando:

- Fontes externas: `SAP`, `SICLG`, `DIJUR_API`
- Entradas internas: `INPUT_GESTOR_OPERACIONAL`, `INPUT_GESTOR_FORMAL`
- Campos calculados: `CALCULADO`

## 1) Convencoes

- Chave central de negocio: `contrato_sap`
- Chave tecnica interna: `contrato_uid` (UUID)
- Datas: `YYYY-MM-DD`
- Data/hora: `YYYY-MM-DDTHH:mm:ssZ`
- Documento fiscal normalizado: apenas digitos
- Origem de dado por campo: sempre explicita

## 2) Entidades canonicas (core)

### 2.1 `core_contrato`

| Campo                  | Tipo         | Origem    | Obrigatorio | Uso principal                 |
| ---------------------- | ------------ | --------- | ----------- | ----------------------------- |
| contrato_uid           | string(uuid) | CALCULADO | Sim         | Todas as telas                |
| contrato_sap           | string       | SAP/SICLG | Sim         | Chave de conciliacao          |
| contrato_siclg         | string       | SICLG     | Nao         | A-I, A-II, B-b..B-h           |
| processo_siclg         | string       | SICLG     | Nao         | A-III, B-f, B-g               |
| descricao_contrato_sap | string       | SAP       | Sim         | A-I, B-c, B-d, B-e, B-h       |
| descricao_objeto_siclg | string       | SICLG     | Nao         | A-I, A-III                    |
| tipo_contrato_sap      | string       | SAP       | Nao         | A-I                           |
| tipo_instrumento_siclg | string       | SICLG     | Nao         | A-I, B-g                      |
| inicio_vigencia_sap    | date         | SAP       | Sim         | A-I, B-b, B-c, B-d, B-h       |
| fim_vigencia_sap       | date         | SAP       | Sim         | A-II, B-a..B-h                |
| inicio_vigencia_siclg  | date         | SICLG     | Nao         | A-I, B-b, B-h                 |
| fim_vigencia_siclg     | date         | SICLG     | Nao         | A-II, B-b, B-h                |
| situacao_siclg         | string       | SICLG     | Nao         | A-I, A-II, A-III, B-g         |
| modalidade_siclg       | string       | SICLG     | Nao         | B-f                           |
| unidade                | string       | SAP/SICLG | Nao         | A-II, A-III, B-a..B-h         |
| uf                     | string(2)    | SAP       | Nao         | A-II, B-b, B-c, B-d, B-e, B-h |
| endereco_sap           | string       | SAP       | Nao         | A-II                          |

### 2.2 `core_fornecedor`

| Campo                   | Tipo         | Origem    | Obrigatorio | Uso principal    |
| ----------------------- | ------------ | --------- | ----------- | ---------------- |
| fornecedor_uid          | string(uuid) | CALCULADO | Sim         | Interno          |
| documento_fiscal        | string       | SAP       | Sim         | Match e exibicao |
| tipo_documento          | string       | SAP       | Nao         | A-I              |
| nome_fornecedor_sap     | string       | SAP       | Sim         | A-I, A-II, B-\*  |
| nome_fornecedor_siclg   | string       | SICLG     | Nao         | A-I, B-g         |
| email                   | string       | SAP       | Nao         | Visao 360        |
| telefone                | string       | SAP       | Nao         | Visao 360        |
| celular                 | string       | SAP       | Nao         | Visao 360        |
| risco_social            | string/bool  | SICLG     | Nao         | A-II, compliance |
| risco_ambiental         | string/bool  | SICLG     | Nao         | A-II, compliance |
| risco_climatico         | string/bool  | SICLG     | Nao         | A-II, compliance |
| conduta_assinada        | string/bool  | SICLG     | Nao         | A-II, compliance |
| terceiro_relevante      | string/bool  | SICLG     | Nao         | A-II, compliance |
| licenciamento_ambiental | string/bool  | SICLG     | Nao         | A-II, compliance |

### 2.3 `bridge_contrato_fornecedor`

| Campo          | Tipo | Origem          | Obrigatorio | Uso principal                      |
| -------------- | ---- | --------------- | ----------- | ---------------------------------- |
| contrato_uid   | uuid | CALCULADO       | Sim         | Relacionamento                     |
| fornecedor_uid | uuid | CALCULADO       | Sim         | Relacionamento                     |
| papel          | enum | CALCULADO/SICLG | Sim         | locador/parte_relacionada/terceiro |

### 2.4 `core_conciliacao`

| Campo                  | Tipo     | Origem              | Obrigatorio | Uso principal |
| ---------------------- | -------- | ------------------- | ----------- | ------------- |
| contrato_uid           | uuid     | CALCULADO           | Sim         | A-I           |
| status_conciliacao     | enum     | CALCULADO           | Sim         | A-I           |
| divergencia_fornecedor | bool     | CALCULADO           | Sim         | A-I           |
| divergencia_descricao  | bool     | CALCULADO           | Sim         | A-I           |
| divergencia_vigencia   | bool     | CALCULADO           | Sim         | A-I           |
| observacao_conciliacao | string   | INPUT_GESTOR_FORMAL | Nao         | A-I           |
| atualizado_em          | datetime | CALCULADO           | Sim         | Auditoria     |

## 3) Workflow operacional (input do usuario)

### 3.1 `workflow_operacional`

| Campo               | Tipo        | Origem                   | Obrigatorio | Perfil             |
| ------------------- | ----------- | ------------------------ | ----------- | ------------------ |
| contrato_uid        | uuid        | CALCULADO                | Sim         | Sistema            |
| decisao_operacional | enum        | INPUT_GESTOR_OPERACIONAL | Sim         | Gestor Operacional |
| houve_acordo        | bool        | INPUT_GESTOR_OPERACIONAL | Nao         | Gestor Operacional |
| incluir_no_siclg    | bool        | INPUT_GESTOR_OPERACIONAL | Nao         | Gestor Operacional |
| radar_sucot         | enum/string | INPUT_GESTOR_FORMAL      | Nao         | Gestor Formal      |
| notas               | string      | INPUT_GESTOR_FORMAL      | Nao         | Gestor Formal      |
| updated_by          | string      | CALCULADO                | Sim         | Auditoria          |
| updated_at          | datetime    | CALCULADO                | Sim         | Auditoria          |

## 4) Integracao DIJUR

### 4.1 `integracao_dijur`

| Campo                 | Tipo     | Origem    | Obrigatorio | Uso principal |
| --------------------- | -------- | --------- | ----------- | ------------- |
| contrato_uid          | uuid     | CALCULADO | Sim         | Join interno  |
| codigo_sijur          | string   | DIJUR_API | Nao         | A-III         |
| numero_processo_dijur | string   | DIJUR_API | Nao         | A-III         |
| situacao_sijur        | string   | DIJUR_API | Nao         | A-III         |
| situacao_cefor        | string   | DIJUR_API | Nao         | A-III         |
| data_entrada_dijur    | date     | DIJUR_API | Nao         | A-III         |
| partes_dijur          | string   | DIJUR_API | Nao         | A-III         |
| last_sync_at          | datetime | CALCULADO | Sim         | Operacao      |

## 5) Campos calculados de prazo e renovacao

### 5.1 `fact_renovacao_fases`

| Campo                       | Tipo          | Origem             | Obrigatorio | Uso principal |
| --------------------------- | ------------- | ------------------ | ----------- | ------------- |
| contrato_uid                | uuid          | CALCULADO          | Sim         | B-a..B-h      |
| fase_atual                  | enum          | CALCULADO/WORKFLOW | Sim         | B-\*          |
| situacao_demanda            | string        | SICLG/WORKFLOW     | Nao         | B-f, B-g      |
| data_entrada_fase           | date          | CALCULADO/WORKFLOW | Nao         | B-\*          |
| tempo_decorrido_operacional | integer(dias) | CALCULADO          | Nao         | B-f           |
| limite_ar_go                | date          | CALCULADO          | Sim         | B-b, B-d, B-h |
| status_prazo_ar_go          | enum          | CALCULADO          | Sim         | B-b, B-d, B-h |

## 6) Regras de negocio oficiais

1. `limite_ar_go = fim_vigencia_sap - 6 meses`
2. `status_prazo_ar_go`:
   - `no_prazo`: hoje < limite_ar_go
   - `alerta`: hoje dentro da janela de alerta (ex.: 30 dias antes do limite)
   - `vencido`: hoje > limite_ar_go
3. Campos removidos por decisao de negocio (nao usar):
   - `pago_ultimos_12_meses`
   - `ultimo_pagamento`
   - `fase_operacional`
   - `situacao_colegiado`

## 7) Mapeamento por modulo/tela

### A) Controle de Locacao

- A-I Conciliacao SAP/SICLG:
  - `core_contrato`, `core_fornecedor`, `core_conciliacao`
- A-II Painel de Vencimento:
  - `core_contrato`, `core_fornecedor`, `workflow_operacional`, `fact_renovacao_fases`
- A-III Painel de Acoes Renovatorias:
  - `core_contrato`, `integracao_dijur`, `workflow_operacional`

### B) Controle de Renovacoes

- B-a a B-h:
  - base principal em `fact_renovacao_fases`
  - complementos em `core_contrato`, `core_fornecedor`, `workflow_operacional`, `integracao_dijur`

## 8) Enumeracoes sugeridas

- `status_conciliacao`: `conciliado`, `pendente`, `inconsistente`, `sem_par`
- `decisao_operacional`: `prorrogar`, `renegociar`, `encerrar`, `ajuizar_ar`, `em_analise`
- `status_prazo_ar_go`: `no_prazo`, `alerta`, `vencido`
- `fase_atual`:
  - `B-a` aviso_vencimento
  - `B-b` decisao_prorrogacao
  - `B-c` laudo_avaliacao
  - `B-d` negociacao
  - `B-e` demandar_sucot
  - `B-f` contratacao
  - `B-g` renovacao
  - `B-h` aguardar_notificacao

## 9) Proxima entrega tecnica (v2)

- Definir JSON Schema para `core_contrato`, `workflow_operacional`, `integracao_dijur`
- Implementar adaptadores:
  - `sapAdapter`
  - `siclgAdapter`
  - `dijurAdapter`
- Implementar `conciliationEngine` e `renewalRulesEngine`

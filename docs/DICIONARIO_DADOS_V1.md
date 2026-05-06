# Dicionario de Dados v1 - SILIC 2.0

Documento base para integracao e uso de dados no dominio de locacao, considerando:

- Fontes externas: `SAP`, `SICLG`, `DIJUR_API`
- Entradas internas: `INPUT_GESTOR_OPERACIONAL`, `INPUT_GESTOR_FORMAL`
- Campos calculados: `CALCULADO`

## 1) Convencoes

- Chave central de negocio: `imovel_sap`
- Chave tecnica interna: `contrato_uid` (UUID)
- Datas: `YYYY-MM-DD`
- Data/hora: `YYYY-MM-DDTHH:mm:ssZ`
- Documento fiscal normalizado: apenas digitos
- Origem de dado por campo: sempre explicita

### 1.1 Convencao de identificadores SAP x SICLG

- `Imovel (SAP)`: identifica o cadastro do imovel/edificio no SAP. Pode existir desde a prospeccao.
- `Contrato (SICLG)`: identifica o instrumento contratual no SICLG. So existe quando houver instrumento formalizado.
- `Processo (SICLG)`: identifica o processo administrativo no SICLG. Existe quando houver tramitacao administrativa associada.

Regra geral:

- imovel pode existir sem contrato
- contrato nao deve existir sem imovel
- processo pode existir conforme o rito administrativo, mas nao substitui o identificador do imovel

## 2) Entidades canonicas (core)

### 2.1 `core_contrato`

| Campo                  | Label de negocio            | Tipo         | Origem    | Obrigatorio | Uso principal                 | Observacao funcional                                |
| ---------------------- | --------------------------- | ------------ | --------- | ----------- | ----------------------------- | --------------------------------------------------- |
| contrato_uid           | Chave interna               | string(uuid) | CALCULADO | Sim         | Todas as telas                | Identificador tecnico interno                       |
| imovel_sap             | Imovel (SAP)                | string       | SAP       | Sim         | A-I, A-II, A-III, B-a..B-h    | Identificador do cadastro do imovel/edificio no SAP |
| contrato_siclg         | Contrato (SICLG)            | string       | SICLG     | Nao         | A-I, A-II, B-b..B-h           | Identificador do instrumento contratual no SICLG    |
| processo_siclg         | Processo (SICLG)            | string       | SICLG     | Nao         | A-III, B-f, B-g               | Identificador do processo administrativo no SICLG   |
| descricao_imovel_sap   | Descricao do imovel (SAP)   | string       | SAP       | Sim         | A-I, B-c, B-d, B-e, B-h       | Nome/descricao do cadastro do imovel no SAP         |
| descricao_objeto_siclg | Objeto (SICLG)              | string       | SICLG     | Nao         | A-I, A-III                    | Descricao do objeto vinculada ao SICLG              |
| tipo_cadastro_sap      | Tipo do cadastro (SAP)      | string       | SAP       | Nao         | A-I                           | Natureza do cadastro do imovel no SAP               |
| tipo_instrumento_siclg | Tipo de instrumento (SICLG) | string       | SICLG     | Nao         | A-I, B-g                      | Natureza do instrumento contratual                  |
| inicio_vigencia_sap    | Inicio de vigencia (SAP)    | date         | SAP       | Sim         | A-I, B-b, B-c, B-d, B-h       | Inicio de vigencia do cadastro/ocupacao no SAP      |
| fim_vigencia_sap       | Fim de vigencia (SAP)       | date         | SAP       | Sim         | A-II, B-a..B-h                | Fim de vigencia do cadastro/ocupacao no SAP         |
| inicio_vigencia_siclg  | Inicio de vigencia (SICLG)  | date         | SICLG     | Nao         | A-I, B-b, B-h                 | Inicio de vigencia do instrumento no SICLG          |
| fim_vigencia_siclg     | Fim de vigencia (SICLG)     | date         | SICLG     | Nao         | A-II, B-b, B-h                | Fim de vigencia do instrumento no SICLG             |
| situacao_siclg         | Situacao (SICLG)            | string       | SICLG     | Nao         | A-I, A-II, A-III, B-g         | Situacao do instrumento/processo no SICLG           |
| modalidade_siclg       | Modalidade (SICLG)          | string       | SICLG     | Nao         | B-f                           | Modalidade do instrumento/processo                  |
| unidade                | Unidade                     | string       | SAP/SICLG | Nao         | A-II, A-III, B-a..B-h         | Unidade gestora/responsavel                         |
| uf                     | UF                          | string(2)    | SAP       | Nao         | A-II, B-b, B-c, B-d, B-e, B-h | UF do imovel                                        |
| endereco_sap           | Endereco (SAP)              | string       | SAP       | Nao         | A-II                          | Endereco do imovel no SAP                           |

### 2.1.1 Regras por status

| Status do imovel  | Imovel (SAP) | Contrato (SICLG) | Processo (SICLG) | Regra de preenchimento                                                                                      |
| ----------------- | ------------ | ---------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Em Prospeccao     | Sim          | Nao              | Opcional         | Ja existe cadastro do imovel no SAP; ainda nao existe instrumento contratual                                |
| Em Mobilizacao    | Sim          | Opcional         | Sim              | Cadastro SAP obrigatorio; processo administrativo ja pode existir; contrato depende do marco formal adotado |
| Ativo             | Sim          | Sim              | Sim/Opcional     | Imovel e contrato devem existir; processo existe quando houver tramitacao administrativa vinculada          |
| Em Desmobilizacao | Sim          | Sim              | Sim/Opcional     | Identificadores permanecem para controle operacional e encerramento                                         |
| Desativado        | Sim          | Historico        | Historico        | Registros podem permanecer apenas para consulta e auditoria                                                 |

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

1. `limite_ar_go = fim_vigencia_sap - 6 meses` (marco legal da AR, janela 12-6)
2. Janela operacional do gestor para decisao direta de AR: entre 12 e 7 meses antes do fim da vigencia.
3. `status_prazo_ar_go`:
   - `no_prazo`: hoje < limite_ar_go
   - `alerta`: hoje dentro da janela de alerta (ex.: 30 dias antes do limite)
   - `vencido`: hoje > limite_ar_go
4. Campos removidos por decisao de negocio (nao usar):
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

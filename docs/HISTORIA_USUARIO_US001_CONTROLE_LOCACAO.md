# Historia de Usuario - US-001

## Titulo

Consolidar e operar contratos de locacao com conciliacao SAP/SICLG e gestao de renovacoes por fase.

## Contexto

O SILIC 2.0 precisa unificar dados de `SAP` e `SICLG`, permitir acao operacional por perfil e dar visibilidade do ciclo de renovacao contratual (fases B-a a B-h), com integracao ao portal DIJUR.

Este documento deve ser lido em conjunto com:

- `docs/DICIONARIO_DADOS_V1.md`
- `docs/ESTADO_ATUAL_DO_PROJETO.md`
- `docs/BACKLOG_US001_SUBHISTORIAS.md`

## Narrativa

Como usuario da area de Gestao Formal e Gestao Operacional,
quero visualizar contratos consolidados SAP/SICLG, registrar decisoes operacionais e acompanhar fases de renovacao,
para tomar decisoes no prazo, reduzir inconsistencias e manter rastreabilidade ponta a ponta.

## Perfis envolvidos

- Gestor Formal
- Gestor Operacional
- Demandante
- Contratacao

## Escopo funcional coberto por esta historia

- A-I Conciliação SAP/SICLG
- A-II Painel de Vencimento
- A-III Painel de Acoes Renovatorias (com dados da DIJUR API)
- B-a a B-h Controle de Renovacoes por fase

## Regras de negocio obrigatorias

1. Chave de conciliacao principal: `contrato_sap`.
2. Campos removidos por decisao de negocio (nao usar):
   - `pago_ultimos_12_meses`
   - `ultimo_pagamento`
   - `fase_operacional`
   - `situacao_colegiado`
3. `decisao_operacional`, `houve_acordo`, `incluir_no_siclg` sao inputs do perfil `Gestor Operacional`.
4. `radar_sucot` e `notas` sao inputs do perfil `Gestor Formal`.
5. `codigo_sijur` e `situacao_sijur/cefor` sao fornecidos por `DIJUR_API`.
6. Regra de prazo: `limite_ar_go = fim_vigencia_sap - 6 meses`.

## Criterios de aceite (Given/When/Then)

### CA-01 - Conciliacao SAP/SICLG

- Given contratos carregados de SAP e SICLG
- When o usuario abrir o modulo A-I
- Then o sistema deve exibir status de conciliacao por contrato (`conciliado`, `pendente`, `inconsistente`, `sem_par`) e filtros definidos para gestao formal.

### CA-02 - Painel de vencimento

- Given contratos com vigencia SAP e/ou SICLG
- When o usuario aplicar filtros de A-II
- Then o sistema deve retornar a lista filtrada por contrato, UF, locador, decisao operacional, demanda e situacao SICLG.

### CA-03 - Inputs de Gestor Operacional

- Given um contrato elegivel para acao
- When o Gestor Operacional registrar `decisao_operacional`, `houve_acordo` e `incluir_no_siclg`
- Then os dados devem ser persistidos com trilha de auditoria (`updated_by`, `updated_at`) e refletidos nos paineis B-d, B-e e B-h.

### CA-04 - Inputs de Gestor Formal

- Given um contrato em fase de acompanhamento
- When o Gestor Formal registrar `radar_sucot` e `notas`
- Then os dados devem ser persistidos com auditoria e exibidos nos paineis B-f e B-g.

### CA-05 - Integracao DIJUR

- Given a API DIJUR disponivel
- When ocorrer sincronizacao do contrato
- Then `codigo_sijur`, `situacao_sijur` e `situacao_cefor` devem ser atualizados e exibidos no painel A-III.

### CA-06 - Regra de limite AR G.O.

- Given `fim_vigencia_sap` preenchida
- When o sistema calcular os indicadores de prazo
- Then deve calcular `limite_ar_go` em D-180 e classificar `status_prazo_ar_go` como `no_prazo`, `alerta` ou `vencido`.

### CA-07 - Rastreabilidade de origem

- Given qualquer campo apresentado nos paineis
- When o usuario ou auditor inspecionar o dado
- Then a origem deve ser identificavel (`SAP`, `SICLG`, `DIJUR_API`, `INPUT_GESTOR_OPERACIONAL`, `INPUT_GESTOR_FORMAL`, `CALCULADO`).

## Fora de escopo desta historia

- Integracoes de pagamento SAP (12 meses e ultimo pagamento)
- Fase operacional e situacao colegiado
- Regras juridicas detalhadas alem da janela de 6 meses para AR

## Definicao de pronto (DoD)

1. Dados modelados conforme `docs/DICIONARIO_DADOS_V1.md`.
2. Criterios de aceite CA-01 a CA-07 validados.
3. Perfis e permissoes aplicados para campos de input.
4. Logs de auditoria ativos para alteracoes manuais.
5. Documentacao atualizada (historia + dicionario + estado atual).

## Riscos e observacoes

- Qualidade de conciliacao depende da consistencia de `contrato_sap` nas fontes.
- Integracao DIJUR deve ter politica de retentativa e carimbo de ultima sincronizacao.
- Campos de input manual exigem governanca de perfil para evitar inconsistencias operacionais.

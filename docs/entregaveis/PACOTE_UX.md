# Pacote de Envio - UX

Objetivo: permitir que UX converta o prototipo de baixa fidelidade em prototipo de alta fidelidade no Figma, mantendo aderencia funcional.

## O que enviar para UX

1. `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
2. `docs/BACKLOG_US001_SUBHISTORIAS.md`
3. `docs/DICIONARIO_DADOS_V1.md`
4. `docs/DIAGRAMA_VISUAL.md`
5. `docs/ARQUITETURA_GESTAO_IMOVEIS.md`

## Escopo que UX deve cobrir no Figma

1. Modulo A-I: Conciliacao SAP/SICLG.
2. Modulo A-II: Painel de Vencimento.
3. Modulo A-III: Acoes Renovatorias.
4. Fluxos B-a a B-h: Controle de Renovacoes.
5. Perfis de uso:
   - Gestor Operacional
   - Gestor Formal

## Regras obrigatorias para UX respeitar

1. Campos fora de escopo nao devem aparecer:
   - `pago_ultimos_12_meses`
   - `ultimo_pagamento`
   - `fase_operacional`
   - `situacao_colegiado`
2. Inputs por perfil:
   - Gestor Operacional: `decisao_operacional`, `houve_acordo`, `incluir_no_siclg`
   - Gestor Formal: `radar_sucot`, `notas`
3. Regra de prazo visualmente representada: `limite_ar_go = fim_vigencia_sap - 6 meses` (D-180).

## Entregavel esperado de UX

1. Link Figma com paginas por modulo (A-I, A-II, A-III e B-a..B-h).
2. Componentes padronizados (tabela, filtros, tags de status, formulario de input).
3. Variacoes por perfil (Gestor Operacional x Gestor Formal).
4. Estados de tela:
   - vazio
   - carregando
   - erro de integracao
   - dados inconsistentes
5. Notas de interacao para handoff ao Analista de Requisitos.

## Checklist rapido de aceite do pacote UX

1. Existe cobertura dos tres paineis A.
2. Existe cobertura minima dos fluxos B.
3. Regras de perfil e D-180 estao visiveis.
4. Campos removidos nao aparecem no prototipo.

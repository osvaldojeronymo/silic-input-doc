# Pacote de Envio - UX

Objetivo: permitir que UX converta o protótipo de baixa fidelidade em protótipo de alta fidelidade no Figma, mantendo aderência funcional.

## O que enviar para UX

1. `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
2. `docs/BACKLOG_US001_SUBHISTORIAS.md`
3. `docs/DICIONARIO_DADOS_V1.md`
4. `docs/DIAGRAMA_VISUAL.md`
5. `docs/ARQUITETURA_GESTAO_IMOVEIS.md`

## Escopo que UX deve cobrir no Figma

1. Módulo A-I: Conciliação SAP/SICLG.
2. Módulo A-II: Painel de Vencimento.
3. Módulo A-III: Ações Renovatórias.
4. Fluxos B-a a B-h: Controle de Renovações.
5. Perfis de uso:
   - Gestor Operacional
   - Gestor Formal

## Regras obrigatórias para UX respeitar

1. Campos fora de escopo não devem aparecer:
   - `pago_ultimos_12_meses`
   - `ultimo_pagamento`
   - `fase_operacional`
   - `situacao_colegiado`
2. Inputs por perfil:
   - Gestor Operacional: `decisao_operacional`, `houve_acordo`, `incluir_no_siclg`
   - Gestor Formal: `radar_sucot`, `notas`
3. Regra de prazo AR visualmente representada: janela legal 12-6 (`limite_ar_go = fim_vigencia_sap - 6 meses`) e janela operacional do gestor 12-7.

## Entregável esperado de UX

1. Link Figma com páginas por módulo (A-I, A-II, A-III e B-a..B-h).
2. Componentes padronizados (tabela, filtros, tags de status, formulário de input).
3. Variações por perfil (Gestor Operacional x Gestor Formal).
4. Estados de tela:
   - vazio
   - carregando
   - erro de integração
   - dados inconsistentes
5. Notas de interação para handoff ao Analista de Requisitos.

## Checklist rápido de aceite do pacote UX

1. Existe cobertura dos três painéis A.
2. Existe cobertura mínima dos fluxos B.
3. Regras de perfil e de prazo AR (legal 12-6 + operacional 12-7) estão visíveis.
4. Campos removidos não aparecem no protótipo.

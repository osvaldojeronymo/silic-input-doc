# Resumo Executivo de Handoff - SILIC 2.0

## Objetivo

Formalizar o encaminhamento do módulo de Controle de Locação do SILIC 2.0 entre os atores de entrega:

1. UX
2. Analista de Requisitos
3. Desenvolvedores (fábrica de software)

## Contexto

O protótipo atual deve ser tratado como baixa fidelidade. A partir dele, será produzido um protótipo de alta fidelidade no Figma, que servirá de base para consolidação de requisitos e posterior solicitação de desenvolvimento.

## Fluxo de encaminhamento aprovado

1. Envio para UX:
   - Entrada: documentação funcional e de dados já consolidada.
   - Saída: protótipo de alta fidelidade no Figma.
2. Envio para Analista de Requisitos:
   - Entrada: Figma + documentação atualizada.
   - Saída: especificação funcional aprovada e rastreável.
3. Envio para Desenvolvedores:
   - Entrada: requisitos aprovados + Figma final + backlog priorizado.
   - Saída: implementação do módulo conforme escopo.

## Entregaveis ja preparados

- Plano de entrega por ator: `docs/ENTREGA_POR_ATOR.md`
- Pacote UX: `docs/entregaveis/PACOTE_UX.md`
- Pacote Analista de Requisitos: `docs/entregaveis/PACOTE_ANALISTA_REQUISITOS.md`
- Pacote Desenvolvedores: `docs/entregaveis/PACOTE_DESENVOLVEDORES.md`
- Checklist de envio: `docs/entregaveis/CHECKLIST_ENVIO.md`
- Modelos de e-mail: `docs/entregaveis/MODELOS_EMAIL_ENCAMINHAMENTO.md`

## Conteúdo técnico base da demanda

- História principal: `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
- Backlog de sub-historias: `docs/BACKLOG_US001_SUBHISTORIAS.md`
- Dicionario de dados v1: `docs/DICIONARIO_DADOS_V1.md`
- Estado atual do projeto: `docs/ESTADO_ATUAL_DO_PROJETO.md`

## Regras criticas que devem ser preservadas

1. Chave de conciliacao: `contrato_sap`.
2. Regra de prazo AR: janela legal 12-6 (`limite_ar_go = fim_vigencia_sap - 6 meses`) e janela operacional do gestor 12-7.
3. Inputs por perfil:
   - Gestor Operacional: `decisao_operacional`, `houve_acordo`, `incluir_no_siclg`
   - Gestor Formal: `radar_sucot`, `notas`
4. Campos fora de escopo não devem ser implementados:
   - `pago_ultimos_12_meses`
   - `ultimo_pagamento`
   - `fase_operacional`
   - `situacao_colegiado`

## Decisão executiva solicitada

Aprovar o fluxo de handoff e autorizar a continuidade nas etapas:

1. UX (alta fidelidade no Figma)
2. Analista de Requisitos (especificação e validação)
3. Fábrica (implementação do módulo)

## Status

- Documentação estruturada e segregada por ator: concluído.
- Pronta para envio formal: sim.

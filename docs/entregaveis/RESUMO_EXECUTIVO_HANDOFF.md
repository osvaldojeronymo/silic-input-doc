# Resumo Executivo de Handoff - SILIC 2.0

## Objetivo

Formalizar o encaminhamento do modulo de Controle de Locacao do SILIC 2.0 entre os atores de entrega:

1. UX
2. Analista de Requisitos
3. Desenvolvedores (fabrica de software)

## Contexto

O prototipo atual deve ser tratado como baixa fidelidade. A partir dele, sera produzido um prototipo de alta fidelidade no Figma, que servira de base para consolidacao de requisitos e posterior solicitacao de desenvolvimento.

## Fluxo de encaminhamento aprovado

1. Envio para UX:
   - Entrada: documentacao funcional e de dados ja consolidada.
   - Saida: prototipo de alta fidelidade no Figma.
2. Envio para Analista de Requisitos:
   - Entrada: Figma + documentacao atualizada.
   - Saida: especificacao funcional aprovada e rastreavel.
3. Envio para Desenvolvedores:
   - Entrada: requisitos aprovados + Figma final + backlog priorizado.
   - Saida: implementacao do modulo conforme escopo.

## Entregaveis ja preparados

- Plano de entrega por ator: `docs/ENTREGA_POR_ATOR.md`
- Pacote UX: `docs/entregaveis/PACOTE_UX.md`
- Pacote Analista de Requisitos: `docs/entregaveis/PACOTE_ANALISTA_REQUISITOS.md`
- Pacote Desenvolvedores: `docs/entregaveis/PACOTE_DESENVOLVEDORES.md`
- Checklist de envio: `docs/entregaveis/CHECKLIST_ENVIO.md`
- Modelos de e-mail: `docs/entregaveis/MODELOS_EMAIL_ENCAMINHAMENTO.md`

## Conteudo tecnico base da demanda

- Historia principal: `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
- Backlog de sub-historias: `docs/BACKLOG_US001_SUBHISTORIAS.md`
- Dicionario de dados v1: `docs/DICIONARIO_DADOS_V1.md`
- Estado atual do projeto: `docs/ESTADO_ATUAL_DO_PROJETO.md`

## Regras criticas que devem ser preservadas

1. Chave de conciliacao: `contrato_sap`.
2. Regra de prazo: `limite_ar_go = fim_vigencia_sap - 6 meses`.
3. Inputs por perfil:
   - Gestor Operacional: `decisao_operacional`, `houve_acordo`, `incluir_no_siclg`
   - Gestor Formal: `radar_sucot`, `notas`
4. Campos fora de escopo nao devem ser implementados:
   - `pago_ultimos_12_meses`
   - `ultimo_pagamento`
   - `fase_operacional`
   - `situacao_colegiado`

## Decisao executiva solicitada

Aprovar o fluxo de handoff e autorizar a continuidade nas etapas:

1. UX (alta fidelidade no Figma)
2. Analista de Requisitos (especificacao e validacao)
3. Fabrica (implementacao do modulo)

## Status

- Documentacao estruturada e segregada por ator: concluido.
- Pronta para envio formal: sim.

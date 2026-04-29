# Ofício de Encaminhamento - Handoff SILIC 2.0

Ofício no: [preencher]
Data: [preencher]
Unidade: [preencher]
Interessado: [preencher]
Assunto: Encaminhamento de protótipo e documentação para continuidade do módulo de Controle de Locação - SILIC 2.0.

A(o) Senhor(a)
[Nome do destinatario]
[Cargo]
[Área]

Senhor(a),

1. Encaminhamos, para conhecimento e providências, o conjunto documental referente ao módulo de Controle de Locação do projeto SILIC 2.0, observando o fluxo institucional de handoff entre os atores UX, Analista de Requisitos e Desenvolvimento.

2. Registra-se que o protótipo atual possui natureza de baixa fidelidade, devendo servir como insumo para elaboração de protótipo de alta fidelidade na ferramenta Figma, com posterior consolidação de requisitos e encaminhamento para implementação pela fábrica de software.

3. O fluxo de encaminhamento aprovado contempla as etapas abaixo:

3.1 UX:

- Receber pacote funcional e de dados.
- Elaborar protótipo de alta fidelidade no Figma, com cobertura dos painéis A-I, A-II, A-III e fluxos B-a a B-h.

  3.2 Analista de Requisitos:

- Receber protótipo Figma e documentação consolidada.
- Produzir especificação funcional rastreável e backlog técnico priorizado.

  3.3 Desenvolvimento (fábrica):

- Receber requisitos aprovados, protótipo final e artefatos de apoio.
- Executar implementação conforme escopo validado.

4. Documentos e referências encaminhados:

4.1 Plano e governança de entrega:

- `docs/ENTREGA_POR_ATOR.md`
- `docs/entregaveis/CHECKLIST_ENVIO.md`

  4.2 Pacotes por público:

- `docs/entregaveis/PACOTE_UX.md`
- `docs/entregaveis/PACOTE_ANALISTA_REQUISITOS.md`
- `docs/entregaveis/PACOTE_DESENVOLVEDORES.md`

  4.3 Base funcional e técnica:

- `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
- `docs/BACKLOG_US001_SUBHISTORIAS.md`
- `docs/DICIONARIO_DADOS_V1.md`
- `docs/ESTADO_ATUAL_DO_PROJETO.md`
- `docs/DIAGRAMA_VISUAL.md`

  4.4 Apoio ao encaminhamento:

- `docs/entregaveis/MODELOS_EMAIL_ENCAMINHAMENTO.md`
- `docs/entregaveis/RESUMO_EXECUTIVO_HANDOFF.md`

5. Diretrizes obrigatórias para preservação no ciclo de entrega:

5.1 Chave de conciliação principal: `contrato_sap`.

5.2 Regra de prazo AR: janela legal 12-6 (`limite_ar_go = fim_vigencia_sap - 6 meses`) e janela operacional do gestor 12-7.

5.3 Segregação de input por perfil:

- Gestor Operacional: `decisao_operacional`, `houve_acordo`, `incluir_no_siclg`.
- Gestor Formal: `radar_sucot`, `notas`.

  5.4 Campos fora de escopo que não devem ser reintroduzidos:

- `pago_ultimos_12_meses`
- `ultimo_pagamento`
- `fase_operacional`
- `situacao_colegiado`

6. Diante do exposto, solicita-se:

6.1 A ciência e aprovação deste encaminhamento.

6.2 A continuidade do fluxo, conforme responsabilidade de cada ator.

6.3 A confirmação formal de recebimento e do cronograma de execução da etapa subsequente.

Atenciosamente,

[Nome da autoridade]
[Cargo]
[Unidade]
[Contato]

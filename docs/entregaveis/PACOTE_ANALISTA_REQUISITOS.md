# Pacote de Envio - Analista de Requisitos

Objetivo: consolidar requisitos funcionais e não funcionais para abertura formal de demanda para desenvolvimento.

## O que enviar para Analista de Requisitos

1. Protótipo de alta fidelidade no Figma (produzido pelo UX).
2. `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
3. `docs/BACKLOG_US001_SUBHISTORIAS.md`
4. `docs/DICIONARIO_DADOS_V1.md`
5. `docs/ESTADO_ATUAL_DO_PROJETO.md`
6. `docs/ENTREGA_POR_ATOR.md`

## O que o Analista deve produzir

1. Especificação funcional consolidada por módulo:
   - A-I
   - A-II
   - A-III
   - B-a..B-h
2. Matriz de rastreabilidade:
   - critério de aceite -> tela/protótipo -> regra de negócio -> item de backlog
3. Especificação de integrações:
   - SAP
   - SICLG
   - DIJUR API
4. Requisitos não funcionais mínimos:
   - auditoria
   - rastreabilidade de origem
   - tratamento de falha de integração

## Regras de negócio que devem constar explicitamente

1. Chave principal de conciliacao: `contrato_sap`.
2. Regra de prazo AR: janela legal 12-6 (`limite_ar_go = fim_vigencia_sap - 6 meses`) e janela operacional do gestor 12-7.
3. Inputs por perfil:
   - Gestor Operacional
   - Gestor Formal
4. Campos removidos por decisão de negócio não devem reaparecer.

## Entregável esperado para repasse ao desenvolvimento

1. Documento de requisitos aprovado.
2. Backlog técnico priorizado (mínimo P0 e P1).
3. Mapa de dados fonte -> campo canônico -> tela.
4. Critérios de aceite testáveis por história/sub-história.

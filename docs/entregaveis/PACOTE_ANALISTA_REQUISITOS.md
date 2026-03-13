# Pacote de Envio - Analista de Requisitos

Objetivo: consolidar requisitos funcionais e nao funcionais para abertura formal de demanda para desenvolvimento.

## O que enviar para Analista de Requisitos

1. Prototipo de alta fidelidade no Figma (produzido pelo UX).
2. `docs/HISTORIA_USUARIO_US001_CONTROLE_LOCACAO.md`
3. `docs/BACKLOG_US001_SUBHISTORIAS.md`
4. `docs/DICIONARIO_DADOS_V1.md`
5. `docs/ESTADO_ATUAL_DO_PROJETO.md`
6. `docs/ENTREGA_POR_ATOR.md`

## O que o Analista deve produzir

1. Especificacao funcional consolidada por modulo:
   - A-I
   - A-II
   - A-III
   - B-a..B-h
2. Matriz de rastreabilidade:
   - criterio de aceite -> tela/prototipo -> regra de negocio -> item de backlog
3. Especificacao de integracoes:
   - SAP
   - SICLG
   - DIJUR API
4. Requisitos nao funcionais minimos:
   - auditoria
   - rastreabilidade de origem
   - tratamento de falha de integracao

## Regras de negocio que devem constar explicitamente

1. Chave principal de conciliacao: `contrato_sap`.
2. Regra D-180: `limite_ar_go = fim_vigencia_sap - 6 meses`.
3. Inputs por perfil:
   - Gestor Operacional
   - Gestor Formal
4. Campos removidos por decisao de negocio nao devem reaparecer.

## Entregavel esperado para repasse ao desenvolvimento

1. Documento de requisitos aprovado.
2. Backlog tecnico priorizado (minimo P0 e P1).
3. Mapa de dados fonte -> campo canonico -> tela.
4. Criterios de aceite testaveis por historia/sub-historia.

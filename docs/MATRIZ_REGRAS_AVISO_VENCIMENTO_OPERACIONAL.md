# Matriz de Regras - Aviso de Vencimento (Perfil Operacional)

Documento de handoff para UX, Analista e Desenvolvimento.
Objetivo: padronizar classificacao, prioridade, SLA e acoes operacionais no bloco Aviso de Vencimento.

Observacao: este documento define regra operacional de produto. Validacao juridica deve ser feita com DIJUR.

## 1) Blocos de navegacao no topo (Perfil Operacional)

1. Passos da sua Jornada
2. Aviso de Vencimento

Regra estrutural:

- Aviso de Vencimento e uma fila operacional paralela.
- Nao e fase da jornada.

## 2) Matriz principal de classificacao por janela

| Faixa                         | Criterio (dias para vencimento) | Rotulo de exibicao | Cor sugerida     | Prioridade                   | SLA primeira acao | Acao recomendada                                            | Escalonamento                           |
| ----------------------------- | ------------------------------: | ------------------ | ---------------- | ---------------------------- | ----------------- | ----------------------------------------------------------- | --------------------------------------- |
| 1 ano                         |                       181 a 365 | D-365 ate D-181    | Azul             | Baixa                        | 15 dias uteis     | Monitorar contrato e validar dados                          | Sem escalonamento automatico            |
| 6 meses                       |                        91 a 180 | D-180 ate D-91     | Ciano            | Baixa-media                  | 10 dias uteis     | Iniciar preparacao de estrategia de renovacao               | Coordenacao regional se sem tratativa   |
| 3 meses                       |                         61 a 90 | D-90 ate D-61      | Amarelo          | Media                        | 5 dias uteis      | Definir estrategia: prorrogar ou nao                        | Escalar para gestor da carteira         |
| 2 meses                       |                         31 a 60 | D-60 ate D-31      | Laranja          | Alta                         | 3 dias uteis      | Abrir tratativa formal e registrar decisao preliminar       | Escalar para gestor senior              |
| 1 mes                         |                          1 a 30 | D-30 ate D-1       | Vermelho         | Muito alta                   | 1 dia util        | Consolidar decisao e disparar fluxo correspondente          | Escalar para governance operacional     |
| Menor que 1 mes               |             1 a 29 (exibir D-N) | D-29 ... D-1       | Vermelho intenso | Critica                      | Mesmo dia         | Acao imediata com dono e prazo definidos                    | Escalar automaticamente em 24h sem acao |
| Vencido (prazo indeterminado) |               <= 0 (exibir D+N) | D+1, D+2...        | Roxo/Preto       | Critica juridico-operacional | Mesmo dia         | Tratar continuidade em prazo indeterminado com plano formal | Escalar por tempo em D+N                |

## 3) Regra especifica para vencidos (prazo indeterminado)

Premissa de negocio:

- Contrato vencido nao some da fila.
- Ele migra para a faixa Vencido (prazo indeterminado).
- Continua elegivel para decisao operacional.

Subfaixas recomendadas para vencido:

| Subfaixa vencido   |     Criterio | Risco      | SLA        | Acao obrigatoria                                  |
| ------------------ | -----------: | ---------- | ---------- | ------------------------------------------------- |
| Vencido inicial    |   D+1 a D+30 | Alto       | 1 dia util | Registrar estrategia pos-vencimento e responsavel |
| Vencido recorrente |  D+31 a D+90 | Muito alto | 24h        | Escalonar para gestor senior + juridico           |
| Vencido prolongado | D+91 ou mais | Critico    | Imediato   | Plano de contingencia com decisao executiva       |

## 4) Arvore de decisao operacional (resumo)

1. Se contrato esta em D-365 a D-31:

- Classificar faixa.
- Definir dono.
- Criar proxima acao com prazo.

2. Se contrato esta em D-30 a D-1:

- Tornar prioridade critica.
- Exigir decisao de prorrogar (sim/nao) com justificativa.

3. Se contrato passou para D+N:

- Mover para faixa Vencido (prazo indeterminado).
- Exigir estrategia pos-vencimento:
  - formalizar aditivo
  - manter por prazo indeterminado temporariamente
  - encerrar contratacao

4. Se sem acao no prazo:

- Escalonar automaticamente conforme matriz.

## 5) Campos minimos de dados (modelo escalavel)

| Campo                   | Tipo     | Obrigatorio | Regra                                                                         |
| ----------------------- | -------- | ----------- | ----------------------------------------------------------------------------- |
| contratoId              | string   | Sim         | Chave canonica                                                                |
| dataFimPrazoDeterminado | date     | Sim         | Base para calculo D-N/D+N                                                     |
| diasParaVencimento      | inteiro  | Sim         | Negativo para vencido                                                         |
| faixaVencimento         | enum     | Sim         | 1_ano, 6_meses, 3_meses, 2_meses, 1_mes, menor_1_mes, vencido                 |
| statusJuridicoLocacao   | enum     | Sim         | prazo_determinado, prazo_indeterminado_regular, prazo_indeterminado_com_risco |
| decisaoProrrogacao      | enum     | Sim         | sim, nao, pendente                                                            |
| estrategiaPosVencimento | enum     | Condicional | obrigatorio quando faixa = vencido                                            |
| dataDecisao             | datetime | Condicional | obrigatorio apos decisao                                                      |
| responsavelAtual        | string   | Sim         | dono da proxima acao                                                          |
| proximaAcao             | string   | Sim         | descricao curta acionavel                                                     |
| prazoProximaAcao        | date     | Sim         | base para SLA                                                                 |
| nivelEscalonamento      | inteiro  | Sim         | 0,1,2,3                                                                       |

## 6) Regras de UX para o bloco Aviso de Vencimento

1. Exibir chips de filtro rapido por faixa no topo.
2. Exibir contador por faixa (incluindo vencido).
3. Para Menor que 1 mes, mostrar D-N em destaque.
4. Para Vencido, mostrar D+N em destaque com alerta juridico-operacional.
5. Sempre mostrar coluna Proxima acao e Prazo.
6. Exigir justificativa quando decisao for nao prorrogar.

## 6.1) Regra complementar: Laudo de avaliacao do imovel

Premissas de negocio:

- Laudo de avaliacao e obrigatorio para contratacoes na modalidade locacao.
- Para cessao e comodato, laudo fica como nao aplicavel no bloco operacional.
- Validade do laudo: ate 12 meses a partir da emissao.
- O laudo deve permanecer valido ate o encerramento da negociacao do valor de locacao com o locador.
- Novo laudo pode ser solicitado antes de 12 meses quando houver variacao conjuntural relevante no mercado imobiliario da regiao.

Regra de execucao na faixa Preparacao (14-12 meses):

1. Para modalidade locacao, o sistema deve perguntar: "Ja possui laudo de avaliacao valido?".
2. Se resposta for "Nao", registrar status e acionar botao/acao "Solicitar laudo a area responsavel".
3. Se resposta for "Sim", manter monitoramento para evitar vencimento do laudo durante a negociacao.

Estados operacionais recomendados para o laudo:

- nao_solicitado
- solicitado (Requisicao do laudo - n. XXXXXXX em DD/MM/AAAA)
- entregue (validade dentro de 12 meses)
- vencido

Regras operacionais adicionais implementadas no prototipo:

- Dados insuficientes de vigencia: quando nao houver data valida de fim de vigencia, bloquear decisoes e sinalizar saneamento cadastral.
- Reabertura de decisao de prorrogacao (prorrogar <-> nao_prorrogar): exigir justificativa obrigatoria e registrar trilha de auditoria.
- Protocolo formal existente: manter decisao travada em prorrogar e informar que o fluxo ja foi encaminhado para Gestao Formal.
- Alerta automatico AR (8-7 meses): sinalizar contratos sem decisao de acao renovatoria para escalonamento preventivo.

SLA operacional do laudo:

- Prazo padrao: ate 30 dias para emissao, quando documentacao estiver completa e acesso ao imovel estiver liberado.
- Excecao por complexidade/volume: registrar prazo formal informado pela area responsavel e manter trilha de auditoria no contrato.

## 7) KPIs recomendados

1. Total em D-30.
2. Total em Vencido (D+N).
3. Tempo medio em prazo indeterminado.
4. Percentual com decisao registrada.
5. Percentual com SLA estourado.

## 8) Critrios de aceite para implementacao

1. Contrato nao desaparece ao vencer; muda para faixa Vencido.
2. Painel mostra D-N e D+N corretamente.
3. Escalonamento e disparado quando SLA expira.
4. Decisao e estrategia ficam auditaveis por contrato.
5. Bloco Aviso de Vencimento permanece separado de Passos da Jornada.

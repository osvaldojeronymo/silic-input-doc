# Matriz de Regras - Aviso de Vencimento (Perfil Operacional)

Documento de handoff para UX, Analista e Desenvolvimento.
Objetivo: padronizar classificação, prioridade, SLA e ações operacionais no bloco Aviso de Vencimento.

Observação: este documento define regra operacional de produto. Validação jurídica deve ser feita com DIJUR.

## 1) Blocos de navegação no topo (Perfil Operacional)

1. Passos da sua Jornada
2. Aviso de Vencimento

Regra estrutural:

- Aviso de Vencimento é uma fila operacional paralela.
- Não é fase da jornada.

## 2) Matriz principal de classificação por janela

| Faixa                         | Critério (dias para vencimento) | Rótulo de exibição | Cor sugerida     | Prioridade                   | SLA primeira ação | Ação recomendada                                            | Escalonamento                           |
| ----------------------------- | ------------------------------: | ------------------ | ---------------- | ---------------------------- | ----------------- | ----------------------------------------------------------- | --------------------------------------- |
| 1 ano                         |                       181 a 365 | D-365 até D-181    | Azul             | Baixa                        | 15 dias úteis     | Monitorar contrato e validar dados                          | Sem escalonamento automático            |
| 6 meses                       |                        91 a 180 | D-180 até D-91     | Ciano            | Baixa-média                  | 10 dias úteis     | Iniciar preparação de estratégia de renovação               | Coordenação regional se sem tratativa   |
| 3 meses                       |                         61 a 90 | D-90 até D-61      | Amarelo          | Média                        | 5 dias úteis      | Definir estratégia: prorrogar ou não                        | Escalar para gestor da carteira         |
| 2 meses                       |                         31 a 60 | D-60 até D-31      | Laranja          | Alta                         | 3 dias úteis      | Abrir tratativa formal e registrar decisão preliminar       | Escalar para gestor sênior              |
| 1 mês                         |                          1 a 30 | D-30 até D-1       | Vermelho         | Muito alta                   | 1 dia útil        | Consolidar decisão e disparar fluxo correspondente          | Escalar para governança operacional     |
| Menor que 1 mês               |             1 a 29 (exibir D-N) | D-29 ... D-1       | Vermelho intenso | Crítica                      | Mesmo dia         | Ação imediata com dono e prazo definidos                    | Escalar automaticamente em 24h sem ação |
| Vencido (prazo indeterminado) |               <= 0 (exibir D+N) | D+1, D+2...        | Roxo/Preto       | Crítica jurídico-operacional | Mesmo dia         | Tratar continuidade em prazo indeterminado com plano formal | Escalar por tempo em D+N                |

## 3) Regra específica para vencidos (prazo indeterminado)

Premissa de negócio:

- Contrato vencido não some da fila.
- Ele migra para a faixa Vencido (prazo indeterminado).
- Continua elegível para decisão operacional.

Subfaixas recomendadas para vencido:

| Subfaixa vencido   |     Critério | Risco      | SLA        | Ação obrigatória                                  |
| ------------------ | -----------: | ---------- | ---------- | ------------------------------------------------- |
| Vencido inicial    |   D+1 a D+30 | Alto       | 1 dia útil | Registrar estratégia pós-vencimento e responsável |
| Vencido recorrente |  D+31 a D+90 | Muito alto | 24h        | Escalonar para gestor sênior + jurídico           |
| Vencido prolongado | D+91 ou mais | Crítico    | Imediato   | Plano de contingência com decisão executiva       |

## 4) Árvore de decisão operacional (resumo)

1. Se contrato está em D-365 a D-31:

- Classificar faixa.
- Definir dono.
- Criar próxima ação com prazo.

2. Se contrato está em D-30 a D-1:

- Tornar prioridade crítica.
- Exigir decisão de prorrogar (sim/não) com justificativa.

3. Se contrato passou para D+N:

- Mover para faixa Vencido (prazo indeterminado).
- Exigir estratégia pós-vencimento:
  - formalizar aditivo
  - manter por prazo indeterminado temporariamente
  - encerrar contratação

4. Se sem ação no prazo:

- Escalonar automaticamente conforme matriz.

## 5) Campos mínimos de dados (modelo escalável)

| Campo                   | Tipo     | Obrigatório | Regra                                                                         |
| ----------------------- | -------- | ----------- | ----------------------------------------------------------------------------- |
| contratoId              | string   | Sim         | Chave canônica                                                                |
| dataFimPrazoDeterminado | date     | Sim         | Base para cálculo D-N/D+N                                                     |
| diasParaVencimento      | inteiro  | Sim         | Negativo para vencido                                                         |
| faixaVencimento         | enum     | Sim         | 1_ano, 6_meses, 3_meses, 2_meses, 1_mes, menor_1_mes, vencido                 |
| statusJuridicoLocacao   | enum     | Sim         | prazo_determinado, prazo_indeterminado_regular, prazo_indeterminado_com_risco |
| decisaoProrrogacao      | enum     | Sim         | sim, nao, pendente                                                            |
| estrategiaPosVencimento | enum     | Condicional | obrigatório quando faixa = vencido                                            |
| dataDecisao             | datetime | Condicional | obrigatório após decisão                                                      |
| responsavelAtual        | string   | Sim         | dono da próxima ação                                                          |
| proximaAcao             | string   | Sim         | descrição curta acionável                                                     |
| prazoProximaAcao        | date     | Sim         | base para SLA                                                                 |
| nivelEscalonamento      | inteiro  | Sim         | 0,1,2,3                                                                       |

## 6) Regras de UX para o bloco Aviso de Vencimento

Padrão de rótulos no painel (alinhado ao produto):

- Planejamento antecipado (14 a mais de 12 meses)
- Momento de decidir sobre a AR (12 a 7 meses)
- Atenção imediata (menos de 7 meses)

1. Exibir chips de filtro rápido por faixa no topo.
2. Exibir contador por faixa (incluindo vencido).
3. Para Menor que 1 mês, mostrar D-N em destaque.
4. Para Vencido, mostrar D+N em destaque com alerta jurídico-operacional.
5. Sempre mostrar coluna Próxima ação e Prazo.
6. Exigir justificativa quando decisão for não prorrogar.

## 6.1) Regra complementar: Laudo de avaliação do imóvel

Premissas de negócio:

- Laudo de avaliação é obrigatório para contratações na modalidade locação.
- Para cessão e comodato, laudo fica como não aplicável no bloco operacional.
- Validade do laudo: até 12 meses a partir da emissão.
- O laudo deve permanecer válido até o encerramento da negociação do valor de locação com o locador.
- Novo laudo pode ser solicitado antes de 12 meses quando houver variação conjuntural relevante no mercado imobiliário da região.

Regra de execução na faixa Planejamento antecipado (14 a mais de 12 meses):

1. Para modalidade locação, o sistema deve perguntar: "Já possui laudo de avaliação válido?".
2. Se resposta for "Não", registrar status e acionar botão/ação "Solicitar laudo à área responsável".
3. Se resposta for "Sim", manter monitoramento para evitar vencimento do laudo durante a negociação.

Estados operacionais recomendados para o laudo:

- nao_solicitado
- solicitado (Requisição do laudo - n. XXXXXXX em DD/MM/AAAA)
- entregue (validade dentro de 12 meses)
- vencido

Regras operacionais adicionais implementadas no protótipo:

- Dados insuficientes de vigência: quando não houver data válida de fim de vigência, bloquear decisões e sinalizar saneamento cadastral.
- Reabertura de decisão de prorrogação (prorrogar <-> nao_prorrogar): exigir justificativa obrigatória e registrar trilha de auditoria.
- Protocolo formal existente: manter decisão travada em prorrogar e informar que o fluxo já foi encaminhado para Gestão Formal.
- Alerta automático AR (8-7 meses): sinalizar contratos com AR pendente para escalonamento preventivo.

SLA operacional do laudo:

- Prazo padrão: até 30 dias para emissão, quando documentação estiver completa e acesso ao imóvel estiver liberado.
- Exceção por complexidade/volume: registrar prazo formal informado pela área responsável e manter trilha de auditoria no contrato.

## 7) KPIs recomendados

1. Total em D-30.
2. Total em Vencido (D+N).
3. Tempo médio em prazo indeterminado.
4. Percentual com decisão registrada.
5. Percentual com SLA estourado.

## 8) Critérios de aceite para implementação

1. Contrato não desaparece ao vencer; muda para faixa Vencido.
2. Painel mostra D-N e D+N corretamente.
3. Escalonamento é disparado quando SLA expira.
4. Decisão e estratégia ficam auditáveis por contrato.
5. Bloco Aviso de Vencimento permanece separado de Passos da Jornada.

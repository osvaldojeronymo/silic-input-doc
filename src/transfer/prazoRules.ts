import type { PainelAvisoVencimentoRow } from '../types/index.js';

export type AvisoFaixaSinalizacao = 'faixa_14_12' | 'faixa_12_7' | 'faixa_menor_6' | 'dados_insuficientes' | 'fora_escopo';
export type AvisoJanela = 'mais_1_ano' | '1_ano' | '6_meses' | '3_meses' | '2_meses' | '1_mes' | 'menor_1_mes' | 'vencido';

export function obterDataBase(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function adicionarMesesCivis(data: Date, meses: number): Date {
  const base = obterDataBase(data);
  const diaOriginal = base.getDate();
  const anoAlvo = base.getFullYear();
  const mesAlvo = base.getMonth() + meses;
  const ultimoDiaMesAlvo = new Date(anoAlvo, mesAlvo + 1, 0).getDate();
  const diaAjustado = Math.min(diaOriginal, ultimoDiaMesAlvo);
  return new Date(anoAlvo, mesAlvo, diaAjustado);
}

export function subtrairMesesCivis(data: Date, meses: number): Date {
  return adicionarMesesCivis(data, -meses);
}

export function calcularDataLimiteAjuizamentoAr(fimVigenciaDate: Date): Date {
  const referenciaSeisMeses = subtrairMesesCivis(fimVigenciaDate, 6);
  const houveAjustePorFimDeMes = referenciaSeisMeses.getDate() !== fimVigenciaDate.getDate();
  if (houveAjustePorFimDeMes) return referenciaSeisMeses;

  const limite = new Date(referenciaSeisMeses);
  limite.setDate(limite.getDate() - 1);
  return obterDataBase(limite);
}

export function calcularDiasParaVencimentoAviso(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate'>): number | null {
  if (!item.fimVigenciaDate) return null;
  const hojeBase = obterDataBase(new Date());
  const fimBase = obterDataBase(item.fimVigenciaDate);
  return Math.ceil((fimBase.getTime() - hojeBase.getTime()) / (1000 * 60 * 60 * 24));
}

export function classificarJanelaAviso(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate'>): AvisoJanela {
  const dias = calcularDiasParaVencimentoAviso(item);
  if (dias === null) return '1_ano';
  if (dias <= 0) return 'vencido';
  if (dias <= 29) return 'menor_1_mes';
  if (dias <= 30) return '1_mes';
  if (dias <= 60) return '2_meses';
  if (dias <= 90) return '3_meses';
  if (dias <= 180) return '6_meses';
  if (dias > 365) return 'mais_1_ano';
  return '1_ano';
}

export function possuiDadosVigenciaInsuficientes(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate' | 'fimVigencia'>): boolean {
  return !item.fimVigenciaDate || !item.fimVigencia || item.fimVigencia === '-';
}

export function estaNaJanelaLegalAcaoRenovatoria(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate'>): boolean {
  if (!item.fimVigenciaDate) return false;
  const hojeBase = obterDataBase(new Date());
  const inicioJanela = subtrairMesesCivis(item.fimVigenciaDate, 12);
  const prazoFinal = calcularDataLimiteAjuizamentoAr(item.fimVigenciaDate);
  return hojeBase >= inicioJanela && hojeBase <= prazoFinal;
}

export function podeManterADecidirProrrogacao(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate'>): boolean {
  if (!item.fimVigenciaDate) return false;
  const hojeBase = obterDataBase(new Date());
  const inicioEscopo = subtrairMesesCivis(item.fimVigenciaDate, 14);
  const limiteDecisaoObrigatoria = subtrairMesesCivis(item.fimVigenciaDate, 12);
  return hojeBase >= inicioEscopo && hojeBase < limiteDecisaoObrigatoria;
}

export function estaNaJanelaPrudenteGestorAr(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate'>): boolean {
  if (!item.fimVigenciaDate) return false;
  const hojeBase = obterDataBase(new Date());
  const inicioJanela = subtrairMesesCivis(item.fimVigenciaDate, 12);
  const limitePrudente = subtrairMesesCivis(item.fimVigenciaDate, 7);
  return hojeBase >= inicioJanela && hojeBase <= limitePrudente;
}

export function estaNaFaixaAlertaAr87(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate'>): boolean {
  if (!item.fimVigenciaDate) return false;
  const hojeBase = obterDataBase(new Date());
  const inicioFaixa = subtrairMesesCivis(item.fimVigenciaDate, 8);
  const fimFaixa = subtrairMesesCivis(item.fimVigenciaDate, 7);
  return hojeBase >= inicioFaixa && hojeBase < fimFaixa;
}

export function estaEmRiscoAr87(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate' | 'decisaoProrrogar' | 'decisaoAcaoRenovatoria'>): boolean {
  return estaNaFaixaAlertaAr87(item)
    && item.decisaoProrrogar === 'a_decidir'
    && item.decisaoAcaoRenovatoria === 'a_decidir';
}

export function classificarFaixaSinalizacaoAviso(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate' | 'fimVigencia'>): AvisoFaixaSinalizacao {
  if (possuiDadosVigenciaInsuficientes(item)) return 'dados_insuficientes';
  if (!item.fimVigenciaDate) return 'fora_escopo';

  const hojeBase = obterDataBase(new Date());
  const inicioEscopo = subtrairMesesCivis(item.fimVigenciaDate, 14);
  const inicioJanelaLegal = subtrairMesesCivis(item.fimVigenciaDate, 12);
  const limitePrudente = subtrairMesesCivis(item.fimVigenciaDate, 7);

  if (hojeBase < inicioEscopo) return 'fora_escopo';
  if (hojeBase < inicioJanelaLegal) return 'faixa_14_12';
  if (hojeBase <= limitePrudente) return 'faixa_12_7';
  return 'faixa_menor_6';
}

export function estaAposPrazoDecadencialAr(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate'>): boolean {
  if (!item.fimVigenciaDate) return false;
  const hojeBase = obterDataBase(new Date());
  const prazoFinal = calcularDataLimiteAjuizamentoAr(item.fimVigenciaDate);
  return hojeBase > prazoFinal;
}

export function estaNoEscopoAvisoVencimento(item: Pick<PainelAvisoVencimentoRow, 'fimVigenciaDate' | 'fimVigencia'>): boolean {
  return classificarFaixaSinalizacaoAviso(item) !== 'fora_escopo';
}

export function dateWithinRange(value: Date | null, start: Date | null, end: Date | null): boolean {
  if (!value) return !start && !end;
  if (start && value < start) return false;
  if (end && value > end) return false;
  return true;
}

export function ordenarPorCriticidadePrazo<T extends { situacaoPrazo: string }>(rows: T[]): T[] {
  const prioridade: Record<string, number> = {
    'Crítico': 0,
    'Atenção': 1,
    'No prazo': 2,
    'Sem prazo': 3
  };

  return [...rows].sort((left, right) => (prioridade[left.situacaoPrazo] ?? 99) - (prioridade[right.situacaoPrazo] ?? 99));
}
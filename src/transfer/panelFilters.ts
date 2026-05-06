import type { Imovel, PainelAcoesRenovatoriasRow, PainelAvisoVencimentoRow, PainelVencimentosContrato } from '../types/index.js';
import type {
  Fase1OperacionalRow,
  Fase2OperacionalRow,
  Fase3OperacionalRow,
  Fase4OperacionalRow,
  Fase5OperacionalRow,
  Fase61OperacionalRow,
  Fase62OperacionalRow,
  Fase7OperacionalRow
} from './operationalContracts.js';
import {
  classificarFaixaSinalizacaoAviso,
  classificarJanelaAviso,
  dateWithinRange,
  estaEmRiscoAr87,
  ordenarPorCriticidadePrazo
} from './prazoRules.js';

export interface ImoveisFilterValues {
  contrato: string;
  utilizacao: string;
  status: string;
  denominacao: string;
  dataInicio: string;
  dataFim: string;
}

export interface PainelVencimentosFilterValues {
  imovelSap: string;
  contratoSiclg: string;
  locador: string;
  cpfCnpj: string;
  vigenciaDe: string;
  vigenciaAte: string;
  status: string;
  ultimoPgtoDe: string;
  ultimoPgtoAte: string;
  ultimoValorDe: number | null;
  ultimoValorAte: number | null;
}

export interface PainelAcoesRenovatoriasFilterValues {
  codigoSijur: string;
  imovelSap: string;
  contratoSiclg: string;
  protocoloFormal: string;
  unidade: string;
  numeroProcesso: string;
  vigenciaAte: string;
  situacaoSiclg: string;
  situacaoSijur: string;
  situacaoCefor: string;
}

export interface PainelAvisoFilterValues {
  imovelSap: string;
  contratoSiclg: string;
  situacaoSiclg: string;
  fimVigenciaAte: string;
  ultimoPagamentoAte: string;
  decisao: string;
  decisaoAr: string;
  fase: string;
  demanda: string;
  colegiado: string;
  janela: string;
  limiteArAte: string;
  statusBadgeFiltroAtivo: string;
  faixaFiltroAtiva: '' | 'faixa_14_12' | 'faixa_12_7' | 'faixa_menor_6';
  filtroRiscoAr87Ativo: boolean;
}

export interface FaseUfFimVigenciaFilterValues {
  uf: string;
  fimVigencia: string;
}

export interface Fase5FilterValues extends FaseUfFimVigenciaFilterValues {
  decisao: string;
}

export interface Fase61FilterValues extends FaseUfFimVigenciaFilterValues {
  demandante: string;
  equipe: string;
  responsavel: string;
  situacao: string;
  modalidade: string;
  protocolo: string;
  objeto: string;
  incluidoDe: Date | null;
  incluidoAte: Date | null;
  concluidoDe: Date | null;
  concluidoAte: Date | null;
  prazoSelecionado: string | null;
}

export interface Fase62FilterValues extends FaseUfFimVigenciaFilterValues {
  gestor: string;
  fornecedor: string;
  protocolo: string;
  situacao: string;
  tipoDemanda: string;
  objeto: string;
  incluidoDe: Date | null;
  incluidoAte: Date | null;
  concluidoDe: Date | null;
  concluidoAte: Date | null;
  prazoSelecionado: string | null;
}

function parseDdMmYyyy(value?: string): Date | null {
  if (!value) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [dia, mes, ano] = value.split('/').map(Number);
    return new Date(ano, mes - 1, dia);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function filtrarImoveis(imoveis: Imovel[], filtros: ImoveisFilterValues): Imovel[] {
  const statusMap: Record<string, string> = {
    'Ativo': 'ativo',
    'Em Prospecção': 'prospeccao',
    'Em Mobilização': 'mobilizacao',
    'Em Desmobilização': 'desmobilizacao',
    'Desativado': 'desativado'
  };

  return imoveis.filter((imovel) => {
    if (filtros.contrato && !imovel.codigo.toLowerCase().includes(filtros.contrato)) return false;
    if (filtros.utilizacao && imovel.utilizacaoPrincipal !== filtros.utilizacao) return false;
    if (filtros.status && imovel.status !== statusMap[filtros.status]) return false;
    if (filtros.denominacao && !imovel.denominacao.toLowerCase().includes(filtros.denominacao)) return false;

    if (filtros.dataInicio || filtros.dataFim) {
      if (!imovel.fimValidade) return false;
      const dataValidade = parseDdMmYyyy(imovel.fimValidade);
      if (!dataValidade) return false;
      if (filtros.dataInicio && dataValidade < new Date(filtros.dataInicio)) return false;
      if (filtros.dataFim && dataValidade > new Date(filtros.dataFim)) return false;
    }

    return true;
  });
}

export function filtrarPainelVencimentos(
  rows: PainelVencimentosContrato[],
  filtros: PainelVencimentosFilterValues,
  parseDate: (value?: string) => Date | null,
  normalizarDocumento: (value: string) => string
): PainelVencimentosContrato[] {
  const vigenciaDeDate = filtros.vigenciaDe ? parseDate(filtros.vigenciaDe) : null;
  const vigenciaAteDate = filtros.vigenciaAte ? parseDate(filtros.vigenciaAte) : null;
  const ultimoPgtoDeDate = filtros.ultimoPgtoDe ? parseDate(filtros.ultimoPgtoDe) : null;
  const ultimoPgtoAteDate = filtros.ultimoPgtoAte ? parseDate(filtros.ultimoPgtoAte) : null;

  return rows.filter((item) => {
    if (filtros.imovelSap && !item.numeroImovelSap.toLowerCase().includes(filtros.imovelSap)) return false;
    if (filtros.contratoSiclg && !item.numeroContratoSiclg.toLowerCase().includes(filtros.contratoSiclg)) return false;
    if (filtros.locador && !item.locadorSap.toLowerCase().includes(filtros.locador)) return false;
    if (filtros.cpfCnpj && !normalizarDocumento(item.cnpjCpfLocadorSiclg).includes(filtros.cpfCnpj)) return false;
    if (filtros.status && item.situacaoSiclg !== filtros.status) return false;

    const vigenciaDate = parseDate(item.vigenciaSap);
    if (vigenciaDeDate && (!vigenciaDate || vigenciaDate < vigenciaDeDate)) return false;
    if (vigenciaAteDate && (!vigenciaDate || vigenciaDate > vigenciaAteDate)) return false;

    const ultimoPgtoDate = parseDate(item.ultimoPgtoSap);
    if (ultimoPgtoDeDate && (!ultimoPgtoDate || ultimoPgtoDate < ultimoPgtoDeDate)) return false;
    if (ultimoPgtoAteDate && (!ultimoPgtoDate || ultimoPgtoDate > ultimoPgtoAteDate)) return false;

    if (filtros.ultimoValorDe !== null && item.ultimoValorPagoSap < filtros.ultimoValorDe) return false;
    if (filtros.ultimoValorAte !== null && item.ultimoValorPagoSap > filtros.ultimoValorAte) return false;

    return true;
  });
}

export function filtrarPainelAcoesRenovatorias(
  rows: PainelAcoesRenovatoriasRow[],
  filtros: PainelAcoesRenovatoriasFilterValues
): PainelAcoesRenovatoriasRow[] {
  const vigenciaAteDate = filtros.vigenciaAte ? new Date(filtros.vigenciaAte) : null;

  return rows.filter((item) => {
    if (filtros.codigoSijur && !item.codigoSijur.toLowerCase().includes(filtros.codigoSijur)) return false;
    if (filtros.imovelSap && !item.imovelSap.toLowerCase().includes(filtros.imovelSap)) return false;
    if (filtros.contratoSiclg && !item.contratoSiclg.toLowerCase().includes(filtros.contratoSiclg)) return false;
    if (filtros.protocoloFormal && !item.protocoloFormalSiclg.toLowerCase().includes(filtros.protocoloFormal)) return false;
    if (filtros.unidade && !item.unidade.toLowerCase().includes(filtros.unidade)) return false;
    if (filtros.numeroProcesso && !item.numeroProcessoSiclg.toLowerCase().includes(filtros.numeroProcesso)) return false;
    if (filtros.situacaoSiclg && item.situacaoSiclg !== filtros.situacaoSiclg) return false;
    if (filtros.situacaoSijur && item.situacaoSijur !== filtros.situacaoSijur) return false;
    if (filtros.situacaoCefor && item.situacaoCefor !== filtros.situacaoCefor) return false;
    if (vigenciaAteDate && (!item.vigenciaDate || item.vigenciaDate > vigenciaAteDate)) return false;
    return true;
  });
}

export function filtrarPainelAvisoVencimento(
  rows: PainelAvisoVencimentoRow[],
  filtros: PainelAvisoFilterValues,
  parseDate: (value?: string) => Date | null
): PainelAvisoVencimentoRow[] {
  const fimVigenciaDate = filtros.fimVigenciaAte ? new Date(filtros.fimVigenciaAte) : null;
  const ultimoPagamentoDate = filtros.ultimoPagamentoAte ? new Date(filtros.ultimoPagamentoAte) : null;
  const limiteArDate = filtros.limiteArAte ? new Date(filtros.limiteArAte) : null;

  return rows.filter((item) => {
    if (filtros.imovelSap && !item.imovelSap.toLowerCase().includes(filtros.imovelSap)) return false;
    if (filtros.contratoSiclg && !item.contratoSiclg.toLowerCase().includes(filtros.contratoSiclg)) return false;
    if (filtros.situacaoSiclg && item.situacaoSiclg !== filtros.situacaoSiclg) return false;
    if (filtros.statusBadgeFiltroAtivo && item.situacaoSiclg !== filtros.statusBadgeFiltroAtivo) return false;
    if (filtros.decisao && item.decisaoProrrogar !== filtros.decisao) return false;
    if (filtros.decisaoAr && item.decisaoAcaoRenovatoria !== filtros.decisaoAr) return false;
    if (filtros.fase && item.fase !== filtros.fase) return false;
    if (filtros.demanda && item.demandaSiclg !== filtros.demanda) return false;
    if (filtros.colegiado && item.colegiado !== filtros.colegiado) return false;
    if (filtros.janela && classificarJanelaAviso(item) !== filtros.janela) return false;
    if (filtros.faixaFiltroAtiva && classificarFaixaSinalizacaoAviso(item) !== filtros.faixaFiltroAtiva) return false;
    if (filtros.filtroRiscoAr87Ativo && !estaEmRiscoAr87(item)) return false;
    if (fimVigenciaDate && (!item.fimVigenciaDate || item.fimVigenciaDate > fimVigenciaDate)) return false;
    if (ultimoPagamentoDate && (!item.ultimoPagamentoDate || item.ultimoPagamentoDate > ultimoPagamentoDate)) return false;
    if (limiteArDate) {
      const limite = parseDate(item.limiteLegalAr);
      if (!limite || limite > limiteArDate) return false;
    }
    return true;
  });
}

export function filtrarFase1(rows: Fase1OperacionalRow[], procurar: string): Fase1OperacionalRow[] {
  if (!procurar) return rows;
  return rows.filter((row) => row.dataNotificacao.toLowerCase().includes(procurar));
}

export function filtrarFase2(rows: Fase2OperacionalRow[], filtros: FaseUfFimVigenciaFilterValues): Fase2OperacionalRow[] {
  const fimDate = filtros.fimVigencia ? new Date(filtros.fimVigencia) : null;
  return rows.filter((row) => (!filtros.uf || row.uf === filtros.uf) && (!fimDate || !row.fimVigenciaDate || row.fimVigenciaDate <= fimDate));
}

export function filtrarFase3(rows: Fase3OperacionalRow[], filtros: FaseUfFimVigenciaFilterValues): Fase3OperacionalRow[] {
  const fimDate = filtros.fimVigencia ? new Date(filtros.fimVigencia) : null;
  return rows.filter((row) => (!filtros.uf || row.uf === filtros.uf) && (!fimDate || !row.fimVigenciaDate || row.fimVigenciaDate <= fimDate));
}

export function filtrarFase4(rows: Fase4OperacionalRow[], filtros: FaseUfFimVigenciaFilterValues): Fase4OperacionalRow[] {
  const fimDate = filtros.fimVigencia ? new Date(filtros.fimVigencia) : null;
  return rows.filter((row) => (!filtros.uf || row.uf === filtros.uf) && (!fimDate || !row.fimVigenciaDate || row.fimVigenciaDate <= fimDate));
}

export function filtrarFase5(rows: Fase5OperacionalRow[], filtros: Fase5FilterValues): Fase5OperacionalRow[] {
  const fimDate = filtros.fimVigencia ? new Date(filtros.fimVigencia) : null;
  return rows.filter((row) => {
    if (filtros.uf && row.uf !== filtros.uf) return false;
    if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
    if (filtros.decisao && row.decisaoOperacional !== filtros.decisao) return false;
    return true;
  });
}

export function filtrarFase61(rows: Fase61OperacionalRow[], filtros: Fase61FilterValues): Fase61OperacionalRow[] {
  const fimDate = filtros.fimVigencia ? new Date(filtros.fimVigencia) : null;
  const filtrado = rows.filter((row) => {
    if (filtros.uf && row.uf !== filtros.uf) return false;
    if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
    if (filtros.demandante && !row.demandante.toLowerCase().includes(filtros.demandante)) return false;
    if (filtros.equipe && !row.equipeRemota.toLowerCase().includes(filtros.equipe)) return false;
    if (filtros.responsavel && !row.responsavel.toLowerCase().includes(filtros.responsavel)) return false;
    if (filtros.situacao && row.statusContratacao !== filtros.situacao) return false;
    if (filtros.modalidade && row.modalidade !== filtros.modalidade) return false;
    if (filtros.protocolo && !row.protocoloSiclg.toLowerCase().includes(filtros.protocolo)) return false;
    if (filtros.objeto && !row.objeto.toLowerCase().includes(filtros.objeto)) return false;
    if (!dateWithinRange(row.incluidoEmDate, filtros.incluidoDe, filtros.incluidoAte)) return false;
    if (!dateWithinRange(row.concluidoEmDate, filtros.concluidoDe, filtros.concluidoAte)) return false;
    if (filtros.prazoSelecionado && row.situacaoPrazo !== filtros.prazoSelecionado) return false;
    return true;
  });

  return ordenarPorCriticidadePrazo(filtrado);
}

export function filtrarFase62(rows: Fase62OperacionalRow[], filtros: Fase62FilterValues): Fase62OperacionalRow[] {
  const fimDate = filtros.fimVigencia ? new Date(filtros.fimVigencia) : null;
  const filtrado = rows.filter((row) => {
    if (filtros.uf && row.uf !== filtros.uf) return false;
    if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
    if (filtros.gestor && !row.gestorOperacional.toLowerCase().includes(filtros.gestor)) return false;
    if (filtros.fornecedor && !row.fornecedor.toLowerCase().includes(filtros.fornecedor)) return false;
    if (filtros.protocolo && !row.protocoloSiclg.toLowerCase().includes(filtros.protocolo)) return false;
    if (filtros.situacao && row.statusRenovacao !== filtros.situacao) return false;
    if (filtros.tipoDemanda && row.tipoDemanda !== filtros.tipoDemanda) return false;
    if (filtros.objeto && !row.objeto.toLowerCase().includes(filtros.objeto)) return false;
    if (!dateWithinRange(row.incluidoEmDate, filtros.incluidoDe, filtros.incluidoAte)) return false;
    if (!dateWithinRange(row.concluidoEmDate, filtros.concluidoDe, filtros.concluidoAte)) return false;
    if (filtros.prazoSelecionado && row.situacaoPrazo !== filtros.prazoSelecionado) return false;
    return true;
  });

  return ordenarPorCriticidadePrazo(filtrado);
}

export function filtrarFase7(rows: Fase7OperacionalRow[], filtros: FaseUfFimVigenciaFilterValues): Fase7OperacionalRow[] {
  const fimDate = filtros.fimVigencia ? new Date(filtros.fimVigencia) : null;
  return rows.filter((row) => (!filtros.uf || row.uf === filtros.uf) && (!fimDate || !row.fimVigenciaDate || row.fimVigenciaDate <= fimDate));
}
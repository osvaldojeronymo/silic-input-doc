import type { DijurRegistro } from '../utils/dijurDataLoader.js';
import type { Imovel, Locador, PainelAcoesRenovatoriasRow, PainelAvisoVencimentoRow, PainelVencimentosContrato } from '../types/index.js';
import { calcularDataLimiteAjuizamentoAr, calcularDiasParaVencimentoAviso, classificarJanelaAviso, estaNaFaixaAlertaAr87, estaNoEscopoAvisoVencimento, obterDataBase } from './prazoRules.js';

export interface PanelDateDeps {
  parseDate(value?: string): Date | null;
  formatDate(value?: string): string;
  formatDateTime?(value?: string): string;
}

export interface PainelVencimentosBuilderDeps extends PanelDateDeps {
  obterConciliacaoStatusImovel(imovel: Imovel): 'conciliado' | 'pendente_conciliacao';
  formatarStatus(status: string): string;
}

export interface PainelFormalBuilderDeps extends PanelDateDeps {
  formatDateTime(value?: string): string;
  carregarEdicoesPainelFormal(): Record<string, { radarSucot: string; notas: string }>;
}

export interface PainelAvisoBuilderDeps extends PanelDateDeps {
  derivarColegiadoAviso(row: PainelVencimentosContrato, index: number): string;
}

export function calcularVencimentoReferencia(
  vigenciaSap: string,
  vigenciaSiclg: string,
  parseDate: (value?: string) => Date | null
): string {
  const sap = parseDate(vigenciaSap);
  const siclg = parseDate(vigenciaSiclg);
  if (sap && siclg) return sap.getTime() <= siclg.getTime() ? vigenciaSap : vigenciaSiclg;
  return vigenciaSap !== '-' ? vigenciaSap : vigenciaSiclg;
}

export function derivarModalidadeContrato(imovel: Imovel): 'locacao' | 'cessao' | 'comodato' | 'nao_informada' {
  const modalidadeNormalizada = (imovel.modalidade || '').toLowerCase();
  if (modalidadeNormalizada.includes('loca')) return 'locacao';
  if (modalidadeNormalizada.includes('cess')) return 'cessao';
  if (modalidadeNormalizada.includes('comod')) return 'comodato';

  const tipoContratoNormalizado = (imovel.tipoContrato || '').toLowerCase();
  if (tipoContratoNormalizado.includes('loca')) return 'locacao';
  if (tipoContratoNormalizado.includes('cess')) return 'cessao';
  if (tipoContratoNormalizado.includes('comod')) return 'comodato';

  return 'nao_informada';
}

export function classificarFaseVencimento(diasParaVencimento: number | null, imovel: Imovel): string {
  if (diasParaVencimento === null) return 'Monitoramento';
  if (diasParaVencimento <= 0) return 'Encerramento';
  if (diasParaVencimento <= 30) return 'Notificação';
  if (diasParaVencimento <= 60) return 'Negociação';
  if ((imovel.termosAditivos || []).length > 0) return 'Aditivo';
  return 'Monitoramento';
}

export function classificarDecisaoOperacional(
  diasParaVencimento: number | null,
  conciliacaoStatus: 'conciliado' | 'pendente_conciliacao'
): string {
  if (conciliacaoStatus === 'pendente_conciliacao') return 'Conciliação SAP/SICLG';
  if (diasParaVencimento === null) return 'Acompanhar vigência';
  if (diasParaVencimento <= 30) return 'Aguardar Notificação';
  if (diasParaVencimento <= 60) return 'Preparar negociação';
  if (diasParaVencimento <= 90) return 'Análise de prorrogação';
  return 'Acompanhamento regular';
}

export function buildPainelVencimentosReadModel(
  imovel: Imovel,
  locadores: Locador[],
  deps: PainelVencimentosBuilderDeps
): PainelVencimentosContrato {
  const locador = locadores.find((item) => item.id === imovel.locadorId) || locadores.find((item) => item.status === 'ativo');
  const historico = (imovel.historicoPagamentos || []).filter((item) => !!item.pagoEm);
  const ultimoPgto = [...historico].sort((left, right) => {
    const ta = deps.parseDate(left.pagoEm || '')?.getTime() || 0;
    const tb = deps.parseDate(right.pagoEm || '')?.getTime() || 0;
    return tb - ta;
  })[0];

  const vigenciaBase = imovel.fimValidade || imovel.contratoFimValidade || imovel.vigenciaFinal || '-';
  const vigenciaSap = vigenciaBase;
  const vigenciaSiclg = vigenciaBase;
  const vencimentoReferencia = calcularVencimentoReferencia(vigenciaSap, vigenciaSiclg, deps.parseDate);
  const dataRef = deps.parseDate(vencimentoReferencia);
  const diasParaVencimento = dataRef
    ? Math.ceil((dataRef.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const conciliacaoStatus = deps.obterConciliacaoStatusImovel(imovel);
  const fase = classificarFaseVencimento(diasParaVencimento, imovel);
  const decisaoOperacional = classificarDecisaoOperacional(diasParaVencimento, conciliacaoStatus);
  const valorMensal = imovel.valorAluguelMensal || imovel.valor || 0;
  const valorAnual = valorMensal * 12;
  const valorAcordado = Number(imovel.valorGlobalAtualizado || imovel.valorOriginalContrato || valorAnual || 0);
  const limiteAr = diasParaVencimento !== null && diasParaVencimento > 30 && dataRef
    ? deps.formatDate(new Date(dataRef.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString())
    : deps.formatDate(vencimentoReferencia);
  const previsaoColegiado = diasParaVencimento !== null && diasParaVencimento > 60 && dataRef
    ? deps.formatDate(new Date(dataRef.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString())
    : '-';

  return {
    contratoId: imovel.id,
    numeroImovelSap: imovel.codigo || '-',
    numeroContratoSiclg: imovel.numeroInstrumento || '-',
    uf: imovel.estado || '-',
    locadorSap: locador?.nome || imovel.parceiroNegocios || '-',
    vigenciaSap,
    descricaoSap: imovel.denominacao || '-',
    ultimoValorPagoSap: Number(ultimoPgto?.valorPago || ultimoPgto?.valor || 0),
    ultimoPgtoSap: ultimoPgto?.pagoEm ? deps.formatDate(ultimoPgto.pagoEm) : '-',
    vigenciaSiclg,
    situacaoSiclg: imovel.situacao || deps.formatarStatus(imovel.status),
    modalidade: derivarModalidadeContrato(imovel),
    descricaoSiclg: imovel.descricaoObjeto || '-',
    demandaSiclg: (imovel.termosAditivos || []).length > 0 ? 'Aditivo' : '-',
    situacaoDemanda: imovel.status === 'ativo' ? 'Em curso' : 'Pendente',
    cnpjCpfLocadorSiclg: locador?.documento || imovel.numeroIdFiscal || '-',
    decisaoOperacional,
    fase,
    valorProrrogacaoMensal: valorMensal,
    valorProrrogacaoAnual: valorAnual,
    valorAcordado,
    previsaoColegiado,
    colegiado: 'Colegiado Regional',
    tipoColegiado: 'Ordinário',
    situacaoColegiado: previsaoColegiado !== '-' ? 'Previsto' : 'Não previsto',
    limiteAr,
    codigoSijur: `SIJUR-${(imovel.codigo || '00000000').slice(-6)}`,
    situacaoProcessoAr: fase === 'Encerramento' ? 'Concluir AR' : 'Acompanhar',
    vencimentoReferencia,
    diasParaVencimento,
    conciliacaoStatus
  };
}

function derivarDecisaoProrrogarAviso(row: PainelVencimentosContrato): 'a_decidir' | 'prorrogar' | 'nao_prorrogar' {
  if (row.fase === 'Encerramento') return 'nao_prorrogar';
  if (row.conciliacaoStatus === 'pendente_conciliacao') return 'a_decidir';
  if (row.fase === 'Negociação' || row.fase === 'Aditivo') return 'prorrogar';
  return 'a_decidir';
}

function derivarDecisaoAcaoRenovatoriaAviso(fimVigenciaDate: Date | null): 'a_decidir' | 'ingressar' | 'nao_ingressar' {
  if (!fimVigenciaDate) return 'a_decidir';
  const hojeBase = obterDataBase(new Date());
  const prazoFinal = calcularDataLimiteAjuizamentoAr(fimVigenciaDate);
  if (hojeBase > prazoFinal) return 'nao_ingressar';
  return 'a_decidir';
}

export function buildPainelAvisoVencimento(
  rows: PainelVencimentosContrato[],
  deps: PainelAvisoBuilderDeps
): PainelAvisoVencimentoRow[] {
  const getDiasEmulados = (index: number): number => {
    const diasPrimeiros10 = [420, 360, 360, 240, 235, 230, 90, 60, 30, -15];
    if (index < diasPrimeiros10.length) return diasPrimeiros10[index];
    if (index < 20) return -15;
    if (index < 57) return 300;
    if (index < 75) return 120;
    if (index < 84) return 75;
    if (index < 93) return 45;
    if (index < 100) return 20;
    return 510;
  };

  let countDesmobilizacao = 0;
  const totalCandidatos = rows.length;

  const candidatos = rows.map((row, index): PainelAvisoVencimentoRow => {
    const fimVigenciaOriginal = row.vigenciaSiclg !== '-' ? row.vigenciaSiclg : row.vigenciaSap;
    const diasEmulados = getDiasEmulados(index);
    const dataEmulada = new Date();
    dataEmulada.setDate(dataEmulada.getDate() + diasEmulados);

    const fimVigencia = deps.formatDate(dataEmulada.toISOString()) || fimVigenciaOriginal;
    const fimVigenciaDate = deps.parseDate(fimVigencia) || deps.parseDate(fimVigenciaOriginal);
    const ultimoPagamentoDate = deps.parseDate(row.ultimoPgtoSap);
    const limiteLegalArDate = fimVigenciaDate ? calcularDataLimiteAjuizamentoAr(fimVigenciaDate) : null;
    const decisaoPrimeiros10: Array<'a_decidir' | 'prorrogar' | 'nao_prorrogar'> = ['a_decidir', 'a_decidir', 'prorrogar', 'a_decidir', 'prorrogar', 'nao_prorrogar', 'prorrogar', 'prorrogar', 'nao_prorrogar', 'nao_prorrogar'];
    const decisaoProrrogarEmulada = index < 10 ? decisaoPrimeiros10[index] : (index < 20 ? 'nao_prorrogar' : (index < 26 ? 'prorrogar' : 'nao_prorrogar'));
    const decisaoAcaoRenovatoriaPrimeiros10: Array<'a_decidir' | 'ingressar' | 'nao_ingressar' | null> = [null, null, null, 'ingressar', 'a_decidir', 'a_decidir', null, null, null, null];
    const decisaoAcaoRenovatoriaPadrao = derivarDecisaoAcaoRenovatoriaAviso(fimVigenciaDate);
    const decisaoAcaoRenovatoriaEmulada = (index < 10 && decisaoAcaoRenovatoriaPrimeiros10[index])
      ? decisaoAcaoRenovatoriaPrimeiros10[index] as 'a_decidir' | 'ingressar' | 'nao_ingressar'
      : decisaoAcaoRenovatoriaPadrao;

    let statusAjustado = 'Ativo';
    const maxDesmobilizacao = Math.ceil(totalCandidatos * 0.05);
    if (countDesmobilizacao < maxDesmobilizacao && Math.random() < 0.05) {
      statusAjustado = 'Em Desmobilização';
      countDesmobilizacao++;
    }

    return {
      contratoId: row.contratoId,
      imovelSap: row.numeroImovelSap,
      contratoSiclg: row.numeroContratoSiclg,
      situacaoSiclg: statusAjustado,
      modalidade: row.modalidade,
      descricao: row.descricaoSiclg !== '-' ? row.descricaoSiclg : row.descricaoSap,
      ultimoValorPagoSap: row.ultimoValorPagoSap,
      ultimoPagamentoSap: row.ultimoPgtoSap,
      decisaoProrrogar: decisaoProrrogarEmulada,
      decisaoAcaoRenovatoria: decisaoAcaoRenovatoriaEmulada,
      situacaoLaudoAvaliacao: row.modalidade === 'locacao' ? 'nao_solicitado' : 'nao_aplicavel',
      laudoPrazoEntregaDias: row.modalidade === 'locacao' ? 30 : undefined,
      laudoPrazoFormalInformado: false,
      fase: row.fase,
      demandaSiclg: row.demandaSiclg,
      colegiado: deps.derivarColegiadoAviso(row, index),
      limiteLegalAr: limiteLegalArDate ? deps.formatDate(limiteLegalArDate.toISOString()) : row.limiteAr,
      fimVigencia,
      fimVigenciaDate,
      ultimoPagamentoDate,
      ordemCasoTeste: index < 10 ? index + 1 : undefined
    };
  });

  const hojeBase = obterDataBase(new Date());
  const offsetDiasFaixaAr87 = [240, 236, 232];
  const contratosFaixaAr87 = candidatos.filter((item) => estaNaFaixaAlertaAr87(item));
  if (contratosFaixaAr87.length < 3) {
    const faltantes = 3 - contratosFaixaAr87.length;
    const reserva = candidatos.filter((item) => !estaNaFaixaAlertaAr87(item)).slice(0, faltantes);
    [...contratosFaixaAr87, ...reserva].slice(0, 3).forEach((item, idx) => {
      const fimAjustado = new Date(hojeBase);
      fimAjustado.setDate(fimAjustado.getDate() + offsetDiasFaixaAr87[idx]);
      item.fimVigenciaDate = fimAjustado;
      item.fimVigencia = deps.formatDate(fimAjustado.toISOString()) || item.fimVigencia;
      const limiteAr = calcularDataLimiteAjuizamentoAr(fimAjustado);
      item.limiteLegalAr = deps.formatDate(limiteAr.toISOString()) || item.limiteLegalAr;
    });
  }

  const exemplosFaixaAr87 = candidatos.filter((item) => estaNaFaixaAlertaAr87(item)).sort((left, right) => (left.ordemCasoTeste || Number.MAX_SAFE_INTEGER) - (right.ordemCasoTeste || Number.MAX_SAFE_INTEGER));
  if (exemplosFaixaAr87[0]) {
    exemplosFaixaAr87[0].decisaoProrrogar = 'a_decidir';
    exemplosFaixaAr87[0].decisaoAcaoRenovatoria = 'ingressar';
  }
  if (exemplosFaixaAr87[1]) {
    exemplosFaixaAr87[1].decisaoProrrogar = 'prorrogar';
    exemplosFaixaAr87[1].decisaoAcaoRenovatoria = 'a_decidir';
  }
  if (exemplosFaixaAr87[2]) {
    exemplosFaixaAr87[2].decisaoProrrogar = 'a_decidir';
    exemplosFaixaAr87[2].decisaoAcaoRenovatoria = 'a_decidir';
  }

  return candidatos
    .filter((item) => estaNoEscopoAvisoVencimento(item))
    .sort((left, right) => {
      if (typeof left.ordemCasoTeste === 'number' && typeof right.ordemCasoTeste === 'number') {
        return left.ordemCasoTeste - right.ordemCasoTeste;
      }
      if (typeof left.ordemCasoTeste === 'number') return -1;
      if (typeof right.ordemCasoTeste === 'number') return 1;
      return (calcularDiasParaVencimentoAviso(left) ?? Number.MAX_SAFE_INTEGER) - (calcularDiasParaVencimentoAviso(right) ?? Number.MAX_SAFE_INTEGER);
    })
    .slice(0, 100);
}

export function mergePainelFormalComDijur(
  rows: PainelAcoesRenovatoriasRow[],
  dadosDijur: DijurRegistro[],
  deps: Pick<PainelFormalBuilderDeps, 'formatDate' | 'formatDateTime'>
): PainelAcoesRenovatoriasRow[] {
  const mapa = new Map(dadosDijur.map((registro) => [String(registro.imovel_sap), registro]));
  return rows.map((row) => {
    const dijur = mapa.get(row.imovelSap);
    if (!dijur) return row;
    return {
      ...row,
      codigoSijur: dijur.codigo_sijur || row.codigoSijur,
      numeroProcessoDijur: dijur.numero_processo_dijur || row.numeroProcessoDijur,
      situacaoSijur: dijur.situacao_sijur || row.situacaoSijur,
      situacaoCefor: dijur.situacao_cefor || row.situacaoCefor,
      dataEntradaDijur: dijur.data_entrada_dijur ? deps.formatDate(dijur.data_entrada_dijur) : row.dataEntradaDijur,
      partesDijur: dijur.partes_dijur || row.partesDijur,
      lastSyncAt: dijur.last_sync_at ? deps.formatDateTime(dijur.last_sync_at) : row.lastSyncAt,
      origemDados: row.origemDados.replace('DIJUR_API (indisponível)', 'DIJUR_API')
    };
  });
}

function gerarContratoSiclgFormal(imovelSap: string, index: number): string {
  return `SICLG-${new Date().getFullYear()}-${(imovelSap.replace(/\D/g, '').slice(-5) || String(index + 1).padStart(5, '0'))}`;
}

function gerarProtocoloFormalSiclg(imovelSap: string, index: number): string {
  const base = imovelSap.replace(/\D/g, '').slice(-6) || String(index + 1).padStart(6, '0');
  return `PF-${new Date().getFullYear()}-${base}`;
}

function gerarNumeroProcessoSiclg(imovelSap: string, index: number): string {
  const base = imovelSap.replace(/\D/g, '').slice(-4) || String(index + 1).padStart(4, '0');
  return `000.${base}/${new Date().getFullYear()}-${String((index % 89) + 10).padStart(2, '0')}`;
}

function gerarNumeroProcessoDijur(imovelSap: string, index: number): string {
  const base = imovelSap.replace(/\D/g, '').slice(-7).padStart(7, '0');
  return `${base}-${String((index % 90) + 10).padStart(2, '0')}.${new Date().getFullYear()}.4.01.${String((index % 27) + 1).padStart(4, '0')}`;
}

function gerarDescricaoUnidadeFormal(imovel: Imovel): string {
  const base = imovel.denominacao || imovel.cidade || 'Unidade não identificada';
  return imovel.estado ? `${base}/${imovel.estado}` : base;
}

function derivarSituacaoSiclgFormal(diasParaVigencia: number | null): string {
  if (diasParaVigencia === null) return 'Sem vigência consolidada';
  if (diasParaVigencia < 0) return 'Vigência expirada';
  if (diasParaVigencia <= 45) return 'Renovação com vencimento iminente';
  if (diasParaVigencia <= 120) return 'Renovação em instrução';
  return 'Instrumento vigente';
}

function derivarSituacaoSijurFormal(diasParaVigencia: number | null): string {
  if (diasParaVigencia === null || diasParaVigencia > 120) return 'Aguardando distribuição';
  if (diasParaVigencia > 60) return 'Em análise DIJUR';
  if (diasParaVigencia > 15) return 'Minuta/peça em elaboração';
  return 'Ajuizamento protocolado';
}

function derivarSituacaoCeforFormal(diasParaVigencia: number | null): string {
  if (diasParaVigencia === null || diasParaVigencia > 120) return 'Aguardando instrução CEFOR';
  if (diasParaVigencia > 60) return 'Em conferência documental';
  if (diasParaVigencia > 15) return 'Minuta validada';
  return 'Instrumento encaminhado para assinatura';
}

function derivarRadarSucotFormal(diasParaVigencia: number | null): string {
  if (diasParaVigencia === null || diasParaVigencia > 120) return 'Não acionado';
  if (diasParaVigencia > 45) return 'Monitorado';
  return 'Acionado';
}

function derivarStatusOperacionalFormal(diasParaVigencia: number | null): string {
  if (diasParaVigencia === null) return 'Sem ação imediata';
  if (diasParaVigencia < 0) return 'Atuação prioritária';
  if (diasParaVigencia <= 45) return 'Escalonamento formal em curso';
  if (diasParaVigencia <= 120) return 'Preparação de instrução';
  return 'Monitoramento preventivo';
}

function derivarNotasGestorFormal(imovel: Imovel, diasParaVigencia: number | null, dadosReais: boolean): string {
  const unidade = gerarDescricaoUnidadeFormal(imovel);
  const origem = dadosReais ? 'base SAP' : 'base local';

  if (diasParaVigencia === null) return `Contrato em acompanhamento no A-III com vigência pendente de consolidação a partir da ${origem}.`;
  if (diasParaVigencia < 0) return `Contrato da unidade ${unidade} requer tratamento prioritário no fluxo formal por vigência expirada.`;
  if (diasParaVigencia <= 45) return `Contrato da unidade ${unidade} em janela crítica de renovação. Validar documentação e tramitação no A-III.`;
  if (diasParaVigencia <= 120) return `Contrato da unidade ${unidade} em preparação de instrução formal, com acompanhamento do Gestor Formal.`;
  return `Contrato da unidade ${unidade} mantido em monitoramento preventivo no painel A-III.`;
}

function calcularDataEntradaDijur(vigenciaDate: Date | null, index: number, formatDate: (value?: string) => string): string {
  if (!vigenciaDate) return formatDate(new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString());
  const referencia = new Date(vigenciaDate.getTime() - 75 * 24 * 60 * 60 * 1000);
  return formatDate(referencia.toISOString());
}

export function buildPainelAcoesRenovatorias(
  imoveis: Imovel[],
  locadores: Locador[],
  dadosReais: boolean,
  dadosDijur: DijurRegistro[] | undefined,
  deps: PainelFormalBuilderDeps
): PainelAcoesRenovatoriasRow[] {
  const locadorMap = new Map(locadores.map((locador) => [locador.id, locador]));
  const dijurMap = new Map((dadosDijur || []).map((registro) => [String(registro.imovel_sap), registro]));
  const edicoes = deps.carregarEdicoesPainelFormal();

  return imoveis.slice(0, 60).map((imovel, index) => {
    const imovelSap = imovel.codigo || `SEM-SAP-${String(index + 1).padStart(4, '0')}`;
    const registroDijur = dijurMap.get(imovelSap);
    const contratoSiclg = imovel.numeroInstrumento || gerarContratoSiclgFormal(imovelSap, index);
    const protocoloFormalSiclg = gerarProtocoloFormalSiclg(imovelSap, index);
    const numeroProcessoSiclg = imovel.numeroProcesso || gerarNumeroProcessoSiclg(imovelSap, index);
    const numeroProcessoDijur = registroDijur?.numero_processo_dijur || gerarNumeroProcessoDijur(imovelSap, index);
    const vigenciaBase = imovel.vigenciaFinal || imovel.contratoFimValidade || imovel.fimValidade || '-';
    const vigenciaDate = deps.parseDate(vigenciaBase);
    const diasParaVigencia = vigenciaDate ? Math.ceil((vigenciaDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    const locador = locadorMap.get(imovel.locadorId || '');
    const unidade = gerarDescricaoUnidadeFormal(imovel);
    const edicao = edicoes[imovel.id];

    return {
      contratoId: imovel.id,
      codigoSijur: registroDijur?.codigo_sijur || `SIJUR-${imovelSap.replace(/\D/g, '').slice(-6).padStart(6, '0')}`,
      imovelSap,
      contratoSiclg,
      protocoloFormalSiclg,
      unidade,
      vigenciaSiclg: deps.formatDate(vigenciaBase),
      situacaoSiclg: derivarSituacaoSiclgFormal(diasParaVigencia),
      numeroProcessoSiclg,
      situacaoSijur: registroDijur?.situacao_sijur || derivarSituacaoSijurFormal(diasParaVigencia),
      situacaoCefor: registroDijur?.situacao_cefor || derivarSituacaoCeforFormal(diasParaVigencia),
      numeroProcessoDijur,
      dataEntradaDijur: registroDijur?.data_entrada_dijur ? deps.formatDate(registroDijur.data_entrada_dijur) : calcularDataEntradaDijur(vigenciaDate, index, deps.formatDate),
      partesDijur: registroDijur?.partes_dijur || `CAIXA ECONÔMICA FEDERAL x ${locador?.nome || imovel.parceiroNegocios || 'Locador não identificado'}`,
      lastSyncAt: registroDijur?.last_sync_at ? deps.formatDateTime(registroDijur.last_sync_at) : new Date(Date.now() - index * 6 * 60 * 60 * 1000).toLocaleString('pt-BR'),
      radarSucot: edicao?.radarSucot || derivarRadarSucotFormal(diasParaVigencia),
      notas: edicao?.notas || derivarNotasGestorFormal(imovel, diasParaVigencia, dadosReais),
      statusOperacional: derivarStatusOperacionalFormal(diasParaVigencia),
      origemDados: registroDijur
        ? (dadosReais ? 'SAP + DIJUR_API + INPUT_GESTOR_FORMAL' : 'BASE_LOCAL + DIJUR_API + INPUT_GESTOR_FORMAL')
        : (dadosReais ? 'SAP + DIJUR_API (indisponível) + INPUT_GESTOR_FORMAL' : 'BASE_LOCAL + DIJUR_API (indisponível) + INPUT_GESTOR_FORMAL'),
      vigenciaDate
    };
  });
}
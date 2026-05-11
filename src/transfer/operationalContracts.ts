export interface Fase1OperacionalRow {
  dataNotificacao: string;
  listaA: number;
  listaB: number;
  listaC: number;
  listaD: number;
  total: number;
  contratoReferenciaId: string;
}

export interface Fase2OperacionalRow {
  contratoId: string;
  imovelSap: string;
  vigenciaSap: string;
  contratoSiclg: string;
  vigenciaSiclg: string;
  fornecedor: string;
  descricao: string;
  limiteArGo: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

export interface Fase3OperacionalRow {
  contratoId: string;
  identificacaoImovelContrato: string;
  fornecedor: string;
  descricaoContrato: string;
  inicioVigencia: string;
  fimVigencia: string;
  situacaoLaudo: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

export interface Fase4OperacionalRow {
  contratoId: string;
  identificacaoImovelContrato: string;
  fornecedor: string;
  descricaoImovelSap: string;
  inicioVigencia: string;
  fimVigencia: string;
  valorMaximo: number;
  incluirNoSiclg: string;
  limiteArGo: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

export interface Fase5OperacionalRow {
  contratoId: string;
  identificacaoImovelContrato: string;
  fornecedor: string;
  descricaoImovelSap: string;
  inicioVigencia: string;
  fimVigencia: string;
  decisaoOperacional: string;
  houveAcordo: string;
  incluirNoSiclg: string;
  situacaoAr: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

export interface Fase61OperacionalRow {
  contratoId: string;
  identificacaoImovelContrato: string;
  fornecedor: string;
  objeto: string;
  demandante: string;
  equipeRemota: string;
  responsavel: string;
  protocoloSiclg: string;
  modalidade: string;
  progressoAtual: string;
  situacaoPrazo: string;
  incluidoEmDate: Date | null;
  concluidoEmDate: Date | null;
  tipoProcesso: string;
  statusContratacao: string;
  valorReferencia: number;
  uf: string;
  fimVigenciaDate: Date | null;
}

export interface Fase62OperacionalRow {
  contratoId: string;
  identificacaoImovelContrato: string;
  fornecedor: string;
  objeto: string;
  gestorOperacional: string;
  protocoloSiclg: string;
  tipoDemanda: string;
  faseAtual: string;
  situacaoPrazo: string;
  incluidoEmDate: Date | null;
  concluidoEmDate: Date | null;
  statusRenovacao: string;
  qtdAditivos: number;
  prazoLimite: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

export interface Fase7OperacionalRow {
  contratoId: string;
  identificacaoImovelContrato: string;
  fornecedor: string;
  objeto: string;
  dataNotificacao: string;
  canal: string;
  statusResposta: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

export interface EstadoPainelAvisoPersistido {
  decisaoProrrogar: 'a_decidir' | 'prorrogar' | 'nao_prorrogar';
  decisaoAcaoRenovatoria: 'a_decidir' | 'ingressar' | 'nao_ingressar';
  protocoloFormal?: string;
  demandaSiclg?: string;
  situacaoLaudoAvaliacao?: 'nao_aplicavel' | 'nao_solicitado' | 'solicitado' | 'entregue';
  laudoRequisicaoNumero?: string;
  laudoRequisicaoData?: string;
  laudoNumero?: string;
  laudoPrazoEntregaDias?: number;
  laudoPrazoFormalInformado?: boolean;
  laudoDataEmissao?: string;
  laudoValidoAte?: string;
  historicoDecisaoProrrogacao?: string[];
  historicoDecisaoAcaoRenovatoria?: string[];
  protocoloContratacao?: string;
}

export interface EtapaRtaRegistro {
  areaContratada?: number;
  benfeitoriasValor?: number;
  possuiValorVenal?: 'sim' | 'nao' | '';
  valorVenalImovel?: number;
  parecerNumero?: string;
  parecerData?: string;
  percentualBenfeitorias?: number;
  manifestacaoNegocio?: string;
  manifestacaoInfra?: string;
  uploadRelatorioArquivos?: string[];
  uploadParecerArquivos?: string[];
}

export interface EtapaLaudoRegistro {
  uploadArquivos?: string[];
  dataElaboracao?: string;
  dataValidade?: string;
  dataEmissao?: string;
  numeroDocumento?: string;
  empresaNome?: string;
  empresaCnpj?: string;
  endereco?: string;
  area?: number;
  valorMinimo?: number;
  valorMedio?: number;
  valorMaximo?: number;
  assinado?: 'sim' | 'nao' | '';
}

export type NegociacaoContextoTipo = 'com_contrato' | 'sem_contrato';

export interface NegociacaoLocadorContexto {
  locadorId: string;
  nome: string;
  tipo: 'fisica' | 'juridica';
  percentualBase: number;
}

export interface NegociacaoLocadorPercentualEdit {
  locadorId: string;
  nome: string;
  tipo: 'fisica' | 'juridica';
  percentualBase: number;
  percentualNegociado: number;
}

export interface EtapaNegociacaoRegistro {
  contextoContrato?: NegociacaoContextoTipo;
  temTermosNegociados?: 'sim' | 'nao' | '';
  valorPropostoAluguel?: number;
  valorAcordadoPartes?: number;
  dataInicioNegociacao?: string;
  dataFimNegociacao?: string;
  vigenciaMeses?: number;
  dataInicioVigencia?: string;
  dataFinalVigencia?: string;
  valorTotalPrevisto?: number;
  temAlteracoesContratuais?: 'sim' | 'nao' | '';
  dataInicioSupressaoAcrescimo?: string;
  quitacaoAreaDevolvida?: 'sim' | 'nao' | '';
  temArAndamento?: 'sim' | 'nao' | '';
  arDesistenciaCondicoes?: string;
  alterouDataPagamento?: 'sim' | 'nao' | '';
  novaDataPagamento?: string;
  temCarencia?: 'sim' | 'nao' | '';
  carenciaDias?: number;
  indiceReajuste?: string;
  dataProximoReajuste?: string;
  preverMultaRescisao?: 'sim' | 'nao' | '';
  clausulaMultaRescisao?: string;
  revogacaoMultaRescisao?: 'sim' | 'nao' | '';
  resultadoNegociacaoMulta?: 'removida' | 'mantida_sem_acordo' | 'em_negociacao' | '';
  justificativaRevogacaoMulta?: string;
  aluguelAcimaLaudo?: 'sim' | 'nao' | '';
  aluguelAcimaLaudoJustificativa?: string;
  modalidade?: 'contrato_simplificado' | 'condicoes_suspensivas' | 'minuta_locador' | '';
  temClausulaExtra?: 'sim' | 'nao' | '';
  clausulaExtraTexto?: string;
  alteracaoTitularidade?: 'sim' | 'nao' | '';
  alteracaoTitularidadeDetalhe?: string;
  alteracoesPercentualLocadores?: string;
  alteracaoDadosBancarios?: 'sim' | 'nao' | '';
  alteracaoDadosBancariosDetalhe?: string;
  alteracaoContratoSocial?: 'sim' | 'nao' | '';
  alteracaoContratoSocialDetalhe?: string;
  locadoresPercentuais?: NegociacaoLocadorPercentualEdit[];
  temUploadsNegociacao?: 'sim' | 'nao' | '';
  uploadAnexosArquivos?: string[];
  uploadMinutaArquivos?: string[];
  uploadContratoSocialArquivos?: string[];
  uploadAutorizacaoAcimaLaudoArquivos?: string[];
}

export type ContratoBuscaStatus = 'todos' | 'ativo' | 'prospeccao' | 'mobilizacao' | 'desmobilizacao' | 'desativado';

export interface ContratoBuscaResultado {
  id: string;
  sap: string;
  fornecedor: string;
  uf: string;
  municipio: string;
  status: Exclude<ContratoBuscaStatus, 'todos'>;
  label: string;
  searchText: string;
}

export interface ContratoBuscaParams {
  query: string;
  offset: number;
  limit: number;
  statusFilter?: ContratoBuscaStatus;
}

export interface ContratoBuscaResponse {
  items: ContratoBuscaResultado[];
  total: number;
  hasMore: boolean;
}

export type ContratoBuscaProvider = (params: ContratoBuscaParams) => Promise<ContratoBuscaResponse>;

export interface ContratoBuscaUiState {
  query: string;
  selectedStatus: ContratoBuscaStatus;
  offset: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  items: ContratoBuscaResultado[];
}
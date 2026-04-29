import { Imovel, Locador, DashboardStats, VisualizationMode, ParticipacaoLocadorImovel, Pagamento, FormaPagamento, TermoAditivo, PainelVencimentosContrato, PainelAcoesRenovatoriasRow, PainelAvisoVencimentoRow } from './types/index.js';
import { Utils } from './utils/index.js';
import { SAPDataLoader } from './utils/sapDataLoader.js';
import { DIJURDataLoader, type DijurRegistro } from './utils/dijurDataLoader.js';
import { labelCategoria, labelAcao, labelModalidade } from './labels.js';
import * as XLSX from 'xlsx';
import './styles/style.css';

interface Fase1OperacionalRow {
  dataNotificacao: string;
  listaA: number;
  listaB: number;
  listaC: number;
  listaD: number;
  total: number;
  contratoReferenciaId: string;
}

interface Fase2OperacionalRow {
  contratoId: string;
  contratoSap: string;
  vigenciaSap: string;
  contratoSiclg: string;
  vigenciaSiclg: string;
  fornecedor: string;
  descricao: string;
  limiteArGo: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

interface Fase3OperacionalRow {
  contratoId: string;
  contratoSapSiclg: string;
  fornecedor: string;
  descricaoContrato: string;
  inicioVigencia: string;
  fimVigencia: string;
  situacaoLaudo: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

interface Fase4OperacionalRow {
  contratoId: string;
  contratoSapSiclg: string;
  fornecedor: string;
  descricaoContratoSap: string;
  inicioVigencia: string;
  fimVigencia: string;
  valorMaximo: number;
  incluirNoSiclg: string;
  limiteArGo: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

interface Fase5OperacionalRow {
  contratoId: string;
  contratoSapSiclg: string;
  fornecedor: string;
  descricaoContratoSap: string;
  inicioVigencia: string;
  fimVigencia: string;
  decisaoOperacional: string;
  houveAcordo: string;
  incluirNoSiclg: string;
  situacaoAr: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

interface Fase61OperacionalRow {
  contratoId: string;
  contratoSapSiclg: string;
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

interface Fase62OperacionalRow {
  contratoId: string;
  contratoSapSiclg: string;
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

interface Fase7OperacionalRow {
  contratoId: string;
  contratoSapSiclg: string;
  fornecedor: string;
  objeto: string;
  dataNotificacao: string;
  canal: string;
  statusResposta: string;
  uf: string;
  fimVigenciaDate: Date | null;
}

interface EstadoPainelAvisoPersistido {
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

interface EtapaRtaRegistro {
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

interface EtapaLaudoRegistro {
  uploadArquivos?: string[];
  dataElaboracao?: string;
  dataValidade?: string;
  numeroDocumento?: string;
  empresaNome?: string;
  empresaCnpj?: string;
  valorMinimo?: number;
  valorMedio?: number;
  valorMaximo?: number;
  assinado?: 'sim' | 'nao' | '';
}

type NegociacaoContextoTipo = 'com_contrato' | 'sem_contrato';

interface NegociacaoLocadorContexto {
  locadorId: string;
  nome: string;
  tipo: 'fisica' | 'juridica';
  percentualBase: number;
}

interface NegociacaoLocadorPercentualEdit {
  locadorId: string;
  nome: string;
  tipo: 'fisica' | 'juridica';
  percentualBase: number;
  percentualNegociado: number;
}

interface EtapaNegociacaoRegistro {
  contextoContrato?: NegociacaoContextoTipo;
  valorPropostoAluguel?: number;
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
  uploadAnexosArquivos?: string[];
  uploadMinutaArquivos?: string[];
  uploadContratoSocialArquivos?: string[];
  uploadAutorizacaoAcimaLaudoArquivos?: string[];
}

interface ContratoBuscaResultado {
  id: string;
  sap: string;
  fornecedor: string;
  uf: string;
  municipio: string;
  label: string;
  searchText: string;
}

interface ContratoBuscaParams {
  query: string;
  offset: number;
  limit: number;
}

interface ContratoBuscaResponse {
  items: ContratoBuscaResultado[];
  total: number;
  hasMore: boolean;
}

type ContratoBuscaProvider = (params: ContratoBuscaParams) => Promise<ContratoBuscaResponse>;

interface ContratoBuscaUiState {
  query: string;
  offset: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  items: ContratoBuscaResultado[];
}

/**
 * Classe principal do Sistema SILIC 2.0
 */
export class SistemaSILIC {
  private static readonly FORMAL_STORAGE_KEY = 'silic.formal.edicoes.v1';
  private static readonly AVISO_STORAGE_KEY = 'silic.aviso.operacional.v1';
  private static readonly AVISO_TEMA_STORAGE_KEY = 'silic.aviso.tema.visual.v1';
  private static readonly ETAPA_RTA_STORAGE_KEY = 'silic.operacional.etapa.rta.v1';
  private static readonly ETAPA_LAUDO_STORAGE_KEY = 'silic.operacional.etapa.laudo.v1';
  private static readonly ETAPA_NEGOCIACAO_STORAGE_KEY = 'silic.operacional.etapa.negociacao.v1';
  private imoveis: Imovel[] = [];
  private imoveisOriginais: Imovel[] = []; // Lista completa sem filtros
  private locadores: Locador[] = [];
  private painelVencimentos: PainelVencimentosContrato[] = [];
  private painelVencimentosFiltrado: PainelVencimentosContrato[] = [];
  private painelAcoesRenovatorias: PainelAcoesRenovatoriasRow[] = [];
  private painelAcoesRenovatoriasFiltrado: PainelAcoesRenovatoriasRow[] = [];
  private painelAvisoVencimento: PainelAvisoVencimentoRow[] = [];
  private painelAvisoVencimentoFiltrado: PainelAvisoVencimentoRow[] = [];
  private usandoDadosSAP = false;
  
  // Paginação
  private currentPage = 1;
  private itemsPerPage = 10;
  private currentPageImoveis = 1;
  private itemsPerPageImoveis = 10;
  private currentPagePainel = 1;
  private itemsPerPagePainel = 10;
  private currentPagePainelFormal = 1;
  private itemsPerPagePainelFormal = 10;
  private currentPagePainelAviso = 1;
  private itemsPerPagePainelAviso = 10;
  private avisoKpiComposicaoExpandida = false;
  private avisoKpiRiscoAr87ComposicaoExpandida = false;
  private avisoFaixaFiltroAtiva: '' | 'faixa_14_12' | 'faixa_12_7' | 'faixa_menor_6' = '';
  private avisoFiltroRiscoAr87Ativo = false;
  private avisoStatusBadgeFiltroAtivo = '';
  private avisoTemaVisual: 'executivo-neutro' | 'operacional-alerta' = 'executivo-neutro';
  private contratosEtapasBusca: ContratoBuscaResultado[] = [];
  private contratoBuscaProvider: ContratoBuscaProvider | null = null;
  private readonly contratoBuscaDebounceMs = 350;
  private readonly contratoBuscaPageSize = 25;
  private readonly contratoBuscaRecentesKey = 'silic.operacional.contrato.recentes.v1';
  private readonly contratoBuscaFavoritosKey = 'silic.operacional.contrato.favoritos.v1';
  private contratoBuscaTimers = new Map<string, number>();
  private contratoBuscaUiState = new Map<string, ContratoBuscaUiState>();
  private contratoBuscaRecentes: string[] = [];
  private contratoBuscaFavoritos: Set<string> = new Set();
  private fase1Rows: Fase1OperacionalRow[] = [];
  private fase1RowsFiltradas: Fase1OperacionalRow[] = [];
  private fase2Rows: Fase2OperacionalRow[] = [];
  private fase2RowsFiltradas: Fase2OperacionalRow[] = [];
  private fase3Rows: Fase3OperacionalRow[] = [];
  private fase3RowsFiltradas: Fase3OperacionalRow[] = [];
  private fase4Rows: Fase4OperacionalRow[] = [];
  private fase4RowsFiltradas: Fase4OperacionalRow[] = [];
  private fase5Rows: Fase5OperacionalRow[] = [];
  private fase5RowsFiltradas: Fase5OperacionalRow[] = [];
  private fase61Rows: Fase61OperacionalRow[] = [];
  private fase61RowsFiltradas: Fase61OperacionalRow[] = [];
  private fase62Rows: Fase62OperacionalRow[] = [];
  private fase62RowsFiltradas: Fase62OperacionalRow[] = [];
  private fase7Rows: Fase7OperacionalRow[] = [];
  private fase7RowsFiltradas: Fase7OperacionalRow[] = [];
  private favoritosFase61: Set<string> = new Set();
  private favoritosFase62: Set<string> = new Set();
  private fase61PrazoSelecionado: string | null = null;
  private fase62PrazoSelecionado: string | null = null;
  private currentView: VisualizationMode = 'table';

  constructor() {
    // Garante abertura sempre na home para evitar confusão após refresh em rotas de perfil.
    this.navegarPara('/');
    this.usandoDadosSAP = false;
    this.carregarDadosDemo();
    this.inicializarPainelVencimentos();
    this.inicializarPainelAcoesRenovatorias();
    this.inicializarPainelAvisoVencimento();
    this.configurarFiltrosImoveisImediato();
    this.configurarExportacaoPortfolio();
    this.configurarPainelVencimentos();
    this.configurarPainelAcoesRenovatorias();
    this.configurarPainelAvisoVencimento();
    this.configurarItemsPorPagina();
    this.configurarPaginacaoPainelPortfolio();
    this.configurarPaginacaoPainelFormal();
    this.configurarPaginacaoPainelAviso();
    this.configurarSwitchPainelFormal();
    this.reposicionarPainelAvisoParaOperacional();
    this.configurarNavegacaoRotas();
    this.configurarAbasPerfilOperacional();
    this.configurarNavegacaoTopoOperacional();
    this.inicializarDadosFasesOperacionais();
    this.configurarEtapasOperacionaisDocumentais();
    this.carregarFavoritosFases();
    this.carregarSelecaoPrazoChips();
    this.configurarFase1Operacional();
    this.configurarFase2Operacional();
    this.configurarFase3Operacional();
    this.configurarFase4Operacional();
    this.configurarFase5Operacional();
    this.configurarFase61Operacional();
    this.configurarFase62Operacional();
    this.configurarFase7Operacional();
    this.configurarChipsPrazoFases();
    this.configurarResetSessaoJornada();
    this.carregarFiltrosFasesSessao();
    this.atualizarTabelaImoveis();
    this.atualizarDashboard();
    this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
    this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
    this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
    this.atualizarTabelaFase1Operacional(this.fase1RowsFiltradas);
    this.atualizarTabelaFase2Operacional(this.fase2RowsFiltradas);
    this.atualizarTabelaFase3Operacional(this.fase3RowsFiltradas);
    this.atualizarTabelaFase4Operacional(this.fase4RowsFiltradas);
    this.atualizarTabelaFase5Operacional(this.fase5RowsFiltradas);
    this.atualizarTabelaFase61Operacional(this.fase61RowsFiltradas);
    this.atualizarTabelaFase62Operacional(this.fase62RowsFiltradas);
    this.atualizarTabelaFase7Operacional(this.fase7RowsFiltradas);
    this.aplicarFiltrosFase2Operacional();
    this.aplicarFiltrosFase3Operacional();
    this.aplicarFiltrosFase4Operacional();
    this.aplicarFiltrosFase5Operacional();
    this.aplicarFiltrosFase61Operacional();
    this.aplicarFiltrosFase62Operacional();
    this.aplicarFiltrosFase7Operacional();
    this.aplicarRota('/');
    void this.hidratarPainelAcoesRenovatoriasComDadosSAP();
  }
  

  // Métodos auxiliares para geração de dados

  private getEstadoByCidade(cidade: string): string {
    const estadosPorCidade: Record<string, string> = {
      'São Paulo': 'SP',
      'Rio de Janeiro': 'RJ',
      'Brasília': 'DF',
      'Salvador': 'BA',
      'Fortaleza': 'CE',
      'Belo Horizonte': 'MG',
      'Manaus': 'AM',
      'Curitiba': 'PR',
      'Recife': 'PE',
      'Goiânia': 'GO'
    };
    return estadosPorCidade[cidade] || 'SP';
  }

  private gerarCPF(): string {
    const nums = Array.from({length: 9}, () => Math.floor(Math.random() * 10));
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += nums[i] * (10 - i);
    }
    const digit1 = ((sum * 10) % 11) % 10;
    
    sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += nums[i] * (11 - i);
    }
    sum += digit1 * 2;
    const digit2 = ((sum * 10) % 11) % 10;
    
    return Utils.formatDocument([...nums, digit1, digit2].join(''));
  }

  private gerarCNPJ(): string {
    const nums = Array.from({length: 8}, () => Math.floor(Math.random() * 10));
    nums.push(0, 0, 0, 1);
    
    let sum = 0;
    let pos = 5;
    for (let i = 0; i < 12; i++) {
      sum += nums[i] * pos--;
      if (pos < 2) pos = 9;
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    sum = 0;
    pos = 6;
    for (let i = 0; i < 12; i++) {
      sum += nums[i] * pos--;
      if (pos < 2) pos = 9;
    }
    sum += digit1 * 2;
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return Utils.formatDocument([...nums, digit1, digit2].join(''));
  }

  private gerarTelefone(): string {
    const ddd = Math.floor(Math.random() * 89) + 11;
    const numero = Math.floor(Math.random() * 900000000) + 100000000;
    return `(${ddd}) ${numero.toString().slice(0, 5)}-${numero.toString().slice(5)}`;
  }
  
  private carregarDadosDemo(): void {
    this.locadores = [
      {
        id: 'loc-1',
        nome: 'João da Silva',
        tipo: 'fisica',
        documento: this.gerarCPF(),
        email: 'joao.silva@example.com',
        telefone: this.gerarTelefone(),
        endereco: { logradouro: 'Rua das Flores', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01000-000' },
        parteRelacionada: false,
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      },
      {
        id: 'loc-2',
        nome: 'Imóveis XYZ Ltda',
        tipo: 'juridica',
        documento: this.gerarCNPJ(),
        email: 'contato@imoveisxyz.com.br',
        telefone: this.gerarTelefone(),
        endereco: { logradouro: 'Av. Paulista', numero: '1500', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP', cep: '01310-000' },
        parteRelacionada: true,
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      },
      {
        id: 'loc-3',
        nome: 'Maria Fernanda Alves',
        tipo: 'fisica',
        documento: this.gerarCPF(),
        email: 'maria.alves@example.com',
        telefone: this.gerarTelefone(),
        endereco: { logradouro: 'Rua do Lago', numero: '45', bairro: 'Jardim', cidade: 'Curitiba', estado: 'PR', cep: '80000-100' },
        parteRelacionada: false,
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      },
      {
        id: 'loc-4',
        nome: 'Construtora Alfa S/A',
        tipo: 'juridica',
        documento: this.gerarCNPJ(),
        email: 'financeiro@alfa.com.br',
        telefone: this.gerarTelefone(),
        endereco: { logradouro: 'Av. Brasil', numero: '2000', bairro: 'Industrial', cidade: 'Porto Alegre', estado: 'RS', cep: '90000-200' },
        parteRelacionada: false,
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      },
      {
        id: 'loc-5',
        nome: 'Roberto Lima',
        tipo: 'fisica',
        documento: this.gerarCPF(),
        email: 'roberto.lima@example.com',
        telefone: this.gerarTelefone(),
        endereco: { logradouro: 'Rua das Acácias', numero: '789', bairro: 'Vila Nova', cidade: 'Recife', estado: 'PE', cep: '50000-300' },
        parteRelacionada: true,
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      }
    ];

    this.imoveisOriginais = this.gerarImoveisDemo(200);
    this.imoveis = [...this.imoveisOriginais];
  }

  private gerarImoveisDemo(qtd: number): Imovel[] {
    const cidades = ['São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza','Belo Horizonte','Manaus','Curitiba','Recife','Goiânia'];
    const bairros = ['Centro','Jardim','Vila Nova','Boa Vista','Industrial','Comercial'];
    const utilizacoes = ['Próprio','Terceiro'];
    const statusList: Imovel['status'][] = ['ativo','prospeccao','mobilizacao','desmobilizacao'];

    const out: Imovel[] = [];
    for (let i = 0; i < qtd; i++) {
      const cidade = cidades[i % cidades.length];
      const estado = this.getEstadoByCidade(cidade);
      const bairro = bairros[i % bairros.length];
      const codigo = (10000000 + i).toString();
      const area = Math.round(80 + Math.random() * 920);
      const valor = +(1500 + Math.random() * 8500).toFixed(2);
      const dia = String(1 + Math.floor(Math.random() * 27)).padStart(2,'0');
      const mes = String(1 + Math.floor(Math.random() * 12)).padStart(2,'0');
      const ano = String(2026 + Math.floor(Math.random() * 4));
      const fimValidade = `${dia}/${mes}/${ano}`;

      const imovel: Imovel = {
        id: `imo-${i+1}`,
        codigo,
        denominacao: `Contrato ${codigo} - Unidade ${cidade}`,
        tipoContrato: 'Contrato de Locação - Imóveis',
        utilizacaoPrincipal: utilizacoes[i % utilizacoes.length],
        fimValidade,
        endereco: `Rua Exemplo ${i+1}`,
        bairro,
        cidade,
        cep: `${String(10000 + i).padStart(5,'0')}-${String(100 + i).padStart(3,'0')}`,
        estado,
        tipo: 'comercial',
        status: statusList[i % statusList.length],
        area,
        valor,
        descricao: 'Imóvel gerado para demonstração.',
        fotos: [],
        caracteristicas: { quartos: 0, banheiros: 2, garagem: 0 },
        locadorId: this.locadores[i % this.locadores.length].id,
        dataRegistro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),

        tipoEdificioCodigo: '01',
        parceiroNegocios: this.locadores[i % this.locadores.length].nome,
        tipoIdFiscal: this.locadores[i % this.locadores.length].tipo === 'fisica' ? 'CPF' : 'CNPJ',
        numeroIdFiscal: this.locadores[i % this.locadores.length].documento,
        denominacaoFuncaoPN: 'Proponente Credor',
        inicioRelacao: `01/01/2025`,
        fimRelacao: `31/12/${ano}`,

        // Pagamento de aluguel (demo)
        valorAluguelMensal: +(1500 + Math.random() * 8500).toFixed(2),
        dataVencimentoAluguel: `${dia}/${mes}/${ano}`,
        formaPagamentoAluguel: (i % 3 === 0 ? 'transferencia' : (i % 3 === 1 ? 'gru' : 'boleto')),
        locadoresParticipacao: this.gerarParticipacoesParaImovel(i),
        beneficiariosImovel: []
      };

      // Campos originais do contrato (para aba Aditivos)
      const mensalBase = imovel.valorAluguelMensal || imovel.valor || 0;
      imovel.valorMensalEstimadoOriginal = mensalBase;
      imovel.qtdMesesOriginal = 48 + (i % 25); // entre 48 e 72 meses
      imovel.dataVigenciaInicioOriginal = imovel.inicioRelacao || '01/01/2025';
      imovel.dataVigenciaFimOriginal = imovel.fimValidade || `31/12/${ano}`;
      imovel.valorOriginalContrato = (imovel.valorMensalEstimadoOriginal || 0) * (imovel.qtdMesesOriginal || 0);

      // Gera histórico de pagamentos (últimos 6 meses)
      imovel.historicoPagamentos = this.gerarHistoricoPagamentosDemo(imovel, i);

      // Gera termos aditivos (demo)
      imovel.termosAditivos = this.gerarTermosAditivosDemo(imovel, i);

      out.push(imovel);
    }
    return out;
  }

  /**
   * Gera cenários variados de participação de locadores
   */
  private gerarParticipacoesParaImovel(i: number): ParticipacaoLocadorImovel[] {
    const l = this.locadores;
    const bankCaixa = {
      banco: '104 - CAIXA', agencia: '1234', dvAgencia: '5', operacaoProduto: '013', conta: '987654', dvConta: '2'
    };
    const bankBradesco = {
      banco: '237 - Bradesco', agencia: '0001', dvAgencia: '0', operacaoProduto: 'Conta Corrente', conta: '123456', dvConta: '7'
    };
    const bankItau = {
      banco: '341 - Itaú', agencia: '4321', dvAgencia: '1', operacaoProduto: 'Conta Corrente', conta: '654321', dvConta: '3'
    };

    const scenarios: ParticipacaoLocadorImovel[][] = [
      // A: 1 locador 100% por transferência
      [
        { locadorId: l[0 % l.length].id, percentual: 100, formaPagamento: 'transferencia', dadosBancarios: bankCaixa, representanteLegal: null, recebedorDivergente: null, beneficiarios: [] }
      ],
      // B: 60/40 transferência + boleto, com recebedor divergente e beneficiário
      [
        { locadorId: l[1 % l.length].id, percentual: 60, formaPagamento: 'transferencia', dadosBancarios: bankItau, representanteLegal: null, recebedorDivergente: null, beneficiarios: [] },
        { locadorId: l[2 % l.length].id, percentual: 40, formaPagamento: 'boleto', representanteLegal: { nome: 'Ana Prado', documento: this.gerarCPF(), email: 'ana.prado@example.com' }, recebedorDivergente: { nome: 'Carlos Lima', documento: this.gerarCPF(), dadosBancarios: bankBradesco }, beneficiarios: [ { nome: 'Assoc. Benef.', documento: this.gerarCNPJ(), percentual: 10 } ] }
      ],
      // C: 50/30/20 com transferência/GRU/boleto e vários beneficiários
      [
        { locadorId: l[3 % l.length].id, percentual: 50, formaPagamento: 'transferencia', dadosBancarios: bankCaixa, representanteLegal: null, recebedorDivergente: null, beneficiarios: [ { nome: 'ONG Apoio', documento: this.gerarCNPJ(), percentual: 5 } ] },
        { locadorId: l[4 % l.length].id, percentual: 30, formaPagamento: 'gru', representanteLegal: null, recebedorDivergente: null, beneficiarios: [] },
        { locadorId: l[0 % l.length].id, percentual: 20, formaPagamento: 'boleto', representanteLegal: { nome: 'Representante Legal', documento: this.gerarCPF(), email: 'rep.legal@example.com' }, recebedorDivergente: null, beneficiarios: [] }
      ],
      // D: 90/10 com recebedor divergente no 10% por transferência
      [
        { locadorId: l[2 % l.length].id, percentual: 90, formaPagamento: 'boleto', representanteLegal: null, recebedorDivergente: null, beneficiarios: [] },
        { locadorId: l[1 % l.length].id, percentual: 10, formaPagamento: 'transferencia', dadosBancarios: bankItau, representanteLegal: null, recebedorDivergente: { nome: 'Terceiro Recebedor', documento: this.gerarCPF(), dadosBancarios: bankItau }, beneficiarios: [] }
      ]
    ];

    return scenarios[i % scenarios.length];
  }

  /**
   * Gera histórico de pagamentos para o imóvel com cenários variados
   */
  private gerarHistoricoPagamentosDemo(imovel: Imovel, idx: number): Pagamento[] {
    const hoje = new Date();
    const pagamentos: Pagamento[] = [];
    const diaVenc = (() => {
      const v = imovel.dataVencimentoAluguel;
      if (v && /^\d{2}\/\d{2}\/\d{4}$/.test(v)) return parseInt(v.slice(0, 2), 10);
      return 10;
    })();
    const valor = imovel.valorAluguelMensal || 3000;
    for (let m = 0; m < 6; m++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - m, 1);
      const competencia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const venc = new Date(d.getFullYear(), d.getMonth(), diaVenc);
      const vencStr = venc.toLocaleDateString('pt-BR');
      // alterna cenários com base em idx e m
      const pick = (idx + m) % 4; // 0..3
      if (pick === 0) {
        // pago em dia
        const pagoEm = new Date(venc.getTime());
        pagamentos.push({ competencia, vencimento: vencStr, valor, pagoEm: pagoEm.toISOString(), valorPago: valor, forma: 'transferencia' as FormaPagamento });
      } else if (pick === 1) {
        // pago com atraso de 5 dias
        const pagoEm = new Date(venc.getTime());
        pagoEm.setDate(pagoEm.getDate() + 5);
        pagamentos.push({ competencia, vencimento: vencStr, valor, pagoEm: pagoEm.toISOString(), valorPago: valor, forma: 'boleto' as FormaPagamento });
      } else if (pick === 2) {
        // não pago ainda (se vencido)
        const pagoEm = null;
        pagamentos.push({ competencia, vencimento: vencStr, valor, pagoEm, valorPago: null, forma: undefined });
      } else {
        // pago com atraso de 15 dias
        const pagoEm = new Date(venc.getTime());
        pagoEm.setDate(pagoEm.getDate() + 15);
        pagamentos.push({ competencia, vencimento: vencStr, valor, pagoEm: pagoEm.toISOString(), valorPago: valor, forma: 'gru' as FormaPagamento });
      }
    }
    return pagamentos;
  }

  // Regras de encargos por atraso (padrão Brasil): 2% multa + 1% a.m. juros
  private readonly multaPercent = 2; // % sobre principal
  private readonly jurosMesPercent = 1; // % ao mês

  private calcularEncargos(valor: number, vencimento: string, pagoEm?: string | null) {
    const due = this.parseDate(vencimento);
    const refDate = pagoEm ? this.parseDate(pagoEm) : new Date();
    if (!due || !refDate) return { dias: 0, multa: 0, juros: 0, total: valor };
    const ms = refDate.getTime() - due.getTime();
    const dias = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (dias <= 0) return { dias: 0, multa: 0, juros: 0, total: valor };
    const multa = (this.multaPercent / 100) * valor;
    const jurosDia = (this.jurosMesPercent / 100) / 30;
    const juros = valor * jurosDia * dias;
    const total = valor + multa + juros;
    return { dias, multa, juros, total };
  }

  /**
   * Gera termos aditivos de demonstração
   */
  private gerarTermosAditivosDemo(imovel: Imovel, idx: number): TermoAditivo[] {
    const baseMensal = imovel.valorMensalEstimadoOriginal || imovel.valorAluguelMensal || imovel.valor || 5000;
    const valorTa1 = Math.round(baseMensal * 1.10); // acréscimo de área
    const valorTa2 = valorTa1; // alteração de titularidade não altera valor
    const valorTa3 = Math.round(valorTa2 * 1.08); // reajuste anual INPC sobre o valor vigente
    const inicio = this.parseDate(imovel.dataVigenciaInicioOriginal) || new Date();
    const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, d.getDate());
    const fmtBR = (d: Date) => d.toLocaleDateString('pt-BR');

    const ta1: TermoAditivo = {
      numeroTA: `TA-${idx + 1}-01`,
      tipoDemanda: 'Acréscimo de área',
      valorMensalEstimado: valorTa1,
      valorGlobalEstimadoAditivo: Math.round(valorTa1 * 12),
      valorGlobalAtualizado: Math.round(valorTa1 * (imovel.qtdMesesOriginal || 60)),
      dataInicioEfeitosFinanceiros: fmtBR(addMonths(inicio, 18)),
      dataVigenciaInicio: fmtBR(addMonths(inicio, 18)),
      dataVigenciaFim: fmtBR(addMonths(inicio, 30)),
      qtdMeses: 12,
      percentualAcrescimo: 10
    };

    const ta2: TermoAditivo = {
      numeroTA: `TA-${idx + 1}-02`,
      tipoDemanda: 'Alteração de titularidade',
      valorMensalEstimado: valorTa2,
      valorGlobalEstimadoAditivo: Math.round(valorTa2 * 10),
      valorGlobalAtualizado: Math.round(valorTa2 * (imovel.qtdMesesOriginal || 60)),
      dataInicioEfeitosFinanceiros: fmtBR(addMonths(inicio, 30)),
      dataVigenciaInicio: fmtBR(addMonths(inicio, 30)),
      dataVigenciaFim: fmtBR(addMonths(inicio, 40)),
      qtdMeses: 10,
      percentualSupressao: 0
    };

    const ta3: TermoAditivo = {
      numeroTA: `TA-${idx + 1}-03`,
      tipoDemanda: 'Reajuste anual - INPC',
      valorMensalEstimado: valorTa3,
      valorGlobalEstimadoAditivo: Math.round(valorTa3 * 6),
      valorGlobalAtualizado: Math.round(valorTa3 * (imovel.qtdMesesOriginal || 60)),
      dataInicioEfeitosFinanceiros: fmtBR(addMonths(inicio, 40)),
      dataVigenciaInicio: fmtBR(addMonths(inicio, 40)),
      dataVigenciaFim: fmtBR(addMonths(inicio, 46)),
      qtdMeses: 6,
      percentualRevisaoPreco: 8
    };

    return [ta1, ta2, ta3];
  }

  /**
   * Renderiza aba de Aditivos
   */
  private renderAditivos(imovel: Imovel): void {
    const setText = (id: string, text: string) => this.setElementText(id, text);
    const fmt = (v?: number) => this.formatCurrency(v ?? 0);

    // Valores originais
    setText('detValMensalEstimadoOriginal', fmt(imovel.valorMensalEstimadoOriginal || imovel.valorAluguelMensal || imovel.valor));
    setText('detValorOriginalContrato', fmt(imovel.valorOriginalContrato));
    setText('detDataVigenciaInicioOriginal', imovel.dataVigenciaInicioOriginal ? this.formatDate(imovel.dataVigenciaInicioOriginal) : '-');
    setText('detDataVigenciaFimOriginal', imovel.dataVigenciaFimOriginal ? this.formatDate(imovel.dataVigenciaFimOriginal) : '-');
    setText('detQtdMesesOriginal', (imovel.qtdMesesOriginal ?? '-').toString());

    // Tabela Termos Aditivos
    const tbody = document.querySelector('#tabelaTermosAditivos tbody') as HTMLTableSectionElement | null;
    if (tbody) {
      tbody.innerHTML = '';
      for (const ta of (imovel.termosAditivos || [])) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ta.numeroTA}</td>
          <td>${ta.tipoDemanda}</td>
          <td>${fmt(ta.valorMensalEstimado)}</td>
          <td>${fmt(ta.valorGlobalEstimadoAditivo)}</td>
          <td>${fmt(ta.valorGlobalAtualizado)}</td>
          <td>${this.formatDate(ta.dataInicioEfeitosFinanceiros)}</td>
          <td>${this.formatDate(ta.dataVigenciaInicio)}</td>
          <td>${this.formatDate(ta.dataVigenciaFim)}</td>
          <td>${ta.qtdMeses ?? '-'}</td>
          <td>${ta.percentualAcrescimo ?? '-'}</td>
          <td>${ta.percentualSupressao ?? '-'}</td>
          <td>${ta.percentualRevisaoPreco ?? '-'}</td>
        `;
        tbody.appendChild(tr);
      }
    }

    // Resumo Geral
    const A = imovel.valorOriginalContrato || 0;
    const B = (imovel.termosAditivos || []).reduce((acc, ta) => acc + (ta.valorGlobalEstimadoAditivo || 0), 0);
    const C = A + B;
    const D = `${this.formatDate(imovel.dataVigenciaInicioOriginal)} — ${this.formatDate(imovel.dataVigenciaFimOriginal)}`;
    const E = C * 0.7; // empenhado (demo)
    const F = (imovel.historicoPagamentos || []).reduce((acc, p) => acc + (p.valorPago || 0), 0);
    const G = F * 0.85; // pago no SIPLO (demo)
    const H = C - F;
    const I = E - G;

    setText('resA', fmt(A));
    setText('resB', fmt(B));
    setText('resC', fmt(C));
    setText('resD', D);
    setText('resE', fmt(E));
    setText('resF', fmt(F));
    setText('resG', fmt(G));
    setText('resH', fmt(H));
    setText('resI', fmt(I));
  }

  // Métodos de interface (serão implementados nas próximas partes)
  private mostrarFormulario(): void {
    // TODO: Implementar
  }

  private adicionarImovel(): void {
    // TODO: Implementar
  }

  private limparFormulario(): void {
    // TODO: Implementar
  }

  private adicionarLocador(): void {
    // TODO: Implementar
  }

  private alterarVisualizacao(modo: VisualizationMode): void {
    this.currentView = modo;
    // TODO: Implementar mudança visual
  }

  private filtrarLocadores(): void {
    // TODO: Implementar
  }

  private limparFiltros(): void {
    // TODO: Implementar
  }

  private atualizarListaLocadores(): void {
    // TODO: Implementar
  }

  /**
   * Atualiza a tabela de imóveis com dados paginados
   */
  private atualizarTabelaImoveis(): void {
    const tbody = document.getElementById('tabelaImoveisBody') as HTMLTableSectionElement | null;
    if (!tbody) {
      console.warn('Tabela de imóveis não encontrada');
      return;
    }

    tbody.innerHTML = '';

    // Calcular paginação
    const inicio = (this.currentPageImoveis - 1) * this.itemsPerPageImoveis;
    const fim = inicio + this.itemsPerPageImoveis;
    const imoveisPaginados = this.imoveis.slice(inicio, fim);

    // Popular tabela
    imoveisPaginados.forEach(imovel => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      
      // Status badge class
      const badgeClass = `badge badge-${imovel.status}`;
      
      // Data de fim da validade (formato dd/mm/aaaa)
      const fimValidade = imovel.fimValidade || '-';

      tr.innerHTML = `
        <td>${imovel.codigo}</td>
        <td>${imovel.denominacao}</td>
        <td>${imovel.tipoContrato || 'Contrato de Locação - Imóveis'}</td>
        <td>${imovel.utilizacaoPrincipal || '-'}</td>
        <td><span class="${badgeClass}">${this.formatarStatus(imovel.status)}</span></td>
        <td>${fimValidade}</td>
        <td>
          <button class="btn-table-action" data-id="${imovel.id}">
            Ver Detalhes
          </button>
        </td>
      `;

      // Adicionar evento de clique na linha
      tr.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains('btn-table-action')) {
          this.abrirModalDetalhes(imovel.id);
        }
      });

      // Adicionar evento de clique no botão
      const btn = tr.querySelector('.btn-table-action');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.abrirModalDetalhes(imovel.id);
        });
      }

      tbody.appendChild(tr);
    });

    // Atualizar informações de paginação
    this.atualizarPaginacaoImoveis();
  }

  private aplicarMascaraCEP(): void {
    const cepInput = document.getElementById('cep') as HTMLInputElement;
    if (cepInput) {
      Utils.applyMask(cepInput, 'cep');
    }
  }

  private fecharModalDetalhes(): void {
    this.fecharTodosDrawersDetalhes();
    const modal = document.getElementById('modalDetalhes');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Abre o modal de detalhes do imóvel
   */
  private abrirModalDetalhes(imovelId: string): void {
    const imovel = this.imoveis.find((i) => i.id === imovelId)
      || this.imoveisOriginais.find((i) => i.id === imovelId);
    if (!imovel) {
      console.error('Imóvel não encontrado:', imovelId);
      return;
    }

    // Preencher dados do modal
    this.preencherModalDetalhes(imovel);

    // Abrir modal
    const modal = document.getElementById('modalDetalhes');
    if (modal) {
      modal.classList.add('active');
      
      // Configurar evento de fechar
      const btnFechar = modal.querySelector('.modal-close');
      if (btnFechar) {
        btnFechar.addEventListener('click', () => this.fecharModalDetalhes());
      }

      // Fechar ao clicar fora do modal
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.fecharModalDetalhes();
        }
      });
    }

    // Configurar tabs
    this.configurarTabs();
    this.configurarCollapsibles();
    this.configurarSectionIndex();
    this.configurarDrawersDetalhes();
    this.configurarDetalhamentoInlinePorTab('tab-contrato');
    this.configurarDetalhamentoInlinePorTab('tab-locador');
    this.configurarDetalhamentoInlinePorTab('tab-aditivos');
    this.configurarDetalhamentoInlinePorTab('tab-alertas');

    // Inicializar aba de serviços com o imóvel atual
    this.inicializarAbaServicos(imovel);
  }

  private abrirModalDetalhesPorAviso(item: PainelAvisoVencimentoRow): void {
    const imovel = this.imoveis.find((i) => i.id === item.contratoId)
      || this.imoveisOriginais.find((i) => i.id === item.contratoId)
      || this.imoveis.find((i) => i.codigo === item.contratoSap)
      || this.imoveisOriginais.find((i) => i.codigo === item.contratoSap);

    if (!imovel) {
      this.showToast(`Não foi possível localizar os dados de detalhe para o contrato SAP ${item.contratoSap}.`);
      return;
    }

    this.abrirModalDetalhes(imovel.id);
  }

  /**
   * Preenche os dados do modal de detalhes
   */
  private preencherModalDetalhes(imovel: Imovel): void {
    // Título do modal
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
      modalTitle.textContent = `Contrato (Visão 360°)`;
    }

    // Tab Contrato (read-only spans) - alinhado ao index.html
    this.setElementText('detNumeroContrato', imovel.codigo || '-'); this.setElementOrigin('detNumeroContrato', 'SAP');
    this.setElementText('detDenominacao', imovel.denominacao || `${imovel.endereco}, ${imovel.bairro}`); this.setElementOrigin('detDenominacao', 'SAP');
    this.setElementText('detTipoContrato', imovel.tipoContrato || 'Contrato de Locação - Imóveis'); this.setElementOrigin('detTipoContrato', 'SAP');
    this.setElementText('detDataInicio', imovel.dataRegistro ? new Date(imovel.dataRegistro).toLocaleDateString('pt-BR') : '-'); this.setElementOrigin('detDataInicio', 'SAP');
    this.setElementText('detDataFim', imovel.fimValidade || imovel.contratoFimValidade || '-'); this.setElementOrigin('detDataFim', 'SAP');
    this.setElementText('detRescisaoEm', imovel.contratoRescisaoEm || '-'); this.setElementOrigin('detRescisaoEm', 'SAP');
    // Status calculado do contrato
    const status = this.calcularStatusContrato(imovel);
    this.setElementText('detContratoStatus', status);
    this.setElementText('detParceiro', imovel.parceiroNegocios || '-'); this.setElementOrigin('detParceiro', 'SAP');
    this.setElementText('detEnderecoContrato', imovel.endereco || '-'); this.setElementOrigin('detEnderecoContrato', 'SAP');
    this.setElementText('detNumeroEndereco', imovel.numeroPN || '-'); this.setElementOrigin('detNumeroEndereco', 'SAP');

    // Tab Imóvel (read-only spans)
    this.setElementText('detCodPostal', imovel.cep || '-'); this.setElementOrigin('detCodPostal', 'SAP');
    this.setElementText('detLocal', imovel.estado || '-'); this.setElementOrigin('detLocal', 'SAP');
    this.setElementText('detRua', imovel.endereco || '-'); this.setElementOrigin('detRua', 'SAP');
    this.setElementText('detBairro', imovel.bairro || '-'); this.setElementOrigin('detBairro', 'SAP');
    this.setElementText('detCidade', imovel.cidade || '-'); this.setElementOrigin('detCidade', 'SAP');
    this.setElementText('detEstado', imovel.estado || '-'); this.setElementOrigin('detEstado', 'SAP');
    this.setElementText('detCep', imovel.cep || '-'); this.setElementOrigin('detCep', 'SAP');
    this.setElementText('detTipoEdificio', imovel.tipoEdificioCodigo || '-'); this.setElementOrigin('detTipoEdificio', 'SAP');
    this.setElementText('detArea', imovel.area ? `${imovel.area} m²` : '-'); this.setElementOrigin('detArea', 'SAP');
    this.setElementText('detValor', imovel.valor ? `R$ ${imovel.valor.toFixed(2)}` : '-'); this.setElementOrigin('detValor', 'SAP');
    // Endereço completo (resumo)
    const enderecoCompleto = [imovel.endereco, imovel.bairro].filter(Boolean).join(', ')
      + (imovel.cidade || imovel.estado ? `, ${[imovel.cidade, imovel.estado].filter(Boolean).join(' - ')}` : '')
      + (imovel.cep ? `, ${imovel.cep}` : '');
    this.setElementText('detEnderecoCompleto', enderecoCompleto || '-'); this.setElementOrigin('detEnderecoCompleto', 'SAP');

    // Tab Locador (read-only spans) - usando dados básicos se disponíveis
    const locador = this.locadores.find(l => l.status === 'ativo');
    this.setElementText('detParceiroNegocios', locador ? locador.nome : '-'); this.setElementOrigin('detParceiroNegocios', 'SAP');
    this.setElementText('detTipoIdFiscal', locador ? (locador.tipo === 'fisica' ? 'CPF' : 'CNPJ') : '-'); this.setElementOrigin('detTipoIdFiscal', 'SAP');
    this.setElementText('detDenominacaoFuncao', 'Proponente Credor'); this.setElementOrigin('detDenominacaoFuncao', 'SAP');
    this.setElementText('detInicioRelacao', imovel.inicioRelacao || '-'); this.setElementOrigin('detInicioRelacao', 'SAP');
    this.setElementText('detFimRelacao', imovel.fimRelacao || '-'); this.setElementOrigin('detFimRelacao', 'SAP');
    this.setElementText('detNomeLocador', locador ? locador.nome : '-'); this.setElementOrigin('detNomeLocador', 'SAP');
    this.setElementText('detLocadorCep', locador?.endereco?.cep || '-'); this.setElementOrigin('detLocadorCep', 'SAP');
    this.setElementText('detLocadorEndereco', locador?.endereco?.logradouro || '-'); this.setElementOrigin('detLocadorEndereco', 'SAP');
    this.setElementText('detLocadorNumero', locador?.endereco?.numero || '-'); this.setElementOrigin('detLocadorNumero', 'SAP');
    this.setElementText('detLocadorBairro', locador?.endereco?.bairro || '-'); this.setElementOrigin('detLocadorBairro', 'SAP');
    this.setElementText('detLocadorLocal', locador?.endereco?.cidade || '-'); this.setElementOrigin('detLocadorLocal', 'SAP');
    this.setElementText('detLocadorUf', locador?.endereco?.estado || '-'); this.setElementOrigin('detLocadorUf', 'SAP');
    this.setElementText('detLocadorEmail', locador?.email || '-'); this.setElementOrigin('detLocadorEmail', 'SAP');
    this.setElementText('detLocadorTelefoneFixo', locador?.telefone || '-'); this.setElementOrigin('detLocadorTelefoneFixo', 'SAP');
    this.setElementText('detLocadorTelefoneCelular', '-'); this.setElementOrigin('detLocadorTelefoneCelular', 'SAP');
    this.setElementText('detLocadorDoc', locador?.documento || '-'); this.setElementOrigin('detLocadorDoc', 'SAP');

    // Participação e Pagamento
    this.setElementText('detValorAluguelMensal', this.formatCurrency(imovel.valorAluguelMensal));
    this.setElementText('detDataVencimentoAluguel', imovel.dataVencimentoAluguel || '-');
    const formaMap: Record<string, string> = { transferencia: 'Transferência', gru: 'GRU', boleto: 'Boleto' };
    this.setElementText('detFormaPagamentoAluguel', imovel.formaPagamentoAluguel ? formaMap[imovel.formaPagamentoAluguel] : '-');

    const lista = document.getElementById('listaParticipacaoLocadores');
    if (lista) {
      lista.innerHTML = '';
      const parts = imovel.locadoresParticipacao || [];
      parts.forEach(p => {
        const l = this.locadores.find(lo => lo.id === p.locadorId);
        const card = document.createElement('div');
        card.className = 'card-item';
        const title = document.createElement('div');
        title.className = 'title-row';
        const name = document.createElement('strong');
        name.textContent = l?.nome || 'Locador';
        title.appendChild(name);
        if (l) {
          const badgeTipo = document.createElement('span');
          badgeTipo.className = `badge ${l.tipo === 'fisica' ? 'pf' : 'pj'}`;
          badgeTipo.textContent = l.tipo === 'fisica' ? 'PF' : 'PJ';
          title.appendChild(badgeTipo);
          if (l.parteRelacionada) {
            const badgePR = document.createElement('span');
            badgePR.className = 'badge flag';
            badgePR.textContent = 'Parte Relacionada';
            title.appendChild(badgePR);
          }
        }
        card.appendChild(title);

        const chips = document.createElement('div');
        chips.className = 'chip-row';
        const chipPerc = document.createElement('span');
        chipPerc.className = 'badge';
        chipPerc.textContent = `Percentual: ${p.percentual}%`;
        chips.appendChild(chipPerc);
        const chipForma = document.createElement('span');
        chipForma.className = `badge pay-${p.formaPagamento}`;
        chipForma.textContent = `Pagamento: ${formaMap[p.formaPagamento]}`;
        chips.appendChild(chipForma);
        card.appendChild(chips);
        if (p.formaPagamento === 'transferencia' && p.dadosBancarios) {
          const bank = document.createElement('div');
          bank.style.marginTop = '6px';
          bank.innerHTML = `<div class="mini-label">Dados bancários</div>
            <div>${p.dadosBancarios.banco || '-'} · Agência ${p.dadosBancarios.agencia || '-'}-${p.dadosBancarios.dvAgencia || '-'} · Operação ${p.dadosBancarios.operacaoProduto || '-'} · Conta ${p.dadosBancarios.conta || '-'}-${p.dadosBancarios.dvConta || '-'}</div>`;
          card.appendChild(bank);
        }

        if (p.representanteLegal) {
          const rep = document.createElement('div');
          rep.style.marginTop = '6px';
          rep.innerHTML = `<div class="mini-label">Representante Legal</div>
            <div>${p.representanteLegal.nome} (${p.representanteLegal.documento})</div>`;
          card.appendChild(rep);
        }

        if (p.recebedorDivergente) {
          const rec = document.createElement('div');
          rec.style.marginTop = '6px';
          rec.innerHTML = `<div class="mini-label">Recebedor Divergente</div>
            <div>${p.recebedorDivergente.nome} (${p.recebedorDivergente.documento})</div>`;
          card.appendChild(rec);
        }

        const beneCount = (p.beneficiarios || []).length;
        if (beneCount > 0) {
          const ben = document.createElement('div');
          ben.style.marginTop = '6px';
          const items = (p.beneficiarios || []).map(b => `${b.nome} (${b.documento})${typeof b.percentual === 'number' ? ` – ${b.percentual}%` : ''}`).join('<br/>');
          ben.innerHTML = `<div class="mini-label">Beneficiários</div><div>${items}</div>`;
          card.appendChild(ben);
        }

        lista.appendChild(card);
      });

      // Resumo da soma de percentuais
      const total = parts.reduce((acc, p) => acc + (p.percentual || 0), 0);
      const resumo = document.createElement('div');
      resumo.className = 'card-item';
      const ok = Math.abs(total - 100) < 0.001;
      resumo.innerHTML = `<div class="mini-label">Soma dos percentuais</div><div style="font-weight:600; ${ok ? 'color:#0F5132;' : 'color:#842029;'}">${total.toFixed(2)}%</div>`;
      lista.appendChild(resumo);
    }

    // Renderiza histórico de pagamentos após a distribuição dos locadores
    this.renderHistoricoPagamentos(imovel);

    // Renderiza aba de Aditivos (resumo e tabela)
    this.renderAditivos(imovel);

    const beneList = document.getElementById('listaBeneficiariosImovel');
    if (beneList) {
      beneList.innerHTML = '';
      (imovel.beneficiariosImovel || []).forEach(b => {
        const card = document.createElement('div');
        card.className = 'card-item';
        const title = document.createElement('div');
        title.className = 'title-row';
        const name = document.createElement('strong');
        name.textContent = b.nome;
        title.appendChild(name);
        card.appendChild(title);
        const data = document.createElement('div');
        data.innerHTML = `<div class="mini-label">Documento</div><div>${b.documento}</div>`;
        card.appendChild(data);
        if (typeof b.percentual === 'number') {
          const perc = document.createElement('div');
          perc.innerHTML = `<div class="mini-label">Percentual</div><div>${b.percentual}%</div>`;
          card.appendChild(perc);
        }
        beneList.appendChild(card);
      });
    }

    // SICLG - Gestão e Publicação
    this.setElementText('detNumeroProcesso', imovel.numeroProcesso || '-'); this.setElementOrigin('detNumeroProcesso', 'SICLG');
    this.setElementText('detNumeroInstrumento', imovel.numeroInstrumento || '-'); this.setElementOrigin('detNumeroInstrumento', 'SICLG');
    this.setElementText('detNumeroLicitacao', imovel.numeroLicitacao || '-'); this.setElementOrigin('detNumeroLicitacao', 'SICLG');
    this.setElementText('detTipoInstrumento', imovel.tipoInstrumento || '-'); this.setElementOrigin('detTipoInstrumento', 'SICLG');
    this.setElementText('detSituacao', imovel.situacao || '-'); this.setElementOrigin('detSituacao', 'SICLG');
    this.setElementText('detIdPncp', imovel.idContratoPncp || '-'); this.setElementOrigin('detIdPncp', 'SICLG');
    this.setElementText('detDescricaoObjeto', imovel.descricaoObjeto || '-'); this.setElementOrigin('detDescricaoObjeto', 'SICLG');
    this.setElementText('detEnquadramentoLegal', imovel.enquadramentoLegal || '-'); this.setElementOrigin('detEnquadramentoLegal', 'SICLG');
    this.setElementText('detDataAssinatura', this.formatDate(imovel.dataAssinatura)); this.setElementOrigin('detDataAssinatura', 'SICLG');
    this.setElementText('detVigenciaInicial', this.formatDate(imovel.vigenciaInicial)); this.setElementOrigin('detVigenciaInicial', 'SICLG');
    this.setElementText('detVigenciaFinal', this.formatDate(imovel.vigenciaFinal)); this.setElementOrigin('detVigenciaFinal', 'SICLG');
    this.setElementText('detFornecedor', imovel.fornecedor || '-'); this.setElementOrigin('detFornecedor', 'SICLG');
    this.setElementText('detModalidade', imovel.modalidade || '-'); this.setElementOrigin('detModalidade', 'SICLG');
    this.setElementText('detGestorFormal', imovel.gestorFormal || '-'); this.setElementOrigin('detGestorFormal', 'SICLG');
    this.setElementText('detGestaoOperacional', imovel.gestaoOperacional || '-'); this.setElementOrigin('detGestaoOperacional', 'SICLG');
    this.setElementText('detDataPublicacao', this.formatDate(imovel.dataPublicacao)); this.setElementOrigin('detDataPublicacao', 'SICLG');
    this.setElementText('detEquipeResponsavel', imovel.equipeResponsavel || '-'); this.setElementOrigin('detEquipeResponsavel', 'SICLG');

    // SICLG - Valores
    this.setElementText('detValorOriginal', this.formatCurrency(imovel.valorOriginal)); this.setElementOrigin('detValorOriginal', 'SICLG');
    this.setElementText('detValorGlobalAtual', this.formatCurrency(imovel.valorGlobalAtualizado)); this.setElementOrigin('detValorGlobalAtual', 'SICLG');
    this.setElementText('detValorVigenciaAtual', this.formatCurrency(imovel.valorVigenciaAtual)); this.setElementOrigin('detValorVigenciaAtual', 'SICLG');
    this.setElementText('detValorGlobalAditivado', this.formatCurrency(imovel.valorGlobalAditivado)); this.setElementOrigin('detValorGlobalAditivado', 'SICLG');
    const pror = imovel.prorrogavel;
    this.setElementText('detProrrogavel', typeof pror === 'boolean' ? (pror ? 'Sim' : 'Não') : (pror || '-')); this.setElementOrigin('detProrrogavel', 'SICLG');
    this.setElementText('detTipoGarantida', imovel.tipoGarantida || '-'); this.setElementOrigin('detTipoGarantida', 'SICLG');

    // SICLG - Compliance e Riscos
    this.setElementText('detRiscoSocial', imovel.riscoSocial || '-'); this.setElementOrigin('detRiscoSocial', 'SICLG');
    this.setElementText('detRiscoAmbiental', imovel.riscoAmbiental || '-'); this.setElementOrigin('detRiscoAmbiental', 'SICLG');
    this.setElementText('detRiscoClimatico', imovel.riscoClimatico || '-'); this.setElementOrigin('detRiscoClimatico', 'SICLG');
    const cond = imovel.codigoCondutaAssinado;
    this.setElementText('detCodigoCondutaAssinado', typeof cond === 'boolean' ? (cond ? 'Sim' : 'Não') : (cond || '-')); this.setElementOrigin('detCodigoCondutaAssinado', 'SICLG');
    this.setElementText('detPartesRelacionadas', imovel.partesRelacionadas || '-'); this.setElementOrigin('detPartesRelacionadas', 'SICLG');
    this.setElementText('detFornecedorTerceiroRelevante', imovel.fornecedorTerceiroRelevante || '-'); this.setElementOrigin('detFornecedorTerceiroRelevante', 'SICLG');
    this.setElementText('detFornecedorCondenadoCrimeAmbiental', imovel.fornecedorCondenadoCrimeAmbiental || '-'); this.setElementOrigin('detFornecedorCondenadoCrimeAmbiental', 'SICLG');
    this.setElementText('detFornecedorSujeitoLicenciamentoAmbiental', imovel.fornecedorSujeitoLicenciamentoAmbiental || '-'); this.setElementOrigin('detFornecedorSujeitoLicenciamentoAmbiental', 'SICLG');

    // Blocos estratégicos transversais
    this.renderAlertasContrato(imovel);
    this.renderTimelineContrato(imovel);
  }

  private renderAlertasContrato(imovel: Imovel): void {
    const lista = document.getElementById('listaAlertasContrato');
    if (!lista) return;

    const hoje = new Date();
    const alertas: Array<{ nivel: 'alto' | 'medio' | 'baixo'; titulo: string; detalhe: string }> = [];

    const fim = this.parseDate(imovel.fimValidade || imovel.contratoFimValidade);
    if (fim) {
      const dias = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (dias <= 0) {
        alertas.push({ nivel: 'alto', titulo: 'Contrato vencido', detalhe: `Vencimento em ${this.formatDate(imovel.fimValidade || imovel.contratoFimValidade)}.` });
      } else if (dias <= 120) {
        alertas.push({ nivel: 'medio', titulo: 'Contrato próximo do vencimento', detalhe: `Faltam ${dias} dia(s) para o vencimento.` });
      }
    }

    const condutaAssinada = typeof imovel.codigoCondutaAssinado === 'boolean'
      ? imovel.codigoCondutaAssinado
      : String(imovel.codigoCondutaAssinado || '').toLowerCase() === 'sim';
    if (!condutaAssinada) {
      alertas.push({ nivel: 'medio', titulo: 'Compliance pendente', detalhe: 'Código de conduta não confirmado para o contrato.' });
    }

    if (!imovel.tipoGarantida || imovel.tipoGarantida === '-') {
      alertas.push({ nivel: 'baixo', titulo: 'Garantia não informada', detalhe: 'Tipo de garantia ausente para acompanhamento de risco.' });
    }

    const possuiAditivos = (imovel.termosAditivos || []).length > 0;
    if (!possuiAditivos) {
      alertas.push({ nivel: 'baixo', titulo: 'Índice de reajuste sem histórico', detalhe: 'Não há reajustes/aditivos registrados para análise financeira.' });
    }

    lista.innerHTML = '';

    // Notificação remanejada da antiga aba Ciclo de Vida
    const notificacao = document.createElement('div');
    notificacao.className = 'card-item';
    notificacao.innerHTML = '<strong>Notificações</strong><div class="mini-label" style="margin-top:6px">Alertas de vigência e conformidade ativos</div>';
    lista.appendChild(notificacao);

    if (!alertas.length) {
      const ok = document.createElement('div');
      ok.className = 'card-item';
      ok.innerHTML = '<strong>Sem alertas críticos no momento</strong><div class="mini-label" style="margin-top:6px">Monitoramento automático ativo para este contrato.</div>';
      lista.appendChild(ok);
      return;
    }

    const corNivel: Record<'alto' | 'medio' | 'baixo', string> = {
      alto: '#842029',
      medio: '#664d03',
      baixo: '#0c5460'
    };

    alertas.forEach((alerta) => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.innerHTML = `
        <div class="title-row">
          <strong>${alerta.titulo}</strong>
          <span class="badge" style="border-color:${corNivel[alerta.nivel]};color:${corNivel[alerta.nivel]}">${alerta.nivel.toUpperCase()}</span>
        </div>
        <div class="mini-label" style="margin-top:6px">${alerta.detalhe}</div>
      `;
      lista.appendChild(card);
    });
  }

  private renderTimelineContrato(imovel: Imovel): void {
    const timeline = document.getElementById('timelineContrato');
    if (!timeline) return;

    const valorAssinatura = Number(
      imovel.valorMensalEstimadoOriginal
      || imovel.valorAluguelMensal
      || imovel.valor
      || 0
    );

    const detalheAssinatura = valorAssinatura > 0
      ? `Formalização inicial do contrato. (${this.formatCurrency(valorAssinatura)})`
      : 'Formalização inicial do contrato.';

    const eventoAssinatura: { data: Date | null; dataTexto: string; titulo: string; detalhe: string } = {
      data: this.parseDate(imovel.dataAssinatura || imovel.dataRegistro),
      dataTexto: this.formatDate(imovel.dataAssinatura || imovel.dataRegistro),
      titulo: 'Assinatura',
      detalhe: detalheAssinatura
    };

    const eventosAditivos: Array<{ data: Date | null; dataTexto: string; titulo: string; detalhe: string }> = [];

    (imovel.termosAditivos || []).forEach((ta, idx) => {
      const ref = ta.dataInicioEfeitosFinanceiros || ta.dataVigenciaInicio || ta.dataVigenciaFim;
      const numeros = (ta.numeroTA || '').match(/\d+/g) || [];
      const numeroExtraido = parseInt(numeros[numeros.length - 1] || '', 10);
      const sequencial = Number.isFinite(numeroExtraido) ? numeroExtraido : (idx + 1);
      const sequencialFormatado = String(Math.min(Math.max(sequencial, 1), 99)).padStart(2, '0');
      eventosAditivos.push({
        data: this.parseDate(ref),
        dataTexto: this.formatDate(ref),
        titulo: `Aditivo TA-${sequencialFormatado}`,
        detalhe: `${ta.tipoDemanda || 'Alteração contratual'} (${this.formatCurrency(ta.valorMensalEstimado || ta.valorGlobalEstimadoAditivo || 0)})`
      });
    });

    const eventoEncerramento: { data: Date | null; dataTexto: string; titulo: string; detalhe: string } = {
      data: this.parseDate(imovel.fimValidade || imovel.contratoFimValidade),
      dataTexto: this.formatDate(imovel.fimValidade || imovel.contratoFimValidade),
      titulo: 'Encerramento previsto',
      detalhe: 'Marco de fim da vigência contratual.'
    };

    const aditivosOrdenados = eventosAditivos.sort((a, b) => {
      const ta = a.data ? a.data.getTime() : Number.MAX_SAFE_INTEGER;
      const tb = b.data ? b.data.getTime() : Number.MAX_SAFE_INTEGER;
      return ta - tb;
    });

    const ordenados: Array<{ data: Date | null; dataTexto: string; titulo: string; detalhe: string }> = [
      eventoAssinatura,
      ...aditivosOrdenados,
      eventoEncerramento
    ];

    timeline.innerHTML = '';
    ordenados.forEach((evento) => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.innerHTML = `
        <div class="title-row">
          <strong>${evento.titulo}</strong>
          <span class="badge">${evento.dataTexto}</span>
        </div>
        <div class="mini-label" style="margin-top:6px">${evento.detalhe}</div>
      `;
      timeline.appendChild(card);
    });
  }

  // --- Aba Solicitar Serviços ---
  private inicializarAbaServicos(imovel: Imovel): void {
    const catGrid = document.getElementById('wizCategoria') as HTMLDivElement | null;
    const acaoGrid = document.getElementById('wizAcao') as HTMLDivElement | null;
    const acaoBlock = document.getElementById('wizAcaoBlock') as HTMLDivElement | null;
    const modRow = document.getElementById('wizModalidade') as HTMLDivElement | null;
    const modBlock = document.getElementById('wizModalidadeBlock') as HTMLDivElement | null;
    const cenarioRow = document.getElementById('wizCenario') as HTMLDivElement | null;
    const cenarioBlock = document.getElementById('wizCenarioBlock') as HTMLDivElement | null;
    const descricao = document.getElementById('servicoDescricao') as HTMLDivElement | null;
    const listaPreenchidos = document.getElementById('dadosPreenchidos') as HTMLUListElement | null;
    const listaPendentes = document.getElementById('dadosPendentes') as HTMLUListElement | null;
    const payloadPreview = document.getElementById('payloadPreview') as HTMLPreElement | null;
    const payloadBlock = document.getElementById('payloadBlock') as HTMLDivElement | null;
    const detalhesBlock = document.getElementById('detalhesDadosBlock') as HTMLDivElement | null;
    const toggleDetalhes = document.getElementById('toggleDetalhesTecnicos') as HTMLButtonElement | null;
    const btn = document.getElementById('btnSolicitarServico') as HTMLButtonElement | null;

    if (!catGrid || !acaoGrid || !modRow || !descricao || !listaPreenchidos || !listaPendentes || !btn) return;

    const mapa = this.carregarServicosHierarquia();
    const acoesEmAndamento = new Set<string>();
    (imovel.termosAditivos || []).forEach((ta) => {
      const tipo = (ta.tipoDemanda || '').toLowerCase();
      if (tipo.includes('titularidade')) {
        acoesEmAndamento.add('alteracao-titularidade');
      }
    });
    // Categoria única: Ato Formal
    let categoriaSel = 'ato-formal';
    let acaoSel = '';
    let modalidadeSel = '';
    let cenarioSel: 'completo' | 'pendencias' = 'completo';
    const imovelBase: Imovel = { ...imovel };

    const aplicarPendencias = (def: {requisitos: string[]}, base: Imovel): Imovel => {
      const clone: Imovel = { ...base };
      for (const req of def.requisitos) {
        switch (req) {
          case 'cep': clone.cep = ''; break;
          case 'endereco': clone.endereco = ''; break;
          case 'cidade': clone.cidade = ''; break;
          case 'estado': clone.estado = ''; break;
          case 'fimValidade': clone.fimValidade = ''; break;
          default: break;
        }
      }
      return clone;
    };

    

    const makeCard = (label: string, desc?: string): HTMLButtonElement => {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.display = 'flex';
      b.style.flexDirection = 'column';
      b.style.alignItems = 'flex-start';
      b.style.gap = '4px';
      b.style.padding = '6px 8px';
      b.style.border = '1px solid #d0d7de';
      b.style.borderRadius = '8px';
      // background definido via CSS para permitir seleção inverter cores
      b.style.cursor = 'pointer';
      b.style.textAlign = 'left';
      b.className = 'card';
      const strong = document.createElement('strong');
      strong.textContent = label;
      const span = document.createElement('span');
      span.textContent = desc || '';
      span.style.color = '#555';
      span.style.fontSize = '.85rem';
      b.appendChild(strong);
      if (desc) b.appendChild(span);
      return b;
    };

    const makeChip = (label: string): HTMLButtonElement => {
      const c = document.createElement('button');
      c.type = 'button';
      c.textContent = label;
      c.style.padding = '4px 8px';
      c.style.border = '1px solid #d0d7de';
      c.style.borderRadius = '999px';
      // background definido via CSS para permitir seleção inverter cores
      c.style.cursor = 'pointer';
      c.className = 'chip';
      return c;
    };

    // Favoritos e recentes removidos do contexto

    const atualizarResumo = () => {
      const def = mapa[categoriaSel]?.[acaoSel]?.[modalidadeSel];
      if (!def) { descricao.textContent = ''; listaPreenchidos.innerHTML = ''; listaPendentes.innerHTML = ''; if(payloadPreview) payloadPreview.textContent=''; btn.disabled = true; return; }
      descricao.textContent = def.descricao;
      const imovelUsado = cenarioSel === 'pendencias' ? aplicarPendencias(def, imovelBase) : imovelBase;
      const resumo = this.montarResumoCampos(def, imovelUsado);
      this.atualizarResumoDados(listaPreenchidos, listaPendentes, resumo);
      const payload = this.montarPayloadSolicitacao({ id: def.id, nome: def.nome }, imovelUsado);
      if (payloadPreview) payloadPreview.textContent = JSON.stringify(payload, null, 2);
      btn.disabled = !this.validarRequisitos(def, imovelUsado);
      if (toggleDetalhes) {
        const count = resumo.pendentes.length;
        const aberto = detalhesBlock && detalhesBlock.style.display !== 'none';
        toggleDetalhes.textContent = aberto ? 'Ocultar detalhes técnicos' : (count > 0 ? `Mostrar detalhes técnicos (${count} pendências)` : 'Mostrar detalhes técnicos');
      }
    };

    const renderCategorias = () => {
      catGrid.innerHTML = '';
      const categorias = Object.keys(mapa).filter(c => c === 'ato-formal');
      for (const c of categorias) {
        const label = labelCategoria(c);
        const card = makeCard(label);
        card.onclick = () => {
          categoriaSel = c;
          acaoSel = '';
          modalidadeSel = '';
          renderCategorias();
          // Com categoria única, sempre renderiza ações
          if (acaoGrid) acaoGrid.innerHTML = '';
          renderAcoes();
          renderModalidades();
          atualizarResumo();
          // Mostrar/ocultar bloco de Ação conforme categoria (forçando prioridade)
          if (acaoBlock) acaoBlock.style.setProperty('display', 'grid', 'important');
        };
        if (categoriaSel === c) card.classList.add('selected');
        catGrid.appendChild(card);
      }
    };

    const renderAcoes = (filtro?: string) => {
      acaoGrid.innerHTML = '';
      const acoes = Object.keys(mapa[categoriaSel] || {});
      const termo = (filtro || '').toLowerCase();
      const filtradas = termo ? acoes.filter(a => this.capitalize(a.replace(/-/g,' ')).toLowerCase().includes(termo)) : acoes;
      for (const a of filtradas) {
        const label = labelAcao(categoriaSel, a);
        const bloqueada = acoesEmAndamento.has(a);
        const card = makeCard(label, bloqueada ? 'Solicitado em: 17/02/2026 - Status: Em andamento' : undefined);
        card.onclick = () => {
          if (bloqueada) return;
          acaoSel = a;
          modalidadeSel = '';
          // Re-render para refletir seleção visual
          renderAcoes();
          renderModalidades();
          renderCenario();
          atualizarResumo();
        };
        if (bloqueada) {
          card.disabled = true;
          card.style.opacity = '0.65';
          card.style.cursor = 'not-allowed';
          card.title = 'Serviço já solicitado anteriormente e em andamento';
          if (acaoSel === a) {
            acaoSel = '';
            modalidadeSel = '';
          }
        }
        if (acaoSel === a) card.classList.add('selected');
        acaoGrid.appendChild(card);
      }
      // Favoritos e recentes removidos
    };

    const renderModalidades = () => {
      modRow.innerHTML = '';
      const modalidades = Object.keys(mapa[categoriaSel]?.[acaoSel] || {});
      if (modalidades.length === 1 && modalidades[0] === 'nao-se-aplica') {
        modalidadeSel = 'nao-se-aplica';
        if (modBlock) modBlock.style.setProperty('display', 'none', 'important');
        return;
      }
      if (modBlock) modBlock.style.setProperty('display', 'grid', 'important');
      for (const m of modalidades) {
        const label = labelModalidade(m);
        const chip = makeChip(label);
        chip.onclick = () => { modalidadeSel = m; atualizarResumo(); };
        if (modalidadeSel === m) chip.classList.add('selected');
        modRow.appendChild(chip);
      }
    };

    const renderCenario = () => {
      if (!cenarioRow || !cenarioBlock) return;
      cenarioRow.innerHTML = '';
      cenarioBlock.style.setProperty('display', 'grid', 'important');
      const chipCompleto = makeChip('Completo');
      const chipPend = makeChip('Pendências');
      chipCompleto.onclick = () => { cenarioSel = 'completo'; renderCenario(); atualizarResumo(); };
      chipPend.onclick = () => { cenarioSel = 'pendencias'; renderCenario(); atualizarResumo(); };
      if (cenarioSel === 'completo') chipCompleto.classList.add('selected');
      if (cenarioSel === 'pendencias') chipPend.classList.add('selected');
      cenarioRow.appendChild(chipCompleto);
      cenarioRow.appendChild(chipPend);
    };

    // Busca removida: lista completa de ações por categoria

    btn.addEventListener('click', () => {
      const def = mapa[categoriaSel]?.[acaoSel]?.[modalidadeSel];
      if (!def) return;
      const imovelUsado = cenarioSel === 'pendencias' ? aplicarPendencias(def, imovelBase) : imovelBase;
      const payload = this.montarPayloadSolicitacao({ id: def.id, nome: def.nome }, imovelUsado);
      console.log('📦 Solicitação (protótipo):', payload);
      const mensagem = 'Solicitação registrada. Seus dados foram encaminhados ao módulo "Solicitar serviços". Em breve você poderá acompanhar o andamento.';
      this.showToast(mensagem);
    });

    // Inicialização
    renderCategorias();
    // Com categoria única, renderiza ações imediatamente
    renderAcoes();
    renderCenario();
    if (acaoBlock) acaoBlock.style.setProperty('display', 'grid', 'important');
    if (modBlock) modBlock.style.setProperty('display', 'none', 'important');
    atualizarResumo();

    // Toggle de detalhes técnicos: oculto por padrão
    if (toggleDetalhes && payloadBlock && detalhesBlock) {
      let visivel = false;
      toggleDetalhes.textContent = 'Mostrar detalhes técnicos';
      payloadBlock.style.setProperty('display', 'none', 'important');
      detalhesBlock.style.setProperty('display', 'none', 'important');
      toggleDetalhes.onclick = () => {
        visivel = !visivel;
        payloadBlock.style.setProperty('display', visivel ? 'block' : 'none', 'important');
        detalhesBlock.style.setProperty('display', visivel ? 'grid' : 'none', 'important');
        toggleDetalhes.textContent = visivel ? 'Ocultar detalhes técnicos' : 'Mostrar detalhes técnicos';
      };
    }
  }

  private carregarServicosHierarquia(): Record<string, Record<string, Record<string, {id:string; nome:string; descricao:string; requisitos: Array<'cep'|'endereco'|'cidade'|'estado'|'fimValidade'>}>>> {
    const make = (categoria:string, acao:string, modalidade:string, descricao:string, requisitos: Array<'cep'|'endereco'|'cidade'|'estado'|'fimValidade'>) => ({
      id: `${categoria}-${acao}-${modalidade}`,
      nome: `${this.capitalize(categoria.replace(/-/g,' '))} - ${this.capitalize(acao.replace(/-/g,' '))} - ${this.capitalize(modalidade)}`,
      descricao,
      requisitos
    });
    return {
      'mudanca-endereco': {
        'nao-se-aplica': {
          'nao-se-aplica': make('mudanca-endereco','nao-se-aplica','nao-se-aplica','Mudança de endereço do imóvel/contrato.', ['cep','endereco','cidade','estado'])
        }
      },
      'regularizacao': {
        'nao-se-aplica': {
          'nao-se-aplica': make('regularizacao','nao-se-aplica','nao-se-aplica','Regularização contratual.', ['fimValidade'])
        }
      },
      'ato-formal': {
        'prorrogacao': {
          'nao-se-aplica': make('ato-formal','prorrogacao','nao-se-aplica','Prorrogação de contrato.', ['fimValidade'])
        },
        'rescisao': {
          'nao-se-aplica': make('ato-formal','rescisao','nao-se-aplica','Rescisão contratual.', ['fimValidade'])
        },
        'alteracao-titularidade': {
          'nao-se-aplica': make('ato-formal','alteracao-titularidade','nao-se-aplica','Alteração de titularidade.', ['fimValidade'])
        },
        'antecipacao-parcela': {
          'nao-se-aplica': make('ato-formal','antecipacao-parcela','nao-se-aplica','Antecipação de parcela.', ['fimValidade'])
        },
        'recebimento-imovel': {
          'nao-se-aplica': make('ato-formal','recebimento-imovel','nao-se-aplica','Recebimento de imóvel.', ['cep','endereco','cidade','estado'])
        },
        'acrescimo-area': {
          'nao-se-aplica': make('ato-formal','acrescimo-area','nao-se-aplica','Acréscimo de área contratada.', ['fimValidade'])
        },
        'supressao-area': {
          'nao-se-aplica': make('ato-formal','supressao-area','nao-se-aplica','Supressão de área contratada.', ['fimValidade'])
        },
        'revisao-aluguel': {
          'nao-se-aplica': make('ato-formal','revisao-aluguel','nao-se-aplica','Revisão de aluguel.', ['fimValidade'])
        },
        'reajuste-aluguel': {
          'nao-se-aplica': make('ato-formal','reajuste-aluguel','nao-se-aplica','Reajuste de aluguel.', ['fimValidade'])
        },
        'apostilamento': {
          'nao-se-aplica': make('ato-formal','apostilamento','nao-se-aplica','Apostilamento contratual.', ['fimValidade'])
        },
        'acao-renovatoria': {
          'nao-se-aplica': make('ato-formal','acao-renovatoria','nao-se-aplica','Ação renovatória.', ['fimValidade'])
        }
      }
    };
  }

  private popularServicosSelect(select: HTMLSelectElement, lista: Array<{id:string; nome:string}>): void {
    select.innerHTML = '';
    for (const s of lista) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.nome;
      select.appendChild(opt);
    }
  }

  private filtrarServicos(select: HTMLSelectElement, lista: Array<{id:string; nome:string}>, termo: string): void {
    const termoLower = termo.toLowerCase();
    const filtrados = lista.filter(s => s.nome.toLowerCase().includes(termoLower));
    this.popularServicosSelect(select, filtrados.length ? filtrados : lista);
  }

  private validarRequisitos(servico: {requisitos: string[]}, imovel: Imovel): boolean {
    const has = (k: string) => {
      switch (k) {
        case 'cep': return !!imovel.cep;
        case 'endereco': return !!imovel.endereco;
        case 'cidade': return !!imovel.cidade;
        case 'estado': return !!imovel.estado;
        case 'fimValidade': return !!imovel.fimValidade;
        default: return true;
      }
    };
    return servico.requisitos.every(has);
  }

  private montarResumoCampos(servico: {requisitos: string[]}, imovel: Imovel): { preenchidos: Array<{label:string;value:string}>, pendentes: Array<{label:string}> } {
    const camposBase: Array<{key:string; label:string; value?:string}> = [
      { key: 'codigo', label: 'Contrato', value: imovel.codigo },
      { key: 'denominacao', label: 'Denominação', value: imovel.denominacao },
      { key: 'parceiroNegocios', label: 'Parceiro', value: imovel.parceiroNegocios },
      { key: 'cep', label: 'CEP', value: imovel.cep },
      { key: 'endereco', label: 'Endereço', value: imovel.endereco },
      { key: 'bairro', label: 'Bairro', value: imovel.bairro },
      { key: 'cidade', label: 'Cidade', value: imovel.cidade },
      { key: 'estado', label: 'UF', value: imovel.estado },
      { key: 'fimValidade', label: 'Fim da validade', value: imovel.fimValidade }
    ];
    const preenchidos: Array<{label:string;value:string}> = [];
    const pendentes: Array<{label:string}> = [];
    for (const c of camposBase) {
      if (c.value) preenchidos.push({ label: c.label, value: c.value });
      else pendentes.push({ label: c.label });
    }
    // Destacar requisitos faltantes especificamente
    const labels: Record<string,string> = { cep: 'CEP', endereco: 'Endereço', cidade: 'Cidade', estado: 'UF', fimValidade: 'Fim da validade' };
    for (const req of servico.requisitos) {
      const val = (imovel as any)[req];
      if (!val) pendentes.push({ label: labels[req] || req });
    }
    return { preenchidos, pendentes };
  }

  private atualizarResumoDados(preenchidosEl: HTMLUListElement, pendentesEl: HTMLUListElement, resumo: { preenchidos: Array<{label:string;value:string}>, pendentes: Array<{label:string}> }): void {
    preenchidosEl.innerHTML = '';
    pendentesEl.innerHTML = '';
    const pendentesCol = document.getElementById('dadosPendentesCol') as HTMLDivElement | null;
    const preenchidosCol = document.getElementById('dadosPreenchidosCol') as HTMLDivElement | null;
    for (const p of resumo.preenchidos) {
      const li = document.createElement('li');
      li.textContent = `${p.label}: ${p.value}`;
      li.style.color = '#2e7d32';
      preenchidosEl.appendChild(li);
    }
    for (const f of resumo.pendentes) {
      const li = document.createElement('li');
      li.textContent = `${f.label}: —`;
      li.style.color = '#b26a00';
      pendentesEl.appendChild(li);
    }
    // Oculta coluna de pendentes quando não houver itens
    if (pendentesCol) pendentesCol.style.display = resumo.pendentes.length ? 'block' : 'none';
    // Mantém coluna de preenchidos visível quando houver pelo menos um item
    if (preenchidosCol) preenchidosCol.style.display = resumo.preenchidos.length ? 'block' : 'none';
  }

  private montarPayloadSolicitacao(servico: {id:string; nome:string}, imovel: Imovel): Record<string, unknown> {
    return {
      servico: { id: servico.id, nome: servico.nome },
      imovel: {
        id: imovel.id,
        codigo: imovel.codigo,
        endereco: imovel.endereco,
        cep: imovel.cep,
        cidade: imovel.cidade,
        estado: imovel.estado,
        fimValidade: imovel.fimValidade
      },
      origem: this.usandoDadosSAP ? 'SAP' : 'Demo',
      criadoEm: new Date().toISOString()
    };
  }

  /**
   * Helper para capitalizar texto
   */
  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Helper para setar texto em elemento
   */
  private setElementText(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  private setElementOrigin(id: string, origin?: 'SAP' | 'SICLG'): void {
    const element = document.getElementById(id);
    if (!element) return;
    if (origin) (element as HTMLElement).setAttribute('data-origin', origin);
    else (element as HTMLElement).removeAttribute('data-origin');
  }

  private formatDate(value?: string): string {
    if (!value) return '-';
    // aceita DD/MM/AAAA ou ISO
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? (value || '-') : d.toLocaleDateString('pt-BR');
  }

  private formatCurrency(value?: number | string): string {
    if (value === undefined || value === null || value === '') return '-';
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.,-]/g, '').replace(',', '.')) : value;
    if (isNaN(num as number)) return String(value);
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num as number);
    } catch {
      return `R$ ${(num as number).toFixed(2)}`;
    }
  }

  /**
   * Calcula o status do contrato com base nas datas.
   */
  private calcularStatusContrato(imovel: Imovel): string {
    const hoje = new Date();
    const inicio = this.parseDate(imovel.contratoInicio || imovel.dataRegistro);
    const fim = this.parseDate(imovel.contratoFimValidade || imovel.fimValidade);
    const rescisao = this.parseDate(imovel.contratoRescisaoEm);

    if (rescisao && rescisao <= hoje) return 'Rescindido';
    if (fim && fim < hoje) return 'Vencido';
    if (inicio && inicio > hoje) return 'Aguardando início';
    if (inicio && (!fim || fim >= hoje)) return 'Vigente';
    return 'Indefinido';
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    // Aceita formatos DD/MM/AAAA ou ISO
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split('/').map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private renderHistoricoPagamentos(imovel: Imovel): void {
    const table = document.getElementById('tabelaHistoricoPagamentos') as HTMLTableElement | null;
    const resumo = document.getElementById('resumoEncargosAtraso');
    if (!table) return;
    const tbody = table.querySelector('tbody')!;
    tbody.innerHTML = '';
    let totalMulta = 0, totalJuros = 0;
    const rows = (imovel.historicoPagamentos || []);
    rows.forEach(p => {
      const enc = this.calcularEncargos(p.valor, p.vencimento, p.pagoEm);
      totalMulta += enc.multa;
      totalJuros += enc.juros;
      const tr = document.createElement('tr');
      const status = (() => {
        if (p.pagoEm) {
          const due = this.parseDate(p.vencimento)!;
          const pay = this.parseDate(p.pagoEm)!;
          return pay > due ? 'Pago com atraso' : 'Pago em dia';
        }
        const due = this.parseDate(p.vencimento)!;
        return new Date() > due ? 'Em atraso' : 'Em aberto';
      })();
      const total = p.pagoEm ? (p.valorPago ?? (enc.total)) : enc.total;
      tr.innerHTML = `
        <td>${p.competencia}</td>
        <td>${p.vencimento}</td>
        <td>${this.formatCurrency(p.valor)}</td>
        <td>${status}</td>
        <td>${p.pagoEm ? this.formatDate(p.pagoEm) : '-'}</td>
        <td>${enc.multa > 0 ? this.formatCurrency(enc.multa) : '-'}</td>
        <td>${enc.juros > 0 ? this.formatCurrency(enc.juros) : '-'}</td>
        <td>${this.formatCurrency(total)}</td>
      `;
      tbody.appendChild(tr);
    });
    if (resumo) {
      resumo.textContent = `Multas acumuladas: ${this.formatCurrency(totalMulta)} · Juros acumulados: ${this.formatCurrency(totalJuros)}`;
    }
  }

  private configurarCollapsibles(): void {
    const sections = Array.from(document.querySelectorAll('.info-section.collapsible')) as HTMLElement[];
    for (const sec of sections) {
      const btn = sec.querySelector('.collapse-toggle') as HTMLButtonElement | null;
      if (!btn) continue;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      sec.classList.toggle('collapsed', !expanded);
      btn.textContent = expanded ? 'Recolher' : 'Expandir';
      btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', (!isExpanded).toString());
        btn.textContent = !isExpanded ? 'Recolher' : 'Expandir';
        sec.classList.toggle('collapsed', isExpanded);
      });
    }
  }

  private configurarSectionIndex(): void {
    const indices = Array.from(document.querySelectorAll('.section-index')) as HTMLElement[];
    if (!indices.length) return;
    for (const index of indices) {
      const links = Array.from(index.querySelectorAll('a')) as HTMLAnchorElement[];
      for (const link of links) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href') || '';
          const id = href.startsWith('#') ? href.slice(1) : href;
          const target = document.getElementById(id);
          if (!target) return;
          // Expand section if collapsed
          if (target.classList.contains('collapsible') && target.classList.contains('collapsed')) {
            const tbtn = target.querySelector('.collapse-toggle') as HTMLButtonElement | null;
            if (tbtn) {
              tbtn.setAttribute('aria-expanded', 'true');
              tbtn.textContent = 'Recolher';
              target.classList.remove('collapsed');
            }
          }
          try {
            target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
          } catch {
            const modal = document.querySelector('.modal') as HTMLElement | null;
            if (modal) {
              const top = target.getBoundingClientRect().top - modal.getBoundingClientRect().top + modal.scrollTop - 60;
              modal.scrollTo({ top, behavior: 'smooth' });
            }
          }
        });
      }
    }
  }

  private configurarDrawersDetalhes(): void {
    this.configurarDrawerPorTab('tab-contrato', 'contratoDrawerSources', 'contratoDrawer', 'contratoDrawerBackdrop', 'contratoDrawerContent', 'contratoDrawerTitle', 'contratoDrawerClose');
    this.configurarDrawerPorTab('tab-imovel', 'imovelDrawerSources', 'imovelDrawer', 'imovelDrawerBackdrop', 'imovelDrawerContent', 'imovelDrawerTitle', 'imovelDrawerClose');
    this.configurarDrawerPorTab('tab-locador', 'locadorDrawerSources', 'locadorDrawer', 'locadorDrawerBackdrop', 'locadorDrawerContent', 'locadorDrawerTitle', 'locadorDrawerClose');
    this.configurarDrawerPorTab('tab-aditivos', 'aditivosDrawerSources', 'aditivosDrawer', 'aditivosDrawerBackdrop', 'aditivosDrawerContent', 'aditivosDrawerTitle', 'aditivosDrawerClose');
    this.configurarDrawerPorTab('tab-alertas', 'alertasDrawerSources', 'alertasDrawer', 'alertasDrawerBackdrop', 'alertasDrawerContent', 'alertasDrawerTitle', 'alertasDrawerClose');
    this.configurarDrawerPorTab('tab-timeline', 'timelineDrawerSources', 'timelineDrawer', 'timelineDrawerBackdrop', 'timelineDrawerContent', 'timelineDrawerTitle', 'timelineDrawerClose');
    this.configurarDrawerPorTab('tab-servicos', 'servicosDrawerSources', 'servicosDrawer', 'servicosDrawerBackdrop', 'servicosDrawerContent', 'servicosDrawerTitle', 'servicosDrawerClose');
  }

  private configurarDrawerPorTab(
    tabId: string,
    sourcesId: string,
    drawerId: string,
    backdropId: string,
    contentId: string,
    titleId: string,
    closeId: string
  ): void {
    const tab = document.getElementById(tabId);
    const drawer = document.getElementById(drawerId);
    const drawerBackdrop = document.getElementById(backdropId);
    const drawerContent = document.getElementById(contentId);
    const drawerTitle = document.getElementById(titleId);
    const drawerClose = document.getElementById(closeId);
    const drawerSources = document.getElementById(sourcesId);

    if (!tab || !drawer || !drawerBackdrop || !drawerContent || !drawerTitle || !drawerClose || !drawerSources) {
      return;
    }

    const configAttr = `data-drawer-configured-${drawerId}`;
    if (tab.getAttribute(configAttr) === 'true') {
      return;
    }
    tab.setAttribute(configAttr, 'true');

    const triggers = Array.from(tab.querySelectorAll('.detail-card-trigger')) as HTMLButtonElement[];
    const fecharAtual = (): void => this.fecharDrawerPorTab(tabId, sourcesId, drawerId, backdropId, contentId);

    const abrirDrawer = (trigger: HTMLButtonElement): void => {
      const sectionId = trigger.dataset.drawerTarget;
      if (!sectionId) return;

      const section = document.getElementById(sectionId) as HTMLElement | null;
      if (!section || !drawerSources.contains(section)) return;

      fecharAtual();

      const title = trigger.dataset.drawerTitle || trigger.querySelector('strong')?.textContent || 'Detalhes';
      drawerTitle.textContent = title;

      drawerContent.appendChild(section);
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      drawerBackdrop.classList.add('active');
      drawerBackdrop.setAttribute('aria-hidden', 'false');

      triggers.forEach((btn) => btn.classList.remove('is-active'));
      trigger.classList.add('is-active');
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => abrirDrawer(trigger));
    });

    drawerClose.addEventListener('click', () => fecharAtual());
    drawerBackdrop.addEventListener('click', () => fecharAtual());

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawer.classList.contains('active')) {
        fecharAtual();
      }
    });
  }

  private fecharDrawerPorTab(tabId: string, sourcesId: string, drawerId: string, backdropId: string, contentId: string): void {
    const tab = document.getElementById(tabId);
    const drawer = document.getElementById(drawerId);
    const drawerBackdrop = document.getElementById(backdropId);
    const drawerContent = document.getElementById(contentId);
    const drawerSources = document.getElementById(sourcesId);

    if (tab) {
      const triggers = Array.from(tab.querySelectorAll('.detail-card-trigger')) as HTMLButtonElement[];
      triggers.forEach((btn) => btn.classList.remove('is-active'));
    }

    if (drawerContent && drawerSources) {
      const sections = Array.from(drawerContent.querySelectorAll('.drawer-section')) as HTMLElement[];
      sections.forEach((section) => drawerSources.appendChild(section));
    }

    if (drawer) {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
    }

    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('active');
      drawerBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  private fecharTodosDrawersDetalhes(): void {
    this.fecharDrawerPorTab('tab-contrato', 'contratoDrawerSources', 'contratoDrawer', 'contratoDrawerBackdrop', 'contratoDrawerContent');
    this.fecharDrawerPorTab('tab-imovel', 'imovelDrawerSources', 'imovelDrawer', 'imovelDrawerBackdrop', 'imovelDrawerContent');
    this.fecharDrawerPorTab('tab-locador', 'locadorDrawerSources', 'locadorDrawer', 'locadorDrawerBackdrop', 'locadorDrawerContent');
    this.fecharDrawerPorTab('tab-aditivos', 'aditivosDrawerSources', 'aditivosDrawer', 'aditivosDrawerBackdrop', 'aditivosDrawerContent');
    this.fecharDrawerPorTab('tab-alertas', 'alertasDrawerSources', 'alertasDrawer', 'alertasDrawerBackdrop', 'alertasDrawerContent');
    this.fecharDrawerPorTab('tab-timeline', 'timelineDrawerSources', 'timelineDrawer', 'timelineDrawerBackdrop', 'timelineDrawerContent');
    this.fecharDrawerPorTab('tab-servicos', 'servicosDrawerSources', 'servicosDrawer', 'servicosDrawerBackdrop', 'servicosDrawerContent');
  }

  private setInputValue(id: string, value: string): void {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = value || '';
  }

  private addEventListenerSafe(id: string, event: string, handler: (e: Event) => void): void {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  }

  private showToast(message: string): void {
    const cont = document.getElementById('toastContainer');
    if (!cont) { alert(message); return; }
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.background = '#2e7d32';
    toast.style.color = '#fff';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,.15)';
    toast.style.fontSize = '.95rem';
    toast.style.maxWidth = '360px';
    cont.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity .3s';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /* campos de edição removidos */

  /* campos de edição removidos */

  /* campos de edição removidos */

  // salvarLocador removido

  
  // salvarImovel removido

  private validarData(value: string, permitirVazio = false): boolean {
    if (!value) return permitirVazio;
    const m = value.match(/^([0-3]\d)\/(0\d|1[0-2])\/(\d{4})$/);
    if (!m) return false;
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    const dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
  }

  private mostrarErro(id: string, mostrar: boolean, mensagem?: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    (el as HTMLElement).style.display = mostrar ? 'block' : 'none';
    if (mensagem) el.textContent = mensagem;
  }

  // salvarContrato removido (read-only)

  /**
   * Formata o status para exibição
   */
  private formatarStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'ativo': 'Ativo',
      'prospeccao': 'Prospecção',
      'mobilizacao': 'Mobilização',
      'desmobilizacao': 'Desmobilização',
      'disponivel': 'Disponível',
      'ocupado': 'Ocupado',
      'manutencao': 'Manutenção',
      'vendido': 'Vendido'
    };
    return statusMap[status] || status;
  }

  /**
   * Configura o sistema de tabs do modal
   */
  private configurarTabs(): void {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        // Remove active de todos
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Adiciona active ao clicado
        btn.classList.add('active');
        if (tabContents[index]) {
          const tabAtiva = tabContents[index] as HTMLElement;
          tabAtiva.classList.add('active');
          this.abrirDetalhamentoPadraoAoEntrarNaAba(tabAtiva);
        }
      });
    });
  }

  /**
   * Configura detalhamento inline por card em uma aba, sem uso de drawer.
   */
  private configurarDetalhamentoInlinePorTab(tabId: string): void {
    const tab = document.getElementById(tabId);
    if (!tab) return;

    const configAttr = `data-inline-detail-configured-${tabId}`;
    if (tab.getAttribute(configAttr) === 'true') return;
    tab.setAttribute(configAttr, 'true');

    const triggers = Array.from(tab.querySelectorAll('.detail-card-trigger[data-inline-target]')) as HTMLButtonElement[];
    if (!triggers.length) return;

    const sectionsByTrigger = triggers
      .map((trigger) => {
        const targetId = trigger.dataset.inlineTarget;
        if (!targetId) return null;
        const section = document.getElementById(targetId) as HTMLElement | null;
        if (!section) return null;
        return { trigger, section };
      })
      .filter((item): item is { trigger: HTMLButtonElement; section: HTMLElement } => item !== null);

    const mostrarSecao = (targetSection: HTMLElement, targetTrigger: HTMLButtonElement): void => {
      sectionsByTrigger.forEach(({ trigger, section }) => {
        const ativa = section === targetSection;
        section.style.display = ativa ? '' : 'none';
        trigger.classList.toggle('is-active', ativa);
      });
    };

    // Inicia com os blocos retraídos; o conteúdo aparece apenas quando o usuário escolher um card.
    sectionsByTrigger.forEach(({ section, trigger }) => {
      section.style.display = 'none';
      trigger.classList.remove('is-active');
    });

    sectionsByTrigger.forEach(({ trigger, section }) => {
      trigger.addEventListener('click', () => {
        const estaAtiva = trigger.classList.contains('is-active');
        if (estaAtiva) {
          section.style.display = 'none';
          trigger.classList.remove('is-active');
          return;
        }
        mostrarSecao(section, trigger);
      });
    });
  }

  /**
   * Autoabre o detalhamento padrão ao entrar na aba quando configurado via data-auto-open-detail.
   */
  private abrirDetalhamentoPadraoAoEntrarNaAba(tabAtiva: HTMLElement): void {
    if (tabAtiva.dataset.autoOpenDetail !== 'true') return;

    const triggerPadrao = tabAtiva.querySelector('.detail-card-trigger[data-default-detail="true"]') as HTMLButtonElement | null;
    const primeiroTrigger = tabAtiva.querySelector('.detail-card-trigger') as HTMLButtonElement | null;
    const trigger = triggerPadrao || primeiroTrigger;

    if (!trigger || trigger.classList.contains('is-active')) return;
    trigger.click();
  }

  /**
   * Atualiza informações de paginação da tabela de imóveis
   */
  private atualizarPaginacaoImoveis(): void {
    const inicio = (this.currentPageImoveis - 1) * this.itemsPerPageImoveis + 1;
    const fim = Math.min(this.currentPageImoveis * this.itemsPerPageImoveis, this.imoveis.length);
    const total = this.imoveis.length;

    // Atualizar spans de informação
    this.setElementText('paginationStart', inicio.toString());
    this.setElementText('paginationEnd', fim.toString());
    this.setElementText('paginationTotal', total.toString());

    // Gerar botões de paginação
    this.gerarBotoesPaginacao();
  }

  private gerarBotoesPaginacao(): void {
    const paginationControls = document.getElementById('paginationControls');
    if (!paginationControls) return;

    paginationControls.innerHTML = '';

    const totalPaginas = Math.ceil(this.imoveis.length / this.itemsPerPageImoveis);
    
    // Se só tem 1 página, não mostra controles
    if (totalPaginas <= 1) return;

    // Botão Anterior (oculto quando desabilitado)
    if (this.currentPageImoveis > 1) {
      const btnAnterior = document.createElement('button');
      btnAnterior.innerHTML = '← Anterior';
      btnAnterior.addEventListener('click', () => {
        if (this.currentPageImoveis > 1) {
          this.currentPageImoveis--;
          this.atualizarTabelaImoveis();
        }
      });
      paginationControls.appendChild(btnAnterior);
    }

    // Números de página (máximo 5 páginas visíveis)
    const maxBotoesVisiveis = 5;
    let inicioPagina = Math.max(1, this.currentPageImoveis - Math.floor(maxBotoesVisiveis / 2));
    let fimPagina = Math.min(totalPaginas, inicioPagina + maxBotoesVisiveis - 1);

    // Ajustar início se estiver no final
    if (fimPagina - inicioPagina < maxBotoesVisiveis - 1) {
      inicioPagina = Math.max(1, fimPagina - maxBotoesVisiveis + 1);
    }

    // Primeira página se não estiver visível
    if (inicioPagina > 1) {
      const btn1 = document.createElement('button');
      btn1.textContent = '1';
      btn1.addEventListener('click', () => {
        this.currentPageImoveis = 1;
        this.atualizarTabelaImoveis();
      });
      paginationControls.appendChild(btn1);

      if (inicioPagina > 2) {
        const btnReticencias = document.createElement('button');
        btnReticencias.textContent = '...';
        btnReticencias.disabled = true;
        paginationControls.appendChild(btnReticencias);
      }
    }

    // Páginas intermediárias
    for (let i = inicioPagina; i <= fimPagina; i++) {
      const btnPagina = document.createElement('button');
      btnPagina.textContent = i.toString();
      btnPagina.classList.toggle('active', i === this.currentPageImoveis);
      
      const pagina = i; // Captura o valor no closure
      btnPagina.addEventListener('click', () => {
        this.currentPageImoveis = pagina;
        this.atualizarTabelaImoveis();
      });
      
      paginationControls.appendChild(btnPagina);
    }

    // Última página se não estiver visível
    if (fimPagina < totalPaginas) {
      if (fimPagina < totalPaginas - 1) {
        const btnReticencias = document.createElement('button');
        btnReticencias.textContent = '...';
        btnReticencias.disabled = true;
        paginationControls.appendChild(btnReticencias);
      }

      const btnUltima = document.createElement('button');
      btnUltima.textContent = totalPaginas.toString();
      btnUltima.addEventListener('click', () => {
        this.currentPageImoveis = totalPaginas;
        this.atualizarTabelaImoveis();
      });
      paginationControls.appendChild(btnUltima);
    }

    // Botão Próximo (oculto quando desabilitado)
    if (this.currentPageImoveis < totalPaginas) {
      const btnProximo = document.createElement('button');
      btnProximo.innerHTML = 'Próximo →';
      btnProximo.addEventListener('click', () => {
        if (this.currentPageImoveis < totalPaginas) {
          this.currentPageImoveis++;
          this.atualizarTabelaImoveis();
        }
      });
      paginationControls.appendChild(btnProximo);
    }
  }

  private configurarItemsPorPagina(): void {
    const select = document.getElementById('imoveisPorPaginaSelect') as HTMLSelectElement | null;
    if (select) {
      select.value = String(this.itemsPerPageImoveis);
      select.addEventListener('change', () => {
        const val = parseInt(select.value, 10);
        if (!isNaN(val) && val > 0) {
          this.itemsPerPageImoveis = val;
          this.currentPageImoveis = 1;
          this.atualizarTabelaImoveis();
        }
      });
    }
  }

  private configurarFiltrosImoveisImediato(): void {
    // Botão Pesquisar
    this.addEventListenerSafe('pesquisarImoveis', 'click', () => {
      this.aplicarFiltrosImoveis();
    });

    // Botão Limpar
    this.addEventListenerSafe('limparFiltrosImoveis', 'click', () => {
      this.limparFiltrosImoveis();
    });

    // Enter nos campos de texto
    this.addEventListenerSafe('filtroContrato', 'keypress', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        this.aplicarFiltrosImoveis();
      }
    });

    this.addEventListenerSafe('filtroDenominacao', 'keypress', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') {
        this.aplicarFiltrosImoveis();
      }
    });
  }

  private configurarExportacaoPortfolio(): void {
    this.addEventListenerSafe('exportarPortfolio', 'click', () => {
      this.exportarPortfolioCSV();
    });
  }

  private exportarPortfolioCSV(): void {
    const headers = [
      'Contrato',
      'Denominacao',
      'TipoContrato',
      'Unidade',
      'Status',
      'FimValidade',
      'Cidade',
      'UF',
      'ValorAluguelMensal'
    ];

    const escapeCSV = (value: string | number | undefined | null): string => {
      const text = (value ?? '').toString().replace(/\r?\n|\r/g, ' ');
      return `"${text.replace(/"/g, '""')}"`;
    };

    const linhas = this.imoveis.map((imovel) => [
      escapeCSV(imovel.codigo),
      escapeCSV(imovel.denominacao),
      escapeCSV(imovel.tipoContrato || 'Contrato de Locação - Imóveis'),
      escapeCSV(imovel.utilizacaoPrincipal || '-'),
      escapeCSV(this.formatarStatus(imovel.status)),
      escapeCSV(imovel.fimValidade || '-'),
      escapeCSV(imovel.cidade || '-'),
      escapeCSV(imovel.estado || '-'),
      escapeCSV(typeof imovel.valorAluguelMensal === 'number' ? imovel.valorAluguelMensal.toFixed(2) : '-')
    ].join(','));

    const csv = [headers.join(','), ...linhas].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const data = new Date();
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    a.href = url;
    a.download = `portfolio-imoveis-${y}${m}${d}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private inicializarPainelVencimentos(): void {
    this.painelVencimentos = this.imoveisOriginais.map((imovel) => this.montarReadModelPainelVencimentos(imovel));
    this.painelVencimentosFiltrado = [...this.painelVencimentos];
  }

  private inicializarPainelAcoesRenovatorias(): void {
    this.painelAcoesRenovatorias = this.montarPainelAcoesRenovatorias(this.imoveisOriginais, this.locadores, false);
    this.painelAcoesRenovatoriasFiltrado = [...this.painelAcoesRenovatorias];
  }

  private inicializarPainelAvisoVencimento(): void {
    this.painelAvisoVencimento = this.montarPainelAvisoVencimento(this.painelVencimentos);
    this.aplicarEstadoPersistidoPainelAviso();
    this.painelAvisoVencimentoFiltrado = [...this.painelAvisoVencimento];
    this.atualizarOpcoesDinamicasFiltrosPainelAviso();
  }

  private montarReadModelPainelVencimentos(imovel: Imovel): PainelVencimentosContrato {
    const locador = this.locadores.find((l) => l.id === imovel.locadorId) || this.locadores.find((l) => l.status === 'ativo');
    const historico = (imovel.historicoPagamentos || []).filter((p) => !!p.pagoEm);
    const ultimoPgto = historico.sort((a, b) => {
      const ta = this.parseDate(a.pagoEm || '')?.getTime() || 0;
      const tb = this.parseDate(b.pagoEm || '')?.getTime() || 0;
      return tb - ta;
    })[0];

    const vigenciaSap = imovel.fimValidade || imovel.contratoFimValidade || '-';
    const vigenciaSiclg = imovel.vigenciaFinal || '-';
    const vencimentoReferencia = this.calcularVencimentoReferencia(vigenciaSap, vigenciaSiclg);
    const dataRef = this.parseDate(vencimentoReferencia);
    const diasParaVencimento = dataRef
      ? Math.ceil((dataRef.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const conciliacaoStatus: 'conciliado' | 'pendente_conciliacao' = imovel.numeroInstrumento
      ? 'conciliado'
      : 'pendente_conciliacao';

    const fase = this.classificarFaseVencimento(diasParaVencimento, imovel);
    const decisaoOperacional = this.classificarDecisaoOperacional(diasParaVencimento, conciliacaoStatus);

    const valorMensal = imovel.valorAluguelMensal || imovel.valor || 0;
    const valorAnual = valorMensal * 12;
    const valorAcordado = Number(imovel.valorGlobalAtualizado || imovel.valorOriginalContrato || valorAnual || 0);

    const limiteAr = diasParaVencimento !== null && diasParaVencimento > 30 && dataRef
      ? this.formatDate(new Date(dataRef.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString())
      : this.formatDate(vencimentoReferencia);

    const previsaoColegiado = diasParaVencimento !== null && diasParaVencimento > 60 && dataRef
      ? this.formatDate(new Date(dataRef.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString())
      : '-';

    return {
      contratoId: imovel.id,
      numeroContratoSap: imovel.codigo || '-',
      numeroContratoSiclg: imovel.numeroInstrumento || '-',
      uf: imovel.estado || '-',
      locadorSap: locador?.nome || imovel.parceiroNegocios || '-',

      vigenciaSap,
      descricaoSap: imovel.denominacao || '-',
      ultimoValorPagoSap: Number(ultimoPgto?.valorPago || ultimoPgto?.valor || 0),
      ultimoPgtoSap: ultimoPgto?.pagoEm ? this.formatDate(ultimoPgto.pagoEm) : '-',

      vigenciaSiclg,
      situacaoSiclg: imovel.situacao || this.formatarStatus(imovel.status),
      modalidade: this.derivarModalidadeContrato(imovel),
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

  private calcularVencimentoReferencia(vigenciaSap: string, vigenciaSiclg: string): string {
    const sap = this.parseDate(vigenciaSap);
    const siclg = this.parseDate(vigenciaSiclg);
    if (sap && siclg) return sap.getTime() <= siclg.getTime() ? vigenciaSap : vigenciaSiclg;
    return vigenciaSap !== '-' ? vigenciaSap : vigenciaSiclg;
  }
  
  private derivarModalidadeContrato(imovel: Imovel): 'locacao' | 'cessao' | 'comodato' | 'nao_informada' {
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

  private classificarFaseVencimento(diasParaVencimento: number | null, imovel: Imovel): string {
    if (diasParaVencimento === null) return 'Monitoramento';
    if (diasParaVencimento <= 0) return 'Encerramento';
    if (diasParaVencimento <= 30) return 'Notificação';
    if (diasParaVencimento <= 60) return 'Negociação';
    if ((imovel.termosAditivos || []).length > 0) return 'Aditivo';
    return 'Monitoramento';
  }

  private classificarDecisaoOperacional(diasParaVencimento: number | null, conciliacaoStatus: 'conciliado' | 'pendente_conciliacao'): string {
    if (conciliacaoStatus === 'pendente_conciliacao') return 'Conciliação SAP/SICLG';
    if (diasParaVencimento === null) return 'Acompanhar vigência';
    if (diasParaVencimento <= 30) return 'Aguardar Notificação';
    if (diasParaVencimento <= 60) return 'Preparar negociação';
    if (diasParaVencimento <= 90) return 'Análise de prorrogação';
    return 'Acompanhamento regular';
  }

  private async hidratarPainelAcoesRenovatoriasComDadosSAP(): Promise<void> {
    const dadosSap = await SAPDataLoader.carregarDados();
    const dadosDijur = await DIJURDataLoader.carregarDados();
    if (!dadosSap?.imoveis?.length) {
      if (dadosDijur) {
        this.painelAcoesRenovatorias = this.aplicarDadosDijurNaMassaExistente(this.painelAcoesRenovatorias, dadosDijur);
        this.painelAcoesRenovatoriasFiltrado = [...this.painelAcoesRenovatorias];
        this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
      }
      return;
    }

    const painelVencimentosSap = dadosSap.imoveis.map((imovel) => this.montarReadModelPainelVencimentos(imovel));
    this.painelAcoesRenovatorias = this.montarPainelAcoesRenovatorias(dadosSap.imoveis, dadosSap.locadores, true, dadosDijur || undefined);
    this.painelAcoesRenovatoriasFiltrado = [...this.painelAcoesRenovatorias];
    this.painelAvisoVencimento = this.montarPainelAvisoVencimento(painelVencimentosSap);
    this.aplicarEstadoPersistidoPainelAviso();
    this.painelAvisoVencimentoFiltrado = [...this.painelAvisoVencimento];
    this.atualizarOpcoesDinamicasFiltrosPainelAviso();
    this.currentPagePainelFormal = 1;
    this.currentPagePainelAviso = 1;
    this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
    this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
  }

  private montarPainelAvisoVencimento(rows: PainelVencimentosContrato[]): PainelAvisoVencimentoRow[] {
    const getDiasEmulados = (index: number): number => {
      const diasPrimeiros10 = [420, 360, 360, 240, 235, 230, 90, 60, 30, -15];
      if (index < diasPrimeiros10.length) return diasPrimeiros10[index];

      // Emulação controlada para 100 contratos no escopo do aviso (<= 14 meses).
      // 10-19: 10% vencidos em prazo indeterminado.
      if (index < 20) return -15;

      // 20-99: 80% em janela de decisão, composição ponderada 60/30/15/15/10.
      // Com os primeiros 10 contratos, o KPI fica em: +1 ano (1), 1 ano (32), 6 meses (19), 3 meses (10), 2 meses (9), 1 mês (8).
      if (index < 57) return 300; // 1 ano
      if (index < 75) return 120; // 6 meses
      if (index < 84) return 75;  // 3 meses
      if (index < 93) return 45;  // 2 meses
      if (index < 100) return 20; // 1 mês

      // Restante fora do escopo de 14 meses.
      return 510;
    };

    const candidatos: PainelAvisoVencimentoRow[] = rows.map((row, index): PainelAvisoVencimentoRow => {
      const fimVigenciaOriginal = row.vigenciaSiclg !== '-' ? row.vigenciaSiclg : row.vigenciaSap;
      const diasEmulados = getDiasEmulados(index);
      const dataEmulada = new Date();
      dataEmulada.setDate(dataEmulada.getDate() + diasEmulados);

      const fimVigencia = this.formatDate(dataEmulada.toISOString()) || fimVigenciaOriginal;
      const fimVigenciaDate = this.parseDate(fimVigencia) || this.parseDate(fimVigenciaOriginal);
      const ultimoPagamentoDate = this.parseDate(row.ultimoPgtoSap);
      const limiteLegalArDate = fimVigenciaDate ? this.calcularDataLimiteAjuizamentoAr(fimVigenciaDate) : null;
      const decisaoPrimeiros10: Array<'a_decidir' | 'prorrogar' | 'nao_prorrogar'> = [
        'a_decidir',
        'a_decidir',
        'prorrogar',
        'a_decidir',
        'prorrogar',
        'nao_prorrogar',
        'prorrogar',
        'prorrogar',
        'nao_prorrogar',
        'nao_prorrogar'
      ];
      const decisaoProrrogarEmulada: 'a_decidir' | 'prorrogar' | 'nao_prorrogar' = index < 10
        ? decisaoPrimeiros10[index]
        : (index < 20 ? 'nao_prorrogar' : (index < 26 ? 'prorrogar' : 'nao_prorrogar'));
      const decisaoAcaoRenovatoriaPadrao = this.derivarDecisaoAcaoRenovatoriaAviso(fimVigenciaDate);
      const decisaoAcaoRenovatoriaPrimeiros10: Array<'a_decidir' | 'ingressar' | 'nao_ingressar' | null> = [
        null,
        null,
        null,
        'ingressar',
        'a_decidir',
        'a_decidir',
        null,
        null,
        null,
        null
      ];
      const decisaoAcaoRenovatoriaEmulada: 'a_decidir' | 'ingressar' | 'nao_ingressar' =
        (index < 10 && decisaoAcaoRenovatoriaPrimeiros10[index])
          ? decisaoAcaoRenovatoriaPrimeiros10[index] as 'a_decidir' | 'ingressar' | 'nao_ingressar'
          : decisaoAcaoRenovatoriaPadrao;

      return {
        contratoId: row.contratoId,
        contratoSap: row.numeroContratoSap,
        contratoSiclg: row.numeroContratoSiclg,
        situacaoSiclg: row.situacaoSiclg,
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
        colegiado: this.derivarColegiadoAviso(row, index),
        limiteLegalAr: limiteLegalArDate ? this.formatDate(limiteLegalArDate.toISOString()) : row.limiteAr,
        fimVigencia,
        fimVigenciaDate,
        ultimoPagamentoDate,
        ordemCasoTeste: index < 10 ? index + 1 : undefined
      };
    });

    // Garante pelo menos 3 contratos dentro da faixa 8-7 meses para didática do KPI de risco.
    const hojeBase = this.obterDataBase(new Date());
    const offsetDiasFaixaAr87 = [240, 236, 232];
    const contratosFaixaAr87 = candidatos.filter((item) => this.estaNaFaixaAlertaAr87(item));
    if (contratosFaixaAr87.length < 3) {
      const faltantes = 3 - contratosFaixaAr87.length;
      const reserva = candidatos
        .filter((item) => !this.estaNaFaixaAlertaAr87(item))
        .slice(0, faltantes);

      [...contratosFaixaAr87, ...reserva].slice(0, 3).forEach((item, idx) => {
        const fimAjustado = new Date(hojeBase);
        fimAjustado.setDate(fimAjustado.getDate() + offsetDiasFaixaAr87[idx]);
        item.fimVigenciaDate = fimAjustado;
        item.fimVigencia = this.formatDate(fimAjustado.toISOString()) || item.fimVigencia;
        const limiteAr = this.calcularDataLimiteAjuizamentoAr(fimAjustado);
        item.limiteLegalAr = this.formatDate(limiteAr.toISOString()) || item.limiteLegalAr;
      });
    }

    // Garante um exemplo em cada categoria da composição do risco 8-7 meses.
    const exemplosFaixaAr87 = candidatos
      .filter((item) => this.estaNaFaixaAlertaAr87(item))
      .sort((a, b) => (a.ordemCasoTeste || Number.MAX_SAFE_INTEGER) - (b.ordemCasoTeste || Number.MAX_SAFE_INTEGER));
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
      .filter((item) => this.estaNoEscopoAvisoVencimento(item))
      .sort((a, b) => {
        if (typeof a.ordemCasoTeste === 'number' && typeof b.ordemCasoTeste === 'number') {
          return a.ordemCasoTeste - b.ordemCasoTeste;
        }
        if (typeof a.ordemCasoTeste === 'number') return -1;
        if (typeof b.ordemCasoTeste === 'number') return 1;
        return (this.calcularDiasParaVencimentoAviso(a) ?? Number.MAX_SAFE_INTEGER) - (this.calcularDiasParaVencimentoAviso(b) ?? Number.MAX_SAFE_INTEGER);
      })
      .slice(0, 100);
  }

  private derivarDecisaoProrrogarAviso(row: PainelVencimentosContrato): 'a_decidir' | 'prorrogar' | 'nao_prorrogar' {
    if (row.fase === 'Encerramento') return 'nao_prorrogar';
    if (row.conciliacaoStatus === 'pendente_conciliacao') return 'a_decidir';
    if (row.fase === 'Negociação' || row.fase === 'Aditivo') return 'prorrogar';
    return 'a_decidir';
  }

  private derivarDecisaoAcaoRenovatoriaAviso(fimVigenciaDate: Date | null): 'a_decidir' | 'ingressar' | 'nao_ingressar' {
    if (!fimVigenciaDate) return 'a_decidir';
    const hojeBase = this.obterDataBase(new Date());
    const prazoFinal = this.calcularDataLimiteAjuizamentoAr(fimVigenciaDate);
    if (hojeBase > prazoFinal) return 'nao_ingressar';
    return 'a_decidir';
  }

  private carregarEstadoPainelAviso(): Record<string, EstadoPainelAvisoPersistido> {
    try {
      const raw = localStorage.getItem(SistemaSILIC.AVISO_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private salvarEstadoPainelAviso(estado: Record<string, EstadoPainelAvisoPersistido>): void {
    try {
      localStorage.setItem(SistemaSILIC.AVISO_STORAGE_KEY, JSON.stringify(estado));
    } catch {
      // Ignora indisponibilidade de localStorage.
    }
  }

  private aplicarEstadoPersistidoPainelAviso(): void {
    const estado = this.carregarEstadoPainelAviso();
    this.painelAvisoVencimento.forEach((item) => {
      const atual = estado[item.contratoId];
      if (!atual) return;
      item.decisaoProrrogar = atual.decisaoProrrogar;
      item.decisaoAcaoRenovatoria = atual.decisaoAcaoRenovatoria || item.decisaoAcaoRenovatoria;
      if (atual.protocoloFormal) item.protocoloFormal = atual.protocoloFormal;
      if (atual.demandaSiclg) item.demandaSiclg = atual.demandaSiclg;
      if (atual.situacaoLaudoAvaliacao) item.situacaoLaudoAvaliacao = atual.situacaoLaudoAvaliacao;
      if (atual.laudoRequisicaoNumero) item.laudoRequisicaoNumero = atual.laudoRequisicaoNumero;
      if (atual.laudoRequisicaoData) item.laudoRequisicaoData = atual.laudoRequisicaoData;
      if (atual.laudoNumero) item.laudoNumero = atual.laudoNumero;
      if (typeof atual.laudoPrazoEntregaDias === 'number') item.laudoPrazoEntregaDias = atual.laudoPrazoEntregaDias;
      if (typeof atual.laudoPrazoFormalInformado === 'boolean') item.laudoPrazoFormalInformado = atual.laudoPrazoFormalInformado;
      if (atual.laudoDataEmissao) item.laudoDataEmissao = atual.laudoDataEmissao;
      if (atual.laudoValidoAte) item.laudoValidoAte = atual.laudoValidoAte;
      if (atual.historicoDecisaoProrrogacao) item.historicoDecisaoProrrogacao = [...atual.historicoDecisaoProrrogacao];
      if (atual.historicoDecisaoAcaoRenovatoria) item.historicoDecisaoAcaoRenovatoria = [...atual.historicoDecisaoAcaoRenovatoria];
      if (atual.protocoloContratacao) item.protocoloContratacao = atual.protocoloContratacao;

      if (!this.exigeLaudoAvaliacao(item)) {
        item.situacaoLaudoAvaliacao = 'nao_aplicavel';
      }

      this.sincronizarSituacaoLaudoAvaliacao(item);
      this.sincronizarDecisaoAcaoRenovatoria(item);

      // Regra de negócio: protocolo formal gerado implica decisão travada em prorrogar.
      if (item.protocoloFormal) {
        item.decisaoProrrogar = 'prorrogar';
      }

    });
  }

  private formatarDecisaoAviso(decisao: 'a_decidir' | 'prorrogar' | 'nao_prorrogar'): string {
    if (decisao === 'prorrogar') return 'Prorrogar';
    if (decisao === 'nao_prorrogar') return 'Não prorrogar';
    return 'A decidir';
  }

  private formatarDecisaoAcaoRenovatoria(decisao: 'a_decidir' | 'ingressar' | 'nao_ingressar'): string {
    if (decisao === 'ingressar') return 'Ingressar';
    if (decisao === 'nao_ingressar') return 'Não ingressar';
    return 'A decidir';
  }

  private exigeLaudoAvaliacao(item: PainelAvisoVencimentoRow): boolean {
    return item.modalidade === 'locacao';
  }

  private formatarModalidadeAviso(modalidade: PainelAvisoVencimentoRow['modalidade']): string {
    if (modalidade === 'locacao') return 'Locação';
    if (modalidade === 'cessao') return 'Cessão';
    if (modalidade === 'comodato') return 'Comodato';
    return 'Não informada';
  }

  private formatarSituacaoLaudoAvaliacao(valor: PainelAvisoVencimentoRow['situacaoLaudoAvaliacao']): string {
    if (valor === 'nao_aplicavel') return 'Não aplicável';
    if (valor === 'nao_solicitado') return 'Não solicitado';
    if (valor === 'solicitado') return 'Solicitado';
    return 'Entregue (válido)';
  }

  private validarFormatoNumeroLaudo(numero: string): boolean {
    // Aceita letras, números e separadores "/", "-" e ".", com tamanho minimo de 5.
    return /^[A-Za-z0-9][A-Za-z0-9./-]{4,29}$/.test(numero);
  }

  private sanitizarNumeroLaudoInput(valor: string): string {
    // Mantém apenas letras, números e separadores aceitos, com no máximo 30 caracteres.
    const limpo = valor.replace(/[^A-Za-z0-9./-]/g, '');
    return limpo.slice(0, 30);
  }

  private formatarDataParaInputDate(valor?: string): string {
    if (!valor) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      const [d, m, y] = valor.split('/');
      return `${y}-${m}-${d}`;
    }
    const data = this.parseDate(valor);
    if (!data) return '';
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private obterAlertaValidadeLaudo(row: PainelAvisoVencimentoRow): string {
    if (!row.laudoValidoAte) return '';
    const validade = this.parseDate(row.laudoValidoAte);
    if (!validade) return '';
    if (this.obterDataBase(new Date()) > this.obterDataBase(validade)) {
      return `Alerta informativo: validade do laudo expirada em ${row.laudoValidoAte}.`;
    }
    return '';
  }

  private gerarNumeroRequisicaoLaudo(contratoSap: string): string {
    const agora = new Date();
    const y = agora.getFullYear();
    const m = String(agora.getMonth() + 1).padStart(2, '0');
    const d = String(agora.getDate()).padStart(2, '0');
    const base = (contratoSap || '').replace(/\D/g, '').slice(-4).padStart(4, '0');
    const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `LAU-${y}${m}${d}-${base}-${seq}`;
  }

  private adicionarMesesCivis(data: Date, meses: number): Date {
    const base = this.obterDataBase(data);
    const diaOriginal = base.getDate();
    const anoAlvo = base.getFullYear();
    const mesAlvo = base.getMonth() + meses;
    const ultimoDiaMesAlvo = new Date(anoAlvo, mesAlvo + 1, 0).getDate();
    const diaAjustado = Math.min(diaOriginal, ultimoDiaMesAlvo);
    return new Date(anoAlvo, mesAlvo, diaAjustado);
  }

  private sincronizarSituacaoLaudoAvaliacao(row: PainelAvisoVencimentoRow): void {
    if (!this.exigeLaudoAvaliacao(row)) {
      row.situacaoLaudoAvaliacao = 'nao_aplicavel';
      return;
    }

    if (!row.situacaoLaudoAvaliacao || row.situacaoLaudoAvaliacao === 'nao_aplicavel') {
      row.situacaoLaudoAvaliacao = 'nao_solicitado';
    }

    if (row.situacaoLaudoAvaliacao === 'solicitado') {
      if (!row.laudoPrazoEntregaDias || row.laudoPrazoEntregaDias <= 0) {
        row.laudoPrazoEntregaDias = 30;
      }
    }

    if (row.situacaoLaudoAvaliacao === 'entregue') {
      if (!row.laudoDataEmissao) {
        row.laudoDataEmissao = this.formatDate(new Date().toISOString());
      }
    }

    if (row.situacaoLaudoAvaliacao === 'nao_solicitado') {
      row.laudoRequisicaoNumero = undefined;
      row.laudoRequisicaoData = undefined;
      row.laudoNumero = undefined;
      row.laudoPrazoEntregaDias = 30;
      row.laudoPrazoFormalInformado = false;
      row.laudoDataEmissao = undefined;
      row.laudoValidoAte = undefined;
    }
  }

  private obterResumoSlaLaudo(row: PainelAvisoVencimentoRow): string {
    if (row.situacaoLaudoAvaliacao !== 'solicitado' || !row.laudoRequisicaoData) return '';
    const dataSolicitacao = this.parseDate(row.laudoRequisicaoData);
    const prazoDias = row.laudoPrazoEntregaDias || 30;
    if (!dataSolicitacao) return '';
    const prazoFinal = new Date(dataSolicitacao.getTime());
    prazoFinal.setDate(prazoFinal.getDate() + prazoDias);
    const hoje = this.obterDataBase(new Date());
    const atraso = hoje.getTime() > this.obterDataBase(prazoFinal).getTime();
    const origemPrazo = row.laudoPrazoFormalInformado ? 'Prazo formal informado' : 'Prazo padrão';
    const statusPrazo = atraso ? 'Atrasado' : 'Em prazo';
    return `${origemPrazo}: ${prazoDias} dias (ate ${this.formatDate(prazoFinal.toISOString())}) - ${statusPrazo}`;
  }

  private persistirEstadoAvisoRow(row: PainelAvisoVencimentoRow): void {
    const estado = this.carregarEstadoPainelAviso();
    estado[row.contratoId] = {
      decisaoProrrogar: row.decisaoProrrogar,
      decisaoAcaoRenovatoria: row.decisaoAcaoRenovatoria,
      protocoloFormal: row.protocoloFormal,
      demandaSiclg: row.demandaSiclg,
      situacaoLaudoAvaliacao: row.situacaoLaudoAvaliacao,
      laudoRequisicaoNumero: row.laudoRequisicaoNumero,
      laudoRequisicaoData: row.laudoRequisicaoData,
      laudoNumero: row.laudoNumero,
      laudoPrazoEntregaDias: row.laudoPrazoEntregaDias,
      laudoPrazoFormalInformado: row.laudoPrazoFormalInformado,
      laudoDataEmissao: row.laudoDataEmissao,
      laudoValidoAte: row.laudoValidoAte,
      historicoDecisaoProrrogacao: row.historicoDecisaoProrrogacao,
      historicoDecisaoAcaoRenovatoria: row.historicoDecisaoAcaoRenovatoria,
      protocoloContratacao: row.protocoloContratacao
    };
    this.salvarEstadoPainelAviso(estado);
  }

  private atualizarSituacaoLaudoPainelAviso(
    contratoId: string,
    situacao: PainelAvisoVencimentoRow['situacaoLaudoAvaliacao'],
    dados?: { laudoRequisicaoNumero?: string; laudoRequisicaoData?: string; laudoDataEmissao?: string }
  ): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row) return;

    if (this.exigeLaudoAvaliacao(row) && situacao === 'solicitado') {
      const numeroRequisicao = (dados?.laudoRequisicaoNumero || '').trim();
      if (numeroRequisicao && !this.validarFormatoNumeroLaudo(numeroRequisicao)) {
        this.showToast('Número da solicitação inválido. Use 5 a 30 caracteres com letras/números e separadores permitidos (/, -, .). Ex.: 12345/2026.');
        this.aplicarFiltrosPainelAvisoVencimento();
        return;
      }
      const dataSolicitacao = (dados?.laudoRequisicaoData || '').trim();
      if (dataSolicitacao) {
        const dataSolicitacaoDate = this.parseDate(dataSolicitacao);
        if (!dataSolicitacaoDate) {
          this.showToast('Data de solicitação do laudo inválida.');
          this.aplicarFiltrosPainelAvisoVencimento();
          return;
        }
        if (this.obterDataBase(dataSolicitacaoDate).getTime() > this.obterDataBase(new Date()).getTime()) {
          this.showToast('A data de solicitação do laudo não pode ser maior que a data atual.');
          this.aplicarFiltrosPainelAvisoVencimento();
          return;
        }
        row.laudoRequisicaoData = this.formatDate(dataSolicitacaoDate.toISOString());
      } else {
        row.laudoRequisicaoData = undefined;
      }
      row.laudoRequisicaoNumero = numeroRequisicao || undefined;
      row.laudoNumero = undefined;
      row.laudoDataEmissao = undefined;
      row.laudoValidoAte = undefined;
    }

    if (this.exigeLaudoAvaliacao(row) && situacao === 'entregue') {
      const dataEmissao = (dados?.laudoDataEmissao || '').trim() || new Date().toISOString().slice(0, 10);
      const dataEmissaoDate = this.parseDate(dataEmissao);
      if (!dataEmissaoDate) {
        this.showToast('Data do laudo inválida.');
        this.aplicarFiltrosPainelAvisoVencimento();
        return;
      }
      if (this.obterDataBase(dataEmissaoDate).getTime() > this.obterDataBase(new Date()).getTime()) {
        this.showToast('A data do laudo não pode ser maior que a data atual.');
        this.aplicarFiltrosPainelAvisoVencimento();
        return;
      }
      row.laudoDataEmissao = this.formatDate(dataEmissaoDate.toISOString());
      row.laudoValidoAte = this.formatDate(this.adicionarMesesCivis(dataEmissaoDate, 12).toISOString());
      row.laudoNumero = undefined;
    }

    row.situacaoLaudoAvaliacao = this.exigeLaudoAvaliacao(row) ? situacao : 'nao_aplicavel';
    this.sincronizarSituacaoLaudoAvaliacao(row);
    this.persistirEstadoAvisoRow(row);

    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private solicitarLaudoAvaliacao(contratoId: string): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row) return;
    if (!this.exigeLaudoAvaliacao(row)) {
      this.showToast('Laudo de avaliação não se aplica para cessão/comodato.');
      return;
    }

    row.situacaoLaudoAvaliacao = 'solicitado';
    row.laudoRequisicaoNumero = undefined;
    row.laudoRequisicaoData = undefined;
    row.laudoPrazoEntregaDias = 30;
    row.laudoPrazoFormalInformado = false;
    this.sincronizarSituacaoLaudoAvaliacao(row);
    this.persistirEstadoAvisoRow(row);

    this.showToast('Status de laudo alterado para "Solicitado". Preencha protocolo (opcional) e data da solicitação.');
    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private registrarPrazoFormalLaudo(contratoId: string): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row || row.situacaoLaudoAvaliacao !== 'solicitado') return;

    const valor = window.prompt('Informe o prazo formal em dias para conclusão do laudo:');
    if (!valor) return;
    const dias = parseInt(valor, 10);
    if (Number.isNaN(dias) || dias <= 0) {
      this.showToast('Prazo formal inválido. Informe um número de dias maior que zero.');
      return;
    }

    row.laudoPrazoEntregaDias = dias;
    row.laudoPrazoFormalInformado = true;
    this.persistirEstadoAvisoRow(row);
    this.showToast(`Prazo formal de ${dias} dias registrado para o laudo.`);
    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private registrarEntregaLaudo(contratoId: string): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row || !this.exigeLaudoAvaliacao(row)) return;

    row.situacaoLaudoAvaliacao = 'entregue';
    row.laudoDataEmissao = this.formatDate(new Date().toISOString());
    this.sincronizarSituacaoLaudoAvaliacao(row);
    this.persistirEstadoAvisoRow(row);
    this.showToast(`Laudo entregue com validade ate ${row.laudoValidoAte || '-'}.`);
    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private sincronizarDecisaoAcaoRenovatoria(row: PainelAvisoVencimentoRow): void {
    if (this.estaNaJanelaLegalAcaoRenovatoria(row)) return;
    row.decisaoAcaoRenovatoria = this.estaAposPrazoDecadencialAr(row) ? 'nao_ingressar' : 'a_decidir';
  }

  private estaNaJanelaLegalAcaoRenovatoria(item: PainelAvisoVencimentoRow): boolean {
    if (!item.fimVigenciaDate) return false;
    const hojeBase = this.obterDataBase(new Date());
    const inicioJanela = this.subtrairMesesCivis(item.fimVigenciaDate, 12);
    const prazoFinal = this.calcularDataLimiteAjuizamentoAr(item.fimVigenciaDate);
    return hojeBase >= inicioJanela && hojeBase <= prazoFinal;
  }

  private podeManterADecidirProrrogacao(item: PainelAvisoVencimentoRow): boolean {
    if (!item.fimVigenciaDate) return false;
    const hojeBase = this.obterDataBase(new Date());
    const inicioEscopo = this.subtrairMesesCivis(item.fimVigenciaDate, 14);
    const limiteDecisaoObrigatoria = this.subtrairMesesCivis(item.fimVigenciaDate, 12);
    return hojeBase >= inicioEscopo && hojeBase < limiteDecisaoObrigatoria;
  }

  private possuiDadosVigenciaInsuficientes(item: PainelAvisoVencimentoRow): boolean {
    return !item.fimVigenciaDate || !item.fimVigencia || item.fimVigencia === '-';
  }

  private estaNaJanelaPrudenteGestorAr(item: PainelAvisoVencimentoRow): boolean {
    if (!item.fimVigenciaDate) return false;
    const hojeBase = this.obterDataBase(new Date());
    const inicioJanela = this.subtrairMesesCivis(item.fimVigenciaDate, 12);
    const limitePrudente = this.subtrairMesesCivis(item.fimVigenciaDate, 7);
    return hojeBase >= inicioJanela && hojeBase <= limitePrudente;
  }

  private estaNaFaixaAlertaAr87(item: PainelAvisoVencimentoRow): boolean {
    if (!item.fimVigenciaDate) return false;
    const hojeBase = this.obterDataBase(new Date());
    const inicioFaixa = this.subtrairMesesCivis(item.fimVigenciaDate, 8);
    const fimFaixa = this.subtrairMesesCivis(item.fimVigenciaDate, 7);
    return hojeBase >= inicioFaixa && hojeBase < fimFaixa;
  }

  private estaEmRiscoAr87(item: PainelAvisoVencimentoRow): boolean {
    return this.estaNaFaixaAlertaAr87(item)
      && item.decisaoProrrogar === 'a_decidir'
      && item.decisaoAcaoRenovatoria === 'a_decidir';
  }

  private registrarReaberturaDecisaoProrrogacao(row: PainelAvisoVencimentoRow, decisaoAnterior: 'a_decidir' | 'prorrogar' | 'nao_prorrogar', novaDecisao: 'a_decidir' | 'prorrogar' | 'nao_prorrogar'): boolean {
    const foiReabertura = (decisaoAnterior === 'prorrogar' && novaDecisao === 'nao_prorrogar') || (decisaoAnterior === 'nao_prorrogar' && novaDecisao === 'prorrogar');
    if (!foiReabertura) return true;

    const justificativa = window.prompt('Reabertura de decisão detectada. Informe a justificativa para auditoria:');
    if (!justificativa || justificativa.trim().length < 5) {
      this.showToast('Justificativa obrigatória (mínimo de 5 caracteres) para reabrir a decisão de prorrogação.');
      return false;
    }

    const historico = row.historicoDecisaoProrrogacao || [];
    historico.push(`${new Date().toLocaleString('pt-BR')} | ${decisaoAnterior} -> ${novaDecisao} | ${justificativa.trim()}`);
    row.historicoDecisaoProrrogacao = historico;
    return true;
  }

  private registrarReaberturaDecisaoAcaoRenovatoria(
    row: PainelAvisoVencimentoRow,
    decisaoAnterior: 'a_decidir' | 'ingressar' | 'nao_ingressar',
    novaDecisao: 'a_decidir' | 'ingressar' | 'nao_ingressar'
  ): boolean {
    const foiReabertura = (decisaoAnterior === 'ingressar' && novaDecisao === 'nao_ingressar')
      || (decisaoAnterior === 'nao_ingressar' && novaDecisao === 'ingressar');
    if (!foiReabertura) return true;

    const justificativa = window.prompt('Reabertura de decisão de ação renovatória detectada. Informe a justificativa para auditoria:');
    if (!justificativa || justificativa.trim().length < 5) {
      this.showToast('Justificativa obrigatória (mínimo de 5 caracteres) para reabrir a decisão de ação renovatória.');
      return false;
    }

    const historico = row.historicoDecisaoAcaoRenovatoria || [];
    historico.push(`${new Date().toLocaleString('pt-BR')} | ${decisaoAnterior} -> ${novaDecisao} | ${justificativa.trim()}`);
    row.historicoDecisaoAcaoRenovatoria = historico;
    return true;
  }

  private classificarFaixaSinalizacaoAviso(item: PainelAvisoVencimentoRow): 'faixa_14_12' | 'faixa_12_7' | 'faixa_menor_6' | 'dados_insuficientes' | 'fora_escopo' {
    if (this.possuiDadosVigenciaInsuficientes(item)) return 'dados_insuficientes';
    if (!item.fimVigenciaDate) return 'fora_escopo';
    const hojeBase = this.obterDataBase(new Date());
    const inicioEscopo = this.subtrairMesesCivis(item.fimVigenciaDate, 14);
    const inicioJanelaLegal = this.subtrairMesesCivis(item.fimVigenciaDate, 12);
    const limitePrudente = this.subtrairMesesCivis(item.fimVigenciaDate, 7);

    if (hojeBase < inicioEscopo) return 'fora_escopo';
    if (hojeBase < inicioJanelaLegal) return 'faixa_14_12';
    if (hojeBase <= limitePrudente) return 'faixa_12_7';
    return 'faixa_menor_6';
  }

  private estaAposPrazoDecadencialAr(item: PainelAvisoVencimentoRow): boolean {
    if (!item.fimVigenciaDate) return false;
    const hojeBase = this.obterDataBase(new Date());
    const prazoFinal = this.calcularDataLimiteAjuizamentoAr(item.fimVigenciaDate);
    return hojeBase > prazoFinal;
  }

  private estaNoEscopoAvisoVencimento(item: PainelAvisoVencimentoRow): boolean {
    return this.classificarFaixaSinalizacaoAviso(item) !== 'fora_escopo';
  }

  private obterDataBase(data: Date): Date {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  private subtrairMesesCivis(data: Date, meses: number): Date {
    const base = this.obterDataBase(data);
    const diaOriginal = base.getDate();
    const anoAlvo = base.getFullYear();
    const mesAlvo = base.getMonth() - meses;
    const ultimoDiaMesAlvo = new Date(anoAlvo, mesAlvo + 1, 0).getDate();
    const diaAjustado = Math.min(diaOriginal, ultimoDiaMesAlvo);
    return new Date(anoAlvo, mesAlvo, diaAjustado);
  }

  private calcularDataLimiteAjuizamentoAr(fimVigenciaDate: Date): Date {
    const referenciaSeisMeses = this.subtrairMesesCivis(fimVigenciaDate, 6);
    const houveAjustePorFimDeMes = referenciaSeisMeses.getDate() !== fimVigenciaDate.getDate();
    if (houveAjustePorFimDeMes) return referenciaSeisMeses;
    const limite = new Date(referenciaSeisMeses);
    limite.setDate(limite.getDate() - 1);
    return this.obterDataBase(limite);
  }

  private atualizarDecisaoAcaoRenovatoriaPainelAviso(contratoId: string, decisao: 'a_decidir' | 'ingressar' | 'nao_ingressar'): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row) return;

    if (!this.estaNaJanelaLegalAcaoRenovatoria(row)) {
      this.sincronizarDecisaoAcaoRenovatoria(row);
      this.persistirEstadoAvisoRow(row);
      this.showToast('Decisão de ação renovatória só pode ser alterada na janela legal entre 12 e 6 meses antes do fim da vigência.');
      this.aplicarFiltrosPainelAvisoVencimento();
      return;
    }

    if (decisao === 'ingressar' && !this.estaNaJanelaPrudenteGestorAr(row)) {
      this.showToast('Para o gestor operacional, o prazo prudente para decidir ingresso na ação renovatória é até 7 meses antes do fim da vigência. Escalone Gestão Formal/Jurídico.');
      this.aplicarFiltrosPainelAvisoVencimento();
      return;
    }

    if (decisao === 'ingressar' && !this.estaNaJanelaLegalAcaoRenovatoria(row)) {
      if (this.estaAposPrazoDecadencialAr(row)) {
        this.showToast('Prazo decadencial encerrado: após o marco legal de 6 meses antes do fim da vigência não é possível ingressar com ação renovatória.');
      } else {
        this.showToast('Ingresso na ação renovatória permitido apenas na janela legal entre 12 e 6 meses (contagem por mês civil). Na visão operacional, a decisão direta do gestor ocorre até 7 meses.');
      }
      this.aplicarFiltrosPainelAvisoVencimento();
      return;
    }

    const decisaoAnterior = row.decisaoAcaoRenovatoria;
    if (!this.registrarReaberturaDecisaoAcaoRenovatoria(row, decisaoAnterior, decisao)) {
      this.aplicarFiltrosPainelAvisoVencimento();
      return;
    }

    row.decisaoAcaoRenovatoria = decisao;
    this.persistirEstadoAvisoRow(row);

    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private gerarProtocoloSolicitacaoProrrogacao(contratoSap: string): string {
    const data = new Date();
    const y = data.getFullYear();
    const numero = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    return `FORMAL - ${numero} - ${y}`;
  }

  private gerarProtocoloContratacaoCECOT(contratoSap: string): string {
    const data = new Date();
    const y = data.getFullYear();
    const numero = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    return `CONTRATACAO - ${numero} - ${y}`;
  }

  private podeSolicitarContratacao(item: PainelAvisoVencimentoRow): boolean {
    const vencido = this.classificarJanelaAviso(item) === 'vencido';
    const naoProrrogar = item.decisaoProrrogar === 'nao_prorrogar';
    return vencido || naoProrrogar;
  }

  private solicitarContratacaoCecot(contratoId: string): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row) return;
    if (!this.podeSolicitarContratacao(row)) {
      this.showToast('Protocolo de contratação disponível apenas para contrato vencido ou decisão de não prorrogar.');
      return;
    }
    if (row.protocoloContratacao) {
      this.showToast(`Solicitação de contratação já registrada. Protocolo: ${row.protocoloContratacao}.`);
      return;
    }

    row.protocoloContratacao = this.gerarProtocoloContratacaoCECOT(row.contratoSap);
    this.persistirEstadoAvisoRow(row);
    this.showToast(`Solicitação de nova contratação enviada à área responsável. Protocolo gerado: ${row.protocoloContratacao}.`);
    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private obterClasseStatusAviso(situacao: string): string {
    const s = (situacao || '').toLowerCase();
    if (s.includes('ativo')) return 'badge badge-ativo';
    if (s.includes('prospec')) return 'badge badge-info';
    if (s.includes('mobiliza')) return 'badge badge-warning';
    if (s.includes('desmobiliza')) return 'badge badge-warning';
    if (s.includes('desativ')) return 'badge badge-danger';
    return 'badge badge-neutral';
  }

  private atualizarRotuloFiltroAtivoAviso(): void {
    const label = document.getElementById('avisoFiltroAtivoLabel');
    if (!label) return;
    const filtrosAtivos: string[] = [];
    if (this.avisoFiltroRiscoAr87Ativo) {
      filtrosAtivos.push('Risco AR 8-7 meses');
    }
    if (this.avisoStatusBadgeFiltroAtivo) {
      filtrosAtivos.push(`Status: ${this.avisoStatusBadgeFiltroAtivo}`);
    }

    if (filtrosAtivos.length > 0) {
      label.textContent = `Filtro ativo: ${filtrosAtivos.join(' | ')}`;
      label.style.display = 'block';
      return;
    }
    label.textContent = '';
    label.style.display = 'none';
  }

  private atualizarDecisaoPainelAviso(contratoId: string, decisao: 'a_decidir' | 'prorrogar' | 'nao_prorrogar'): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row) return;

    if (row.protocoloFormal) {
      row.decisaoProrrogar = 'prorrogar';
      this.showToast('Decisão travada em "Prorrogar": solicitação já encaminhada à Gestão Formal (protocolo existente).');
      this.aplicarFiltrosPainelAvisoVencimento();
      return;
    }

    if (decisao === 'a_decidir' && !this.podeManterADecidirProrrogacao(row)) {
      this.showToast('Status "A decidir" só é permitido entre 14 meses e 12 meses antes do fim da vigência.');
      this.aplicarFiltrosPainelAvisoVencimento();
      return;
    }

    const decisaoAnterior = row.decisaoProrrogar;
    if (!this.registrarReaberturaDecisaoProrrogacao(row, decisaoAnterior, decisao)) {
      this.aplicarFiltrosPainelAvisoVencimento();
      return;
    }

    row.decisaoProrrogar = decisao;
    this.persistirEstadoAvisoRow(row);

    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private solicitarProrrogacaoFormal(contratoId: string): void {
    const row = this.painelAvisoVencimento.find((item) => item.contratoId === contratoId);
    if (!row) return;

    if (row.decisaoProrrogar !== 'prorrogar') {
      this.showToast('Defina a decisão como "Prorrogar" antes de enviar a solicitação ao Gestor Formal.');
      return;
    }

    if (row.decisaoAcaoRenovatoria === 'a_decidir') {
      this.showToast('Defina também a decisão de ação renovatória antes de encaminhar o protocolo para Gestão Formal.');
      return;
    }

    if (row.protocoloFormal) {
      this.showToast(`Solicitação já registrada. Protocolo: ${row.protocoloFormal}.`);
      return;
    }

    const protocolo = this.gerarProtocoloSolicitacaoProrrogacao(row.contratoSap);
    row.protocoloFormal = protocolo;
    row.demandaSiclg = 'Ato Formal - Prorrogação';

    this.persistirEstadoAvisoRow(row);

    this.showToast(`Solicitação enviada ao Gestor Formal na categoria Ato Formal / Prorrogação. Protocolo gerado: ${protocolo}.`);
    this.aplicarFiltrosPainelAvisoVencimento();
  }

  private derivarColegiadoAviso(row: PainelVencimentosContrato, index: number): string {
    const mapaPorUf: Record<string, string> = {
      SP: 'Colegiado Regional Sudeste',
      RJ: 'Colegiado Regional Sudeste',
      MG: 'Colegiado Regional Sudeste',
      DF: 'Colegiado Nacional',
      BA: 'Colegiado Regional Nordeste',
      CE: 'Colegiado Regional Nordeste',
      PE: 'Colegiado Regional Nordeste',
      PR: 'Colegiado Regional Sul',
      GO: 'Colegiado Regional Centro-Oeste',
      AM: 'Colegiado Regional Norte'
    };

    return mapaPorUf[row.uf] || (index % 2 === 0 ? 'Colegiado Regional' : 'Colegiado Nacional');
  }

  private montarPainelAcoesRenovatorias(imoveis: Imovel[], locadores: Locador[], dadosReais: boolean, dadosDijur?: DijurRegistro[]): PainelAcoesRenovatoriasRow[] {
    const locadorMap = new Map(locadores.map((locador) => [locador.id, locador]));
    const dijurMap = new Map((dadosDijur || []).map((registro) => [String(registro.contrato_sap), registro]));

    return imoveis.slice(0, 60).map((imovel, index) => {
      const contratoSap = imovel.codigo || `SEM-SAP-${String(index + 1).padStart(4, '0')}`;
      const registroDijur = dijurMap.get(contratoSap);
      const contratoSiclg = imovel.numeroInstrumento || this.gerarContratoSiclgFormal(contratoSap, index);
      const protocoloFormalSiclg = this.gerarProtocoloFormalSiclg(contratoSap, index);
      const numeroProcessoSiclg = imovel.numeroProcesso || this.gerarNumeroProcessoSiclg(contratoSap, index);
      const numeroProcessoDijur = registroDijur?.numero_processo_dijur || this.gerarNumeroProcessoDijur(contratoSap, index);
      const vigenciaBase = imovel.vigenciaFinal || imovel.contratoFimValidade || imovel.fimValidade || '-';
      const vigenciaDate = this.parseDate(vigenciaBase);
      const diasParaVigencia = vigenciaDate
        ? Math.ceil((vigenciaDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const locador = locadorMap.get(imovel.locadorId || '');
      const unidade = this.gerarDescricaoUnidadeFormal(imovel);
      const situacaoSiclg = this.derivarSituacaoSiclgFormal(diasParaVigencia);
      const situacaoSijur = registroDijur?.situacao_sijur || this.derivarSituacaoSijurFormal(diasParaVigencia);
      const situacaoCefor = registroDijur?.situacao_cefor || this.derivarSituacaoCeforFormal(diasParaVigencia);
      const radarSucot = this.derivarRadarSucotFormal(diasParaVigencia);
      const lastSyncAt = registroDijur?.last_sync_at ? this.formatDateTime(registroDijur.last_sync_at) : new Date(Date.now() - index * 6 * 60 * 60 * 1000).toLocaleString('pt-BR');
      const partesDijur = registroDijur?.partes_dijur || `CAIXA ECONÔMICA FEDERAL x ${locador?.nome || imovel.parceiroNegocios || 'Locador não identificado'}`;
      const edicoes = this.carregarEdicoesPainelFormal();
      const edicao = edicoes[imovel.id];

      return {
        contratoId: imovel.id,
        codigoSijur: registroDijur?.codigo_sijur || `SIJUR-${contratoSap.replace(/\D/g, '').slice(-6).padStart(6, '0')}`,
        contratoSap,
        contratoSiclg,
        protocoloFormalSiclg,
        unidade,
        vigenciaSiclg: this.formatDate(vigenciaBase),
        situacaoSiclg,
        numeroProcessoSiclg,
        situacaoSijur,
        situacaoCefor,
        numeroProcessoDijur,
        dataEntradaDijur: registroDijur?.data_entrada_dijur ? this.formatDate(registroDijur.data_entrada_dijur) : this.calcularDataEntradaDijur(vigenciaDate, index),
        partesDijur,
        lastSyncAt,
        radarSucot: edicao?.radarSucot || radarSucot,
        notas: edicao?.notas || this.derivarNotasGestorFormal(imovel, diasParaVigencia, dadosReais),
        statusOperacional: this.derivarStatusOperacionalFormal(diasParaVigencia),
        origemDados: registroDijur
          ? (dadosReais ? 'SAP + DIJUR_API + INPUT_GESTOR_FORMAL' : 'BASE_LOCAL + DIJUR_API + INPUT_GESTOR_FORMAL')
          : (dadosReais ? 'SAP + DIJUR_API (indisponível) + INPUT_GESTOR_FORMAL' : 'BASE_LOCAL + DIJUR_API (indisponível) + INPUT_GESTOR_FORMAL'),
        vigenciaDate
      };
    });
  }

  private aplicarDadosDijurNaMassaExistente(rows: PainelAcoesRenovatoriasRow[], dadosDijur: DijurRegistro[]): PainelAcoesRenovatoriasRow[] {
    const mapa = new Map(dadosDijur.map((registro) => [String(registro.contrato_sap), registro]));

    return rows.map((row) => {
      const dijur = mapa.get(row.contratoSap);
      if (!dijur) return row;

      return {
        ...row,
        codigoSijur: dijur.codigo_sijur || row.codigoSijur,
        numeroProcessoDijur: dijur.numero_processo_dijur || row.numeroProcessoDijur,
        situacaoSijur: dijur.situacao_sijur || row.situacaoSijur,
        situacaoCefor: dijur.situacao_cefor || row.situacaoCefor,
        dataEntradaDijur: dijur.data_entrada_dijur ? this.formatDate(dijur.data_entrada_dijur) : row.dataEntradaDijur,
        partesDijur: dijur.partes_dijur || row.partesDijur,
        lastSyncAt: dijur.last_sync_at ? this.formatDateTime(dijur.last_sync_at) : row.lastSyncAt,
        origemDados: row.origemDados.replace('DIJUR_API (indisponível)', 'DIJUR_API')
      };
    });
  }

  private carregarEdicoesPainelFormal(): Record<string, { radarSucot: string; notas: string }> {
    try {
      const raw = localStorage.getItem(SistemaSILIC.FORMAL_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private salvarEdicoesPainelFormal(edicoes: Record<string, { radarSucot: string; notas: string }>): void {
    try {
      localStorage.setItem(SistemaSILIC.FORMAL_STORAGE_KEY, JSON.stringify(edicoes));
    } catch {
      // Sem persistência quando localStorage estiver indisponível.
    }
  }

  private formatDateTime(value?: string): string {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('pt-BR');
  }

  private gerarContratoSiclgFormal(contratoSap: string, index: number): string {
    return `SICLG-${new Date().getFullYear()}-${(contratoSap.replace(/\D/g, '').slice(-5) || String(index + 1).padStart(5, '0'))}`;
  }

  private gerarProtocoloFormalSiclg(contratoSap: string, index: number): string {
    const base = contratoSap.replace(/\D/g, '').slice(-6) || String(index + 1).padStart(6, '0');
    return `PF-${new Date().getFullYear()}-${base}`;
  }

  private gerarNumeroProcessoSiclg(contratoSap: string, index: number): string {
    const base = contratoSap.replace(/\D/g, '').slice(-4) || String(index + 1).padStart(4, '0');
    return `000.${base}/${new Date().getFullYear()}-${String((index % 89) + 10).padStart(2, '0')}`;
  }

  private gerarNumeroProcessoDijur(contratoSap: string, index: number): string {
    const base = contratoSap.replace(/\D/g, '').slice(-7).padStart(7, '0');
    return `${base}-${String((index % 90) + 10).padStart(2, '0')}.${new Date().getFullYear()}.4.01.${String((index % 27) + 1).padStart(4, '0')}`;
  }

  private gerarDescricaoUnidadeFormal(imovel: Imovel): string {
    const base = imovel.denominacao || imovel.cidade || 'Unidade não identificada';
    return imovel.estado ? `${base}/${imovel.estado}` : base;
  }

  private derivarSituacaoSiclgFormal(diasParaVigencia: number | null): string {
    if (diasParaVigencia === null) return 'Sem vigência consolidada';
    if (diasParaVigencia < 0) return 'Vigência expirada';
    if (diasParaVigencia <= 45) return 'Renovação com vencimento iminente';
    if (diasParaVigencia <= 120) return 'Renovação em instrução';
    return 'Instrumento vigente';
  }

  private derivarSituacaoSijurFormal(diasParaVigencia: number | null): string {
    if (diasParaVigencia === null || diasParaVigencia > 120) return 'Aguardando distribuição';
    if (diasParaVigencia > 60) return 'Em análise DIJUR';
    if (diasParaVigencia > 15) return 'Minuta/peça em elaboração';
    return 'Ajuizamento protocolado';
  }

  private derivarSituacaoCeforFormal(diasParaVigencia: number | null): string {
    if (diasParaVigencia === null || diasParaVigencia > 120) return 'Aguardando instrução CEFOR';
    if (diasParaVigencia > 60) return 'Em conferência documental';
    if (diasParaVigencia > 15) return 'Minuta validada';
    return 'Instrumento encaminhado para assinatura';
  }

  private derivarRadarSucotFormal(diasParaVigencia: number | null): string {
    if (diasParaVigencia === null || diasParaVigencia > 120) return 'Não acionado';
    if (diasParaVigencia > 45) return 'Monitorado';
    return 'Acionado';
  }

  private derivarStatusOperacionalFormal(diasParaVigencia: number | null): string {
    if (diasParaVigencia === null) return 'Sem ação imediata';
    if (diasParaVigencia < 0) return 'Atuação prioritária';
    if (diasParaVigencia <= 45) return 'Escalonamento formal em curso';
    if (diasParaVigencia <= 120) return 'Preparação de instrução';
    return 'Monitoramento preventivo';
  }

  private derivarNotasGestorFormal(imovel: Imovel, diasParaVigencia: number | null, dadosReais: boolean): string {
    const unidade = this.gerarDescricaoUnidadeFormal(imovel);
    const origem = dadosReais ? 'base SAP' : 'base local';

    if (diasParaVigencia === null) {
      return `Contrato em acompanhamento no A-III com vigência pendente de consolidação a partir da ${origem}.`;
    }

    if (diasParaVigencia < 0) {
      return `Contrato da unidade ${unidade} requer tratamento prioritário no fluxo formal por vigência expirada.`;
    }

    if (diasParaVigencia <= 45) {
      return `Contrato da unidade ${unidade} em janela crítica de renovação. Validar documentação e tramitação no A-III.`;
    }

    if (diasParaVigencia <= 120) {
      return `Contrato da unidade ${unidade} em preparação de instrução formal, com acompanhamento do Gestor Formal.`;
    }

    return `Contrato da unidade ${unidade} mantido em monitoramento preventivo no painel A-III.`;
  }

  private calcularDataEntradaDijur(vigenciaDate: Date | null, index: number): string {
    if (!vigenciaDate) {
      return this.formatDate(new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString());
    }

    const referencia = new Date(vigenciaDate.getTime() - 75 * 24 * 60 * 60 * 1000);
    return this.formatDate(referencia.toISOString());
  }

  private obterBadgePainelFormal(status: string, tipo: 'siclg' | 'sijur' | 'cefor'): string {
    const maps: Record<'siclg' | 'sijur' | 'cefor', Record<string, string>> = {
      siclg: {
        'Instrumento vigente': 'badge badge-ativo',
        'Renovação em instrução': 'badge badge-info',
        'Renovação com vencimento iminente': 'badge badge-warning',
        'Vigência expirada': 'badge badge-danger',
        'Sem vigência consolidada': 'badge badge-neutral'
      },
      sijur: {
        'Aguardando distribuição': 'badge badge-neutral',
        'Em análise DIJUR': 'badge badge-info',
        'Minuta/peça em elaboração': 'badge badge-warning',
        'Ajuizamento protocolado': 'badge badge-ativo'
      },
      cefor: {
        'Aguardando instrução CEFOR': 'badge badge-neutral',
        'Em conferência documental': 'badge badge-info',
        'Aguardando instrução': 'badge badge-warning',
        'Minuta validada': 'badge badge-warning',
        'Instrumento encaminhado para assinatura': 'badge badge-ativo'
      }
    };

    return maps[tipo][status] || 'badge badge-neutral';
  }

  private configurarPainelVencimentos(): void {
    this.addEventListenerSafe('painelBuscarBtn', 'click', () => this.aplicarFiltrosPainelVencimentos());
    this.addEventListenerSafe('painelLimparBtn', 'click', () => this.limparFiltrosPainelVencimentos());
  }

  private configurarPainelAcoesRenovatorias(): void {
    this.addEventListenerSafe('formalBuscarBtn', 'click', () => this.aplicarFiltrosPainelAcoesRenovatorias());
    this.addEventListenerSafe('formalLimparBtn', 'click', () => this.limparFiltrosPainelAcoesRenovatorias());
    this.addEventListenerSafe('formalExportarCsvBtn', 'click', () => this.exportarPainelFormalCSV());
    this.addEventListenerSafe('formalExportarExcelBtn', 'click', () => this.exportarPainelFormalExcel());
    this.addEventListenerSafe('formalSalvarEdicaoBtn', 'click', () => this.salvarEdicaoModalFormal());

    const modal = document.getElementById('modalDetalhesFormal');
    const btnClose = modal?.querySelector('[data-formal-close="true"]');

    if (btnClose) {
      btnClose.addEventListener('click', () => this.fecharModalDetalhesFormal());
    }

    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          this.fecharModalDetalhesFormal();
        }
      });
    }
  }

  private configurarPainelAvisoVencimento(): void {
    this.addEventListenerSafe('avisoBuscarBtn', 'click', () => this.aplicarFiltrosPainelAvisoVencimento());
    this.addEventListenerSafe('avisoLimparBtn', 'click', () => this.limparFiltrosPainelAvisoVencimento());
    this.addEventListenerSafe('avisoExportarCsvBtn', 'click', () => this.exportarPainelAvisoCSV());
    this.addEventListenerSafe('avisoExportarExcelBtn', 'click', () => this.exportarPainelAvisoExcel());
    this.addEventListenerSafe('avisoToggleFiltrosBtn', 'click', () => {
      const body = document.getElementById('avisoFiltrosBody');
      const btn = document.getElementById('avisoToggleFiltrosBtn');
      if (!body || !btn) return;

      const oculto = body.hasAttribute('hidden');
      if (oculto) {
        body.removeAttribute('hidden');
        btn.textContent = 'Ocultar filtros';
      } else {
        body.setAttribute('hidden', 'true');
        btn.textContent = 'Mostrar filtros';
      }
    });

    this.addEventListenerSafe('avisoTemaExecutivoBtn', 'click', () => this.alterarTemaPainelAviso('executivo-neutro'));
    this.addEventListenerSafe('avisoTemaOperacionalBtn', 'click', () => this.alterarTemaPainelAviso('operacional-alerta'));

    document.querySelectorAll<HTMLElement>('[data-aviso-faixa-filter]').forEach((card) => {
      const faixa = card.dataset.avisoFaixaFilter as '' | 'faixa_14_12' | 'faixa_12_7' | 'faixa_menor_6';
      if (!faixa) return;

      card.addEventListener('click', () => {
        this.avisoFaixaFiltroAtiva = this.avisoFaixaFiltroAtiva === faixa ? '' : faixa;
        this.aplicarFiltrosPainelAvisoVencimento();
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.avisoFaixaFiltroAtiva = this.avisoFaixaFiltroAtiva === faixa ? '' : faixa;
          this.aplicarFiltrosPainelAvisoVencimento();
        }
      });
    });

    const cardRisco = document.getElementById('avisoKpiRiscoAr87Card');
    if (cardRisco) {
      cardRisco.addEventListener('click', () => {
        this.avisoFiltroRiscoAr87Ativo = !this.avisoFiltroRiscoAr87Ativo;
        this.aplicarFiltrosPainelAvisoVencimento();
      });

      cardRisco.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.avisoFiltroRiscoAr87Ativo = !this.avisoFiltroRiscoAr87Ativo;
          this.aplicarFiltrosPainelAvisoVencimento();
        }
      });
    }

    const gatilhoComposicaoRisco = document.getElementById('avisoKpiRiscoAr87');
    if (gatilhoComposicaoRisco && gatilhoComposicaoRisco.dataset.bound !== 'true') {
      gatilhoComposicaoRisco.dataset.bound = 'true';
      gatilhoComposicaoRisco.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.alternarComposicaoRiscoAr87();
      });
      gatilhoComposicaoRisco.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          this.alternarComposicaoRiscoAr87();
        }
      });
    }

    this.atualizarEstadoVisualFiltroFaixaAviso();
    this.atualizarEstadoVisualFiltroRiscoAr87();
    this.atualizarRotuloFiltroAtivoAviso();
    this.carregarTemaPainelAviso();
    this.aplicarTemaVisualPainelAviso();
  }

  private carregarTemaPainelAviso(): void {
    try {
      const tema = localStorage.getItem(SistemaSILIC.AVISO_TEMA_STORAGE_KEY);
      if (tema === 'operacional-alerta' || tema === 'executivo-neutro') {
        this.avisoTemaVisual = tema;
      }
    } catch {
      this.avisoTemaVisual = 'executivo-neutro';
    }
  }

  private salvarTemaPainelAviso(): void {
    try {
      localStorage.setItem(SistemaSILIC.AVISO_TEMA_STORAGE_KEY, this.avisoTemaVisual);
    } catch {
      // Ignora indisponibilidade de localStorage.
    }
  }

  private alterarTemaPainelAviso(tema: 'executivo-neutro' | 'operacional-alerta'): void {
    if (this.avisoTemaVisual === tema) return;
    this.avisoTemaVisual = tema;
    this.aplicarTemaVisualPainelAviso();
    this.salvarTemaPainelAviso();
  }

  private aplicarTemaVisualPainelAviso(): void {
    const painel = document.querySelector<HTMLElement>('.formal-panel-view[data-formal-panel="aviso-vencimento"]');
    if (painel) {
      painel.classList.remove('executivo-neutro', 'operacional-alerta');
      painel.classList.add(this.avisoTemaVisual);
    }

    const btnExecutivo = document.getElementById('avisoTemaExecutivoBtn');
    const btnOperacional = document.getElementById('avisoTemaOperacionalBtn');
    const executivoAtivo = this.avisoTemaVisual === 'executivo-neutro';

    if (btnExecutivo) {
      btnExecutivo.classList.toggle('is-active', executivoAtivo);
      btnExecutivo.setAttribute('aria-pressed', String(executivoAtivo));
    }

    if (btnOperacional) {
      btnOperacional.classList.toggle('is-active', !executivoAtivo);
      btnOperacional.setAttribute('aria-pressed', String(!executivoAtivo));
    }
  }

  private atualizarEstadoVisualFiltroFaixaAviso(): void {
    document.querySelectorAll<HTMLElement>('[data-aviso-faixa-filter]').forEach((card) => {
      const faixa = card.dataset.avisoFaixaFilter || '';
      const ativo = faixa === this.avisoFaixaFiltroAtiva;
      card.classList.toggle('is-active', ativo);
      card.setAttribute('aria-pressed', String(ativo));
    });
  }

  private atualizarEstadoVisualFiltroRiscoAr87(): void {
    const card = document.getElementById('avisoKpiRiscoAr87Card');
    if (!card) return;
    card.classList.toggle('is-active', this.avisoFiltroRiscoAr87Ativo);
    card.setAttribute('aria-pressed', String(this.avisoFiltroRiscoAr87Ativo));
  }

  private configurarDrawerContextoAviso(): void {
    const drawer = document.getElementById('avisoContextDrawer');
    const backdrop = document.getElementById('avisoContextDrawerBackdrop');
    const closeBtn = document.getElementById('avisoContextDrawerClose');
    if (!drawer || !backdrop || !closeBtn) return;

    closeBtn.addEventListener('click', () => this.fecharDrawerContextoAviso());
    backdrop.addEventListener('click', () => this.fecharDrawerContextoAviso());

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drawer.classList.contains('active')) {
        this.fecharDrawerContextoAviso();
      }
    });
  }

  private abrirDrawerContextoAviso(item: PainelAvisoVencimentoRow): void {
    const drawer = document.getElementById('avisoContextDrawer');
    const backdrop = document.getElementById('avisoContextDrawerBackdrop');
    const title = document.getElementById('avisoContextDrawerTitle');
    const content = document.getElementById('avisoContextDrawerContent');
    if (!drawer || !backdrop || !title || !content) return;

    this.sincronizarSituacaoLaudoAvaliacao(item);
    const partesDetalheRequisicaoLaudo: string[] = [];
    if (item.laudoRequisicaoNumero) {
      partesDetalheRequisicaoLaudo.push(`Protocolo: ${item.laudoRequisicaoNumero}`);
    }
    if (item.laudoRequisicaoData) {
      partesDetalheRequisicaoLaudo.push(`Data da solicitação: ${item.laudoRequisicaoData}`);
    }
    const detalheRequisicaoLaudo = partesDetalheRequisicaoLaudo.join(' | ') || '-';
    const detalheNumeroLaudo = item.laudoNumero || '-';
    const detalhePrazoLaudo = this.obterResumoSlaLaudo(item) || '-';
    const detalheValidadeLaudo = item.laudoValidoAte || '-';
    const alertaValidadeLaudo = this.obterAlertaValidadeLaudo(item);
    const detalheHistoricoProrrogacao = (item.historicoDecisaoProrrogacao && item.historicoDecisaoProrrogacao.length)
      ? item.historicoDecisaoProrrogacao.join('<br>')
      : '-';
    const detalheHistoricoAr = (item.historicoDecisaoAcaoRenovatoria && item.historicoDecisaoAcaoRenovatoria.length)
      ? item.historicoDecisaoAcaoRenovatoria.join('<br>')
      : '-';
    const detalheProtocoloFormal = item.protocoloFormal || '-';
    const detalheProtocoloContratacao = item.protocoloContratacao || '-';

    title.textContent = `Contexto do aviso - Contrato SAP ${item.contratoSap}`;
    content.innerHTML = `
      <div class="info-section">
        <div class="info-grid">
          <div class="info-item"><label>Contrato (SICLG)</label><span>${item.contratoSiclg || '-'}</span></div>
          <div class="info-item"><label>Fase</label><span>${item.fase}</span></div>
          <div class="info-item"><label>Demanda (SICLG)</label><span>${item.demandaSiclg}</span></div>
          <div class="info-item"><label>Modalidade</label><span>${this.formatarModalidadeAviso(item.modalidade)}</span></div>
          <div class="info-item"><label>Situação do laudo de avaliação</label><span>${this.formatarSituacaoLaudoAvaliacao(item.situacaoLaudoAvaliacao)}</span></div>
          <div class="info-item"><label>Protocolo FORMAL</label><span>${detalheProtocoloFormal}</span></div>
          <div class="info-item"><label>Protocolo CONTRATACAO</label><span>${detalheProtocoloContratacao}</span></div>
          <div class="info-item"><label>Requisição do laudo</label><span>${detalheRequisicaoLaudo}</span></div>
          <div class="info-item"><label>Número do laudo</label><span>${detalheNumeroLaudo}</span></div>
          <div class="info-item"><label>Prazo de entrega do laudo</label><span>${detalhePrazoLaudo}</span></div>
          <div class="info-item"><label>Validade do laudo até</label><span>${detalheValidadeLaudo}</span></div>
          ${alertaValidadeLaudo ? `<div class="info-item" style="grid-column: 1 / -1;"><label>Alerta de validade</label><span>${alertaValidadeLaudo}</span></div>` : ''}
          <div class="info-item" style="grid-column: 1 / -1;"><label>Histórico de reabertura da prorrogação</label><span>${detalheHistoricoProrrogacao}</span></div>
          <div class="info-item" style="grid-column: 1 / -1;"><label>Histórico de reabertura da ação renovatória</label><span>${detalheHistoricoAr}</span></div>
          <div class="info-item"><label>Colegiado</label><span>${item.colegiado}</span></div>
          <div class="info-item"><label>Limite legal para ingresso da AR</label><span>${item.limiteLegalAr}</span></div>
          <div class="info-item"><label>Último valor pago no SAP</label><span>${this.formatCurrency(item.ultimoValorPagoSap)}</span></div>
          <div class="info-item" style="grid-column: 1 / -1;"><label>Descrição</label><span>${item.descricao}</span></div>
        </div>
      </div>
    `;

    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  private fecharDrawerContextoAviso(): void {
    const drawer = document.getElementById('avisoContextDrawer');
    const backdrop = document.getElementById('avisoContextDrawerBackdrop');
    if (!drawer || !backdrop) return;

    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  private configurarSwitchPainelFormal(): void {
    const container = document.getElementById('perfilFormalPage');
    if (!container) return;

    const tabs = Array.from(container.querySelectorAll('[data-formal-panel-target]')) as HTMLButtonElement[];
    const views = Array.from(container.querySelectorAll('[data-formal-panel]')) as HTMLElement[];
    if (!tabs.length || !views.length) return;

    const ativarPainel = (target: string): void => {
      tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.formalPanelTarget === target));
      views.forEach((view) => {
        const active = view.dataset.formalPanel === target;
        view.classList.toggle('is-active', active);
        view.hidden = !active;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.formalPanelTarget;
        if (!target) return;
        ativarPainel(target);
      });
    });

    ativarPainel('acoes-renovatorias');
  }

  private reposicionarPainelAvisoParaOperacional(): void {
    const alvo = document.getElementById('operacionalAvisoContainer');
    const painelAviso = document.querySelector('[data-formal-panel="aviso-vencimento"]') as HTMLElement | null;
    if (!alvo || !painelAviso) return;

    if (painelAviso.parentElement !== alvo) {
      alvo.appendChild(painelAviso);
    }

    // O painel veio do switch formal e precisa ficar ativo no novo container.
    painelAviso.classList.add('is-active');
    painelAviso.hidden = false;

    const botaoAvisoFormal = document.querySelector('[data-formal-panel-target="aviso-vencimento"]') as HTMLElement | null;
    if (botaoAvisoFormal) {
      botaoAvisoFormal.remove();
    }

    const switcherFormal = document.querySelector('#perfilFormalPage .formal-panel-switcher') as HTMLElement | null;
    if (switcherFormal) {
      const totalBotoes = switcherFormal.querySelectorAll('[data-formal-panel-target]').length;
      if (totalBotoes <= 1) {
        switcherFormal.style.display = 'none';
      }
    }
  }

  private configurarNavegacaoTopoOperacional(): void {
    const container = document.getElementById('perfilOperacionalPage');
    if (!container) return;

    const tabs = Array.from(container.querySelectorAll('[data-operacional-panel-target]')) as HTMLButtonElement[];
    const views = Array.from(container.querySelectorAll('[data-operacional-panel]')) as HTMLElement[];
    if (!tabs.length || !views.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.operacionalPanelTarget;
        if (!target) return;
        this.ativarPainelOperacional(target as 'passos-jornada' | 'aviso-vencimento');
      });
    });

    this.ativarPainelOperacional('passos-jornada');
  }

  private ativarPainelOperacional(target: 'passos-jornada' | 'aviso-vencimento'): void {
    const container = document.getElementById('perfilOperacionalPage');
    if (!container) return;

    const tabs = Array.from(container.querySelectorAll('[data-operacional-panel-target]')) as HTMLButtonElement[];
    const views = Array.from(container.querySelectorAll('[data-operacional-panel]')) as HTMLElement[];
    if (!tabs.length || !views.length) return;

    tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.operacionalPanelTarget === target));
    views.forEach((view) => {
      const active = view.dataset.operacionalPanel === target;
      view.classList.toggle('is-active', active);
      view.hidden = !active;
    });
  }

  private configurarPaginacaoPainelPortfolio(): void {
    const select = document.getElementById('painelItensPorPaginaSelect') as HTMLSelectElement | null;
    if (!select) return;

    select.value = String(this.itemsPerPagePainel);
    select.addEventListener('change', () => {
      const val = parseInt(select.value, 10);
      if (!isNaN(val) && val > 0) {
        this.itemsPerPagePainel = val;
        this.currentPagePainel = 1;
        this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
      }
    });
  }

  private exportarPainelFormalCSV(): void {
    const headers = [
      'Codigo SIJUR',
      'Contrato SAP',
      'Contrato SICLG',
      'Protocolo Formal (SICLG)',
      'Unidade',
      'Vigencia (SICLG)',
      'Situacao SICLG',
      'Numero do Processo (SICLG)',
      'Situacao SIJUR',
      'Situacao CEFOR',
      'Numero do Processo DIJUR',
      'Data de Entrada DIJUR',
      'Last Sync At',
      'Radar SUCOT',
      'Status Operacional',
      'Notas',
      'Origem dos Dados'
    ];

    const csv = [
      headers.join(','),
      ...this.painelAcoesRenovatoriasFiltrado.map((item) => this.serializarLinhaPainelFormal(item).join(','))
    ].join('\n');

    this.baixarArquivo(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }), `painel-acoes-renovatorias-${this.obterDataArquivo()}.csv`);
  }

  private exportarPainelFormalExcel(): void {
    const rows = this.painelAcoesRenovatoriasFiltrado.map((item) => ({
      'Código SIJUR': item.codigoSijur,
      'Contrato SAP': item.contratoSap,
      'Contrato SICLG': item.contratoSiclg,
      'Protocolo Formal (SICLG)': item.protocoloFormalSiclg,
      'Unidade': item.unidade,
      'Vigência (SICLG)': item.vigenciaSiclg,
      'Situação SICLG': item.situacaoSiclg,
      'Número do Processo (SICLG)': item.numeroProcessoSiclg,
      'Situação SIJUR': item.situacaoSijur,
      'Situação CEFOR': item.situacaoCefor,
      'Número do Processo DIJUR': item.numeroProcessoDijur,
      'Data de Entrada DIJUR': item.dataEntradaDijur,
      'Última sincronização DIJUR': item.lastSyncAt,
      'Radar SUCOT': item.radarSucot,
      'Status operacional': item.statusOperacional,
      'Notas do Gestor Formal': item.notas,
      'Origem dos dados': item.origemDados
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AcoesRenovatorias');
    XLSX.writeFile(workbook, `painel-acoes-renovatorias-${this.obterDataArquivo()}.xlsx`);
  }

  private exportarPainelAvisoCSV(): void {
    const headers = [
      'Contrato SAP',
      'Contrato SICLG',
      'Situacao SICLG',
      'Descricao',
      'Ultimo valor pago no SAP',
      'Decisao de prorrogar',
      'Decisao de acao renovatoria',
      'Status',
      'Protocolo de contratacao',
      'Protocolo formal',
      'Fase',
      'Demanda SICLG',
      'Colegiado',
      'Limite legal AR',
      'Fim da vigencia',
      'Ultimo pagamento SAP'
    ];

    const csv = [
      headers.join(','),
      ...this.painelAvisoVencimentoFiltrado.map((item) => this.serializarLinhaPainelAviso(item).join(','))
    ].join('\n');

    this.baixarArquivo(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }), `painel-aviso-vencimento-${this.obterDataArquivo()}.csv`);
  }

  private exportarPainelAvisoExcel(): void {
    const rows = this.painelAvisoVencimentoFiltrado.map((item) => ({
      'Contrato SAP': item.contratoSap,
      'Contrato SICLG': item.contratoSiclg,
      'Situação SICLG': item.situacaoSiclg,
      'Descrição': item.descricao,
      'Último valor pago no SAP': item.ultimoValorPagoSap,
      'Decisão de prorrogar': this.formatarDecisaoAviso(item.decisaoProrrogar),
      'Decisão de ação renovatória': this.formatarDecisaoAcaoRenovatoria(item.decisaoAcaoRenovatoria),
      'Status': item.situacaoSiclg,
      'Protocolo de contratação': item.protocoloContratacao || '-',
      'Protocolo formal': item.protocoloFormal || '-',
      'Fase': item.fase,
      'Demanda (SICLG)': item.demandaSiclg,
      'Colegiado': item.colegiado,
      'Limite legal para ingresso da AR': item.limiteLegalAr,
      'Fim da vigência': item.fimVigencia,
      'Último pagamento SAP': item.ultimoPagamentoSap
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AvisoVencimento');
    XLSX.writeFile(workbook, `painel-aviso-vencimento-${this.obterDataArquivo()}.xlsx`);
  }

  private serializarLinhaPainelFormal(item: PainelAcoesRenovatoriasRow): string[] {
    const escapeCSV = (value: string): string => `"${value.replace(/"/g, '""').replace(/\r?\n|\r/g, ' ')}"`;

    return [
      item.codigoSijur,
      item.contratoSap,
      item.contratoSiclg,
      item.protocoloFormalSiclg,
      item.unidade,
      item.vigenciaSiclg,
      item.situacaoSiclg,
      item.numeroProcessoSiclg,
      item.situacaoSijur,
      item.situacaoCefor,
      item.numeroProcessoDijur,
      item.dataEntradaDijur,
      item.lastSyncAt,
      item.radarSucot,
      item.statusOperacional,
      item.notas,
      item.origemDados
    ].map(escapeCSV);
  }

  private serializarLinhaPainelAviso(item: PainelAvisoVencimentoRow): string[] {
    const escapeCSV = (value: string | number): string => `"${String(value).replace(/"/g, '""').replace(/\r?\n|\r/g, ' ')}"`;

    return [
      item.contratoSap,
      item.contratoSiclg,
      item.situacaoSiclg,
      item.descricao,
      item.ultimoValorPagoSap.toFixed(2),
      this.formatarDecisaoAviso(item.decisaoProrrogar),
      this.formatarDecisaoAcaoRenovatoria(item.decisaoAcaoRenovatoria),
      item.situacaoSiclg,
      item.protocoloContratacao || '-',
      item.protocoloFormal || '-',
      item.fase,
      item.demandaSiclg,
      item.colegiado,
      item.limiteLegalAr,
      item.fimVigencia,
      item.ultimoPagamentoSap
    ].map(escapeCSV);
  }

  private baixarArquivo(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private obterDataArquivo(): string {
    const data = new Date();
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  private configurarPaginacaoPainelFormal(): void {
    const select = document.getElementById('formalItensPorPaginaSelect') as HTMLSelectElement | null;
    if (!select) return;

    select.value = String(this.itemsPerPagePainelFormal);
    select.addEventListener('change', () => {
      const val = parseInt(select.value, 10);
      if (!isNaN(val) && val > 0) {
        this.itemsPerPagePainelFormal = val;
        this.currentPagePainelFormal = 1;
        this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
      }
    });
  }

  private configurarPaginacaoPainelAviso(): void {
    const select = document.getElementById('avisoItensPorPaginaSelect') as HTMLSelectElement | null;
    if (!select) return;

    select.value = String(this.itemsPerPagePainelAviso);
    select.addEventListener('change', () => {
      const val = parseInt(select.value, 10);
      if (!isNaN(val) && val > 0) {
        this.itemsPerPagePainelAviso = val;
        this.currentPagePainelAviso = 1;
        this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
      }
    });
  }

  private aplicarFiltrosPainelVencimentos(): void {
    const uf = (document.getElementById('painelUfFiltro') as HTMLSelectElement | null)?.value || '';
    const ate = (document.getElementById('painelAteFiltro') as HTMLInputElement | null)?.value || '';
    const status = (document.getElementById('painelStatusFiltro') as HTMLSelectElement | null)?.value || '';

    const ateDate = ate ? new Date(ate) : null;

    this.painelVencimentosFiltrado = this.painelVencimentos.filter((item) => {
      if (uf && item.uf !== uf) return false;
      if (status && item.conciliacaoStatus !== status) return false;

      if (ateDate) {
        const v = this.parseDate(item.vencimentoReferencia);
        if (!v) return false;
        if (v > ateDate) return false;
      }

      return true;
    });

    this.currentPagePainel = 1;

    this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
  }

  private limparFiltrosPainelVencimentos(): void {
    const uf = document.getElementById('painelUfFiltro') as HTMLSelectElement | null;
    const ate = document.getElementById('painelAteFiltro') as HTMLInputElement | null;
    const status = document.getElementById('painelStatusFiltro') as HTMLSelectElement | null;
    if (uf) uf.value = '';
    if (ate) ate.value = '';
    if (status) status.value = '';
    this.painelVencimentosFiltrado = [...this.painelVencimentos];
    this.currentPagePainel = 1;
    this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
  }

  private aplicarFiltrosPainelAcoesRenovatorias(): void {
    const codigoSijur = ((document.getElementById('formalCodigoSijurFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const contratoSap = ((document.getElementById('formalContratoSapFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const contratoSiclg = ((document.getElementById('formalContratoSiclgFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const protocoloFormal = ((document.getElementById('formalProtocoloFormalFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const unidade = ((document.getElementById('formalUnidadeFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const numeroProcesso = ((document.getElementById('formalProcessoFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const vigenciaAte = (document.getElementById('formalVigenciaAteFiltro') as HTMLInputElement | null)?.value || '';
    const situacaoSiclg = (document.getElementById('formalSituacaoSiclgFiltro') as HTMLSelectElement | null)?.value || '';
    const situacaoSijur = (document.getElementById('formalSituacaoSijurFiltro') as HTMLSelectElement | null)?.value || '';
    const situacaoCefor = (document.getElementById('formalSituacaoCeforFiltro') as HTMLSelectElement | null)?.value || '';

    const vigenciaAteDate = vigenciaAte ? new Date(vigenciaAte) : null;

    this.painelAcoesRenovatoriasFiltrado = this.painelAcoesRenovatorias.filter((item) => {
      if (codigoSijur && !item.codigoSijur.toLowerCase().includes(codigoSijur)) return false;
      if (contratoSap && !item.contratoSap.toLowerCase().includes(contratoSap)) return false;
      if (contratoSiclg && !item.contratoSiclg.toLowerCase().includes(contratoSiclg)) return false;
      if (protocoloFormal && !item.protocoloFormalSiclg.toLowerCase().includes(protocoloFormal)) return false;
      if (unidade && !item.unidade.toLowerCase().includes(unidade)) return false;
      if (numeroProcesso && !item.numeroProcessoSiclg.toLowerCase().includes(numeroProcesso)) return false;
      if (situacaoSiclg && item.situacaoSiclg !== situacaoSiclg) return false;
      if (situacaoSijur && item.situacaoSijur !== situacaoSijur) return false;
      if (situacaoCefor && item.situacaoCefor !== situacaoCefor) return false;

      if (vigenciaAteDate) {
        if (!item.vigenciaDate || item.vigenciaDate > vigenciaAteDate) return false;
      }

      return true;
    });

    this.currentPagePainelFormal = 1;
    this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
  }

  private limparFiltrosPainelAcoesRenovatorias(): void {
    this.setInputValue('formalCodigoSijurFiltro', '');
    this.setInputValue('formalContratoSapFiltro', '');
    this.setInputValue('formalContratoSiclgFiltro', '');
    this.setInputValue('formalProtocoloFormalFiltro', '');
    this.setInputValue('formalUnidadeFiltro', '');
    this.setInputValue('formalProcessoFiltro', '');
    this.setInputValue('formalVigenciaAteFiltro', '');

    const situacaoSiclg = document.getElementById('formalSituacaoSiclgFiltro') as HTMLSelectElement | null;
    const situacaoSijur = document.getElementById('formalSituacaoSijurFiltro') as HTMLSelectElement | null;
    const situacaoCefor = document.getElementById('formalSituacaoCeforFiltro') as HTMLSelectElement | null;

    if (situacaoSiclg) situacaoSiclg.value = '';
    if (situacaoSijur) situacaoSijur.value = '';
    if (situacaoCefor) situacaoCefor.value = '';

    this.painelAcoesRenovatoriasFiltrado = [...this.painelAcoesRenovatorias];
    this.currentPagePainelFormal = 1;
    this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
  }

  private atualizarOpcoesSelectDinamicoAviso(
    selectId: string,
    placeholderLabel: string,
    valores: string[],
    opcoes?: {
      ordem?: string[];
      labels?: Record<string, string>;
    }
  ): void {
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    if (!select) return;

    const valorSelecionado = select.value;
    const valoresUnicos = Array.from(new Set(
      valores
        .map((valor) => (valor || '').trim())
        .filter((valor) => valor.length > 0)
    ));

    const ordem = opcoes?.ordem || [];
    const labels = opcoes?.labels || {};
    const valoresOrdenados = [...valoresUnicos].sort((a, b) => {
      const indiceA = ordem.indexOf(a);
      const indiceB = ordem.indexOf(b);
      const aOrdenado = indiceA >= 0;
      const bOrdenado = indiceB >= 0;

      if (aOrdenado && bOrdenado) return indiceA - indiceB;
      if (aOrdenado) return -1;
      if (bOrdenado) return 1;
      return a.localeCompare(b, 'pt-BR');
    });

    select.innerHTML = '';

    const optionTodas = document.createElement('option');
    optionTodas.value = '';
    optionTodas.textContent = placeholderLabel;
    select.appendChild(optionTodas);

    valoresOrdenados.forEach((valor) => {
      const option = document.createElement('option');
      option.value = valor;
      option.textContent = labels[valor] || valor;
      select.appendChild(option);
    });

    if (valorSelecionado && valoresOrdenados.includes(valorSelecionado)) {
      select.value = valorSelecionado;
      return;
    }

    select.value = '';
  }

  private atualizarOpcoesDinamicasFiltrosPainelAviso(): void {
    const rows = this.painelAvisoVencimento;

    this.atualizarOpcoesSelectDinamicoAviso(
      'avisoSituacaoSiclgFiltro',
      'Situação do instrumento (SICLG): todas',
      rows.map((item) => item.situacaoSiclg)
    );

    this.atualizarOpcoesSelectDinamicoAviso(
      'avisoDecisaoFiltro',
      'Decisão de prorrogar: todas',
      rows.map((item) => item.decisaoProrrogar),
      {
        ordem: ['a_decidir', 'prorrogar', 'nao_prorrogar'],
        labels: {
          a_decidir: 'A decidir',
          prorrogar: 'Prorrogar',
          nao_prorrogar: 'Não prorrogar'
        }
      }
    );

    this.atualizarOpcoesSelectDinamicoAviso(
      'avisoDecisaoArFiltro',
      'Ação renovatória: todas',
      rows.map((item) => item.decisaoAcaoRenovatoria),
      {
        ordem: ['a_decidir', 'ingressar', 'nao_ingressar'],
        labels: {
          a_decidir: 'A decidir',
          ingressar: 'Ingressar',
          nao_ingressar: 'Não ingressar'
        }
      }
    );

    this.atualizarOpcoesSelectDinamicoAviso(
      'avisoFaseFiltro',
      'Fase do tratamento: todas',
      rows.map((item) => item.fase),
      {
        ordem: ['Monitoramento', 'Negociação', 'Notificação', 'Aditivo', 'Encerramento']
      }
    );

    this.atualizarOpcoesSelectDinamicoAviso(
      'avisoDemandaFiltro',
      'Tipo de demanda (SICLG): todas',
      rows.map((item) => item.demandaSiclg),
      {
        ordem: ['Ato Formal - Prorrogação', 'Aditivo', '-'],
        labels: {
          '-': 'Sem demanda registrada'
        }
      }
    );

    this.atualizarOpcoesSelectDinamicoAviso(
      'avisoColegiadoFiltro',
      'Instância colegiada: todas',
      rows.map((item) => item.colegiado)
    );

    this.atualizarOpcoesSelectDinamicoAviso(
      'avisoJanelaFiltro',
      'Janela de vencimento: todas',
      rows.map((item) => this.classificarJanelaAviso(item)),
      {
        ordem: ['mais_1_ano', '1_ano', '6_meses', '3_meses', '2_meses', '1_mes', 'menor_1_mes', 'vencido'],
        labels: {
          'mais_1_ano': '+1 ano',
          '1_ano': '1 ano',
          '6_meses': '6 meses',
          '3_meses': '3 meses',
          '2_meses': '2 meses',
          '1_mes': '1 mês',
          'menor_1_mes': 'Menor que 1 mês',
          vencido: 'Vencido (prazo indeterminado)'
        }
      }
    );
  }

  private aplicarFiltrosPainelAvisoVencimento(): void {
    this.atualizarOpcoesDinamicasFiltrosPainelAviso();

    const contratoSap = ((document.getElementById('avisoContratoSapFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const contratoSiclg = ((document.getElementById('avisoContratoSiclgFiltro') as HTMLInputElement | null)?.value || '').trim().toLowerCase();
    const situacaoSiclg = (document.getElementById('avisoSituacaoSiclgFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigenciaAte = (document.getElementById('avisoFimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const ultimoPagamentoAte = (document.getElementById('avisoUltimoPagamentoFiltro') as HTMLInputElement | null)?.value || '';
    const decisao = (document.getElementById('avisoDecisaoFiltro') as HTMLSelectElement | null)?.value || '';
    const decisaoAr = (document.getElementById('avisoDecisaoArFiltro') as HTMLSelectElement | null)?.value || '';
    const fase = (document.getElementById('avisoFaseFiltro') as HTMLSelectElement | null)?.value || '';
    const demanda = (document.getElementById('avisoDemandaFiltro') as HTMLSelectElement | null)?.value || '';
    const colegiado = (document.getElementById('avisoColegiadoFiltro') as HTMLSelectElement | null)?.value || '';
    const janela = (document.getElementById('avisoJanelaFiltro') as HTMLSelectElement | null)?.value || '';
    const limiteArAte = (document.getElementById('avisoLimiteArFiltro') as HTMLInputElement | null)?.value || '';

    const fimVigenciaDate = fimVigenciaAte ? new Date(fimVigenciaAte) : null;
    const ultimoPagamentoDate = ultimoPagamentoAte ? new Date(ultimoPagamentoAte) : null;
    const limiteArDate = limiteArAte ? new Date(limiteArAte) : null;

    this.painelAvisoVencimentoFiltrado = this.painelAvisoVencimento.filter((item) => {
      if (contratoSap && !item.contratoSap.toLowerCase().includes(contratoSap)) return false;
      if (contratoSiclg && !item.contratoSiclg.toLowerCase().includes(contratoSiclg)) return false;
      if (situacaoSiclg && item.situacaoSiclg !== situacaoSiclg) return false;
      if (this.avisoStatusBadgeFiltroAtivo && item.situacaoSiclg !== this.avisoStatusBadgeFiltroAtivo) return false;
      if (decisao && item.decisaoProrrogar !== decisao) return false;
      if (decisaoAr && item.decisaoAcaoRenovatoria !== decisaoAr) return false;
      if (fase && item.fase !== fase) return false;
      if (demanda && item.demandaSiclg !== demanda) return false;
      if (colegiado && item.colegiado !== colegiado) return false;
      if (janela && this.classificarJanelaAviso(item) !== janela) return false;
      if (this.avisoFaixaFiltroAtiva && this.classificarFaixaSinalizacaoAviso(item) !== this.avisoFaixaFiltroAtiva) return false;
      if (this.avisoFiltroRiscoAr87Ativo && !this.estaEmRiscoAr87(item)) return false;

      if (fimVigenciaDate) {
        if (!item.fimVigenciaDate || item.fimVigenciaDate > fimVigenciaDate) return false;
      }

      if (ultimoPagamentoDate) {
        if (!item.ultimoPagamentoDate || item.ultimoPagamentoDate > ultimoPagamentoDate) return false;
      }

      if (limiteArDate) {
        const limite = this.parseDate(item.limiteLegalAr);
        if (!limite || limite > limiteArDate) return false;
      }

      return true;
    });

    this.currentPagePainelAviso = 1;
    this.atualizarEstadoVisualFiltroFaixaAviso();
    this.atualizarEstadoVisualFiltroRiscoAr87();
    this.atualizarRotuloFiltroAtivoAviso();
    this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
  }

  private limparFiltrosPainelAvisoVencimento(): void {
    this.setInputValue('avisoContratoSapFiltro', '');
    this.setInputValue('avisoContratoSiclgFiltro', '');
    this.setInputValue('avisoFimVigenciaFiltro', '');
    this.setInputValue('avisoUltimoPagamentoFiltro', '');
    const demanda = document.getElementById('avisoDemandaFiltro') as HTMLSelectElement | null;
    const colegiado = document.getElementById('avisoColegiadoFiltro') as HTMLSelectElement | null;
    this.setInputValue('avisoLimiteArFiltro', '');

    const situacao = document.getElementById('avisoSituacaoSiclgFiltro') as HTMLSelectElement | null;
    const decisao = document.getElementById('avisoDecisaoFiltro') as HTMLSelectElement | null;
    const decisaoAr = document.getElementById('avisoDecisaoArFiltro') as HTMLSelectElement | null;
    const fase = document.getElementById('avisoFaseFiltro') as HTMLSelectElement | null;
    const janela = document.getElementById('avisoJanelaFiltro') as HTMLSelectElement | null;
    if (situacao) situacao.value = '';
    if (decisao) decisao.value = '';
    if (decisaoAr) decisaoAr.value = '';
    if (fase) fase.value = '';
    if (janela) janela.value = '';
    if (demanda) demanda.value = '';
    if (colegiado) colegiado.value = '';
    this.avisoFaixaFiltroAtiva = '';
    this.avisoFiltroRiscoAr87Ativo = false;
    this.avisoStatusBadgeFiltroAtivo = '';

    this.painelAvisoVencimentoFiltrado = [...this.painelAvisoVencimento];
    this.currentPagePainelAviso = 1;
    this.atualizarEstadoVisualFiltroFaixaAviso();
    this.atualizarEstadoVisualFiltroRiscoAr87();
    this.atualizarRotuloFiltroAtivoAviso();
    this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
  }

  private atualizarPainelVencimentos(dados: PainelVencimentosContrato[]): void {
    const tbody = document.getElementById('painelVencimentosBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';

    const inicio = (this.currentPagePainel - 1) * this.itemsPerPagePainel;
    const fim = inicio + this.itemsPerPagePainel;
    const dadosPaginados = dados.slice(inicio, fim);

    dadosPaginados.forEach((item) => {
      const tr = document.createElement('tr');
      const conciliacaoLabel = item.conciliacaoStatus === 'conciliado' ? 'Conciliado' : 'Pendente';
      const badgeClass = item.conciliacaoStatus === 'conciliado' ? 'badge badge-ativo' : 'badge badge-desmobilizacao';

      tr.innerHTML = `
        <td>${item.numeroContratoSap}</td>
        <td>${item.numeroContratoSiclg}</td>
        <td>${item.uf}</td>
        <td>${item.locadorSap}</td>
        <td>${item.vigenciaSap}</td>
        <td>${item.vigenciaSiclg}</td>
        <td>${item.situacaoSiclg}</td>
        <td>${item.ultimoPgtoSap}</td>
        <td>${this.formatCurrency(item.ultimoValorPagoSap)}</td>
        <td>${item.decisaoOperacional}</td>
        <td>${item.fase}</td>
        <td>${item.situacaoProcessoAr}</td>
        <td><span class="${badgeClass}">${conciliacaoLabel}</span></td>
        <td><button class="btn-table-action" data-id="${item.contratoId}">Detalhar</button></td>
      `;

      const btn = tr.querySelector('.btn-table-action');
      if (btn) {
        btn.addEventListener('click', () => this.abrirModalDetalhes(item.contratoId));
      }

      tbody.appendChild(tr);
    });

    this.atualizarPaginacaoPainelPortfolio(dados.length);
  }

  private atualizarPaginacaoPainelPortfolio(total: number): void {
    const inicio = total === 0 ? 0 : (this.currentPagePainel - 1) * this.itemsPerPagePainel + 1;
    const fim = Math.min(this.currentPagePainel * this.itemsPerPagePainel, total);
    this.setElementText('painelPaginationStart', String(inicio));
    this.setElementText('painelPaginationEnd', String(fim));
    this.setElementText('painelPaginationTotal', String(total));
    this.gerarBotoesPaginacaoPainel(total);
  }

  private atualizarPainelAcoesRenovatorias(dados: PainelAcoesRenovatoriasRow[]): void {
    const tbody = document.getElementById('formalAcoesRenovatoriasBody') as HTMLTableSectionElement | null;
    const resumo = document.getElementById('formalResumo');
    if (!tbody) return;

    tbody.innerHTML = '';

    const inicio = (this.currentPagePainelFormal - 1) * this.itemsPerPagePainelFormal;
    const fim = inicio + this.itemsPerPagePainelFormal;
    const dadosPaginados = dados.slice(inicio, fim);

    dadosPaginados.forEach((item) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${item.codigoSijur}</td>
        <td>${item.contratoSap}</td>
        <td>${item.contratoSiclg}</td>
        <td>${item.protocoloFormalSiclg}</td>
        <td>${item.unidade}</td>
        <td>${item.vigenciaSiclg}</td>
        <td><span class="${this.obterBadgePainelFormal(item.situacaoSiclg, 'siclg')}">${item.situacaoSiclg}</span></td>
        <td>${item.numeroProcessoSiclg}</td>
        <td><span class="${this.obterBadgePainelFormal(item.situacaoSijur, 'sijur')}">${item.situacaoSijur}</span></td>
        <td><span class="${this.obterBadgePainelFormal(item.situacaoCefor, 'cefor')}">${item.situacaoCefor}</span></td>
        <td><button class="btn-table-action" data-formal-id="${item.contratoId}">Detalhar</button></td>
      `;

      const button = tr.querySelector('[data-formal-id]');
      if (button) {
        button.addEventListener('click', () => this.abrirModalDetalhesFormal(item.contratoId));
      }

      tbody.appendChild(tr);
    });

    if (resumo) {
      const total = dados.length;
      const janelaCritica = dados.filter((item) => item.situacaoSiclg === 'Renovação com vencimento iminente' || item.situacaoSiclg === 'Vigência expirada').length;
      const analiseDijur = dados.filter((item) => item.situacaoSijur === 'Em análise DIJUR' || item.situacaoSijur === 'Minuta/peça em elaboração').length;
      const radarAcionado = dados.filter((item) => item.radarSucot === 'Acionado').length;
      resumo.textContent = `${total} registro(s) no A-III • ${janelaCritica} em janela crítica • ${analiseDijur} com tratamento DIJUR • ${radarAcionado} com radar SUCOT acionado`;
    }

    this.atualizarPaginacaoPainelFormal(dados.length);
  }

  private atualizarPaginacaoPainelFormal(total: number): void {
    const inicio = total === 0 ? 0 : (this.currentPagePainelFormal - 1) * this.itemsPerPagePainelFormal + 1;
    const fim = Math.min(this.currentPagePainelFormal * this.itemsPerPagePainelFormal, total);
    this.setElementText('formalPaginationStart', String(inicio));
    this.setElementText('formalPaginationEnd', String(fim));
    this.setElementText('formalPaginationTotal', String(total));
    this.gerarBotoesPaginacaoPainelFormal(total);
  }

  private calcularDiasParaVencimentoAviso(item: PainelAvisoVencimentoRow): number | null {
    if (!item.fimVigenciaDate) return null;
    const hoje = new Date();
    const hojeBase = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimBase = new Date(item.fimVigenciaDate.getFullYear(), item.fimVigenciaDate.getMonth(), item.fimVigenciaDate.getDate());
    return Math.ceil((fimBase.getTime() - hojeBase.getTime()) / (1000 * 60 * 60 * 24));
  }

  private classificarJanelaAviso(item: PainelAvisoVencimentoRow): string {
    const dias = this.calcularDiasParaVencimentoAviso(item);
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

  private obterRotuloJanelaAviso(item: PainelAvisoVencimentoRow): string {
    const janela = this.classificarJanelaAviso(item);
    const mapa: Record<string, string> = {
      'mais_1_ano': '+1 ano',
      '1_ano': '1 ano',
      '6_meses': '6 meses',
      '3_meses': '3 meses',
      '2_meses': '2 meses',
      '1_mes': '1 mês',
      'menor_1_mes': 'Menor que 1 mês',
      'vencido': 'Vencido'
    };
    return mapa[janela] || '1 ano';
  }

  private obterClasseJanelaAviso(item: PainelAvisoVencimentoRow): string {
    const janela = this.classificarJanelaAviso(item);
    const mapa: Record<string, string> = {
      'mais_1_ano': 'badge badge-info',
      '1_ano': 'badge badge-info',
      '6_meses': 'badge badge-info',
      '3_meses': 'badge badge-warning',
      '2_meses': 'badge badge-warning',
      '1_mes': 'badge badge-danger',
      'menor_1_mes': 'badge badge-danger',
      'vencido': 'badge badge-neutral'
    };
    return mapa[janela] || 'badge badge-info';
  }

  private formatarContagemJanelaAviso(item: PainelAvisoVencimentoRow): string {
    const dias = this.calcularDiasParaVencimentoAviso(item);
    if (dias === null) return '-';
    if (dias <= 0) return `D+${Math.abs(dias)}`;
    return `D-${dias}`;
  }

  private ehJanelaDecisaoAviso(janela: string): boolean {
    return janela === 'mais_1_ano' || janela === '1_ano' || janela === '6_meses' || janela === '3_meses' || janela === '2_meses' || janela === '1_mes';
  }

  private aplicarEstadoComposicaoJanelaDecisao(): void {
    const detalhe = document.getElementById('avisoKpiCriticosDetalhe');
    const gatilho = document.getElementById('avisoKpiCriticos');
    if (detalhe) {
      detalhe.hidden = false;
      detalhe.classList.toggle('is-open', this.avisoKpiComposicaoExpandida);
    }
    if (gatilho) {
      gatilho.setAttribute('aria-expanded', String(this.avisoKpiComposicaoExpandida));
    }
  }

  private alternarComposicaoJanelaDecisao(): void {
    this.avisoKpiComposicaoExpandida = !this.avisoKpiComposicaoExpandida;
    this.aplicarEstadoComposicaoJanelaDecisao();
  }

  private aplicarEstadoComposicaoRiscoAr87(): void {
    const detalhe = document.getElementById('avisoKpiRiscoAr87Detalhe');
    const gatilho = document.getElementById('avisoKpiRiscoAr87');
    if (detalhe) {
      detalhe.hidden = false;
      detalhe.classList.toggle('is-open', this.avisoKpiRiscoAr87ComposicaoExpandida);
    }
    if (gatilho) {
      gatilho.setAttribute('aria-expanded', String(this.avisoKpiRiscoAr87ComposicaoExpandida));
    }
  }

  private alternarComposicaoRiscoAr87(): void {
    this.avisoKpiRiscoAr87ComposicaoExpandida = !this.avisoKpiRiscoAr87ComposicaoExpandida;
    this.aplicarEstadoComposicaoRiscoAr87();
  }

  private atualizarPainelAvisoVencimento(dados: PainelAvisoVencimentoRow[]): void {
    const tbody = document.getElementById('avisoVencimentoBody') as HTMLTableSectionElement | null;
    const resumo = document.getElementById('avisoResumo');
    if (!tbody) return;

    tbody.innerHTML = '';

    const inicio = (this.currentPagePainelAviso - 1) * this.itemsPerPagePainelAviso;
    const fim = inicio + this.itemsPerPagePainelAviso;
    const dadosPaginados = dados.slice(inicio, fim);

    dadosPaginados.forEach((item) => {
      this.sincronizarSituacaoLaudoAvaliacao(item);
      this.sincronizarDecisaoAcaoRenovatoria(item);
      const tr = document.createElement('tr');
      const faixaSinalizacao = this.classificarFaixaSinalizacaoAviso(item);
      const dadosInsuficientes = faixaSinalizacao === 'dados_insuficientes';
      const situacaoClass = this.obterClasseStatusAviso(item.situacaoSiclg);
      const statusBadgeAtivo = this.avisoStatusBadgeFiltroAtivo === item.situacaoSiclg;
      const tituloStatusBadge = statusBadgeAtivo
        ? 'Filtro ativo: clique para remover'
        : 'Clique para filtrar por este status';
      const opcaoADecidir = item.decisaoProrrogar === 'a_decidir' ? 'selected' : '';
      const opcaoProrrogar = item.decisaoProrrogar === 'prorrogar' ? 'selected' : '';
      const opcaoNaoProrrogar = item.decisaoProrrogar === 'nao_prorrogar' ? 'selected' : '';
      const opcaoArADecidir = item.decisaoAcaoRenovatoria === 'a_decidir' ? 'selected' : '';
      const opcaoArIngressar = item.decisaoAcaoRenovatoria === 'ingressar' ? 'selected' : '';
      const opcaoArNaoIngressar = item.decisaoAcaoRenovatoria === 'nao_ingressar' ? 'selected' : '';
      const decisaoTravada = !!item.protocoloFormal;
      const seletorDesabilitado = decisaoTravada ? 'disabled' : '';
      const seletorTitulo = decisaoTravada ? 'title="Decisão bloqueada após solicitação de Ato Formal"' : '';
      const podeADecidirProrrogacao = this.podeManterADecidirProrrogacao(item);
      const opcoesProrrogacao = podeADecidirProrrogacao
        ? `
            <option value="a_decidir" ${opcaoADecidir}>A decidir</option>
            <option value="prorrogar" ${opcaoProrrogar}>Prorrogar</option>
            <option value="nao_prorrogar" ${opcaoNaoProrrogar}>Não prorrogar</option>
          `
        : `
            <option value="prorrogar" ${opcaoProrrogar}>Prorrogar</option>
            <option value="nao_prorrogar" ${opcaoNaoProrrogar}>Não prorrogar</option>
          `;
      const podeDecidirAr = this.estaNaJanelaLegalAcaoRenovatoria(item);
      const podeDecidirArComSeguranca = this.estaNaJanelaPrudenteGestorAr(item);
      const alertaAr87 = this.estaEmRiscoAr87(item);
      const prazoDecadencialEncerrado = this.estaAposPrazoDecadencialAr(item);
      const decisaoArTitulo = !podeDecidirAr
        ? (prazoDecadencialEncerrado
          ? 'title="Prazo legal encerrado para ingresso da ação renovatória"'
          : 'title="Fora da janela legal da AR (12-6 meses): decisão indisponível no momento."')
        : '';
      const seletorArDesabilitado = !podeDecidirAr ? 'disabled' : '';
      const opcaoIngressarMarkup = (podeDecidirAr && podeDecidirArComSeguranca)
        ? `<option value="ingressar" ${opcaoArIngressar}>Ingressar</option>`
        : '';
      const opcoesAr = podeDecidirAr
        ? `
            <option value="a_decidir" ${opcaoArADecidir}>A decidir</option>
            ${opcaoIngressarMarkup}
            <option value="nao_ingressar" ${opcaoArNaoIngressar}>Não ingressar</option>
          `
        : (prazoDecadencialEncerrado
          ? '<option value="nao_ingressar" selected>Não ingressar</option>'
          : '<option value="a_decidir" selected>A decidir</option>');
      const legendaAr = podeDecidirArComSeguranca
        ? 'Janela prudente do gestor ativa (12-7 meses)'
        : (podeDecidirAr
          ? 'Janela legal da AR ativa (12-6), mas fora da janela operacional do gestor (12-7); escalar Gestao Formal/Juridico'
          : (prazoDecadencialEncerrado
            ? 'Prazo legal de ingresso encerrado; decisão travada em Não ingressar.'
            : 'Antes da janela legal da AR (12-6 meses); decisão ainda indisponível.'));
      const legendaArCompleta = alertaAr87
        ? `${legendaAr}. Alerta: contrato na faixa 8-7 meses com pendencia simultanea de prorrogacao e AR.`
        : legendaAr;
      const legendaArClass = podeDecidirAr ? 'aviso-ar-hint is-open' : 'aviso-ar-hint is-closed';
      const exigeLaudo = this.exigeLaudoAvaliacao(item);
      const exibirPerguntaLaudo = exigeLaudo;
      const opcaoLaudoNaoSolicitado = item.situacaoLaudoAvaliacao === 'nao_solicitado' ? 'selected' : '';
      const opcaoLaudoSolicitado = item.situacaoLaudoAvaliacao === 'solicitado' ? 'selected' : '';
      const opcaoLaudoEntregue = item.situacaoLaudoAvaliacao === 'entregue' ? 'selected' : '';
      const exibirInputRequisicaoLaudo = exibirPerguntaLaudo && item.situacaoLaudoAvaliacao === 'solicitado';
      const exibirInputDataRequisicaoLaudo = exibirPerguntaLaudo && item.situacaoLaudoAvaliacao === 'solicitado';
      const exibirInputDataLaudo = exibirPerguntaLaudo && item.situacaoLaudoAvaliacao === 'entregue';
      const exibirBotaoPrazoFormal = exibirPerguntaLaudo && item.situacaoLaudoAvaliacao === 'solicitado';
      const exibirBotaoEntregaLaudo = exibirPerguntaLaudo && item.situacaoLaudoAvaliacao === 'solicitado';
      const partesDetalhamentoSolicitacao: string[] = [];
      if (item.laudoRequisicaoNumero) {
        partesDetalhamentoSolicitacao.push(`Protocolo: ${item.laudoRequisicaoNumero}`);
      }
      if (item.laudoRequisicaoData) {
        partesDetalhamentoSolicitacao.push(`Data da solicitação: ${item.laudoRequisicaoData}`);
      }
      const detalhamentoSolicitacao = partesDetalhamentoSolicitacao.join(' | ');
      const resumoSlaLaudo = this.obterResumoSlaLaudo(item);
      const validadeLaudo = item.laudoValidoAte ? `Validade do laudo ate ${item.laudoValidoAte}.` : '';
      const alertaValidadeLaudo = this.obterAlertaValidadeLaudo(item);
      const laudoRequisicaoAtual = item.laudoRequisicaoNumero || '';
      const laudoDataRequisicaoInput = this.formatarDataParaInputDate(item.laudoRequisicaoData);
      const laudoDataEmissaoInput = this.formatarDataParaInputDate(item.laudoDataEmissao);
      const dataAtualInput = new Date().toISOString().slice(0, 10);
      const contextoFaixa = faixaSinalizacao === 'faixa_14_12'
        ? 'Faixa de preparacao ativa (14-12 meses).'
        : '';
      const blocoLaudo = exibirPerguntaLaudo
        ? `
            <div class="aviso-laudo-bloco">
              <label class="aviso-laudo-label" for="avisoLaudo-${item.contratoId}">Laudo de avaliação (locação):</label>
              <select id="avisoLaudo-${item.contratoId}" class="filter-select aviso-laudo-select" data-aviso-laudo-id="${item.contratoId}">
                <option value="nao_solicitado" ${opcaoLaudoNaoSolicitado}>Não solicitado</option>
                <option value="solicitado" ${opcaoLaudoSolicitado}>Solicitado</option>
                <option value="entregue" ${opcaoLaudoEntregue}>Entregue (válido)</option>
              </select>
              ${exibirInputRequisicaoLaudo
                ? `<input type="text" class="filter-search" data-aviso-laudo-requisicao-id="${item.contratoId}" placeholder="Protocolo da solicitação (opcional)" title="Formato: 5 a 30 caracteres, com letras/números e separadores / - ." maxlength="30" value="${laudoRequisicaoAtual}">`
                : ''}
              ${exibirInputDataRequisicaoLaudo
                ? `<input type="date" class="filter-date" data-aviso-laudo-requisicao-data-id="${item.contratoId}" value="${laudoDataRequisicaoInput}" max="${dataAtualInput}" title="Data da solicitação do laudo (não pode ser futura)">`
                : ''}
              ${exibirInputDataLaudo
                ? `<input type="date" class="filter-date" data-aviso-laudo-data-emissao-id="${item.contratoId}" value="${laudoDataEmissaoInput}" max="${dataAtualInput}" title="Data do laudo (obrigatória em Entregue e não pode ser futura)">`
                : ''}
              <small class="aviso-ar-hint is-closed">Validade máxima de 12 meses e deve cobrir toda a negociação. ${contextoFaixa}</small>
              ${detalhamentoSolicitacao ? `<small class="aviso-ar-hint is-closed">${detalhamentoSolicitacao}</small>` : ''}
              ${resumoSlaLaudo ? `<small class="aviso-ar-hint is-closed">${resumoSlaLaudo}</small>` : ''}
              ${validadeLaudo ? `<small class="aviso-ar-hint is-open">${validadeLaudo}</small>` : ''}
              ${alertaValidadeLaudo ? `<small class="aviso-ar-hint is-closed">${alertaValidadeLaudo}</small>` : ''}
              ${exibirBotaoPrazoFormal ? `<button class="btn-clear" type="button" data-aviso-prazo-formal-laudo-id="${item.contratoId}">Registrar prazo formal</button>` : ''}
              ${exibirBotaoEntregaLaudo ? `<button class="btn-clear" type="button" data-aviso-entregar-laudo-id="${item.contratoId}">Registrar entrega do laudo</button>` : ''}
            </div>
          `
        : '';
      const podeContratacao = this.podeSolicitarContratacao(item);
      const decisoesConcluidasAtoFormal = item.decisaoProrrogar !== 'a_decidir' && item.decisaoAcaoRenovatoria !== 'a_decidir';
      const mostrarSolicitacaoAtoFormal = item.decisaoProrrogar === 'prorrogar' && decisoesConcluidasAtoFormal && !item.protocoloFormal;
      const protocoloContratacaoMarkup = item.protocoloContratacao
        ? `<span class="badge badge-info">${item.protocoloContratacao}</span>`
        : (podeContratacao ? `<button class="btn-clear" type="button" data-aviso-solicitar-contratacao-id="${item.contratoId}">Solicitar contratação</button>` : '<span class="aviso-protocolo-vazio">-</span>');
      const protocoloFormalMarkup = item.protocoloFormal
        ? `<span class="badge badge-info">${item.protocoloFormal}</span>`
        : (mostrarSolicitacaoAtoFormal ? `<button class="btn-clear" type="button" data-aviso-solicitar-id="${item.contratoId}">Solicitar ato formal</button>` : '<span class="aviso-protocolo-vazio">-</span>');

      tr.innerHTML = `
        <td>${item.contratoSap}</td>
        <td>${item.fimVigencia}</td>
        <td>
          <select class="filter-select aviso-decisao-select" data-aviso-decisao-id="${item.contratoId}" ${seletorDesabilitado} ${seletorTitulo} ${dadosInsuficientes ? 'disabled' : ''}>
            ${opcoesProrrogacao}
          </select>
        </td>
        <td>
          <select class="filter-select aviso-decisao-select" data-aviso-decisao-ar-id="${item.contratoId}" ${decisaoArTitulo} ${seletorArDesabilitado} ${dadosInsuficientes ? 'disabled' : ''}>
            ${opcoesAr}
          </select>
          <small class="${legendaArClass}">${legendaArCompleta}</small>
        </td>
        <td><span class="${situacaoClass} aviso-status-badge ${statusBadgeAtivo ? 'is-active' : ''}" data-aviso-status-filter="${item.situacaoSiclg}" data-filter-tag="${statusBadgeAtivo ? 'ativo' : 'filtrar'}" role="button" tabindex="0" aria-pressed="${statusBadgeAtivo ? 'true' : 'false'}" aria-label="${tituloStatusBadge}" title="${tituloStatusBadge}">${item.situacaoSiclg}</span></td>
        <td class="aviso-protocolo-cell">${protocoloContratacaoMarkup}</td>
        <td class="aviso-protocolo-cell">${protocoloFormalMarkup}</td>
        <td>
          <div class="aviso-acoes-coluna">
            ${blocoLaudo}
            <button class="btn-table-action" data-formal-aviso-id="${item.contratoId}">Detalhar contrato</button>
            ${dadosInsuficientes ? `<small class="aviso-ar-hint is-closed">Dados insuficientes de vigência: revisar cadastro do contrato.</small>` : ''}
          </div>
        </td>
      `;

      const selectDecisao = tr.querySelector('[data-aviso-decisao-id]') as HTMLSelectElement | null;
      if (selectDecisao) {
        selectDecisao.addEventListener('change', () => {
          const novoValor = selectDecisao.value as 'a_decidir' | 'prorrogar' | 'nao_prorrogar';
          this.atualizarDecisaoPainelAviso(item.contratoId, novoValor);
        });
      }

      const selectDecisaoAr = tr.querySelector('[data-aviso-decisao-ar-id]') as HTMLSelectElement | null;
      if (selectDecisaoAr) {
        selectDecisaoAr.addEventListener('change', () => {
          const novoValor = selectDecisaoAr.value as 'a_decidir' | 'ingressar' | 'nao_ingressar';
          this.atualizarDecisaoAcaoRenovatoriaPainelAviso(item.contratoId, novoValor);
        });
      }

      const btnSolicitar = tr.querySelector('[data-aviso-solicitar-id]') as HTMLButtonElement | null;
      if (btnSolicitar) {
        btnSolicitar.addEventListener('click', () => this.solicitarProrrogacaoFormal(item.contratoId));
      }

      const badgeStatus = tr.querySelector('[data-aviso-status-filter]') as HTMLElement | null;
      if (badgeStatus) {
        const alternarFiltroStatus = () => {
          const statusSelecionado = badgeStatus.getAttribute('data-aviso-status-filter') || '';
          this.avisoStatusBadgeFiltroAtivo = this.avisoStatusBadgeFiltroAtivo === statusSelecionado ? '' : statusSelecionado;

          const selectSituacao = document.getElementById('avisoSituacaoSiclgFiltro') as HTMLSelectElement | null;
          if (selectSituacao) {
            if (!this.avisoStatusBadgeFiltroAtivo) {
              selectSituacao.value = '';
            } else if (Array.from(selectSituacao.options).some((opt) => opt.value === this.avisoStatusBadgeFiltroAtivo)) {
              selectSituacao.value = this.avisoStatusBadgeFiltroAtivo;
            }
          }

          this.aplicarFiltrosPainelAvisoVencimento();
        };

        badgeStatus.addEventListener('click', () => {
          alternarFiltroStatus();
        });

        badgeStatus.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            alternarFiltroStatus();
          }
        });
      }

      const btnSolicitarContratacao = tr.querySelector('[data-aviso-solicitar-contratacao-id]') as HTMLButtonElement | null;
      if (btnSolicitarContratacao) {
        btnSolicitarContratacao.addEventListener('click', () => this.solicitarContratacaoCecot(item.contratoId));
      }

      const selectLaudo = tr.querySelector('[data-aviso-laudo-id]') as HTMLSelectElement | null;
      const inputRequisicaoLaudo = tr.querySelector('[data-aviso-laudo-requisicao-id]') as HTMLInputElement | null;
      const inputDataRequisicaoLaudo = tr.querySelector('[data-aviso-laudo-requisicao-data-id]') as HTMLInputElement | null;
      if (inputRequisicaoLaudo) {
        inputRequisicaoLaudo.addEventListener('input', () => {
          const atual = inputRequisicaoLaudo.value;
          const sanitizado = this.sanitizarNumeroLaudoInput(atual);
          if (sanitizado !== atual) {
            inputRequisicaoLaudo.value = sanitizado;
          }
        });

        inputRequisicaoLaudo.addEventListener('change', () => {
          this.atualizarSituacaoLaudoPainelAviso(item.contratoId, 'solicitado', {
            laudoRequisicaoNumero: inputRequisicaoLaudo.value || '',
            laudoRequisicaoData: inputDataRequisicaoLaudo?.value || ''
          });
        });
      }

      if (inputDataRequisicaoLaudo) {
        inputDataRequisicaoLaudo.addEventListener('change', () => {
          this.atualizarSituacaoLaudoPainelAviso(item.contratoId, 'solicitado', {
            laudoRequisicaoNumero: inputRequisicaoLaudo?.value || '',
            laudoRequisicaoData: inputDataRequisicaoLaudo.value || ''
          });
        });
      }
      if (selectLaudo) {
        selectLaudo.addEventListener('change', () => {
          const novoValor = selectLaudo.value as PainelAvisoVencimentoRow['situacaoLaudoAvaliacao'];
          const inputRequisicao = tr.querySelector('[data-aviso-laudo-requisicao-id]') as HTMLInputElement | null;
          const inputDataRequisicao = tr.querySelector('[data-aviso-laudo-requisicao-data-id]') as HTMLInputElement | null;
          const inputDataEmissao = tr.querySelector('[data-aviso-laudo-data-emissao-id]') as HTMLInputElement | null;
          this.atualizarSituacaoLaudoPainelAviso(item.contratoId, novoValor, {
            laudoRequisicaoNumero: inputRequisicao?.value || '',
            laudoRequisicaoData: inputDataRequisicao?.value || '',
            laudoDataEmissao: inputDataEmissao?.value || ''
          });
        });
      }

      const btnPrazoFormalLaudo = tr.querySelector('[data-aviso-prazo-formal-laudo-id]') as HTMLButtonElement | null;
      if (btnPrazoFormalLaudo) {
        btnPrazoFormalLaudo.addEventListener('click', () => this.registrarPrazoFormalLaudo(item.contratoId));
      }

      const btnEntregarLaudo = tr.querySelector('[data-aviso-entregar-laudo-id]') as HTMLButtonElement | null;
      if (btnEntregarLaudo) {
        btnEntregarLaudo.addEventListener('click', () => {
          const inputDataEmissao = tr.querySelector('[data-aviso-laudo-data-emissao-id]') as HTMLInputElement | null;
          this.atualizarSituacaoLaudoPainelAviso(item.contratoId, 'entregue', {
            laudoDataEmissao: inputDataEmissao?.value || ''
          });
        });
      }

      const button = tr.querySelector('[data-formal-aviso-id]');
      if (button) {
        button.addEventListener('click', () => this.abrirModalDetalhesPorAviso(item));
      }

      tbody.appendChild(tr);
    });

    if (resumo) {
      const total = dados.length;
      const vencidos = dados.filter((item) => this.classificarJanelaAviso(item) === 'vencido').length;
      const prorrogar = dados.filter((item) => item.decisaoProrrogar === 'prorrogar' && this.classificarJanelaAviso(item) !== 'vencido').length;

      const baseJanelaDecisao = dados.filter((item) => item.decisaoProrrogar !== 'prorrogar' && this.classificarJanelaAviso(item) !== 'vencido');
      const totaisPorJanela = {
        'mais_1_ano': 0,
        '1_ano': 0,
        '6_meses': 0,
        '3_meses': 0,
        '2_meses': 0,
        '1_mes': 0
      } as Record<string, number>;

      baseJanelaDecisao.forEach((item) => {
        const janela = this.classificarJanelaAviso(item);
        if (janela === 'mais_1_ano') totaisPorJanela['mais_1_ano'] += 1;
        else if (janela === '1_ano') totaisPorJanela['1_ano'] += 1;
        else if (janela === '6_meses') totaisPorJanela['6_meses'] += 1;
        else if (janela === '3_meses') totaisPorJanela['3_meses'] += 1;
        else if (janela === '2_meses') totaisPorJanela['2_meses'] += 1;
        else if (janela === '1_mes' || janela === 'menor_1_mes') totaisPorJanela['1_mes'] += 1;
      });

      const janelaDecisao = baseJanelaDecisao.length;

      const faixa1412 = dados.filter((item) => this.classificarFaixaSinalizacaoAviso(item) === 'faixa_14_12').length;
      const faixa127 = dados.filter((item) => this.classificarFaixaSinalizacaoAviso(item) === 'faixa_12_7').length;
      const faixaMenor6 = dados.filter((item) => this.classificarFaixaSinalizacaoAviso(item) === 'faixa_menor_6').length;
      const baseFaixaAr87 = dados.filter((item) => this.estaNaFaixaAlertaAr87(item));
      const pendenciaProrrogacaoAr87 = baseFaixaAr87.filter((item) => item.decisaoProrrogar === 'a_decidir' && item.decisaoAcaoRenovatoria !== 'a_decidir').length;
      const pendenciaArAr87 = baseFaixaAr87.filter((item) => item.decisaoProrrogar !== 'a_decidir' && item.decisaoAcaoRenovatoria === 'a_decidir').length;
      const alertaAr87 = baseFaixaAr87.filter((item) => this.estaEmRiscoAr87(item)).length;
      const totalRiscoAr87 = pendenciaProrrogacaoAr87 + pendenciaArAr87 + alertaAr87;
      const dadosInsuficientes = dados.filter((item) => this.possuiDadosVigenciaInsuficientes(item)).length;
      resumo.innerHTML = `
        <details class="aviso-regras-box">
          <summary>Regras de negocio aplicadas neste painel</summary>
          <ul>
            <li>Classificacao por janela de vencimento (D+ e D-): Vencido (D+), Menor que 1 mes (D-1 a D-29), 1 mes (D-30), 2 meses (D-31 a D-60), 3 meses (D-61 a D-90), 6 meses (D-91 a D-180), 1 ano (D-181 a D-365) e +1 ano (acima de D-365).</li>
            <li>KPIs com fechamento: Registros no aviso = Com decisao de prorrogar + Janela de decisao + Vencidos em prazo indeterminado.</li>
            <li>Fluxo decisorio por prazo: prorrogacao e acao renovatoria podem ser decididas em momentos distintos, com monitoramento continuo das janelas 14-12, 12-7 e abaixo de 7 meses.</li>
            <li>Decisao de prorrogar: status "a decidir" somente entre 14 meses e 12 meses antes do fim da vigencia; com 12 meses ou menos a decisao deve ser "prorrogar" ou "nao prorrogar".</li>
            <li>Preparacao (14-12 meses): na modalidade locacao o sistema pergunta se ja existe laudo de avaliacao valido; se nao houver, orienta solicitar a area responsavel.</li>
            <li>Laudo de avaliacao (somente locacao): validade legal de ate 12 meses da emissao e obrigacao de permanecer valido ate o encerramento da negociacao com o locador.</li>
            <li>Estados de controle do laudo: nao solicitado, solicitado (com requisicao e data), entregue (dentro da validade) e vencido.</li>
            <li>SLA padrao do laudo: 30 dias apos solicitacao com documentacao completa e acesso liberado ao imovel.</li>
            <li>Em caso de complexidade elevada ou volume expressivo, o gestor registra prazo formal informado pela area responsavel.</li>
            <li>Novo laudo pode ser solicitado antes de 12 meses quando houver variacao de mercado na regiao que impacte a negociacao.</li>
            <li>KPI "Janela de decisao": contratos sem decisao de prorrogar e nao vencidos, distribuidos entre +1 ano, 1 ano, 6 meses, 3 meses, 2 meses e 1 mes (inclui menor que 1 mes).</li>
            <li>Acao renovatoria: janela legal para ingresso entre 12 e 6 meses antes do fim da vigencia.</li>
            <li>Janela AR (12-7 meses): recorte operacional para decisao direta do gestor; entre 7 e 6 meses, manter escalonamento para Gestao Formal/Juridico.</li>
            <li>Prazo decadencial: contagem por ano e mes civil (Art. 132 do Codigo Civil), com limite final no marco de 6 meses retroativos.</li>
            <li>Alerta automatico AR (8-7 meses): ${totalRiscoAr87} contrato(s) com pendencia de prorrogacao e/ou AR; ${alertaAr87} em risco real por dupla pendencia.</li>
            <li>Qualidade de dados: ${dadosInsuficientes} contrato(s) com dados insuficientes de vigencia para decisao (acoes bloqueadas ate saneamento).</li>
            <li>Decisao de prorrogar fica bloqueada quando existe protocolo formal, preservando o fluxo formal ja iniciado.</li>
            <li>Solicitacao de Ato Formal so aparece quando a decisao estiver em "Prorrogar" e ainda nao houver protocolo formal.</li>
          </ul>
        </details>
      `;

      this.setElementText('avisoKpiTotal', String(total));
      this.setElementText('avisoKpiProrrogar', String(prorrogar));
      this.setElementText('avisoKpiCriticos', String(janelaDecisao));
      this.setElementText('avisoKpiVencidos', String(vencidos));
      this.setElementText('avisoKpiRiscoAr87', String(totalRiscoAr87));
      this.setElementText('avisoFaixa1412', String(faixa1412));
      this.setElementText('avisoFaixa126', String(faixa127));
      this.setElementText('avisoFaixaMenor6', String(faixaMenor6));

      const gatilhoComposicao = document.getElementById('avisoKpiCriticos');
      if (gatilhoComposicao && gatilhoComposicao.dataset.bound !== 'true') {
        gatilhoComposicao.dataset.bound = 'true';
        gatilhoComposicao.addEventListener('click', () => this.alternarComposicaoJanelaDecisao());
        gatilhoComposicao.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.alternarComposicaoJanelaDecisao();
          }
        });
      }

      const detalheJanelaDecisao = document.getElementById('avisoKpiCriticosDetalhe');
      if (detalheJanelaDecisao) {
        detalheJanelaDecisao.innerHTML = `
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${totaisPorJanela['mais_1_ano']}</span><span class="aviso-kpi-chip-label">+1 ano</span></span>
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${totaisPorJanela['1_ano']}</span><span class="aviso-kpi-chip-label">1 ano</span></span>
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${totaisPorJanela['6_meses']}</span><span class="aviso-kpi-chip-label">6 meses</span></span>
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${totaisPorJanela['3_meses']}</span><span class="aviso-kpi-chip-label">3 meses</span></span>
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${totaisPorJanela['2_meses']}</span><span class="aviso-kpi-chip-label">2 meses</span></span>
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${totaisPorJanela['1_mes']}</span><span class="aviso-kpi-chip-label">1 mes</span></span>
        `;
      }

      const detalheRiscoAr87 = document.getElementById('avisoKpiRiscoAr87Detalhe');
      if (detalheRiscoAr87) {
        detalheRiscoAr87.innerHTML = `
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${pendenciaProrrogacaoAr87}</span><span class="aviso-kpi-chip-label">Prorrogacao pendente</span></span>
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${pendenciaArAr87}</span><span class="aviso-kpi-chip-label">AR pendente</span></span>
          <span class="aviso-kpi-chip"><span class="aviso-kpi-chip-value">${alertaAr87}</span><span class="aviso-kpi-chip-label">Risco real (dupla pendencia)</span></span>
        `;
      }

      this.aplicarEstadoComposicaoJanelaDecisao();
      this.aplicarEstadoComposicaoRiscoAr87();
    }

    this.atualizarPaginacaoPainelAviso(dados.length);
  }

  private atualizarPaginacaoPainelAviso(total: number): void {
    const inicio = total === 0 ? 0 : (this.currentPagePainelAviso - 1) * this.itemsPerPagePainelAviso + 1;
    const fim = Math.min(this.currentPagePainelAviso * this.itemsPerPagePainelAviso, total);
    this.setElementText('avisoPaginationStart', String(inicio));
    this.setElementText('avisoPaginationEnd', String(fim));
    this.setElementText('avisoPaginationTotal', String(total));
    this.gerarBotoesPaginacaoPainelAviso(total);
  }

  private abrirModalDetalhesFormal(contratoId: string): void {
    const registro = this.painelAcoesRenovatorias.find((item) => item.contratoId === contratoId);
    const modal = document.getElementById('modalDetalhesFormal');
    if (!registro || !modal) return;

    this.setElementText('formalDetCodigoSijur', registro.codigoSijur);
    this.setElementText('formalDetContratoSap', registro.contratoSap);
    this.setElementText('formalDetContratoSiclg', registro.contratoSiclg);
    this.setElementText('formalDetProtocolo', registro.protocoloFormalSiclg);
    this.setElementText('formalDetProcesso', registro.numeroProcessoSiclg);
    this.setElementText('formalDetUnidade', registro.unidade);
    this.setElementText('formalDetVigencia', registro.vigenciaSiclg);
    this.setElementText('formalDetOrigemDados', registro.origemDados);
    this.setBadgeText('formalDetSituacaoSiclg', registro.situacaoSiclg, this.obterBadgePainelFormal(registro.situacaoSiclg, 'siclg'));
    this.setBadgeText('formalDetSituacaoSijur', registro.situacaoSijur, this.obterBadgePainelFormal(registro.situacaoSijur, 'sijur'));
    this.setBadgeText('formalDetSituacaoCefor', registro.situacaoCefor, this.obterBadgePainelFormal(registro.situacaoCefor, 'cefor'));
    this.setElementText('formalDetNumeroProcessoDijur', registro.numeroProcessoDijur);
    this.setElementText('formalDetDataEntradaDijur', registro.dataEntradaDijur);
    this.setElementText('formalDetLastSyncAt', registro.lastSyncAt);
    this.setElementText('formalDetPartesDijur', registro.partesDijur);
    this.setElementText('formalDetStatusOperacional', registro.statusOperacional);
    this.setInputValue('formalEditRadarSucot', registro.radarSucot);
    this.setTextAreaValue('formalEditNotas', registro.notas);
    modal.setAttribute('data-contrato-id', registro.contratoId);

    modal.classList.add('active');
  }

  private fecharModalDetalhesFormal(): void {
    const modal = document.getElementById('modalDetalhesFormal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  private setBadgeText(id: string, value: string, className: string): void {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
    element.className = className;
  }

  private setTextAreaValue(id: string, value: string): void {
    const element = document.getElementById(id) as HTMLTextAreaElement | null;
    if (element) element.value = value || '';
  }

  private salvarEdicaoModalFormal(): void {
    const modal = document.getElementById('modalDetalhesFormal');
    const contratoId = modal?.getAttribute('data-contrato-id');
    const radarSucot = (document.getElementById('formalEditRadarSucot') as HTMLSelectElement | null)?.value || 'Não acionado';
    const notas = (document.getElementById('formalEditNotas') as HTMLTextAreaElement | null)?.value.trim() || '';
    if (!contratoId) return;

    const row = this.painelAcoesRenovatorias.find((item) => item.contratoId === contratoId);
    if (!row) return;

    row.radarSucot = radarSucot;
    row.notas = notas;

    const edicoes = this.carregarEdicoesPainelFormal();
    edicoes[contratoId] = { radarSucot, notas };
    this.salvarEdicoesPainelFormal(edicoes);

    this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
    this.showToast('Radar SUCOT e notas do Gestor Formal salvos.');
  }

  private gerarBotoesPaginacaoPainelFormal(total: number): void {
    const controls = document.getElementById('formalPaginationControls');
    if (!controls) return;

    controls.innerHTML = '';

    const totalPaginas = Math.max(1, Math.ceil(total / this.itemsPerPagePainelFormal));
    if (this.currentPagePainelFormal > totalPaginas) this.currentPagePainelFormal = totalPaginas;
    if (totalPaginas <= 1) return;

    const criarBotao = (texto: string, onClick: () => void, disabled = false, active = false): void => {
      const button = document.createElement('button');
      button.textContent = texto;
      button.disabled = disabled;
      if (active) button.classList.add('active');
      button.addEventListener('click', () => {
        if (button.disabled) return;
        onClick();
      });
      controls.appendChild(button);
    };

    if (this.currentPagePainelFormal > 1) {
      criarBotao('← Anterior', () => {
        if (this.currentPagePainelFormal > 1) {
          this.currentPagePainelFormal--;
          this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
        }
      });
    }

    const maxBotoesVisiveis = 7;
    let inicioPagina = Math.max(1, this.currentPagePainelFormal - Math.floor(maxBotoesVisiveis / 2));
    let fimPagina = Math.min(totalPaginas, inicioPagina + maxBotoesVisiveis - 1);

    if (fimPagina - inicioPagina < maxBotoesVisiveis - 1) {
      inicioPagina = Math.max(1, fimPagina - maxBotoesVisiveis + 1);
    }

    if (inicioPagina > 1) {
      criarBotao('1', () => {
        this.currentPagePainelFormal = 1;
        this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
      });

      if (inicioPagina > 2) {
        criarBotao('...', () => undefined, true);
      }
    }

    for (let pagina = inicioPagina; pagina <= fimPagina; pagina++) {
      criarBotao(String(pagina), () => {
        this.currentPagePainelFormal = pagina;
        this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
      }, false, pagina === this.currentPagePainelFormal);
    }

    if (fimPagina < totalPaginas) {
      if (fimPagina < totalPaginas - 1) {
        criarBotao('...', () => undefined, true);
      }

      criarBotao(String(totalPaginas), () => {
        this.currentPagePainelFormal = totalPaginas;
        this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
      });
    }

    if (this.currentPagePainelFormal < totalPaginas) {
      criarBotao('Próximo →', () => {
        if (this.currentPagePainelFormal < totalPaginas) {
          this.currentPagePainelFormal++;
          this.atualizarPainelAcoesRenovatorias(this.painelAcoesRenovatoriasFiltrado);
        }
      });
    }
  }

  private gerarBotoesPaginacaoPainelAviso(total: number): void {
    const controls = document.getElementById('avisoPaginationControls');
    if (!controls) return;

    controls.innerHTML = '';

    const totalPaginas = Math.max(1, Math.ceil(total / this.itemsPerPagePainelAviso));
    if (this.currentPagePainelAviso > totalPaginas) this.currentPagePainelAviso = totalPaginas;
    if (totalPaginas <= 1) return;

    const criarBotao = (texto: string, onClick: () => void, disabled = false, active = false): void => {
      const button = document.createElement('button');
      button.textContent = texto;
      button.disabled = disabled;
      if (active) button.classList.add('active');
      button.addEventListener('click', () => {
        if (button.disabled) return;
        onClick();
      });
      controls.appendChild(button);
    };

    if (this.currentPagePainelAviso > 1) {
      criarBotao('← Anterior', () => {
        if (this.currentPagePainelAviso > 1) {
          this.currentPagePainelAviso--;
          this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
        }
      });
    }

    const maxBotoesVisiveis = 7;
    let inicioPagina = Math.max(1, this.currentPagePainelAviso - Math.floor(maxBotoesVisiveis / 2));
    let fimPagina = Math.min(totalPaginas, inicioPagina + maxBotoesVisiveis - 1);

    if (fimPagina - inicioPagina < maxBotoesVisiveis - 1) {
      inicioPagina = Math.max(1, fimPagina - maxBotoesVisiveis + 1);
    }

    if (inicioPagina > 1) {
      criarBotao('1', () => {
        this.currentPagePainelAviso = 1;
        this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
      });

      if (inicioPagina > 2) {
        criarBotao('...', () => undefined, true);
      }
    }

    for (let pagina = inicioPagina; pagina <= fimPagina; pagina++) {
      criarBotao(String(pagina), () => {
        this.currentPagePainelAviso = pagina;
        this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
      }, false, pagina === this.currentPagePainelAviso);
    }

    if (fimPagina < totalPaginas) {
      if (fimPagina < totalPaginas - 1) {
        criarBotao('...', () => undefined, true);
      }

      criarBotao(String(totalPaginas), () => {
        this.currentPagePainelAviso = totalPaginas;
        this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
      });
    }

    if (this.currentPagePainelAviso < totalPaginas) {
      criarBotao('Próximo →', () => {
        if (this.currentPagePainelAviso < totalPaginas) {
          this.currentPagePainelAviso++;
          this.atualizarPainelAvisoVencimento(this.painelAvisoVencimentoFiltrado);
        }
      });
    }
  }

  private gerarBotoesPaginacaoPainel(total: number): void {
    const controls = document.getElementById('painelPaginationControls');
    if (!controls) return;

    controls.innerHTML = '';

    const totalPaginas = Math.max(1, Math.ceil(total / this.itemsPerPagePainel));
    if (this.currentPagePainel > totalPaginas) this.currentPagePainel = totalPaginas;
    if (totalPaginas <= 1) return;

    const criarBotao = (texto: string, onClick: () => void, disabled = false, active = false): void => {
      const button = document.createElement('button');
      button.textContent = texto;
      button.disabled = disabled;
      if (active) button.classList.add('active');
      button.addEventListener('click', () => {
        if (button.disabled) return;
        onClick();
      });
      controls.appendChild(button);
    };

    if (this.currentPagePainel > 1) {
      criarBotao('← Anterior', () => {
        if (this.currentPagePainel > 1) {
          this.currentPagePainel--;
          this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
        }
      });
    }

    const maxBotoesVisiveis = 7;
    let inicioPagina = Math.max(1, this.currentPagePainel - Math.floor(maxBotoesVisiveis / 2));
    let fimPagina = Math.min(totalPaginas, inicioPagina + maxBotoesVisiveis - 1);

    if (fimPagina - inicioPagina < maxBotoesVisiveis - 1) {
      inicioPagina = Math.max(1, fimPagina - maxBotoesVisiveis + 1);
    }

    if (inicioPagina > 1) {
      criarBotao('1', () => {
        this.currentPagePainel = 1;
        this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
      });

      if (inicioPagina > 2) {
        criarBotao('...', () => undefined, true);
      }
    }

    for (let pagina = inicioPagina; pagina <= fimPagina; pagina++) {
      criarBotao(String(pagina), () => {
        this.currentPagePainel = pagina;
        this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
      }, false, pagina === this.currentPagePainel);
    }

    if (fimPagina < totalPaginas) {
      if (fimPagina < totalPaginas - 1) {
        criarBotao('...', () => undefined, true);
      }

      criarBotao(String(totalPaginas), () => {
        this.currentPagePainel = totalPaginas;
        this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
      });
    }

    if (this.currentPagePainel < totalPaginas) {
      criarBotao('Próximo →', () => {
        if (this.currentPagePainel < totalPaginas) {
          this.currentPagePainel++;
          this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
        }
      });
    }
  }

  private configurarNavegacaoRotas(): void {
    const routeButtons = Array.from(document.querySelectorAll('[data-route]')) as HTMLElement[];
    routeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const route = button.getAttribute('data-route');
        if (!route) return;
        this.navegarPara(route);
      });
    });
  }

  private configurarAbasPerfilOperacional(): void {
    const tabs = Array.from(document.querySelectorAll('#perfilOperacionalPage [data-fase-target]')) as HTMLButtonElement[];
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-fase-target');
        if (!targetId) return;

        tabs.forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');

        const panes = Array.from(document.querySelectorAll('#perfilOperacionalPage .fase-pane')) as HTMLElement[];
        panes.forEach((pane) => pane.classList.remove('active'));

        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
      });
    });
  }

  private configurarEtapasOperacionaisDocumentais(): void {
    this.inicializarBuscaContratosEtapas();
    this.configurarSeletorContratoEtapa('rta', 'rtaContratoBusca', 'rtaContratoSelect', 'rtaContratoAtalhos', 'rtaContratoResultados', 'rtaContratoCarregarMaisBtn', 'rtaContratoLoading');
    this.configurarSeletorContratoEtapa('laudo', 'laudoContratoBusca', 'laudoContratoSelect', 'laudoContratoAtalhos', 'laudoContratoResultados', 'laudoContratoCarregarMaisBtn', 'laudoContratoLoading');
    this.configurarSeletorContratoEtapa('negociacao', 'negociacaoContratoBusca', 'negociacaoContratoSelect', 'negociacaoContratoAtalhos', 'negociacaoContratoResultados', 'negociacaoContratoCarregarMaisBtn', 'negociacaoContratoLoading');
    this.configurarEtapaRtaOperacional();
    this.configurarEtapaLaudoOperacional();
    this.configurarEtapaNegociacoesOperacional();
  }

  private inicializarBuscaContratosEtapas(): void {
    const contratos = this.painelVencimentos.slice(0, 200);

    this.contratosEtapasBusca = contratos.map((contrato) => {
      const imovel = this.imoveisOriginais.find((item) => item.id === contrato.contratoId);
      const municipio = (() => {
        if (!imovel) return '-';
        const enderecoRaw = (imovel as unknown as { endereco?: unknown }).endereco;
        if (typeof enderecoRaw === 'string' && enderecoRaw.trim()) return enderecoRaw.trim();
        if (enderecoRaw && typeof enderecoRaw === 'object' && 'cidade' in enderecoRaw) {
          const cidade = (enderecoRaw as { cidade?: unknown }).cidade;
          return typeof cidade === 'string' && cidade.trim() ? cidade.trim() : '-';
        }
        return '-';
      })();
      const sap = contrato.numeroContratoSap;
      const fornecedor = contrato.locadorSap;
      const uf = contrato.uf;
      const label = `${sap} | ${fornecedor} | ${uf} | ${municipio}`;
      return {
        id: contrato.contratoId,
        sap,
        fornecedor,
        uf,
        municipio,
        label,
        searchText: `${sap} ${fornecedor} ${uf} ${municipio}`.toLowerCase()
      };
    });

    this.contratoBuscaRecentes = this.carregarRecentesBuscaContrato();
    this.contratoBuscaFavoritos = this.carregarFavoritosBuscaContrato();
    this.contratoBuscaProvider = async (params: ContratoBuscaParams) => {
      const remoto = await this.buscarContratosRemoto(params);
      if (remoto) return remoto;
      return this.buscarContratosLocalComRelevancia(params);
    };
  }

  private configurarSeletorContratoEtapa(
    contexto: 'rta' | 'laudo' | 'negociacao',
    searchId: string,
    selectId: string,
    atalhosId: string,
    resultadosId: string,
    carregarMaisId: string,
    loadingId: string
  ): void {
    const searchInput = document.getElementById(searchId) as HTMLInputElement | null;
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    const atalhos = document.getElementById(atalhosId);
    const resultados = document.getElementById(resultadosId);
    const carregarMaisBtn = document.getElementById(carregarMaisId) as HTMLButtonElement | null;
    const loadingStatus = document.getElementById(loadingId) as HTMLDivElement | null;
    if (!searchInput || !select || !atalhos || !resultados || !carregarMaisBtn || !loadingStatus) return;

    const stateKey = `${contexto}:${searchId}`;
    const listboxId = `${searchId}-listbox`;
    this.contratoBuscaUiState.set(stateKey, {
      query: '',
      offset: 0,
      total: 0,
      hasMore: false,
      loading: false,
      items: []
    });
    let activeIndex = -1;

    searchInput.setAttribute('role', 'combobox');
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-haspopup', 'listbox');
    searchInput.setAttribute('aria-controls', listboxId);
    searchInput.setAttribute('aria-expanded', 'false');
    resultados.id = listboxId;
    resultados.setAttribute('role', 'listbox');
    resultados.setAttribute('aria-label', 'Resultados de contratos');
    resultados.setAttribute('aria-busy', 'false');

    const renderAtalhos = (): void => {
      atalhos.innerHTML = '';

      const recentes = this.contratoBuscaRecentes
        .map((id) => this.contratosEtapasBusca.find((item) => item.id === id))
        .filter((item): item is ContratoBuscaResultado => Boolean(item))
        .slice(0, 5);

      const favoritos = Array.from(this.contratoBuscaFavoritos)
        .map((id) => this.contratosEtapasBusca.find((item) => item.id === id))
        .filter((item): item is ContratoBuscaResultado => Boolean(item))
        .slice(0, 5);

      if (favoritos.length) {
        const favLabel = document.createElement('span');
        favLabel.className = 'contrato-picker-shortcuts-label';
        favLabel.textContent = 'Favoritos:';
        atalhos.appendChild(favLabel);
        favoritos.forEach((item) => {
          atalhos.appendChild(this.criarBotaoAtalhoContrato(item, 'favorito', (escolhido) => selecionarContrato(escolhido)));
        });
      }

      if (recentes.length) {
        const recentLabel = document.createElement('span');
        recentLabel.className = 'contrato-picker-shortcuts-label';
        recentLabel.textContent = 'Recentes:';
        atalhos.appendChild(recentLabel);
        recentes.forEach((item) => {
          atalhos.appendChild(this.criarBotaoAtalhoContrato(item, 'recente', (escolhido) => selecionarContrato(escolhido)));
        });
      }
    };

    const aplicarItemAtivo = (): void => {
      const elementos = Array.from(resultados.querySelectorAll('.contrato-picker-item')) as HTMLElement[];
      elementos.forEach((el, idx) => {
        const ativo = idx === activeIndex;
        el.classList.toggle('is-active', ativo);
        el.tabIndex = ativo ? 0 : -1;
        el.setAttribute('aria-selected', String(ativo));
        if (ativo) el.scrollIntoView({ block: 'nearest' });
      });

      const itemAtivo = activeIndex >= 0 ? elementos[activeIndex] : null;
      if (itemAtivo?.id) {
        searchInput.setAttribute('aria-activedescendant', itemAtivo.id);
      } else {
        searchInput.removeAttribute('aria-activedescendant');
      }
    };

    const ocultarResultados = (): void => {
      resultados.hidden = true;
      carregarMaisBtn.hidden = true;
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.removeAttribute('aria-activedescendant');
      activeIndex = -1;
    };

    const atualizarLoading = (loading: boolean): void => {
      loadingStatus.hidden = !loading;
      resultados.setAttribute('aria-busy', String(loading));
      searchInput.setAttribute('aria-busy', String(loading));
    };

    const renderResultados = (items: ContratoBuscaResultado[], query: string): void => {
      resultados.innerHTML = '';
      if (query.trim().length < 2) {
        ocultarResultados();
        return;
      }

      resultados.hidden = false;
      searchInput.setAttribute('aria-expanded', 'true');
      if (!items.length) {
        const vazio = document.createElement('div');
        vazio.className = 'contrato-picker-empty';
        vazio.textContent = 'Nenhum contrato encontrado para esta busca.';
        resultados.appendChild(vazio);
        carregarMaisBtn.hidden = true;
        activeIndex = -1;
        return;
      }

      const cabecalho = document.createElement('div');
      cabecalho.className = 'contrato-picker-header';
      cabecalho.textContent = `Top resultados (${Math.min(items.length, this.contratoBuscaPageSize)} de ${this.contratoBuscaUiState.get(stateKey)?.total || items.length})`;
      resultados.appendChild(cabecalho);

      items.forEach((item, index) => {
        const linha = document.createElement('div');
        linha.className = 'contrato-picker-item';
        linha.id = `${searchId}-option-${index}`;
        linha.tabIndex = -1;
        linha.setAttribute('role', 'option');
        linha.setAttribute('aria-selected', String(index === activeIndex));
        const fornecedorDestacado = this.destacarTermoBusca(item.fornecedor, query);
        const sapDestacado = this.destacarTermoBusca(item.sap, query);
        const municipioDestacado = this.destacarTermoBusca(item.municipio, query);
        linha.innerHTML = `
          <span class="contrato-picker-item-title">${sapDestacado} | ${fornecedorDestacado}</span>
          <span class="contrato-picker-item-meta">UF: ${this.escaparHtml(item.uf)} | Município: ${municipioDestacado}</span>
        `;

        const favoritoBtn = document.createElement('button');
        favoritoBtn.type = 'button';
        favoritoBtn.className = `contrato-picker-fav ${this.contratoBuscaFavoritos.has(item.id) ? 'is-active' : ''}`;
        favoritoBtn.textContent = this.contratoBuscaFavoritos.has(item.id) ? '★' : '☆';
        favoritoBtn.title = this.contratoBuscaFavoritos.has(item.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
        favoritoBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.toggleFavoritoContratoBusca(item.id);
          favoritoBtn.textContent = this.contratoBuscaFavoritos.has(item.id) ? '★' : '☆';
          favoritoBtn.classList.toggle('is-active', this.contratoBuscaFavoritos.has(item.id));
          renderAtalhos();
        });

        linha.appendChild(favoritoBtn);
        linha.addEventListener('click', () => {
          activeIndex = index;
          selecionarContrato(item);
        });
        linha.addEventListener('mousemove', () => {
          activeIndex = index;
          aplicarItemAtivo();
        });
        resultados.appendChild(linha);
      });

      const state = this.contratoBuscaUiState.get(stateKey);
      carregarMaisBtn.hidden = !(state?.hasMore);
      if (activeIndex < 0 || activeIndex >= items.length) {
        activeIndex = 0;
      }
      aplicarItemAtivo();
    };

    const selecionarContrato = (item: ContratoBuscaResultado): void => {
      select.innerHTML = '';
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      option.selected = true;
      select.appendChild(option);
      searchInput.value = item.label;

      this.registrarRecenteContratoBusca(item.id);
      renderAtalhos();
      ocultarResultados();

      select.dispatchEvent(new Event('change'));
    };

    const executarBusca = async (append = false): Promise<void> => {
      const state = this.contratoBuscaUiState.get(stateKey);
      if (!state || state.loading) return;

      const query = (searchInput.value || '').trim();
      state.query = query;

      if (query.length < 2) {
        state.items = [];
        state.offset = 0;
        state.total = 0;
        state.hasMore = false;
        renderResultados([], query);
        return;
      }

      state.loading = true;
      atualizarLoading(true);
      carregarMaisBtn.disabled = true;
      try {
        const response = await this.buscarContratosEtapas({
          query,
          offset: append ? state.offset : 0,
          limit: this.contratoBuscaPageSize
        });

        state.items = append ? [...state.items, ...response.items] : response.items;
        state.offset = append ? state.offset + response.items.length : response.items.length;
        state.total = response.total;
        state.hasMore = response.hasMore;
        renderResultados(state.items, query);
      } finally {
        state.loading = false;
        atualizarLoading(false);
        carregarMaisBtn.disabled = false;
      }
    };

    const buscarComDebounce = (): void => {
      const timer = this.contratoBuscaTimers.get(stateKey);
      if (timer) window.clearTimeout(timer);
      const next = window.setTimeout(() => {
        void executarBusca(false);
      }, this.contratoBuscaDebounceMs);
      this.contratoBuscaTimers.set(stateKey, next);
    };

    searchInput.addEventListener('input', buscarComDebounce);
    searchInput.addEventListener('focus', () => {
      renderAtalhos();
      const state = this.contratoBuscaUiState.get(stateKey);
      renderResultados(state?.items || [], searchInput.value || '');
    });
    searchInput.addEventListener('keydown', (event) => {
      const state = this.contratoBuscaUiState.get(stateKey);
      const items = state?.items || [];

      if (event.key === 'Escape') {
        event.preventDefault();
        ocultarResultados();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!items.length) return;
        if (resultados.hidden) {
          renderResultados(items, searchInput.value || '');
          return;
        }
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        aplicarItemAtivo();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!items.length) return;
        activeIndex = Math.max(activeIndex - 1, 0);
        aplicarItemAtivo();
        return;
      }

      if (event.key === 'Tab' && !resultados.hidden && items.length) {
        event.preventDefault();
        if (event.shiftKey) {
          activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
        } else {
          activeIndex = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;
        }
        aplicarItemAtivo();
        return;
      }

      if (event.key === 'Enter') {
        if (resultados.hidden) return;
        event.preventDefault();
        if (!items.length) return;
        const indiceSelecionado = activeIndex >= 0 ? activeIndex : 0;
        const escolhido = items[indiceSelecionado];
        if (escolhido) selecionarContrato(escolhido);
      }
    });
    document.addEventListener('click', (event) => {
      const target = event.target as Node;
      if (searchInput.contains(target) || resultados.contains(target) || atalhos.contains(target) || carregarMaisBtn.contains(target)) {
        return;
      }
      ocultarResultados();
    });
    carregarMaisBtn.addEventListener('click', () => {
      void executarBusca(true);
    });

    renderAtalhos();
    renderResultados([], '');
  }

  private escaparHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escaparRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private destacarTermoBusca(value: string, query: string): string {
    const safeValue = this.escaparHtml(value);
    const termo = query.trim();
    if (termo.length < 2) return safeValue;

    const regex = new RegExp(`(${this.escaparRegex(this.escaparHtml(termo))})`, 'ig');
    return safeValue.replace(regex, '<mark class="contrato-picker-highlight">$1</mark>');
  }

  private async buscarContratosEtapas(params: ContratoBuscaParams): Promise<ContratoBuscaResponse> {
    if (this.contratoBuscaProvider) {
      return this.contratoBuscaProvider(params);
    }
    return this.buscarContratosLocalComRelevancia(params);
  }

  private async buscarContratosRemoto(params: ContratoBuscaParams): Promise<ContratoBuscaResponse | null> {
    const endpoint = (window as Window & { SILIC_CONTRATO_BUSCA_ENDPOINT?: string }).SILIC_CONTRATO_BUSCA_ENDPOINT;
    if (!endpoint) return null;

    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('q', params.query);
      url.searchParams.set('offset', String(params.offset));
      url.searchParams.set('limit', String(params.limit));

      const response = await fetch(url.toString(), { method: 'GET' });
      if (!response.ok) return null;
      const payload = await response.json() as { items?: ContratoBuscaResultado[]; total?: number; hasMore?: boolean };
      if (!Array.isArray(payload.items)) return null;

      return {
        items: payload.items,
        total: typeof payload.total === 'number' ? payload.total : payload.items.length,
        hasMore: typeof payload.hasMore === 'boolean' ? payload.hasMore : false
      };
    } catch {
      return null;
    }
  }

  private buscarContratosLocalComRelevancia(params: ContratoBuscaParams): ContratoBuscaResponse {
    const query = params.query.trim().toLowerCase();
    const resultadosOrdenados = this.contratosEtapasBusca
      .filter((item) => item.searchText.includes(query))
      .sort((a, b) => {
        const scoreA = this.obterScoreRelevanciaContrato(a, query);
        const scoreB = this.obterScoreRelevanciaContrato(b, query);
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.sap.localeCompare(b.sap);
      });

    const total = resultadosOrdenados.length;
    const items = resultadosOrdenados.slice(params.offset, params.offset + Math.min(params.limit, 50));
    const hasMore = params.offset + items.length < total;
    return { items, total, hasMore };
  }

  private obterScoreRelevanciaContrato(item: ContratoBuscaResultado, query: string): number {
    if (item.sap.toLowerCase() === query) return 0;
    if (item.sap.toLowerCase().startsWith(query)) return 1;
    if (item.fornecedor.toLowerCase().startsWith(query)) return 2;
    if (item.municipio.toLowerCase().startsWith(query)) return 3;
    if (item.searchText.includes(query)) return 4;
    return 99;
  }

  private carregarRecentesBuscaContrato(): string[] {
    try {
      const raw = localStorage.getItem(this.contratoBuscaRecentesKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  private carregarFavoritosBuscaContrato(): Set<string> {
    try {
      const raw = localStorage.getItem(this.contratoBuscaFavoritosKey);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((item) => typeof item === 'string'));
    } catch {
      return new Set();
    }
  }

  private registrarRecenteContratoBusca(contratoId: string): void {
    this.contratoBuscaRecentes = [contratoId, ...this.contratoBuscaRecentes.filter((id) => id !== contratoId)].slice(0, 10);
    try {
      localStorage.setItem(this.contratoBuscaRecentesKey, JSON.stringify(this.contratoBuscaRecentes));
    } catch {
      // Ignora indisponibilidade de localStorage.
    }
  }

  private toggleFavoritoContratoBusca(contratoId: string): void {
    if (this.contratoBuscaFavoritos.has(contratoId)) this.contratoBuscaFavoritos.delete(contratoId);
    else this.contratoBuscaFavoritos.add(contratoId);
    try {
      localStorage.setItem(this.contratoBuscaFavoritosKey, JSON.stringify(Array.from(this.contratoBuscaFavoritos)));
    } catch {
      // Ignora indisponibilidade de localStorage.
    }
  }

  private criarBotaoAtalhoContrato(
    item: ContratoBuscaResultado,
    tipo: 'favorito' | 'recente',
    onClick: (item: ContratoBuscaResultado) => void
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `contrato-picker-shortcut contrato-picker-shortcut-${tipo}`;
    button.textContent = `${tipo === 'favorito' ? '★' : '⟳'} ${item.sap}`;
    button.title = item.label;
    button.addEventListener('click', () => onClick(item));
    return button;
  }

  private obterResumoContratoOperacional(contratoId: string): string {
    const contrato = this.painelVencimentos.find((item) => item.contratoId === contratoId);
    if (!contrato) return 'Contrato não encontrado na base atual.';
    return `Contrato SAP ${contrato.numeroContratoSap} | SICLG ${contrato.numeroContratoSiclg} | Fornecedor ${contrato.locadorSap} | Vigência ${contrato.vigenciaSap}`;
  }

  private atualizarResumoContratoEtapa(selectId: string, resumoId: string): void {
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    const resumo = document.getElementById(resumoId);
    if (!select || !resumo) return;

    if (!select.value) {
      resumo.textContent = 'Selecione um contrato para preencher os dados desta etapa.';
      return;
    }

    resumo.textContent = this.obterResumoContratoOperacional(select.value);
  }

  private contratoSiclgValido(numeroContratoSiclg?: string): boolean {
    const valor = (numeroContratoSiclg || '').trim();
    if (!valor) return false;
    const normalizado = valor.toLowerCase();
    const invalidos = new Set(['-', '--', 'n/a', 'na', 'null', 'undefined', 'sem contrato', 'sem instrumento']);
    return !invalidos.has(normalizado);
  }

  private obterContextoContratoNegociacao(contratoId: string): { tipo: NegociacaoContextoTipo; contratoSiclg: string; regraAplicada: string } {
    const contrato = this.painelVencimentos.find((item) => item.contratoId === contratoId);
    const imovel = this.imoveisOriginais.find((item) => item.id === contratoId);
    const contratoSiclg = (contrato?.numeroContratoSiclg || imovel?.numeroInstrumento || '').trim();
    const possuiContratoSiclg = this.contratoSiclgValido(contratoSiclg);

    return {
      tipo: possuiContratoSiclg ? 'com_contrato' : 'sem_contrato',
      contratoSiclg: possuiContratoSiclg ? contratoSiclg : '-',
      regraAplicada: possuiContratoSiclg
        ? 'Regra: com contrato quando numeroContratoSiclg/numeroInstrumento possui valor valido.'
        : 'Regra: sem contrato quando numeroContratoSiclg/numeroInstrumento esta vazio ou com marcador de ausencia.'
    };
  }

  private obterLocadoresContratoNegociacao(contratoId: string): NegociacaoLocadorContexto[] {
    const imovel = this.imoveisOriginais.find((item) => item.id === contratoId);
    if (!imovel) return [];

    const participacoes = imovel.locadoresParticipacao || [];
    if (participacoes.length) {
      return participacoes.map((participacao, index) => {
        const locador = this.locadores.find((item) => item.id === participacao.locadorId);
        const tipoFallback = imovel.tipoIdFiscal === 'CNPJ' ? 'juridica' : 'fisica';
        return {
          locadorId: participacao.locadorId || `locador-${index + 1}`,
          nome: locador?.nome || `Locador ${index + 1}`,
          tipo: locador?.tipo || tipoFallback,
          percentualBase: Number.isFinite(participacao.percentual) ? participacao.percentual : 0
        };
      });
    }

    const locadorPrincipal = this.locadores.find((item) => item.id === imovel.locadorId);
    if (!locadorPrincipal && !imovel.locadorId && !imovel.parceiroNegocios) return [];

    return [{
      locadorId: locadorPrincipal?.id || imovel.locadorId || `locador-principal-${imovel.id}`,
      nome: locadorPrincipal?.nome || imovel.parceiroNegocios || 'Locador principal',
      tipo: locadorPrincipal?.tipo || (imovel.tipoIdFiscal === 'CNPJ' ? 'juridica' : 'fisica'),
      percentualBase: 100
    }];
  }

  private carregarMapaEtapa<T>(storageKey: string): Record<string, T> {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed as Record<string, T> : {};
    } catch {
      return {};
    }
  }

  private salvarMapaEtapa<T>(storageKey: string, data: Record<string, T>): void {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Ignora indisponibilidade de localStorage.
    }
  }

  private obterNomesArquivosInput(inputId: string): string[] {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (!input?.files?.length) return [];
    return Array.from(input.files).map((file) => file.name);
  }

  private atualizarInfoUploadEtapa(infoId: string, nomesArquivos: string[]): void {
    const info = document.getElementById(infoId);
    if (!info) return;
    info.textContent = nomesArquivos.length ? `Arquivo(s): ${nomesArquivos.join(', ')}` : '';
  }

  private lerNumeroInput(id: string): number | undefined {
    const element = document.getElementById(id) as HTMLInputElement | null;
    if (!element || element.value.trim() === '') return undefined;
    const parsed = Number(element.value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private lerNumeroMonetarioInput(id: string): number | undefined {
    const element = document.getElementById(id) as HTMLInputElement | null;
    if (!element) return undefined;

    const texto = element.value.trim();
    if (!texto) return undefined;

    const normalizado = texto
      .replace(/\s/g, '')
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.');

    const parsed = Number(normalizado);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private formatarCampoMonetario(id: string, valor?: number): void {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) return;
    input.value = valor === undefined ? '' : Utils.formatCurrency(valor);
  }

  private aplicarMascaraMonetariaInput(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) return;

    const formatarValor = (): void => {
      const digitos = input.value.replace(/\D/g, '');
      if (!digitos) {
        input.value = '';
        return;
      }

      const valor = Number(digitos) / 100;
      input.value = Utils.formatCurrency(valor);
    };

    input.addEventListener('input', formatarValor);
    input.addEventListener('blur', formatarValor);
  }

  private configurarEtapaRtaOperacional(): void {
    const selectContrato = document.getElementById('rtaContratoSelect') as HTMLSelectElement | null;
    const areaInput = document.getElementById('rtaAreaContratada') as HTMLInputElement | null;
    const benfeitoriasInput = document.getElementById('rtaBenfeitoriasValor') as HTMLInputElement | null;
    const valorVenalInput = document.getElementById('rtaValorVenalImovel') as HTMLInputElement | null;
    const salvarBtn = document.getElementById('rtaSalvarBtn') as HTMLButtonElement | null;
    const uploadRelatorio = document.getElementById('rtaUploadRelatorio') as HTMLInputElement | null;
    const uploadParecer = document.getElementById('rtaUploadParecer') as HTMLInputElement | null;

    if (!selectContrato || !areaInput || !salvarBtn) return;

    const atualizarVisibilidadeBenfeitorias = (): void => {
      const section = document.getElementById('rtaBenfeitoriasSection');
      if (!section) return;
      const area = Number(areaInput.value || '0');
      section.hidden = !(Number.isFinite(area) && area > 550);
    };

    const atualizarPercentual = (): void => {
      const percentualInput = document.getElementById('rtaPercentualBenfeitorias') as HTMLInputElement | null;
      if (!percentualInput) return;
      const benfeitorias = this.lerNumeroInput('rtaBenfeitoriasValor');
      const valorVenal = this.lerNumeroInput('rtaValorVenalImovel');
      if (!benfeitorias || !valorVenal || valorVenal <= 0) {
        percentualInput.value = '';
        return;
      }
      percentualInput.value = ((benfeitorias / valorVenal) * 100).toFixed(2);
    };

    const preencherFormulario = (registro?: EtapaRtaRegistro): void => {
      areaInput.value = registro?.areaContratada !== undefined ? String(registro.areaContratada) : '';
      (document.getElementById('rtaBenfeitoriasValor') as HTMLInputElement | null)!.value = registro?.benfeitoriasValor !== undefined ? String(registro.benfeitoriasValor) : '';
      (document.getElementById('rtaPossuiValorVenal') as HTMLSelectElement | null)!.value = registro?.possuiValorVenal || '';
      (document.getElementById('rtaValorVenalImovel') as HTMLInputElement | null)!.value = registro?.valorVenalImovel !== undefined ? String(registro.valorVenalImovel) : '';
      (document.getElementById('rtaParecerNumero') as HTMLInputElement | null)!.value = registro?.parecerNumero || '';
      (document.getElementById('rtaParecerData') as HTMLInputElement | null)!.value = registro?.parecerData || '';
      (document.getElementById('rtaPercentualBenfeitorias') as HTMLInputElement | null)!.value = registro?.percentualBenfeitorias !== undefined ? String(registro.percentualBenfeitorias) : '';
      (document.getElementById('rtaManifestacaoNegocio') as HTMLTextAreaElement | null)!.value = registro?.manifestacaoNegocio || '';
      (document.getElementById('rtaManifestacaoInfra') as HTMLTextAreaElement | null)!.value = registro?.manifestacaoInfra || '';
      this.atualizarInfoUploadEtapa('rtaUploadRelatorioInfo', registro?.uploadRelatorioArquivos || []);
      this.atualizarInfoUploadEtapa('rtaUploadParecerInfo', registro?.uploadParecerArquivos || []);
      atualizarVisibilidadeBenfeitorias();
      atualizarPercentual();
    };

    const carregarRegistroSelecionado = (): void => {
      const mapa = this.carregarMapaEtapa<EtapaRtaRegistro>(SistemaSILIC.ETAPA_RTA_STORAGE_KEY);
      preencherFormulario(mapa[selectContrato.value]);
    };

    selectContrato.addEventListener('change', () => {
      this.atualizarResumoContratoEtapa('rtaContratoSelect', 'rtaContratoResumo');
      carregarRegistroSelecionado();
    });

    areaInput.addEventListener('input', atualizarVisibilidadeBenfeitorias);
    benfeitoriasInput?.addEventListener('input', atualizarPercentual);
    valorVenalInput?.addEventListener('input', atualizarPercentual);

    uploadRelatorio?.addEventListener('change', () => {
      this.atualizarInfoUploadEtapa('rtaUploadRelatorioInfo', this.obterNomesArquivosInput('rtaUploadRelatorio'));
    });
    uploadParecer?.addEventListener('change', () => {
      this.atualizarInfoUploadEtapa('rtaUploadParecerInfo', this.obterNomesArquivosInput('rtaUploadParecer'));
    });

    salvarBtn.addEventListener('click', () => {
      const contratoId = selectContrato.value;
      if (!contratoId) {
        this.showToast('Selecione um contrato para salvar os dados do RTA.');
        return;
      }

      const mapa = this.carregarMapaEtapa<EtapaRtaRegistro>(SistemaSILIC.ETAPA_RTA_STORAGE_KEY);
      const uploadRelatorioArquivos = this.obterNomesArquivosInput('rtaUploadRelatorio');
      const uploadParecerArquivos = this.obterNomesArquivosInput('rtaUploadParecer');
      const areaContratada = this.lerNumeroInput('rtaAreaContratada');
      const percentualCalculado = this.lerNumeroInput('rtaPercentualBenfeitorias');

      mapa[contratoId] = {
        areaContratada,
        benfeitoriasValor: this.lerNumeroInput('rtaBenfeitoriasValor'),
        possuiValorVenal: ((document.getElementById('rtaPossuiValorVenal') as HTMLSelectElement | null)?.value || '') as 'sim' | 'nao' | '',
        valorVenalImovel: this.lerNumeroInput('rtaValorVenalImovel'),
        parecerNumero: (document.getElementById('rtaParecerNumero') as HTMLInputElement | null)?.value.trim() || '',
        parecerData: (document.getElementById('rtaParecerData') as HTMLInputElement | null)?.value || '',
        percentualBenfeitorias: percentualCalculado,
        manifestacaoNegocio: (document.getElementById('rtaManifestacaoNegocio') as HTMLTextAreaElement | null)?.value.trim() || '',
        manifestacaoInfra: (document.getElementById('rtaManifestacaoInfra') as HTMLTextAreaElement | null)?.value.trim() || '',
        uploadRelatorioArquivos: uploadRelatorioArquivos.length ? uploadRelatorioArquivos : (mapa[contratoId]?.uploadRelatorioArquivos || []),
        uploadParecerArquivos: uploadParecerArquivos.length ? uploadParecerArquivos : (mapa[contratoId]?.uploadParecerArquivos || [])
      };

      this.salvarMapaEtapa(SistemaSILIC.ETAPA_RTA_STORAGE_KEY, mapa);
      this.showToast('Dados da etapa RTA salvos para o contrato selecionado.');
      carregarRegistroSelecionado();
    });

    this.atualizarResumoContratoEtapa('rtaContratoSelect', 'rtaContratoResumo');
  }

  private configurarEtapaLaudoOperacional(): void {
    const selectContrato = document.getElementById('laudoContratoSelect') as HTMLSelectElement | null;
    const uploadInput = document.getElementById('laudoUploadArquivo') as HTMLInputElement | null;
    const dadosSection = document.getElementById('laudoDadosSection');
    const salvarBtn = document.getElementById('laudoSalvarBtn') as HTMLButtonElement | null;
    const cnpjInput = document.getElementById('laudoEmpresaCnpj') as HTMLInputElement | null;

    if (!selectContrato || !uploadInput || !dadosSection || !salvarBtn) return;

  this.aplicarMascaraMonetariaInput('laudoValorMinimo');
  this.aplicarMascaraMonetariaInput('laudoValorMedio');
  this.aplicarMascaraMonetariaInput('laudoValorMaximo');

    const preencherFormulario = (registro?: EtapaLaudoRegistro): void => {
      (document.getElementById('laudoDataElaboracao') as HTMLInputElement | null)!.value = registro?.dataElaboracao || '';
      (document.getElementById('laudoDataValidade') as HTMLInputElement | null)!.value = registro?.dataValidade || '';
      (document.getElementById('laudoNumeroDocumento') as HTMLInputElement | null)!.value = registro?.numeroDocumento || '';
      (document.getElementById('laudoEmpresaNome') as HTMLInputElement | null)!.value = registro?.empresaNome || '';
      (document.getElementById('laudoEmpresaCnpj') as HTMLInputElement | null)!.value = registro?.empresaCnpj || '';
      this.formatarCampoMonetario('laudoValorMinimo', registro?.valorMinimo);
      this.formatarCampoMonetario('laudoValorMedio', registro?.valorMedio);
      this.formatarCampoMonetario('laudoValorMaximo', registro?.valorMaximo);
      (document.getElementById('laudoAssinado') as HTMLSelectElement | null)!.value = registro?.assinado || '';
      this.atualizarInfoUploadEtapa('laudoUploadInfo', registro?.uploadArquivos || []);
      dadosSection.hidden = !(registro?.uploadArquivos && registro.uploadArquivos.length);
    };

    const carregarRegistroSelecionado = (): void => {
      const mapa = this.carregarMapaEtapa<EtapaLaudoRegistro>(SistemaSILIC.ETAPA_LAUDO_STORAGE_KEY);
      preencherFormulario(mapa[selectContrato.value]);
    };

    selectContrato.addEventListener('change', () => {
      this.atualizarResumoContratoEtapa('laudoContratoSelect', 'laudoContratoResumo');
      carregarRegistroSelecionado();
    });

    uploadInput.addEventListener('change', () => {
      const nomes = this.obterNomesArquivosInput('laudoUploadArquivo');
      this.atualizarInfoUploadEtapa('laudoUploadInfo', nomes);
      dadosSection.hidden = nomes.length === 0;
    });

    cnpjInput?.addEventListener('input', () => {
      const digits = cnpjInput.value.replace(/\D/g, '').slice(0, 14);
      cnpjInput.value = digits;
    });

    salvarBtn.addEventListener('click', () => {
      const contratoId = selectContrato.value;
      if (!contratoId) {
        this.showToast('Selecione um contrato para salvar os dados do laudo.');
        return;
      }

      const mapa = this.carregarMapaEtapa<EtapaLaudoRegistro>(SistemaSILIC.ETAPA_LAUDO_STORAGE_KEY);
      const nomesUpload = this.obterNomesArquivosInput('laudoUploadArquivo');
      const uploadsPersistidos = nomesUpload.length ? nomesUpload : (mapa[contratoId]?.uploadArquivos || []);
      if (!uploadsPersistidos.length) {
        this.showToast('Faça upload do laudo para registrar esta etapa.');
        return;
      }

      const cnpj = ((document.getElementById('laudoEmpresaCnpj') as HTMLInputElement | null)?.value || '').replace(/\D/g, '');
      if (cnpj && cnpj.length !== 14) {
        this.showToast('CNPJ inválido. Informe 14 dígitos.');
        return;
      }

      const dataElaboracao = (document.getElementById('laudoDataElaboracao') as HTMLInputElement | null)?.value || '';
      const dataValidade = (document.getElementById('laudoDataValidade') as HTMLInputElement | null)?.value || '';
      if (dataElaboracao && dataValidade && dataValidade < dataElaboracao) {
        this.showToast('A data de validade do laudo não pode ser anterior à data de elaboração.');
        return;
      }

      mapa[contratoId] = {
        uploadArquivos: uploadsPersistidos,
        dataElaboracao,
        dataValidade,
        numeroDocumento: (document.getElementById('laudoNumeroDocumento') as HTMLInputElement | null)?.value.trim() || '',
        empresaNome: (document.getElementById('laudoEmpresaNome') as HTMLInputElement | null)?.value.trim() || '',
        empresaCnpj: cnpj,
        valorMinimo: this.lerNumeroMonetarioInput('laudoValorMinimo'),
        valorMedio: this.lerNumeroMonetarioInput('laudoValorMedio'),
        valorMaximo: this.lerNumeroMonetarioInput('laudoValorMaximo'),
        assinado: ((document.getElementById('laudoAssinado') as HTMLSelectElement | null)?.value || '') as 'sim' | 'nao' | ''
      };

      this.salvarMapaEtapa(SistemaSILIC.ETAPA_LAUDO_STORAGE_KEY, mapa);
      this.showToast('Dados da etapa Laudo salvos para o contrato selecionado.');
      carregarRegistroSelecionado();
    });

    this.atualizarResumoContratoEtapa('laudoContratoSelect', 'laudoContratoResumo');
  }

  private configurarEtapaNegociacoesOperacional(): void {
    const selectContrato = document.getElementById('negociacaoContratoSelect') as HTMLSelectElement | null;
    const regraContextualInfo = document.getElementById('negociacaoRegraContextualAtiva');
    const temArAndamentoSelect = document.getElementById('negociacaoTemArAndamento') as HTMLSelectElement | null;
    const arDesistenciaWrap = document.getElementById('negociacaoArDesistenciaWrap');
    const temAlteracoesContratuaisToggle = document.getElementById('negociacaoTemAlteracoesContratuaisToggle') as HTMLInputElement | null;
    const alteracoesContratuaisSection = document.getElementById('negociacaoAlteracoesContratuaisSection');
    const alterarDataPagamentoToggle = document.getElementById('negociacaoAlterarDataPagamentoToggle') as HTMLInputElement | null;
    const dataPagamentoAtualInput = document.getElementById('negociacaoDataPagamentoAtual') as HTMLInputElement | null;
    const novaDataPagamentoWrap = document.getElementById('negociacaoNovaDataPagamentoWrap');
    const temCarenciaToggle = document.getElementById('negociacaoTemCarenciaToggle') as HTMLInputElement | null;
    const carenciaWrap = document.getElementById('negociacaoCarenciaDiasWrap');
    const temClausula = document.getElementById('negociacaoTemClausulaExtra') as HTMLSelectElement | null;
    const clausulaWrap = document.getElementById('negociacaoClausulaExtraWrap');
    const alteracaoTitularidade = document.getElementById('negociacaoAlteracaoTitularidade') as HTMLSelectElement | null;
    const alteracaoTitularidadeDetalheWrap = document.getElementById('negociacaoAlteracaoTitularidadeDetalheWrap');
    const alteracaoDadosBancarios = document.getElementById('negociacaoAlteracaoDadosBancarios') as HTMLSelectElement | null;
    const alteracaoDadosBancariosDetalheWrap = document.getElementById('negociacaoAlteracaoDadosBancariosDetalheWrap');
    const alteracaoContratoSocial = document.getElementById('negociacaoAlteracaoContratoSocial') as HTMLSelectElement | null;
    const alteracaoContratoSocialDetalheWrap = document.getElementById('negociacaoAlteracaoContratoSocialDetalheWrap');
    const preverMultaRescisao = document.getElementById('negociacaoPreverMultaRescisao') as HTMLSelectElement | null;
    const clausulaMultaRescisaoWrap = document.getElementById('negociacaoClausulaMultaRescisaoWrap');
    const revogacaoMultaRescisaoWrap = document.getElementById('negociacaoRevogacaoMultaRescisaoWrap');
    const resultadoMultaWrap = document.getElementById('negociacaoResultadoMultaWrap');
    const justificativaRevogacaoMultaWrap = document.getElementById('negociacaoJustificativaRevogacaoMultaWrap');
    const aluguelAcimaLaudo = document.getElementById('negociacaoAluguelAcimaLaudo') as HTMLSelectElement | null;
    const aluguelAcimaLaudoJustificativaWrap = document.getElementById('negociacaoAluguelAcimaLaudoJustificativaWrap');
    const uploadAutorizacaoAcimaLaudoWrap = document.getElementById('negociacaoUploadAutorizacaoAcimaLaudoWrap');
    const locadoresSection = document.getElementById('negociacaoLocadoresSection');
    const locadoresLista = document.getElementById('negociacaoLocadoresLista');
    const locadoresInfo = document.getElementById('negociacaoLocadoresInfo');
    const uploadContratoSocialWrap = document.getElementById('negociacaoUploadContratoSocialWrap');
    const uploadContratoSocialLabel = document.getElementById('negociacaoUploadContratoSocialLabel');
    const uploadContratoSocial = document.getElementById('negociacaoUploadContratoSocial') as HTMLInputElement | null;
    const uploadAutorizacaoAcimaLaudo = document.getElementById('negociacaoUploadAutorizacaoAcimaLaudo') as HTMLInputElement | null;
    const revogacaoMultaRescisao = document.getElementById('negociacaoRevogacaoMultaRescisao') as HTMLSelectElement | null;
    const resultadoNegociacaoMulta = document.getElementById('negociacaoResultadoNegociacaoMulta') as HTMLSelectElement | null;
    const valorPropostoAluguelInput = document.getElementById('negociacaoValorPropostoAluguel') as HTMLInputElement | null;
    const vigenciaMesesInput = document.getElementById('negociacaoVigenciaMeses') as HTMLInputElement | null;
    const dataInicioVigenciaInput = document.getElementById('negociacaoDataInicioVigencia') as HTMLInputElement | null;
    const dataFinalVigenciaInput = document.getElementById('negociacaoDataFinalVigencia') as HTMLInputElement | null;
    const valorTotalPrevistoInput = document.getElementById('negociacaoValorTotalPrevisto') as HTMLInputElement | null;
    const salvarBtn = document.getElementById('negociacaoSalvarBtn') as HTMLButtonElement | null;
    const uploadAnexos = document.getElementById('negociacaoUploadAnexos') as HTMLInputElement | null;
    const uploadMinuta = document.getElementById('negociacaoUploadMinuta') as HTMLInputElement | null;

    if (!selectContrato || !temAlteracoesContratuaisToggle || !alteracoesContratuaisSection || !alterarDataPagamentoToggle || !novaDataPagamentoWrap || !temCarenciaToggle || !carenciaWrap || !temClausula || !clausulaWrap || !alteracaoTitularidade || !alteracaoTitularidadeDetalheWrap || !alteracaoDadosBancarios || !alteracaoDadosBancariosDetalheWrap || !alteracaoContratoSocial || !alteracaoContratoSocialDetalheWrap || !salvarBtn) return;

    let contextoAtual = this.obterContextoContratoNegociacao('');
    let locadoresAtuais: NegociacaoLocadorContexto[] = [];
    const sugestaoClausulaMultaRescisao = 'Em caso de rescisão antecipada do contrato, a parte que der causa ficará sujeita à multa rescisória, conforme condições pactuadas entre as partes.';

    const possuiLocadorJuridico = (): boolean => locadoresAtuais.some((locador) => locador.tipo === 'juridica');
    const MIN_CHARS_DETALHE_NEGOCIACAO = 30;

    const normalizarDataParaInput = (valor?: string): string => {
      if (!valor) return '';
      const texto = valor.trim();
      if (!texto) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;

      const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (matchBr) {
        const [, dia, mes, ano] = matchBr;
        return `${ano}-${mes}-${dia}`;
      }

      const parsed = this.parseDate(texto);
      if (!parsed || Number.isNaN(parsed.getTime())) return '';
      const ano = parsed.getFullYear();
      const mes = String(parsed.getMonth() + 1).padStart(2, '0');
      const dia = String(parsed.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    };

    const normalizarDataParaDiaMes = (valor?: string): string => {
      if (!valor) return '';
      const texto = valor.trim();
      if (!texto) return '';

      const matchDiaMes = texto.match(/^(\d{2})\/(\d{2})(?:\/\d{4})?$/);
      if (matchDiaMes) {
        const [, dia, mes] = matchDiaMes;
        return `${dia}/${mes}`;
      }

      const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (matchIso) {
        const [, , mes, dia] = matchIso;
        return `${dia}/${mes}`;
      }

      const parsed = this.parseDate(texto);
      if (!parsed || Number.isNaN(parsed.getTime())) return '';
      const dia = String(parsed.getDate()).padStart(2, '0');
      const mes = String(parsed.getMonth() + 1).padStart(2, '0');
      return `${dia}/${mes}`;
    };

    const obterDataPagamentoAtualContrato = (contratoId: string): string => {
      if (!contratoId) return '';
      const imovel = this.imoveisOriginais.find((item) => item.id === contratoId);
      return normalizarDataParaDiaMes(imovel?.dataVencimentoAluguel);
    };

    const atualizarDataPagamentoAtual = (): void => {
      if (!dataPagamentoAtualInput) return;
      dataPagamentoAtualInput.value = obterDataPagamentoAtualContrato(selectContrato.value);
    };

    const atualizarCondicoes = (): void => {
      alteracoesContratuaisSection.hidden = !temAlteracoesContratuaisToggle.checked;
      if (temArAndamentoSelect && arDesistenciaWrap) {
        arDesistenciaWrap.hidden = !temAlteracoesContratuaisToggle.checked || temArAndamentoSelect.value !== 'sim';
      }
      if (preverMultaRescisao && clausulaMultaRescisaoWrap && revogacaoMultaRescisaoWrap && resultadoMultaWrap) {
        const exibirCondicoesMulta = preverMultaRescisao.value === 'sim';
        const solicitouRetiradaMulta = (revogacaoMultaRescisao?.value || '') === 'sim';
        const resultadoNegociacaoSelect = document.getElementById('negociacaoResultadoNegociacaoMulta') as HTMLSelectElement | null;
        if (exibirCondicoesMulta && solicitouRetiradaMulta && resultadoNegociacaoSelect && !resultadoNegociacaoSelect.value) {
          resultadoNegociacaoSelect.value = 'mantida_sem_acordo';
        }
        clausulaMultaRescisaoWrap.hidden = !exibirCondicoesMulta;
        revogacaoMultaRescisaoWrap.hidden = !exibirCondicoesMulta;
        resultadoMultaWrap.hidden = !(exibirCondicoesMulta && solicitouRetiradaMulta);
        if (justificativaRevogacaoMultaWrap) {
          justificativaRevogacaoMultaWrap.hidden = !(exibirCondicoesMulta && solicitouRetiradaMulta && resultadoNegociacaoSelect?.value === 'mantida_sem_acordo');
        }

        if (exibirCondicoesMulta) {
          const clausulaMultaInput = document.getElementById('negociacaoClausulaMultaRescisao') as HTMLTextAreaElement | null;
          if (clausulaMultaInput && !clausulaMultaInput.value.trim()) {
            clausulaMultaInput.value = sugestaoClausulaMultaRescisao;
          }
        } else {
          const clausulaMultaInput = document.getElementById('negociacaoClausulaMultaRescisao') as HTMLTextAreaElement | null;
          const revogacaoMultaSelect = document.getElementById('negociacaoRevogacaoMultaRescisao') as HTMLSelectElement | null;
          const justificativaRevogacaoInput = document.getElementById('negociacaoJustificativaRevogacaoMulta') as HTMLTextAreaElement | null;
          if (clausulaMultaInput) clausulaMultaInput.value = '';
          if (revogacaoMultaSelect) revogacaoMultaSelect.value = '';
          if (resultadoNegociacaoSelect) resultadoNegociacaoSelect.value = '';
          if (justificativaRevogacaoInput) justificativaRevogacaoInput.value = '';
        }

        if (exibirCondicoesMulta && !solicitouRetiradaMulta) {
          const justificativaRevogacaoInput = document.getElementById('negociacaoJustificativaRevogacaoMulta') as HTMLTextAreaElement | null;
          if (resultadoNegociacaoSelect) resultadoNegociacaoSelect.value = '';
          if (justificativaRevogacaoInput) justificativaRevogacaoInput.value = '';
        }
      }
      if (aluguelAcimaLaudo && aluguelAcimaLaudoJustificativaWrap && uploadAutorizacaoAcimaLaudoWrap) {
        const exibirCondicoesAcimaLaudo = aluguelAcimaLaudo.value === 'sim';
        aluguelAcimaLaudoJustificativaWrap.hidden = !exibirCondicoesAcimaLaudo;
        uploadAutorizacaoAcimaLaudoWrap.hidden = !exibirCondicoesAcimaLaudo;
        if (uploadAutorizacaoAcimaLaudo) uploadAutorizacaoAcimaLaudo.required = exibirCondicoesAcimaLaudo;
        if (!exibirCondicoesAcimaLaudo) {
          const justificativaAcimaLaudo = document.getElementById('negociacaoAluguelAcimaLaudoJustificativa') as HTMLTextAreaElement | null;
          if (justificativaAcimaLaudo) justificativaAcimaLaudo.value = '';
          this.atualizarInfoUploadEtapa('negociacaoUploadAutorizacaoAcimaLaudoInfo', []);
        }
      }
      novaDataPagamentoWrap.hidden = !temAlteracoesContratuaisToggle.checked || !alterarDataPagamentoToggle.checked;
      carenciaWrap.hidden = !temCarenciaToggle.checked;
      clausulaWrap.hidden = temClausula.value !== 'sim';
      alteracaoTitularidadeDetalheWrap.hidden = !temAlteracoesContratuaisToggle.checked || alteracaoTitularidade.value !== 'sim';
      alteracaoDadosBancariosDetalheWrap.hidden = !temAlteracoesContratuaisToggle.checked || alteracaoDadosBancarios.value !== 'sim';
      alteracaoContratoSocialDetalheWrap.hidden = !temAlteracoesContratuaisToggle.checked || alteracaoContratoSocial.value !== 'sim';

      if (!temAlteracoesContratuaisToggle.checked) {
        const dataInicioSupressao = document.getElementById('negociacaoDataInicioSupressaoAcrescimo') as HTMLInputElement | null;
        const quitacao = document.getElementById('negociacaoQuitacaoAreaDevolvida') as HTMLSelectElement | null;
        const alteracoesPercentual = document.getElementById('negociacaoAlteracoesPercentualLocadores') as HTMLTextAreaElement | null;
        const arDesistencia = document.getElementById('negociacaoArDesistenciaCondicoes') as HTMLTextAreaElement | null;
        if (dataInicioSupressao) dataInicioSupressao.value = '';
        if (quitacao) quitacao.value = '';
        if (alteracoesPercentual) alteracoesPercentual.value = '';
        if (temArAndamentoSelect) temArAndamentoSelect.value = '';
        if (arDesistencia) arDesistencia.value = '';
        alteracaoTitularidade.value = '';
        alteracaoDadosBancarios.value = '';
        alteracaoContratoSocial.value = '';
        alterarDataPagamentoToggle.checked = false;
        const novaDataPagamentoInput = document.getElementById('negociacaoNovaDataPagamento') as HTMLInputElement | null;
        if (novaDataPagamentoInput) novaDataPagamentoInput.value = '';
      }

      if (alteracaoTitularidade.value !== 'sim') {
        const campo = document.getElementById('negociacaoAlteracaoTitularidadeDetalhe') as HTMLTextAreaElement | null;
        if (campo) campo.value = '';
      }
      if (alteracaoDadosBancarios.value !== 'sim') {
        const campo = document.getElementById('negociacaoAlteracaoDadosBancariosDetalhe') as HTMLTextAreaElement | null;
        if (campo) campo.value = '';
      }
      if (alteracaoContratoSocial.value !== 'sim') {
        const campo = document.getElementById('negociacaoAlteracaoContratoSocialDetalhe') as HTMLTextAreaElement | null;
        if (campo) campo.value = '';
      }
    };

    const atualizarObrigatoriedadesDinamicas = (): void => {
      const negociacaoInicial = contextoAtual.tipo === 'sem_contrato';

      const valorProposto = document.getElementById('negociacaoValorPropostoAluguel') as HTMLInputElement | null;
      const vigenciaMeses = document.getElementById('negociacaoVigenciaMeses') as HTMLInputElement | null;
      const dataInicio = document.getElementById('negociacaoDataInicioVigencia') as HTMLInputElement | null;
      const modalidade = document.getElementById('negociacaoModalidade') as HTMLSelectElement | null;
      if (valorProposto) valorProposto.required = negociacaoInicial;
      if (vigenciaMeses) vigenciaMeses.required = negociacaoInicial;
      if (dataInicio) dataInicio.required = negociacaoInicial;
      if (modalidade) modalidade.required = negociacaoInicial;

      const exigirUploadContratoSocial = (negociacaoInicial && possuiLocadorJuridico()) || alteracaoContratoSocial.value === 'sim';
      const mostrarUploadContratoSocial = possuiLocadorJuridico() || alteracaoContratoSocial.value === 'sim';
      if (uploadContratoSocialWrap) uploadContratoSocialWrap.hidden = !mostrarUploadContratoSocial;
      if (uploadContratoSocial) uploadContratoSocial.required = exigirUploadContratoSocial;

      if (uploadContratoSocialLabel) {
        if (negociacaoInicial && possuiLocadorJuridico()) {
          uploadContratoSocialLabel.textContent = 'Anexar contrato social do(s) locador(es) PJ (obrigatório na negociação inicial)';
        } else if (alteracaoContratoSocial.value === 'sim') {
          uploadContratoSocialLabel.textContent = 'Anexar contrato social atualizado do locador';
        } else {
          uploadContratoSocialLabel.textContent = 'Anexar contrato social do locador';
        }
      }
    };

    const calcularDataFinalVigencia = (dataInicio: string, vigenciaMeses: number): string => {
      const partes = dataInicio.split('-').map((item) => Number(item));
      if (partes.length !== 3 || partes.some((item) => !Number.isFinite(item))) return '';

      const [ano, mes, dia] = partes;
      const dataFim = new Date(ano, (mes - 1) + vigenciaMeses, dia);
      dataFim.setDate(dataFim.getDate() - 1);

      const anoFim = dataFim.getFullYear();
      const mesFim = String(dataFim.getMonth() + 1).padStart(2, '0');
      const diaFim = String(dataFim.getDate()).padStart(2, '0');
      return `${anoFim}-${mesFim}-${diaFim}`;
    };

    const atualizarCamposCalculados = (): void => {
      const valorProposto = this.lerNumeroInput('negociacaoValorPropostoAluguel');
      const vigenciaMeses = this.lerNumeroInput('negociacaoVigenciaMeses');
      const dataInicioVigencia = dataInicioVigenciaInput?.value || '';

      if (dataFinalVigenciaInput) {
        if (dataInicioVigencia && vigenciaMeses && vigenciaMeses > 0) {
          dataFinalVigenciaInput.value = calcularDataFinalVigencia(dataInicioVigencia, Math.floor(vigenciaMeses));
        } else {
          dataFinalVigenciaInput.value = '';
        }
      }

      if (valorTotalPrevistoInput) {
        if (valorProposto !== undefined && vigenciaMeses !== undefined && valorProposto >= 0 && vigenciaMeses > 0) {
          valorTotalPrevistoInput.value = Utils.formatCurrency(valorProposto * Math.floor(vigenciaMeses));
        } else {
          valorTotalPrevistoInput.value = '';
        }
      }
    };

    const obterPercentuaisLocadoresDaTela = (): NegociacaoLocadorPercentualEdit[] => {
      if (!locadoresLista) return [];

      const inputs = Array.from(locadoresLista.querySelectorAll<HTMLInputElement>('input[data-negociacao-locador-id]'));
      return inputs.map((input) => {
        const locadorId = input.dataset.negociacaoLocadorId || '';
        const contextoLocador = locadoresAtuais.find((item) => item.locadorId === locadorId);
        const percentualNegociado = Number(input.value || '0');
        return {
          locadorId,
          nome: contextoLocador?.nome || 'Locador',
          tipo: contextoLocador?.tipo || 'fisica',
          percentualBase: contextoLocador?.percentualBase || 0,
          percentualNegociado: Number.isFinite(percentualNegociado) ? percentualNegociado : 0
        };
      });
    };

    const atualizarResumoPercentuaisLocadores = (): void => {
      if (!locadoresInfo) return;
      if (!locadoresAtuais.length) {
        locadoresInfo.textContent = 'Não há locadores vinculados a este contrato na base atual.';
        return;
      }

      const total = obterPercentuaisLocadoresDaTela().reduce((acc, item) => acc + item.percentualNegociado, 0);
      locadoresInfo.textContent = `Total informado: ${total.toFixed(2)}%. O total deve ser 100%.`;
    };

    const renderizarLocadores = (registro?: EtapaNegociacaoRegistro): void => {
      if (!locadoresSection || !locadoresLista) return;

      if (!selectContrato.value) {
        locadoresLista.innerHTML = '';
        locadoresSection.hidden = true;
        locadoresAtuais = [];
        atualizarResumoPercentuaisLocadores();
        atualizarObrigatoriedadesDinamicas();
        return;
      }

      locadoresAtuais = this.obterLocadoresContratoNegociacao(selectContrato.value);
      locadoresLista.innerHTML = '';

      if (!locadoresAtuais.length) {
        locadoresSection.hidden = true;
        atualizarResumoPercentuaisLocadores();
        atualizarObrigatoriedadesDinamicas();
        return;
      }

      const percentualSalvoPorLocador = new Map((registro?.locadoresPercentuais || []).map((item) => [item.locadorId, item.percentualNegociado]));

      locadoresAtuais.forEach((locador, index) => {
        const campo = document.createElement('label');
        campo.className = 'etapa-field';

        const titulo = document.createElement('span');
        titulo.textContent = `${locador.nome} (${locador.tipo === 'juridica' ? 'PJ' : 'PF'})`;

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '100';
        input.step = '0.01';
        input.className = 'filter-input';
        input.placeholder = 'Ex.: 50';
        input.dataset.negociacaoLocadorId = locador.locadorId;
        const percentualPadrao = percentualSalvoPorLocador.get(locador.locadorId);
        input.value = String(percentualPadrao ?? locador.percentualBase);
        input.required = contextoAtual.tipo === 'sem_contrato';

        const detalhe = document.createElement('small');
        detalhe.className = 'mini-label etapa-upload-info';
        detalhe.textContent = `Base atual: ${locador.percentualBase.toFixed(2)}%`;

        input.addEventListener('input', atualizarResumoPercentuaisLocadores);

        campo.appendChild(titulo);
        campo.appendChild(input);
        campo.appendChild(detalhe);
        locadoresLista.appendChild(campo);

        if ((index + 1) % 2 === 0) {
          const separador = document.createElement('div');
          separador.className = 'etapa-field';
          separador.hidden = true;
          locadoresLista.appendChild(separador);
        }
      });

      locadoresSection.hidden = false;
      atualizarResumoPercentuaisLocadores();
      atualizarObrigatoriedadesDinamicas();
    };

    const atualizarContextoContrato = (): void => {
      if (!selectContrato.value) {
        contextoAtual = this.obterContextoContratoNegociacao('');
        if (regraContextualInfo) {
          regraContextualInfo.textContent = 'Regra contextual ativa: selecione um contrato para detalhar as validações.';
        }
        atualizarObrigatoriedadesDinamicas();
        return;
      }

      contextoAtual = this.obterContextoContratoNegociacao(selectContrato.value);
      if (regraContextualInfo) {
        regraContextualInfo.textContent = `Regra contextual ativa: ${contextoAtual.regraAplicada}`;
      }
      atualizarObrigatoriedadesDinamicas();
    };

    const validarPercentuaisLocadores = (): NegociacaoLocadorPercentualEdit[] | null => {
      if (!locadoresAtuais.length) return [];

      const percentuais = obterPercentuaisLocadoresDaTela();
      if (percentuais.some((item) => !Number.isFinite(item.percentualNegociado) || item.percentualNegociado < 0 || item.percentualNegociado > 100)) {
        this.showToast('Informe percentuais válidos por locador entre 0 e 100.');
        return null;
      }

      const total = percentuais.reduce((acc, item) => acc + item.percentualNegociado, 0);
      if (Math.abs(total - 100) > 0.01) {
        this.showToast(`A distribuição percentual por locador deve totalizar 100%. Total atual: ${total.toFixed(2)}%.`);
        return null;
      }

      return percentuais;
    };

    const validarObrigatoriosNegociacaoInicial = (): boolean => {
      if (contextoAtual.tipo !== 'sem_contrato') return true;

      const valorProposto = this.lerNumeroInput('negociacaoValorPropostoAluguel');
      const vigenciaMeses = this.lerNumeroInput('negociacaoVigenciaMeses');
      const dataInicioVigencia = (document.getElementById('negociacaoDataInicioVigencia') as HTMLInputElement | null)?.value || '';
      const modalidade = (document.getElementById('negociacaoModalidade') as HTMLSelectElement | null)?.value || '';

      if (!valorProposto || valorProposto <= 0) {
        this.showToast('Na negociação inicial (sem contrato), informe o valor proposto de aluguel.');
        return false;
      }

      if (!vigenciaMeses || vigenciaMeses <= 0) {
        this.showToast('Na negociação inicial (sem contrato), informe a vigência em meses.');
        return false;
      }

      if (!dataInicioVigencia) {
        this.showToast('Na negociação inicial (sem contrato), informe a data de início da vigência.');
        return false;
      }

      if (!modalidade) {
        this.showToast('Na negociação inicial (sem contrato), informe a modalidade da contratação.');
        return false;
      }

      return true;
    };

    const preencherFormulario = (registro?: EtapaNegociacaoRegistro): void => {
      (document.getElementById('negociacaoValorPropostoAluguel') as HTMLInputElement | null)!.value = registro?.valorPropostoAluguel !== undefined ? String(registro.valorPropostoAluguel) : '';
      (document.getElementById('negociacaoVigenciaMeses') as HTMLInputElement | null)!.value = registro?.vigenciaMeses !== undefined ? String(registro.vigenciaMeses) : '';
      (document.getElementById('negociacaoDataInicioVigencia') as HTMLInputElement | null)!.value = registro?.dataInicioVigencia || '';
      if (dataFinalVigenciaInput) {
        dataFinalVigenciaInput.value = registro?.dataFinalVigencia || '';
      }
      if (valorTotalPrevistoInput) {
        valorTotalPrevistoInput.value = registro?.valorTotalPrevisto !== undefined ? Utils.formatCurrency(registro.valorTotalPrevisto) : '';
      }
      temAlteracoesContratuaisToggle.checked = registro?.temAlteracoesContratuais === 'sim'
        || !!registro?.dataInicioSupressaoAcrescimo
        || !!registro?.quitacaoAreaDevolvida
        || registro?.temArAndamento === 'sim'
        || !!registro?.arDesistenciaCondicoes
        || registro?.alterouDataPagamento === 'sim'
        || !!registro?.novaDataPagamento
        || registro?.alteracaoTitularidade === 'sim'
        || !!registro?.alteracoesPercentualLocadores
        || registro?.alteracaoDadosBancarios === 'sim'
        || registro?.alteracaoContratoSocial === 'sim'
        || !!registro?.alteracaoTitularidadeDetalhe
        || !!registro?.alteracaoDadosBancariosDetalhe
        || !!registro?.alteracaoContratoSocialDetalhe;
      (document.getElementById('negociacaoDataInicioSupressaoAcrescimo') as HTMLInputElement | null)!.value = registro?.dataInicioSupressaoAcrescimo || '';
      (document.getElementById('negociacaoQuitacaoAreaDevolvida') as HTMLSelectElement | null)!.value = registro?.quitacaoAreaDevolvida || '';
      if (temArAndamentoSelect) {
        temArAndamentoSelect.value = registro?.temArAndamento || '';
      }
      (document.getElementById('negociacaoArDesistenciaCondicoes') as HTMLTextAreaElement | null)!.value = registro?.arDesistenciaCondicoes || '';
      alterarDataPagamentoToggle.checked = registro?.alterouDataPagamento === 'sim';
      (document.getElementById('negociacaoNovaDataPagamento') as HTMLInputElement | null)!.value = registro?.novaDataPagamento || '';
      temCarenciaToggle.checked = registro?.temCarencia === 'sim';
      (document.getElementById('negociacaoCarenciaDias') as HTMLInputElement | null)!.value = registro?.carenciaDias !== undefined ? String(registro.carenciaDias) : '';
      (document.getElementById('negociacaoIndiceReajuste') as HTMLInputElement | null)!.value = registro?.indiceReajuste || '';
      (document.getElementById('negociacaoDataProximoReajuste') as HTMLInputElement | null)!.value = registro?.dataProximoReajuste || '';
      if (preverMultaRescisao) {
        preverMultaRescisao.value = registro?.preverMultaRescisao || '';
      }
      (document.getElementById('negociacaoClausulaMultaRescisao') as HTMLTextAreaElement | null)!.value = registro?.clausulaMultaRescisao || '';
      if (revogacaoMultaRescisao) {
        revogacaoMultaRescisao.value = registro?.revogacaoMultaRescisao || '';
      }
      if (resultadoNegociacaoMulta) {
        resultadoNegociacaoMulta.value = registro?.resultadoNegociacaoMulta || '';
      }
      (document.getElementById('negociacaoJustificativaRevogacaoMulta') as HTMLTextAreaElement | null)!.value = registro?.justificativaRevogacaoMulta || '';
      if (aluguelAcimaLaudo) {
        aluguelAcimaLaudo.value = registro?.aluguelAcimaLaudo || '';
      }
      (document.getElementById('negociacaoAluguelAcimaLaudoJustificativa') as HTMLTextAreaElement | null)!.value = registro?.aluguelAcimaLaudoJustificativa || '';
      (document.getElementById('negociacaoModalidade') as HTMLSelectElement | null)!.value = registro?.modalidade || '';
      temClausula.value = registro?.temClausulaExtra || '';
      (document.getElementById('negociacaoClausulaExtraTexto') as HTMLTextAreaElement | null)!.value = registro?.clausulaExtraTexto || '';
      alteracaoTitularidade.value = registro?.alteracaoTitularidade || '';
      (document.getElementById('negociacaoAlteracaoTitularidadeDetalhe') as HTMLTextAreaElement | null)!.value = registro?.alteracaoTitularidadeDetalhe || '';
      (document.getElementById('negociacaoAlteracoesPercentualLocadores') as HTMLTextAreaElement | null)!.value = registro?.alteracoesPercentualLocadores || '';
      alteracaoDadosBancarios.value = registro?.alteracaoDadosBancarios || '';
      (document.getElementById('negociacaoAlteracaoDadosBancariosDetalhe') as HTMLTextAreaElement | null)!.value = registro?.alteracaoDadosBancariosDetalhe || '';
      alteracaoContratoSocial.value = registro?.alteracaoContratoSocial || '';
      (document.getElementById('negociacaoAlteracaoContratoSocialDetalhe') as HTMLTextAreaElement | null)!.value = registro?.alteracaoContratoSocialDetalhe || '';
      this.atualizarInfoUploadEtapa('negociacaoUploadAnexosInfo', registro?.uploadAnexosArquivos || []);
      this.atualizarInfoUploadEtapa('negociacaoUploadMinutaInfo', registro?.uploadMinutaArquivos || []);
      this.atualizarInfoUploadEtapa('negociacaoUploadContratoSocialInfo', registro?.uploadContratoSocialArquivos || []);
      this.atualizarInfoUploadEtapa('negociacaoUploadAutorizacaoAcimaLaudoInfo', registro?.uploadAutorizacaoAcimaLaudoArquivos || []);
      atualizarCondicoes();
      atualizarCamposCalculados();
      renderizarLocadores(registro);
      atualizarObrigatoriedadesDinamicas();
      atualizarDataPagamentoAtual();
    };

    const carregarRegistroSelecionado = (): void => {
      const mapa = this.carregarMapaEtapa<EtapaNegociacaoRegistro>(SistemaSILIC.ETAPA_NEGOCIACAO_STORAGE_KEY);
      const registroNegociacao = mapa[selectContrato.value];
      if (registroNegociacao) {
        preencherFormulario(registroNegociacao);
        return;
      }

      // Migração de compatibilidade: campos já salvos na etapa RTA agora exibidos em Negociações.
      const mapaRta = this.carregarMapaEtapa<EtapaRtaRegistro>(SistemaSILIC.ETAPA_RTA_STORAGE_KEY);
      const registroRtaLegado = mapaRta[selectContrato.value] as (EtapaRtaRegistro & {
        dataInicioSupressaoAcrescimo?: string;
        quitacaoAreaDevolvida?: 'sim' | 'nao' | '';
        temArAndamento?: 'sim' | 'nao' | '';
        arDesistenciaCondicoes?: string;
      }) | undefined;

      preencherFormulario({
        dataInicioSupressaoAcrescimo: registroRtaLegado?.dataInicioSupressaoAcrescimo || '',
        quitacaoAreaDevolvida: registroRtaLegado?.quitacaoAreaDevolvida || '',
        temArAndamento: registroRtaLegado?.temArAndamento || '',
        arDesistenciaCondicoes: registroRtaLegado?.arDesistenciaCondicoes || ''
      });
    };

    selectContrato.addEventListener('change', () => {
      this.atualizarResumoContratoEtapa('negociacaoContratoSelect', 'negociacaoContratoResumo');
      atualizarContextoContrato();
      atualizarDataPagamentoAtual();
      carregarRegistroSelecionado();
    });

    temArAndamentoSelect?.addEventListener('change', atualizarCondicoes);
    alterarDataPagamentoToggle.addEventListener('change', atualizarCondicoes);
    temAlteracoesContratuaisToggle.addEventListener('change', () => {
      atualizarCondicoes();
      atualizarObrigatoriedadesDinamicas();
    });
    temCarenciaToggle.addEventListener('change', atualizarCondicoes);
    temClausula.addEventListener('change', atualizarCondicoes);
    alteracaoTitularidade.addEventListener('change', atualizarCondicoes);
    alteracaoDadosBancarios.addEventListener('change', atualizarCondicoes);
    alteracaoContratoSocial.addEventListener('change', () => {
      atualizarCondicoes();
      atualizarObrigatoriedadesDinamicas();
    });
    valorPropostoAluguelInput?.addEventListener('input', atualizarCamposCalculados);
    vigenciaMesesInput?.addEventListener('input', atualizarCamposCalculados);
    dataInicioVigenciaInput?.addEventListener('change', atualizarCamposCalculados);

    uploadAnexos?.addEventListener('change', () => {
      this.atualizarInfoUploadEtapa('negociacaoUploadAnexosInfo', this.obterNomesArquivosInput('negociacaoUploadAnexos'));
    });
    uploadMinuta?.addEventListener('change', () => {
      this.atualizarInfoUploadEtapa('negociacaoUploadMinutaInfo', this.obterNomesArquivosInput('negociacaoUploadMinuta'));
    });
    uploadContratoSocial?.addEventListener('change', () => {
      this.atualizarInfoUploadEtapa('negociacaoUploadContratoSocialInfo', this.obterNomesArquivosInput('negociacaoUploadContratoSocial'));
    });
    uploadAutorizacaoAcimaLaudo?.addEventListener('change', () => {
      this.atualizarInfoUploadEtapa('negociacaoUploadAutorizacaoAcimaLaudoInfo', this.obterNomesArquivosInput('negociacaoUploadAutorizacaoAcimaLaudo'));
    });
    preverMultaRescisao?.addEventListener('change', atualizarCondicoes);
    revogacaoMultaRescisao?.addEventListener('change', atualizarCondicoes);
    resultadoNegociacaoMulta?.addEventListener('change', atualizarCondicoes);
    aluguelAcimaLaudo?.addEventListener('change', atualizarCondicoes);

    salvarBtn.addEventListener('click', () => {
      const contratoId = selectContrato.value;
      if (!contratoId) {
        this.showToast('Selecione um contrato para salvar os itens negociados.');
        return;
      }

      const mapa = this.carregarMapaEtapa<EtapaNegociacaoRegistro>(SistemaSILIC.ETAPA_NEGOCIACAO_STORAGE_KEY);
      const nomesAnexos = this.obterNomesArquivosInput('negociacaoUploadAnexos');
      const nomesMinuta = this.obterNomesArquivosInput('negociacaoUploadMinuta');
      const nomesContratoSocial = this.obterNomesArquivosInput('negociacaoUploadContratoSocial');
      const nomesAutorizacaoAcimaLaudo = this.obterNomesArquivosInput('negociacaoUploadAutorizacaoAcimaLaudo');
      const dataInicioSupressaoAcrescimo = (document.getElementById('negociacaoDataInicioSupressaoAcrescimo') as HTMLInputElement | null)?.value || '';
      const quitacaoAreaDevolvida = ((document.getElementById('negociacaoQuitacaoAreaDevolvida') as HTMLSelectElement | null)?.value || '') as 'sim' | 'nao' | '';
      const temArAndamento = (temArAndamentoSelect?.value || '') as 'sim' | 'nao' | '';
      const arDesistenciaCondicoes = (document.getElementById('negociacaoArDesistenciaCondicoes') as HTMLTextAreaElement | null)?.value.trim() || '';
      const novaDataPagamento = (document.getElementById('negociacaoNovaDataPagamento') as HTMLInputElement | null)?.value || '';
      const dataInicioVigencia = (document.getElementById('negociacaoDataInicioVigencia') as HTMLInputElement | null)?.value || '';
      const dataFinalVigencia = (document.getElementById('negociacaoDataFinalVigencia') as HTMLInputElement | null)?.value || '';
      const dataProximoReajuste = (document.getElementById('negociacaoDataProximoReajuste') as HTMLInputElement | null)?.value || '';
      const valorTotalPrevistoCalculado = (() => {
        const valor = this.lerNumeroInput('negociacaoValorPropostoAluguel');
        const meses = this.lerNumeroInput('negociacaoVigenciaMeses');
        if (valor === undefined || meses === undefined || meses <= 0) return undefined;
        return valor * Math.floor(meses);
      })();
      const alteracaoTitularidadeDetalhe = (document.getElementById('negociacaoAlteracaoTitularidadeDetalhe') as HTMLTextAreaElement | null)?.value.trim() || '';
      const alteracaoDadosBancariosDetalhe = (document.getElementById('negociacaoAlteracaoDadosBancariosDetalhe') as HTMLTextAreaElement | null)?.value.trim() || '';
      const alteracaoContratoSocialDetalhe = (document.getElementById('negociacaoAlteracaoContratoSocialDetalhe') as HTMLTextAreaElement | null)?.value.trim() || '';
      const clausulaMultaRescisao = (document.getElementById('negociacaoClausulaMultaRescisao') as HTMLTextAreaElement | null)?.value.trim() || '';
      const justificativaRevogacaoMulta = (document.getElementById('negociacaoJustificativaRevogacaoMulta') as HTMLTextAreaElement | null)?.value.trim() || '';
      const aluguelAcimaLaudoJustificativa = (document.getElementById('negociacaoAluguelAcimaLaudoJustificativa') as HTMLTextAreaElement | null)?.value.trim() || '';
      const uploadAutorizacaoAcimaLaudoPersistido = nomesAutorizacaoAcimaLaudo.length
        ? nomesAutorizacaoAcimaLaudo
        : (mapa[contratoId]?.uploadAutorizacaoAcimaLaudoArquivos || []);

      if (!validarObrigatoriosNegociacaoInicial()) {
        return;
      }

      if (alterarDataPagamentoToggle.checked && !novaDataPagamento) {
        this.showToast('Informe a nova data de pagamento quando houver alteração.');
        return;
      }

      if (temAlteracoesContratuaisToggle.checked) {
        if (!alteracaoDadosBancarios.value) {
          this.showToast('Selecione se houve alteração dos dados bancários para pagamento.');
          return;
        }
        if (!alteracaoContratoSocial.value) {
          this.showToast('Selecione se houve alteração do contrato social do locador.');
          return;
        }
      }

      if (alteracaoTitularidade.value === 'sim' && !alteracaoTitularidadeDetalhe) {
        this.showToast('Descreva as alterações de titularidade quando marcado Sim.');
        return;
      }
      if (alteracaoTitularidade.value === 'sim' && alteracaoTitularidadeDetalhe.length < MIN_CHARS_DETALHE_NEGOCIACAO) {
        this.showToast('A descrição de alteração de titularidade deve ter pelo menos 30 caracteres.');
        return;
      }

      if (alteracaoDadosBancarios.value === 'sim' && !alteracaoDadosBancariosDetalhe) {
        this.showToast('Descreva os novos dados bancários quando houver alteração.');
        return;
      }
      if (alteracaoDadosBancarios.value === 'sim' && alteracaoDadosBancariosDetalhe.length < MIN_CHARS_DETALHE_NEGOCIACAO) {
        this.showToast('A descrição dos novos dados bancários deve ter pelo menos 30 caracteres.');
        return;
      }

      if (temCarenciaToggle.checked) {
        const carenciaDias = this.lerNumeroInput('negociacaoCarenciaDias');
        if (!carenciaDias || carenciaDias <= 0) {
          this.showToast('Informe a quantidade de dias de carência quando a opção estiver habilitada.');
          return;
        }
      }

      if (alteracaoContratoSocial.value === 'sim' && !alteracaoContratoSocialDetalhe) {
        this.showToast('Descreva a alteração do contrato social quando marcado Sim.');
        return;
      }
      if (alteracaoContratoSocial.value === 'sim' && alteracaoContratoSocialDetalhe.length < MIN_CHARS_DETALHE_NEGOCIACAO) {
        this.showToast('A descrição da alteração do contrato social deve ter pelo menos 30 caracteres.');
        return;
      }

      if ((preverMultaRescisao?.value || '') === 'sim') {
        if (!clausulaMultaRescisao) {
          this.showToast('Descreva a cláusula da multa por rescisão antecipada.');
          return;
        }
        if (!(revogacaoMultaRescisao?.value || '')) {
          this.showToast('Informe se a CAIXA solicitou formalmente a retirada da cláusula.');
          return;
        }
        if ((revogacaoMultaRescisao?.value || '') === 'sim' && !(resultadoNegociacaoMulta?.value || '')) {
          this.showToast('Informe o resultado da negociação sobre a retirada da cláusula.');
          return;
        }
        if ((revogacaoMultaRescisao?.value || '') === 'sim' && (resultadoNegociacaoMulta?.value || '') === 'mantida_sem_acordo' && !justificativaRevogacaoMulta) {
          this.showToast('Descreva a justificativa para manutenção da cláusula.');
          return;
        }
      }

      if ((aluguelAcimaLaudo?.value || '') === 'sim') {
        if (!aluguelAcimaLaudoJustificativa) {
          this.showToast('Justifique a negociação acima do laudo.');
          return;
        }
        if (aluguelAcimaLaudoJustificativa.length < 30) {
          this.showToast('A justificativa para valor acima do laudo deve ter pelo menos 30 caracteres.');
          return;
        }
        if (!uploadAutorizacaoAcimaLaudoPersistido.length) {
          this.showToast('Anexe a autorização formal para valor acima do laudo.');
          return;
        }
      }

      if (dataInicioVigencia && dataProximoReajuste && dataProximoReajuste < dataInicioVigencia) {
        this.showToast('A data do próximo reajuste não pode ser anterior à data de início da vigência.');
        return;
      }

      const locadoresPercentuais = validarPercentuaisLocadores();
      if (locadoresPercentuais === null) return;

      const uploadContratoSocialPersistido = nomesContratoSocial.length ? nomesContratoSocial : (mapa[contratoId]?.uploadContratoSocialArquivos || []);
      const uploadContratoSocialObrigatorio = ((contextoAtual.tipo === 'sem_contrato') && possuiLocadorJuridico()) || alteracaoContratoSocial.value === 'sim';
      if (uploadContratoSocialObrigatorio && !uploadContratoSocialPersistido.length) {
        this.showToast('Anexe o contrato social do locador para prosseguir.');
        return;
      }

      mapa[contratoId] = {
        contextoContrato: contextoAtual.tipo,
        valorPropostoAluguel: this.lerNumeroInput('negociacaoValorPropostoAluguel'),
        vigenciaMeses: this.lerNumeroInput('negociacaoVigenciaMeses'),
        dataInicioVigencia,
        dataFinalVigencia,
        valorTotalPrevisto: valorTotalPrevistoCalculado,
        temAlteracoesContratuais: temAlteracoesContratuaisToggle.checked ? 'sim' : 'nao',
        dataInicioSupressaoAcrescimo: temAlteracoesContratuaisToggle.checked ? dataInicioSupressaoAcrescimo : '',
        quitacaoAreaDevolvida: temAlteracoesContratuaisToggle.checked ? quitacaoAreaDevolvida : '',
        temArAndamento: temAlteracoesContratuaisToggle.checked ? temArAndamento : '',
        arDesistenciaCondicoes: (temAlteracoesContratuaisToggle.checked && temArAndamento === 'sim') ? arDesistenciaCondicoes : '',
        alterouDataPagamento: (temAlteracoesContratuaisToggle.checked && alterarDataPagamentoToggle.checked) ? 'sim' : 'nao',
        novaDataPagamento: (temAlteracoesContratuaisToggle.checked && alterarDataPagamentoToggle.checked) ? novaDataPagamento : '',
        temCarencia: temCarenciaToggle.checked ? 'sim' : 'nao',
        carenciaDias: temCarenciaToggle.checked ? this.lerNumeroInput('negociacaoCarenciaDias') : undefined,
        indiceReajuste: (document.getElementById('negociacaoIndiceReajuste') as HTMLInputElement | null)?.value.trim() || '',
        dataProximoReajuste,
        preverMultaRescisao: (preverMultaRescisao?.value || '') as 'sim' | 'nao' | '',
        clausulaMultaRescisao,
        revogacaoMultaRescisao: (revogacaoMultaRescisao?.value || '') as 'sim' | 'nao' | '',
        resultadoNegociacaoMulta: ((preverMultaRescisao?.value || '') === 'sim' && (revogacaoMultaRescisao?.value || '') === 'sim'
          ? (resultadoNegociacaoMulta?.value || '')
          : '') as 'removida' | 'mantida_sem_acordo' | 'em_negociacao' | '',
        justificativaRevogacaoMulta: ((revogacaoMultaRescisao?.value || '') === 'sim' && (resultadoNegociacaoMulta?.value || '') === 'mantida_sem_acordo')
          ? justificativaRevogacaoMulta
          : '',
        aluguelAcimaLaudo: (aluguelAcimaLaudo?.value || '') as 'sim' | 'nao' | '',
        aluguelAcimaLaudoJustificativa: (aluguelAcimaLaudo?.value || '') === 'sim' ? aluguelAcimaLaudoJustificativa : '',
        modalidade: ((document.getElementById('negociacaoModalidade') as HTMLSelectElement | null)?.value || '') as 'contrato_simplificado' | 'condicoes_suspensivas' | 'minuta_locador' | '',
        temClausulaExtra: (temClausula.value || '') as 'sim' | 'nao' | '',
        clausulaExtraTexto: (document.getElementById('negociacaoClausulaExtraTexto') as HTMLTextAreaElement | null)?.value.trim() || '',
        alteracaoTitularidade: (temAlteracoesContratuaisToggle.checked ? alteracaoTitularidade.value : '') as 'sim' | 'nao' | '',
        alteracaoTitularidadeDetalhe: temAlteracoesContratuaisToggle.checked ? alteracaoTitularidadeDetalhe : '',
        alteracoesPercentualLocadores: temAlteracoesContratuaisToggle.checked
          ? ((document.getElementById('negociacaoAlteracoesPercentualLocadores') as HTMLTextAreaElement | null)?.value.trim() || '')
          : '',
        locadoresPercentuais: locadoresPercentuais || [],
        alteracaoDadosBancarios: (temAlteracoesContratuaisToggle.checked ? alteracaoDadosBancarios.value : '') as 'sim' | 'nao' | '',
        alteracaoDadosBancariosDetalhe: temAlteracoesContratuaisToggle.checked ? alteracaoDadosBancariosDetalhe : '',
        alteracaoContratoSocial: (temAlteracoesContratuaisToggle.checked ? alteracaoContratoSocial.value : '') as 'sim' | 'nao' | '',
        alteracaoContratoSocialDetalhe: temAlteracoesContratuaisToggle.checked ? alteracaoContratoSocialDetalhe : '',
        uploadAnexosArquivos: nomesAnexos.length ? nomesAnexos : (mapa[contratoId]?.uploadAnexosArquivos || []),
        uploadMinutaArquivos: nomesMinuta.length ? nomesMinuta : (mapa[contratoId]?.uploadMinutaArquivos || []),
        uploadContratoSocialArquivos: uploadContratoSocialPersistido,
        uploadAutorizacaoAcimaLaudoArquivos: (aluguelAcimaLaudo?.value || '') === 'sim' ? uploadAutorizacaoAcimaLaudoPersistido : []
      };

      this.salvarMapaEtapa(SistemaSILIC.ETAPA_NEGOCIACAO_STORAGE_KEY, mapa);
      this.showToast('Itens negociados salvos para o contrato selecionado.');
      carregarRegistroSelecionado();
    });

    this.atualizarResumoContratoEtapa('negociacaoContratoSelect', 'negociacaoContratoResumo');
    atualizarContextoContrato();
    atualizarDataPagamentoAtual();
    atualizarCondicoes();
    renderizarLocadores();
    atualizarObrigatoriedadesDinamicas();
  }

  private inicializarDadosFasesOperacionais(): void {
    const fase2 = this.painelVencimentos.map((item): Fase2OperacionalRow => {
      const fimDate = this.parseDate(item.vigenciaSap) || this.parseDate(item.vigenciaSiclg);
      return {
        contratoId: item.contratoId,
        contratoSap: item.numeroContratoSap,
        vigenciaSap: item.vigenciaSap,
        contratoSiclg: item.numeroContratoSiclg,
        vigenciaSiclg: item.vigenciaSiclg,
        fornecedor: item.locadorSap,
        descricao: item.descricaoSap,
        limiteArGo: item.limiteAr,
        uf: item.uf,
        fimVigenciaDate: fimDate
      };
    });

    this.fase2Rows = fase2;
    this.fase2RowsFiltradas = [...fase2];

    const fase3: Fase3OperacionalRow[] = this.painelVencimentos.map((item) => {
      const imovel = this.imoveisOriginais.find((i) => i.id === item.contratoId);
      const inicio = imovel?.inicioRelacao || this.formatDate(imovel?.dataRegistro) || '-';
      const contratoComposto = item.numeroContratoSiclg && item.numeroContratoSiclg !== '-'
        ? `${item.numeroContratoSap} - ${item.numeroContratoSiclg}`
        : item.numeroContratoSap;

      return {
        contratoId: item.contratoId,
        contratoSapSiclg: contratoComposto,
        fornecedor: item.locadorSap,
        descricaoContrato: item.descricaoSap,
        inicioVigencia: inicio,
        fimVigencia: item.vigenciaSap,
        situacaoLaudo: item.conciliacaoStatus === 'conciliado' ? 'Concluído' : 'Pendente',
        uf: item.uf,
        fimVigenciaDate: this.parseDate(item.vigenciaSap)
      };
    });

    this.fase3Rows = fase3;
    this.fase3RowsFiltradas = [...fase3];

    const fase4: Fase4OperacionalRow[] = this.painelVencimentos.map((item) => {
      const imovel = this.imoveisOriginais.find((i) => i.id === item.contratoId);
      const inicio = imovel?.inicioRelacao || this.formatDate(imovel?.dataRegistro) || '-';
      const contratoComposto = item.numeroContratoSiclg && item.numeroContratoSiclg !== '-'
        ? `${item.numeroContratoSap} - ${item.numeroContratoSiclg}`
        : item.numeroContratoSap;

      return {
        contratoId: item.contratoId,
        contratoSapSiclg: contratoComposto,
        fornecedor: item.locadorSap,
        descricaoContratoSap: item.descricaoSap,
        inicioVigencia: inicio,
        fimVigencia: item.vigenciaSap,
        valorMaximo: Math.max(item.valorProrrogacaoMensal, item.valorAcordado),
        incluirNoSiclg: item.numeroContratoSiclg === '-' ? 'Sim' : 'Não',
        limiteArGo: item.limiteAr,
        uf: item.uf,
        fimVigenciaDate: this.parseDate(item.vigenciaSap)
      };
    });

    this.fase4Rows = fase4;
    this.fase4RowsFiltradas = [...fase4];

    const fase5: Fase5OperacionalRow[] = this.painelVencimentos.map((item) => {
      const fimDate = this.parseDate(item.vigenciaSap);
      const imovel = this.imoveisOriginais.find((i) => i.id === item.contratoId);
      const inicio = imovel?.inicioRelacao || this.formatDate(imovel?.dataRegistro) || '-';
      const contratoComposto = item.numeroContratoSiclg && item.numeroContratoSiclg !== '-'
        ? `${item.numeroContratoSap} - ${item.numeroContratoSiclg}`
        : item.numeroContratoSap;
      const decisao = item.decisaoOperacional || 'Reavaliar';
      const houveAcordo = item.valorAcordado > 0 ? 'Sim' : 'Não';
      const incluirNoSiclg = (item.numeroContratoSiclg !== '-' || decisao === 'Prorrogar') ? 'Sim' : 'Não';
      const situacaoAr = item.situacaoProcessoAr || item.situacaoDemanda || '-';

      return {
        contratoId: item.contratoId,
        contratoSapSiclg: contratoComposto,
        fornecedor: item.locadorSap,
        descricaoContratoSap: item.descricaoSap,
        inicioVigencia: inicio,
        fimVigencia: item.vigenciaSap,
        decisaoOperacional: decisao,
        houveAcordo,
        incluirNoSiclg,
        situacaoAr,
        uf: item.uf,
        fimVigenciaDate: fimDate
      };
    });

    this.fase5Rows = fase5;
    this.fase5RowsFiltradas = [...fase5];

    const fase61: Fase61OperacionalRow[] = this.painelVencimentos.map((item) => {
      const imovel = this.imoveisOriginais.find((i) => i.id === item.contratoId);
      const contratoComposto = item.numeroContratoSiclg && item.numeroContratoSiclg !== '-'
        ? `${item.numeroContratoSap} - ${item.numeroContratoSiclg}`
        : item.numeroContratoSap;
      const tipoProcesso = item.numeroContratoSiclg === '-' ? 'Nova contratação' : 'Contratação complementar';
      const fimDate = this.parseDate(item.vigenciaSap);
      const diasParaFim = fimDate ? Math.ceil((fimDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
      const situacaoPrazo = diasParaFim === null ? 'Sem prazo' : diasParaFim <= 30 ? 'Crítico' : diasParaFim <= 90 ? 'Atenção' : 'No prazo';
      const incluidoEmDate = this.parseDate(imovel?.dataRegistro);
      const concluidoEmDate = (item.situacaoDemanda || '').toLowerCase().includes('conclu')
        ? (this.parseDate(imovel?.dataAtualizacao) || this.parseDate(item.ultimoPgtoSap))
        : null;

      return {
        contratoId: item.contratoId,
        contratoSapSiclg: contratoComposto,
        fornecedor: item.locadorSap,
        objeto: imovel?.descricaoObjeto || item.descricaoSap,
        demandante: item.demandaSiclg || 'Rede de Atendimento',
        equipeRemota: imovel?.equipeResponsavel || 'Equipe Regional',
        responsavel: imovel?.gestaoOperacional || 'Gestor Operacional',
        protocoloSiclg: item.codigoSijur || item.numeroContratoSiclg || '-',
        modalidade: item.colegiado || 'Pregão',
        progressoAtual: item.fase || 'Análise inicial',
        situacaoPrazo,
        incluidoEmDate,
        concluidoEmDate,
        tipoProcesso,
        statusContratacao: item.situacaoDemanda || (item.situacaoSiclg === 'Ativo' ? 'Em andamento' : 'A iniciar'),
        valorReferencia: Math.max(item.valorAcordado, item.valorProrrogacaoMensal),
        uf: item.uf,
        fimVigenciaDate: fimDate
      };
    });

    this.fase61Rows = fase61;
    this.fase61RowsFiltradas = this.ordenarPorCriticidadePrazo([...fase61]);

    const fase62: Fase62OperacionalRow[] = this.painelVencimentos.map((item) => {
      const imovel = this.imoveisOriginais.find((i) => i.id === item.contratoId);
      const fimDate = this.parseDate(item.vigenciaSap);
      const prazoLimite = fimDate ? new Date(fimDate.getTime()) : null;
      if (prazoLimite) prazoLimite.setDate(prazoLimite.getDate() - 120);
      const contratoComposto = item.numeroContratoSiclg && item.numeroContratoSiclg !== '-'
        ? `${item.numeroContratoSap} - ${item.numeroContratoSiclg}`
        : item.numeroContratoSap;
      const qtdAditivos = imovel?.termosAditivos?.length || 0;
      const diasParaFim = fimDate ? Math.ceil((fimDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
      const situacaoPrazo = diasParaFim === null ? 'Sem prazo' : diasParaFim <= 30 ? 'Crítico' : diasParaFim <= 90 ? 'Atenção' : 'No prazo';
      const incluidoEmDate = this.parseDate(imovel?.dataRegistro);
      const concluidoEmDate = (item.situacaoDemanda || '').toLowerCase().includes('conclu')
        ? (this.parseDate(imovel?.dataAtualizacao) || this.parseDate(item.ultimoPgtoSap))
        : null;

      return {
        contratoId: item.contratoId,
        contratoSapSiclg: contratoComposto,
        fornecedor: item.locadorSap,
        objeto: imovel?.descricaoObjeto || item.descricaoSap,
        gestorOperacional: imovel?.gestaoOperacional || 'Gestor Operacional',
        protocoloSiclg: item.numeroContratoSiclg || '-',
        tipoDemanda: item.demandaSiclg || (qtdAditivos > 0 ? 'Prorrogação' : 'Renovação'),
        faseAtual: item.fase || 'Fase 6.2',
        situacaoPrazo,
        incluidoEmDate,
        concluidoEmDate,
        statusRenovacao: qtdAditivos > 0 ? 'Renovável' : 'Avaliar renovação',
        qtdAditivos,
        prazoLimite: prazoLimite ? this.formatDate(prazoLimite.toISOString()) : '-',
        uf: item.uf,
        fimVigenciaDate: fimDate
      };
    });

    this.fase62Rows = fase62;
    this.fase62RowsFiltradas = this.ordenarPorCriticidadePrazo([...fase62]);

    const canais = ['E-mail', 'SEI', 'Ofício'];
    const fase7: Fase7OperacionalRow[] = this.painelVencimentos.map((item, index) => {
      const imovel = this.imoveisOriginais.find((i) => i.id === item.contratoId);
      const fimDate = this.parseDate(item.vigenciaSap);
      const dataNotificacao = fimDate ? new Date(fimDate.getTime()) : null;
      if (dataNotificacao) dataNotificacao.setDate(dataNotificacao.getDate() - 60);
      const contratoComposto = item.numeroContratoSiclg && item.numeroContratoSiclg !== '-'
        ? `${item.numeroContratoSap} - ${item.numeroContratoSiclg}`
        : item.numeroContratoSap;

      return {
        contratoId: item.contratoId,
        contratoSapSiclg: contratoComposto,
        fornecedor: item.locadorSap,
        objeto: imovel?.descricaoObjeto || item.descricaoSap,
        dataNotificacao: dataNotificacao ? this.formatDate(dataNotificacao.toISOString()) : '-',
        canal: canais[index % canais.length],
        statusResposta: index % 3 === 0 ? 'Respondido' : index % 3 === 1 ? 'Aguardando resposta' : 'Reforçar contato',
        uf: item.uf,
        fimVigenciaDate: fimDate
      };
    });

    this.fase7Rows = fase7;
    this.fase7RowsFiltradas = [...fase7];

    const total = fase2.length;
    const listaA = fase2.filter((r) => r.contratoSiclg !== '-' && r.contratoSiclg !== '').length;
    const listaB = fase2.filter((r) => r.contratoSiclg === '-' || r.contratoSiclg === '').length;
    const listaC = fase2.filter((r) => r.uf === 'SP' || r.uf === 'RJ').length;
    const listaD = Math.max(total - listaA - listaB - listaC, 0);

    const referencia = fase2[0]?.contratoId || this.imoveis[0]?.id || '';
    this.fase1Rows = [
      {
        dataNotificacao: new Date().toLocaleDateString('pt-BR'),
        listaA,
        listaB,
        listaC,
        listaD,
        total,
        contratoReferenciaId: referencia
      }
    ];
    this.fase1RowsFiltradas = [...this.fase1Rows];
  }

  private configurarFase1Operacional(): void {
    this.addEventListenerSafe('fase1BuscarBtn', 'click', () => this.aplicarFiltrosFase1Operacional());
    this.addEventListenerSafe('fase1LimparBtn', 'click', () => this.limparFiltrosFase1Operacional());
  }

  private configurarFase2Operacional(): void {
    this.addEventListenerSafe('fase2BuscarBtn', 'click', () => this.aplicarFiltrosFase2Operacional());
    this.addEventListenerSafe('fase2LimparBtn', 'click', () => this.limparFiltrosFase2Operacional());
  }

  private configurarFase3Operacional(): void {
    this.addEventListenerSafe('fase3BuscarBtn', 'click', () => this.aplicarFiltrosFase3Operacional());
    this.addEventListenerSafe('fase3LimparBtn', 'click', () => this.limparFiltrosFase3Operacional());
  }

  private configurarFase4Operacional(): void {
    this.addEventListenerSafe('fase4BuscarBtn', 'click', () => this.aplicarFiltrosFase4Operacional());
    this.addEventListenerSafe('fase4LimparBtn', 'click', () => this.limparFiltrosFase4Operacional());
  }

  private configurarFase5Operacional(): void {
    this.addEventListenerSafe('fase5BuscarBtn', 'click', () => this.aplicarFiltrosFase5Operacional());
    this.addEventListenerSafe('fase5LimparBtn', 'click', () => this.limparFiltrosFase5Operacional());
  }

  private configurarFase61Operacional(): void {
    this.addEventListenerSafe('fase61BuscarBtn', 'click', () => this.aplicarFiltrosFase61Operacional());
    this.addEventListenerSafe('fase61LimparBtn', 'click', () => this.limparFiltrosFase61Operacional());
  }

  private configurarFase62Operacional(): void {
    this.addEventListenerSafe('fase62BuscarBtn', 'click', () => this.aplicarFiltrosFase62Operacional());
    this.addEventListenerSafe('fase62LimparBtn', 'click', () => this.limparFiltrosFase62Operacional());
  }

  private configurarFase7Operacional(): void {
    this.addEventListenerSafe('fase7BuscarBtn', 'click', () => this.aplicarFiltrosFase7Operacional());
    this.addEventListenerSafe('fase7LimparBtn', 'click', () => this.limparFiltrosFase7Operacional());
  }

  private configurarResetSessaoJornada(): void {
    this.addEventListenerSafe('resetSessaoJornadaBtn', 'click', () => this.abrirModalConfirmacaoReset());
    this.addEventListenerSafe('cancelarConfirmacaoResetBtn', 'click', () => this.fecharModalConfirmacaoReset());
    this.addEventListenerSafe('fecharConfirmacaoResetBtn', 'click', () => this.fecharModalConfirmacaoReset());
    this.addEventListenerSafe('confirmarResetSessaoBtn', 'click', () => {
      this.fecharModalConfirmacaoReset();
      this.resetarPainelAvisoVencimento();
    });

    const modal = document.getElementById('modalConfirmacaoReset');
    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) this.fecharModalConfirmacaoReset();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const activeModal = document.getElementById('modalConfirmacaoReset');
      if (activeModal?.classList.contains('active')) {
        this.fecharModalConfirmacaoReset();
      }
    });
  }

  private abrirModalConfirmacaoReset(): void {
    const modal = document.getElementById('modalConfirmacaoReset');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  private fecharModalConfirmacaoReset(): void {
    const modal = document.getElementById('modalConfirmacaoReset');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  private resetarPainelAvisoVencimento(): void {
    try {
      localStorage.removeItem(SistemaSILIC.AVISO_STORAGE_KEY);
    } catch {
      // Ignora indisponibilidade de localStorage.
    }

    this.fecharDrawerContextoAviso();
    this.painelAvisoVencimento = this.montarPainelAvisoVencimento(this.painelVencimentos);
    this.painelAvisoVencimentoFiltrado = [...this.painelAvisoVencimento];
    this.currentPagePainelAviso = 1;
    this.limparFiltrosPainelAvisoVencimento();
    this.ativarPainelOperacional('aviso-vencimento');
    this.showToast('Painel de Aviso de Vencimento resetado. Decisões anteriores foram removidas para os 100 contratos.');
  }

  private aplicarFiltrosFase1Operacional(): void {
    const procurar = ((document.getElementById('fase1ProcurarFiltro') as HTMLInputElement | null)?.value || '').toLowerCase();
    this.fase1RowsFiltradas = this.fase1Rows.filter((row) => {
      if (!procurar) return true;
      return row.dataNotificacao.toLowerCase().includes(procurar);
    });
    this.atualizarTabelaFase1Operacional(this.fase1RowsFiltradas);
  }

  private limparFiltrosFase1Operacional(): void {
    const procurar = document.getElementById('fase1ProcurarFiltro') as HTMLInputElement | null;
    if (procurar) procurar.value = '';
    this.fase1RowsFiltradas = [...this.fase1Rows];
    this.atualizarTabelaFase1Operacional(this.fase1RowsFiltradas);
  }

  private aplicarFiltrosFase2Operacional(): void {
    const uf = (document.getElementById('fase2UfFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigencia = (document.getElementById('fase2FimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const fimDate = fimVigencia ? new Date(fimVigencia) : null;

    this.fase2RowsFiltradas = this.fase2Rows.filter((row) => {
      if (uf && row.uf !== uf) return false;
      if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
      return true;
    });

    this.salvarFiltrosFaseSessao('2');

    this.atualizarTabelaFase2Operacional(this.fase2RowsFiltradas);
  }

  private limparFiltrosFase2Operacional(): void {
    const uf = document.getElementById('fase2UfFiltro') as HTMLSelectElement | null;
    const fimVigencia = document.getElementById('fase2FimVigenciaFiltro') as HTMLInputElement | null;
    if (uf) uf.value = '';
    if (fimVigencia) fimVigencia.value = '';

    this.salvarFiltrosFaseSessao('2');

    this.fase2RowsFiltradas = [...this.fase2Rows];
    this.atualizarTabelaFase2Operacional(this.fase2RowsFiltradas);
  }

  private aplicarFiltrosFase3Operacional(): void {
    const uf = (document.getElementById('fase3UfFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigencia = (document.getElementById('fase3FimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const fimDate = fimVigencia ? new Date(fimVigencia) : null;

    this.fase3RowsFiltradas = this.fase3Rows.filter((row) => {
      if (uf && row.uf !== uf) return false;
      if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
      return true;
    });

    this.salvarFiltrosFaseSessao('3');

    this.atualizarTabelaFase3Operacional(this.fase3RowsFiltradas);
  }

  private limparFiltrosFase3Operacional(): void {
    const uf = document.getElementById('fase3UfFiltro') as HTMLSelectElement | null;
    const fimVigencia = document.getElementById('fase3FimVigenciaFiltro') as HTMLInputElement | null;
    if (uf) uf.value = '';
    if (fimVigencia) fimVigencia.value = '';

    this.salvarFiltrosFaseSessao('3');

    this.fase3RowsFiltradas = [...this.fase3Rows];
    this.atualizarTabelaFase3Operacional(this.fase3RowsFiltradas);
  }

  private aplicarFiltrosFase4Operacional(): void {
    const uf = (document.getElementById('fase4UfFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigencia = (document.getElementById('fase4FimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const fimDate = fimVigencia ? new Date(fimVigencia) : null;

    this.fase4RowsFiltradas = this.fase4Rows.filter((row) => {
      if (uf && row.uf !== uf) return false;
      if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
      return true;
    });

    this.salvarFiltrosFaseSessao('4');

    this.atualizarTabelaFase4Operacional(this.fase4RowsFiltradas);
  }

  private limparFiltrosFase4Operacional(): void {
    const uf = document.getElementById('fase4UfFiltro') as HTMLSelectElement | null;
    const fimVigencia = document.getElementById('fase4FimVigenciaFiltro') as HTMLInputElement | null;
    if (uf) uf.value = '';
    if (fimVigencia) fimVigencia.value = '';

    this.salvarFiltrosFaseSessao('4');

    this.fase4RowsFiltradas = [...this.fase4Rows];
    this.atualizarTabelaFase4Operacional(this.fase4RowsFiltradas);
  }

  private aplicarFiltrosFase5Operacional(): void {
    const uf = (document.getElementById('fase5UfFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigencia = (document.getElementById('fase5FimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const decisao = (document.getElementById('fase5DecisaoFiltro') as HTMLSelectElement | null)?.value || '';
    const fimDate = fimVigencia ? new Date(fimVigencia) : null;

    this.fase5RowsFiltradas = this.fase5Rows.filter((row) => {
      if (uf && row.uf !== uf) return false;
      if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
      if (decisao && row.decisaoOperacional !== decisao) return false;
      return true;
    });

    this.salvarFiltrosFaseSessao('5');

    this.atualizarTabelaFase5Operacional(this.fase5RowsFiltradas);
  }

  private limparFiltrosFase5Operacional(): void {
    const uf = document.getElementById('fase5UfFiltro') as HTMLSelectElement | null;
    const fimVigencia = document.getElementById('fase5FimVigenciaFiltro') as HTMLInputElement | null;
    const decisao = document.getElementById('fase5DecisaoFiltro') as HTMLSelectElement | null;
    if (uf) uf.value = '';
    if (fimVigencia) fimVigencia.value = '';
    if (decisao) decisao.value = '';

    this.salvarFiltrosFaseSessao('5');

    this.fase5RowsFiltradas = [...this.fase5Rows];
    this.atualizarTabelaFase5Operacional(this.fase5RowsFiltradas);
  }

  private aplicarFiltrosFase61Operacional(): void {
    const uf = (document.getElementById('fase61UfFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigencia = (document.getElementById('fase61FimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const demandante = (document.getElementById('fase61DemandanteFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const equipe = (document.getElementById('fase61EquipeFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const responsavel = (document.getElementById('fase61ResponsavelFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const situacao = (document.getElementById('fase61SituacaoFiltro') as HTMLSelectElement | null)?.value || '';
    const modalidade = (document.getElementById('fase61ModalidadeFiltro') as HTMLSelectElement | null)?.value || '';
    const protocolo = (document.getElementById('fase61ProtocoloFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const objeto = (document.getElementById('fase61ObjetoFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const incluidoDe = this.lerDataFiltro('fase61IncluidoDeFiltro');
    const incluidoAte = this.lerDataFiltro('fase61IncluidoAteFiltro');
    const concluidoDe = this.lerDataFiltro('fase61ConcluidoDeFiltro');
    const concluidoAte = this.lerDataFiltro('fase61ConcluidoAteFiltro');
    const fimDate = fimVigencia ? new Date(fimVigencia) : null;

    this.fase61RowsFiltradas = this.fase61Rows.filter((row) => {
      if (uf && row.uf !== uf) return false;
      if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
      if (demandante && !row.demandante.toLowerCase().includes(demandante)) return false;
      if (equipe && !row.equipeRemota.toLowerCase().includes(equipe)) return false;
      if (responsavel && !row.responsavel.toLowerCase().includes(responsavel)) return false;
      if (situacao && row.statusContratacao !== situacao) return false;
      if (modalidade && row.modalidade !== modalidade) return false;
      if (protocolo && !row.protocoloSiclg.toLowerCase().includes(protocolo)) return false;
      if (objeto && !row.objeto.toLowerCase().includes(objeto)) return false;
      if (!this.dateWithinRange(row.incluidoEmDate, incluidoDe, incluidoAte)) return false;
      if (!this.dateWithinRange(row.concluidoEmDate, concluidoDe, concluidoAte)) return false;
      if (this.fase61PrazoSelecionado && row.situacaoPrazo !== this.fase61PrazoSelecionado) return false;
      return true;
    });

    this.fase61RowsFiltradas = this.ordenarPorCriticidadePrazo(this.fase61RowsFiltradas);
    this.salvarFiltrosFaseSessao('61');

    this.atualizarTabelaFase61Operacional(this.fase61RowsFiltradas);
  }

  private limparFiltrosFase61Operacional(): void {
    const uf = document.getElementById('fase61UfFiltro') as HTMLSelectElement | null;
    const fimVigencia = document.getElementById('fase61FimVigenciaFiltro') as HTMLInputElement | null;
    const demandante = document.getElementById('fase61DemandanteFiltro') as HTMLInputElement | null;
    const equipe = document.getElementById('fase61EquipeFiltro') as HTMLInputElement | null;
    const responsavel = document.getElementById('fase61ResponsavelFiltro') as HTMLInputElement | null;
    const situacao = document.getElementById('fase61SituacaoFiltro') as HTMLSelectElement | null;
    const modalidade = document.getElementById('fase61ModalidadeFiltro') as HTMLSelectElement | null;
    const protocolo = document.getElementById('fase61ProtocoloFiltro') as HTMLInputElement | null;
    const objeto = document.getElementById('fase61ObjetoFiltro') as HTMLInputElement | null;
    const incluidoDe = document.getElementById('fase61IncluidoDeFiltro') as HTMLInputElement | null;
    const incluidoAte = document.getElementById('fase61IncluidoAteFiltro') as HTMLInputElement | null;
    const concluidoDe = document.getElementById('fase61ConcluidoDeFiltro') as HTMLInputElement | null;
    const concluidoAte = document.getElementById('fase61ConcluidoAteFiltro') as HTMLInputElement | null;
    if (uf) uf.value = '';
    if (fimVigencia) fimVigencia.value = '';
    if (demandante) demandante.value = '';
    if (equipe) equipe.value = '';
    if (responsavel) responsavel.value = '';
    if (situacao) situacao.value = '';
    if (modalidade) modalidade.value = '';
    if (protocolo) protocolo.value = '';
    if (objeto) objeto.value = '';
    if (incluidoDe) incluidoDe.value = '';
    if (incluidoAte) incluidoAte.value = '';
    if (concluidoDe) concluidoDe.value = '';
    if (concluidoAte) concluidoAte.value = '';

    this.fase61PrazoSelecionado = null;
    this.salvarSelecaoPrazoChip('61', this.fase61PrazoSelecionado);
    this.atualizarEstadoChipsPrazo('61');
    this.salvarFiltrosFaseSessao('61');

    this.fase61RowsFiltradas = this.ordenarPorCriticidadePrazo([...this.fase61Rows]);
    this.atualizarTabelaFase61Operacional(this.fase61RowsFiltradas);
  }

  private aplicarFiltrosFase62Operacional(): void {
    const uf = (document.getElementById('fase62UfFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigencia = (document.getElementById('fase62FimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const gestor = (document.getElementById('fase62GestorFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const fornecedor = (document.getElementById('fase62FornecedorFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const protocolo = (document.getElementById('fase62ProtocoloFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const situacao = (document.getElementById('fase62SituacaoFiltro') as HTMLSelectElement | null)?.value || '';
    const tipoDemanda = (document.getElementById('fase62TipoDemandaFiltro') as HTMLSelectElement | null)?.value || '';
    const objeto = (document.getElementById('fase62ObjetoFiltro') as HTMLInputElement | null)?.value.toLowerCase() || '';
    const incluidoDe = this.lerDataFiltro('fase62IncluidoDeFiltro');
    const incluidoAte = this.lerDataFiltro('fase62IncluidoAteFiltro');
    const concluidoDe = this.lerDataFiltro('fase62ConcluidoDeFiltro');
    const concluidoAte = this.lerDataFiltro('fase62ConcluidoAteFiltro');
    const fimDate = fimVigencia ? new Date(fimVigencia) : null;

    this.fase62RowsFiltradas = this.fase62Rows.filter((row) => {
      if (uf && row.uf !== uf) return false;
      if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
      if (gestor && !row.gestorOperacional.toLowerCase().includes(gestor)) return false;
      if (fornecedor && !row.fornecedor.toLowerCase().includes(fornecedor)) return false;
      if (protocolo && !row.protocoloSiclg.toLowerCase().includes(protocolo)) return false;
      if (situacao && row.statusRenovacao !== situacao) return false;
      if (tipoDemanda && row.tipoDemanda !== tipoDemanda) return false;
      if (objeto && !row.objeto.toLowerCase().includes(objeto)) return false;
      if (!this.dateWithinRange(row.incluidoEmDate, incluidoDe, incluidoAte)) return false;
      if (!this.dateWithinRange(row.concluidoEmDate, concluidoDe, concluidoAte)) return false;
      if (this.fase62PrazoSelecionado && row.situacaoPrazo !== this.fase62PrazoSelecionado) return false;
      return true;
    });

    this.fase62RowsFiltradas = this.ordenarPorCriticidadePrazo(this.fase62RowsFiltradas);
    this.salvarFiltrosFaseSessao('62');

    this.atualizarTabelaFase62Operacional(this.fase62RowsFiltradas);
  }

  private limparFiltrosFase62Operacional(): void {
    const uf = document.getElementById('fase62UfFiltro') as HTMLSelectElement | null;
    const fimVigencia = document.getElementById('fase62FimVigenciaFiltro') as HTMLInputElement | null;
    const gestor = document.getElementById('fase62GestorFiltro') as HTMLInputElement | null;
    const fornecedor = document.getElementById('fase62FornecedorFiltro') as HTMLInputElement | null;
    const protocolo = document.getElementById('fase62ProtocoloFiltro') as HTMLInputElement | null;
    const situacao = document.getElementById('fase62SituacaoFiltro') as HTMLSelectElement | null;
    const tipoDemanda = document.getElementById('fase62TipoDemandaFiltro') as HTMLSelectElement | null;
    const objeto = document.getElementById('fase62ObjetoFiltro') as HTMLInputElement | null;
    const incluidoDe = document.getElementById('fase62IncluidoDeFiltro') as HTMLInputElement | null;
    const incluidoAte = document.getElementById('fase62IncluidoAteFiltro') as HTMLInputElement | null;
    const concluidoDe = document.getElementById('fase62ConcluidoDeFiltro') as HTMLInputElement | null;
    const concluidoAte = document.getElementById('fase62ConcluidoAteFiltro') as HTMLInputElement | null;
    if (uf) uf.value = '';
    if (fimVigencia) fimVigencia.value = '';
    if (gestor) gestor.value = '';
    if (fornecedor) fornecedor.value = '';
    if (protocolo) protocolo.value = '';
    if (situacao) situacao.value = '';
    if (tipoDemanda) tipoDemanda.value = '';
    if (objeto) objeto.value = '';
    if (incluidoDe) incluidoDe.value = '';
    if (incluidoAte) incluidoAte.value = '';
    if (concluidoDe) concluidoDe.value = '';
    if (concluidoAte) concluidoAte.value = '';

    this.fase62PrazoSelecionado = null;
    this.salvarSelecaoPrazoChip('62', this.fase62PrazoSelecionado);
    this.atualizarEstadoChipsPrazo('62');
    this.salvarFiltrosFaseSessao('62');

    this.fase62RowsFiltradas = this.ordenarPorCriticidadePrazo([...this.fase62Rows]);
    this.atualizarTabelaFase62Operacional(this.fase62RowsFiltradas);
  }

  private aplicarFiltrosFase7Operacional(): void {
    const uf = (document.getElementById('fase7UfFiltro') as HTMLSelectElement | null)?.value || '';
    const fimVigencia = (document.getElementById('fase7FimVigenciaFiltro') as HTMLInputElement | null)?.value || '';
    const fimDate = fimVigencia ? new Date(fimVigencia) : null;

    this.fase7RowsFiltradas = this.fase7Rows.filter((row) => {
      if (uf && row.uf !== uf) return false;
      if (fimDate && row.fimVigenciaDate && row.fimVigenciaDate > fimDate) return false;
      return true;
    });

    this.salvarFiltrosFaseSessao('7');

    this.atualizarTabelaFase7Operacional(this.fase7RowsFiltradas);
  }

  private limparFiltrosFase7Operacional(): void {
    const uf = document.getElementById('fase7UfFiltro') as HTMLSelectElement | null;
    const fimVigencia = document.getElementById('fase7FimVigenciaFiltro') as HTMLInputElement | null;
    if (uf) uf.value = '';
    if (fimVigencia) fimVigencia.value = '';

    this.salvarFiltrosFaseSessao('7');

    this.fase7RowsFiltradas = [...this.fase7Rows];
    this.atualizarTabelaFase7Operacional(this.fase7RowsFiltradas);
  }

  private atualizarTabelaFase1Operacional(rows: Fase1OperacionalRow[]): void {
    const tbody = document.getElementById('fase1TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.dataNotificacao}</td>
        <td>${row.listaA}</td>
        <td>${row.listaB}</td>
        <td>${row.listaC}</td>
        <td>${row.listaD}</td>
        <td>${row.total}</td>
        <td><button class="btn-table-action" data-id="${row.contratoReferenciaId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button && row.contratoReferenciaId) {
        button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoReferenciaId));
      }

      tbody.appendChild(tr);
    });
  }

  private atualizarTabelaFase2Operacional(rows: Fase2OperacionalRow[]): void {
    const tbody = document.getElementById('fase2TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.contratoSap}</td>
        <td>${row.vigenciaSap}</td>
        <td>${row.contratoSiclg}</td>
        <td>${row.vigenciaSiclg}</td>
        <td>${row.fornecedor}</td>
        <td>${row.descricao}</td>
        <td>${row.limiteArGo}</td>
        <td><button class="btn-table-action" data-id="${row.contratoId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button) {
        button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoId));
      }

      tbody.appendChild(tr);
    });
  }

  private atualizarTabelaFase3Operacional(rows: Fase3OperacionalRow[]): void {
    const tbody = document.getElementById('fase3TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.contratoSapSiclg}</td>
        <td>${row.fornecedor}</td>
        <td>${row.descricaoContrato}</td>
        <td>${row.inicioVigencia}</td>
        <td>${row.fimVigencia}</td>
        <td>${row.situacaoLaudo}</td>
        <td><button class="btn-table-action" data-id="${row.contratoId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button) button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoId));

      tbody.appendChild(tr);
    });
  }

  private atualizarTabelaFase4Operacional(rows: Fase4OperacionalRow[]): void {
    const tbody = document.getElementById('fase4TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.contratoSapSiclg}</td>
        <td>${row.fornecedor}</td>
        <td>${row.descricaoContratoSap}</td>
        <td>${row.inicioVigencia}</td>
        <td>${row.fimVigencia}</td>
        <td>${this.formatCurrency(row.valorMaximo)}</td>
        <td>${row.incluirNoSiclg}</td>
        <td>${row.limiteArGo}</td>
        <td><button class="btn-table-action" data-id="${row.contratoId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button) button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoId));

      tbody.appendChild(tr);
    });
  }

  private atualizarTabelaFase5Operacional(rows: Fase5OperacionalRow[]): void {
    const tbody = document.getElementById('fase5TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.contratoSapSiclg}</td>
        <td>${row.fornecedor}</td>
        <td>${row.descricaoContratoSap}</td>
        <td>${row.inicioVigencia}</td>
        <td>${row.fimVigencia}</td>
        <td><span class="badge ${this.getStatusBadgeClass(row.decisaoOperacional)}">${row.decisaoOperacional}</span></td>
        <td><span class="badge ${this.getBooleanBadgeClass(row.houveAcordo)}">${row.houveAcordo}</span></td>
        <td><span class="badge ${this.getBooleanBadgeClass(row.incluirNoSiclg)}">${row.incluirNoSiclg}</span></td>
        <td><span class="badge ${this.getStatusBadgeClass(row.situacaoAr)}">${row.situacaoAr}</span></td>
        <td><button class="btn-table-action" data-id="${row.contratoId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button) button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoId));

      tbody.appendChild(tr);
    });
  }

  private atualizarTabelaFase61Operacional(rows: Fase61OperacionalRow[]): void {
    this.atualizarKpisPrazoFase61(rows);

    const tbody = document.getElementById('fase61TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      const favorito = this.favoritosFase61.has(row.contratoId);
      tr.innerHTML = `
        <td><button class="btn-favorite${favorito ? ' active' : ''}" data-action="favorite" data-id="${row.contratoId}" title="Favoritar">${favorito ? '★' : '☆'}</button></td>
        <td>${row.contratoSapSiclg}</td>
        <td>${row.fornecedor}</td>
        <td>${row.objeto}</td>
        <td>${row.tipoProcesso}</td>
        <td><span class="badge ${this.getStatusBadgeClass(row.statusContratacao)}">${row.statusContratacao}</span></td>
        <td>${this.formatCurrency(row.valorReferencia)}</td>
        <td><button class="btn-table-action" data-id="${row.contratoId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button) button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoId));

      const favoriteButton = tr.querySelector('[data-action="favorite"]');
      if (favoriteButton) {
        favoriteButton.addEventListener('click', () => {
          this.toggleFavorito(this.favoritosFase61, row.contratoId, 'silic-favoritos-fase61');
          this.atualizarTabelaFase61Operacional(this.fase61RowsFiltradas);
        });
      }

      tbody.appendChild(tr);
    });
  }

  private atualizarTabelaFase62Operacional(rows: Fase62OperacionalRow[]): void {
    this.atualizarKpisPrazoFase62(rows);

    const tbody = document.getElementById('fase62TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      const favorito = this.favoritosFase62.has(row.contratoId);
      tr.innerHTML = `
        <td><button class="btn-favorite${favorito ? ' active' : ''}" data-action="favorite" data-id="${row.contratoId}" title="Favoritar">${favorito ? '★' : '☆'}</button></td>
        <td>${row.contratoSapSiclg}</td>
        <td>${row.fornecedor}</td>
        <td>${row.objeto}</td>
        <td><span class="badge ${this.getStatusBadgeClass(row.statusRenovacao)}">${row.statusRenovacao}</span></td>
        <td>${row.qtdAditivos}</td>
        <td><span class="badge ${this.getPrazoBadgeClass(row.situacaoPrazo)}">${row.prazoLimite}</span></td>
        <td><button class="btn-table-action" data-id="${row.contratoId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button) button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoId));

      const favoriteButton = tr.querySelector('[data-action="favorite"]');
      if (favoriteButton) {
        favoriteButton.addEventListener('click', () => {
          this.toggleFavorito(this.favoritosFase62, row.contratoId, 'silic-favoritos-fase62');
          this.atualizarTabelaFase62Operacional(this.fase62RowsFiltradas);
        });
      }

      tbody.appendChild(tr);
    });
  }

  private atualizarTabelaFase7Operacional(rows: Fase7OperacionalRow[]): void {
    const tbody = document.getElementById('fase7TabelaBody') as HTMLTableSectionElement | null;
    if (!tbody) return;

    tbody.innerHTML = '';
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.contratoSapSiclg}</td>
        <td>${row.fornecedor}</td>
        <td>${row.objeto}</td>
        <td>${row.dataNotificacao}</td>
        <td>${row.canal}</td>
        <td><span class="badge ${this.getStatusBadgeClass(row.statusResposta)}">${row.statusResposta}</span></td>
        <td><button class="btn-table-action" data-id="${row.contratoId}" title="Detalhar">🔍</button></td>
      `;

      const button = tr.querySelector('.btn-table-action');
      if (button) button.addEventListener('click', () => this.abrirModalDetalhes(row.contratoId));

      tbody.appendChild(tr);
    });
  }

  private toggleFavorito(store: Set<string>, contratoId: string, localStorageKey: string): void {
    if (store.has(contratoId)) {
      store.delete(contratoId);
    } else {
      store.add(contratoId);
    }

    try {
      localStorage.setItem(localStorageKey, JSON.stringify(Array.from(store)));
    } catch {
      // Sem persistencia quando localStorage estiver indisponivel.
    }
  }

  private carregarFavoritosFases(): void {
    this.favoritosFase61 = this.carregarSetFavoritos('silic-favoritos-fase61');
    this.favoritosFase62 = this.carregarSetFavoritos('silic-favoritos-fase62');
  }

  private carregarSetFavoritos(localStorageKey: string): Set<string> {
    try {
      const raw = localStorage.getItem(localStorageKey);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((item) => typeof item === 'string'));
    } catch {
      return new Set();
    }
  }

  private carregarSelecaoPrazoChips(): void {
    this.fase61PrazoSelecionado = this.carregarSelecaoPrazoChip('silic-prazo-chip-fase61');
    this.fase62PrazoSelecionado = this.carregarSelecaoPrazoChip('silic-prazo-chip-fase62');
  }

  private salvarSelecaoPrazoChip(fase: '61' | '62', valor?: string | null): void {
    const key = fase === '61' ? 'silic-prazo-chip-fase61' : 'silic-prazo-chip-fase62';
    const selected = typeof valor !== 'undefined'
      ? valor
      : (fase === '61' ? this.fase61PrazoSelecionado : this.fase62PrazoSelecionado);

    try {
      if (!selected) {
        sessionStorage.removeItem(key);
        return;
      }
      sessionStorage.setItem(key, selected);
    } catch {
      // Ignora indisponibilidade de sessionStorage.
    }
  }

  private carregarSelecaoPrazoChip(key: string): string | null {
    try {
      const value = sessionStorage.getItem(key);
      const allowed = new Set(['Crítico', 'Atenção', 'No prazo']);
      return value && allowed.has(value) ? value : null;
    } catch {
      return null;
    }
  }

  private carregarFiltrosFasesSessao(): void {
    this.restaurarFiltrosFaseSessao('2');
    this.restaurarFiltrosFaseSessao('3');
    this.restaurarFiltrosFaseSessao('4');
    this.restaurarFiltrosFaseSessao('5');
    this.restaurarFiltrosFaseSessao('7');
    this.restaurarFiltrosFaseSessao('61');
    this.restaurarFiltrosFaseSessao('62');
  }

  private salvarFiltrosFaseSessao(fase: '2' | '3' | '4' | '5' | '7' | '61' | '62'): void {
    const ids = this.getIdsFiltroFase(fase);
    const payload: Record<string, string> = {};

    ids.forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) return;
      payload[id] = el.value || '';
    });

    const key = `silic-filtros-fase${fase}`;
    try {
      sessionStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // Ignora indisponibilidade de sessionStorage.
    }
  }

  private restaurarFiltrosFaseSessao(fase: '2' | '3' | '4' | '5' | '7' | '61' | '62'): void {
    const key = `silic-filtros-fase${fase}`;
    let parsed: Record<string, string> | null = null;

    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      const maybe = JSON.parse(raw);
      if (typeof maybe === 'object' && maybe !== null) {
        parsed = maybe as Record<string, string>;
      }
    } catch {
      return;
    }

    if (!parsed) return;
    this.getIdsFiltroFase(fase).forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) return;
      if (Object.prototype.hasOwnProperty.call(parsed, id)) {
        el.value = parsed[id] || '';
      }
    });
  }

  private getIdsFiltroFase(fase: '2' | '3' | '4' | '5' | '7' | '61' | '62'): string[] {
    if (fase === '2') {
      return [
        'fase2FimVigenciaFiltro',
        'fase2UfFiltro'
      ];
    }

    if (fase === '3') {
      return [
        'fase3FimVigenciaFiltro',
        'fase3UfFiltro'
      ];
    }

    if (fase === '4') {
      return [
        'fase4FimVigenciaFiltro',
        'fase4UfFiltro'
      ];
    }

    if (fase === '5') {
      return [
        'fase5FimVigenciaFiltro',
        'fase5UfFiltro',
        'fase5DecisaoFiltro'
      ];
    }

    if (fase === '7') {
      return [
        'fase7FimVigenciaFiltro',
        'fase7UfFiltro'
      ];
    }

    if (fase === '61') {
      return [
        'fase61FimVigenciaFiltro',
        'fase61UfFiltro',
        'fase61DemandanteFiltro',
        'fase61EquipeFiltro',
        'fase61ResponsavelFiltro',
        'fase61SituacaoFiltro',
        'fase61ModalidadeFiltro',
        'fase61ProtocoloFiltro',
        'fase61ObjetoFiltro',
        'fase61IncluidoDeFiltro',
        'fase61IncluidoAteFiltro',
        'fase61ConcluidoDeFiltro',
        'fase61ConcluidoAteFiltro'
      ];
    }

    return [
      'fase62FimVigenciaFiltro',
      'fase62UfFiltro',
      'fase62GestorFiltro',
      'fase62FornecedorFiltro',
      'fase62ProtocoloFiltro',
      'fase62SituacaoFiltro',
      'fase62TipoDemandaFiltro',
      'fase62ObjetoFiltro',
      'fase62IncluidoDeFiltro',
      'fase62IncluidoAteFiltro',
      'fase62ConcluidoDeFiltro',
      'fase62ConcluidoAteFiltro'
    ];
  }

  private getStatusBadgeClass(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized.includes('conclu') || normalized.includes('respondido') || normalized.includes('aprov')) return 'badge-ok';
    if (normalized.includes('refor') || normalized.includes('crítico')) return 'badge-danger';
    if (normalized.includes('aguard') || normalized.includes('pend') || normalized.includes('encerrar') || normalized.includes('avaliar')) return 'badge-warning';
    if (normalized.includes('andamento') || normalized.includes('renovável')) return 'badge-info';
    if (normalized.includes('iniciar')) return 'badge-warning';
    return 'badge-neutral';
  }

  private getPrazoBadgeClass(situacaoPrazo: string): string {
    const normalized = situacaoPrazo.toLowerCase();
    if (normalized.includes('crítico')) return 'badge-danger';
    if (normalized.includes('atenção')) return 'badge-warning';
    if (normalized.includes('prazo')) return 'badge-ok';
    return 'badge-neutral';
  }

  private getBooleanBadgeClass(value: string): string {
    const normalized = value.toLowerCase();
    if (normalized === 'sim') return 'badge-ok';
    if (normalized === 'não' || normalized === 'nao') return 'badge-neutral';
    return 'badge-neutral';
  }

  private lerDataFiltro(inputId: string): Date | null {
    const value = (document.getElementById(inputId) as HTMLInputElement | null)?.value || '';
    return value ? new Date(value) : null;
  }

  private dateWithinRange(value: Date | null, start: Date | null, end: Date | null): boolean {
    if (!start && !end) return true;
    if (!value) return false;
    if (start && value < start) return false;
    if (end && value > end) return false;
    return true;
  }

  private ordenarPorCriticidadePrazo<T extends { situacaoPrazo: string }>(rows: T[]): T[] {
    const peso = (situacao: string): number => {
      const normalized = situacao.toLowerCase();
      if (normalized.includes('crítico')) return 0;
      if (normalized.includes('atenção')) return 1;
      if (normalized.includes('prazo')) return 2;
      return 3;
    };

    return [...rows].sort((a, b) => peso(a.situacaoPrazo) - peso(b.situacaoPrazo));
  }

  private configurarChipsPrazoFases(): void {
    const chips = Array.from(document.querySelectorAll('.kpi-chip')) as HTMLButtonElement[];
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const fase = chip.dataset.fase;
        const prazo = chip.dataset.prazoFilter || '';
        if (!fase || !prazo) return;

        if (fase === '61') {
          this.fase61PrazoSelecionado = this.fase61PrazoSelecionado === prazo ? null : prazo;
          this.salvarSelecaoPrazoChip('61', this.fase61PrazoSelecionado);
          this.atualizarEstadoChipsPrazo('61');
          this.aplicarFiltrosFase61Operacional();
          return;
        }

        if (fase === '62') {
          this.fase62PrazoSelecionado = this.fase62PrazoSelecionado === prazo ? null : prazo;
          this.salvarSelecaoPrazoChip('62', this.fase62PrazoSelecionado);
          this.atualizarEstadoChipsPrazo('62');
          this.aplicarFiltrosFase62Operacional();
        }
      });
    });

    this.atualizarEstadoChipsPrazo('61');
    this.atualizarEstadoChipsPrazo('62');
  }

  private atualizarEstadoChipsPrazo(fase: '61' | '62'): void {
    const selected = fase === '61' ? this.fase61PrazoSelecionado : this.fase62PrazoSelecionado;
    const chips = Array.from(document.querySelectorAll(`.kpi-chip[data-fase="${fase}"]`)) as HTMLButtonElement[];
    chips.forEach((chip) => {
      const prazo = chip.dataset.prazoFilter || '';
      chip.classList.toggle('active', Boolean(selected && prazo === selected));
    });
  }

  private atualizarKpisPrazoFase61(rows: Fase61OperacionalRow[]): void {
    const resumo = this.calcularResumoPrazo(rows.map((row) => row.situacaoPrazo));
    this.setElementText('fase61CriticoCount', String(resumo.critico));
    this.setElementText('fase61AtencaoCount', String(resumo.atencao));
    this.setElementText('fase61NoPrazoCount', String(resumo.noPrazo));
  }

  private atualizarKpisPrazoFase62(rows: Fase62OperacionalRow[]): void {
    const resumo = this.calcularResumoPrazo(rows.map((row) => row.situacaoPrazo));
    this.setElementText('fase62CriticoCount', String(resumo.critico));
    this.setElementText('fase62AtencaoCount', String(resumo.atencao));
    this.setElementText('fase62NoPrazoCount', String(resumo.noPrazo));
  }

  private calcularResumoPrazo(situacoes: string[]): { critico: number; atencao: number; noPrazo: number } {
    let critico = 0;
    let atencao = 0;
    let noPrazo = 0;

    situacoes.forEach((situacao) => {
      const normalized = situacao.toLowerCase();
      if (normalized.includes('crítico')) {
        critico += 1;
        return;
      }
      if (normalized.includes('atenção')) {
        atencao += 1;
        return;
      }
      if (normalized.includes('prazo')) {
        noPrazo += 1;
      }
    });

    return { critico, atencao, noPrazo };
  }

  private navegarPara(path: string): void {
    // Perfis navegam somente por interação na home (sem deep-link por URL).
    if (path === '/') {
      const homePath = `${this.obterBasePath() || ''}/`;
      if (window.location.pathname !== homePath) {
        window.history.replaceState({}, '', homePath);
      }
    }
    this.aplicarRota(path);
  }

  private obterRotaAtual(): string {
    const path = window.location.pathname;
    if (path.endsWith('/perfil/operacional')) return '/perfil/operacional';
    if (path.endsWith('/perfil/contratacao')) return '/perfil/contratacao';
    if (path.endsWith('/perfil/formal')) return '/perfil/formal';
    return '/';
  }

  private obterBasePath(): string {
    const path = window.location.pathname;
    const routeSuffixes = ['/perfil/operacional', '/perfil/contratacao', '/perfil/formal'];

    for (const suffix of routeSuffixes) {
      if (path.endsWith(suffix)) {
        const base = path.slice(0, -suffix.length);
        return base.endsWith('/') ? base.slice(0, -1) : base;
      }
    }

    if (path === '/') return '';
    return path.endsWith('/') ? path.slice(0, -1) : path;
  }

  private aplicarRota(path: string): void {
    const dashboard = document.querySelector('.dashboard-section') as HTMLElement | null;
    const portfolio = document.getElementById('portfolioSection');
    const perfis = document.getElementById('perfisGestaoSection');
    const listaGeral = document.getElementById('listaGeralSection');
    const operacional = document.getElementById('perfilOperacionalPage');
    const contratacao = document.getElementById('perfilContratacaoPage');
    const formal = document.getElementById('perfilFormalPage');

    const show = (el: Element | null, visible: boolean): void => {
      if (!el) return;
      (el as HTMLElement).style.display = visible ? 'block' : 'none';
    };

    const isHome = path === '/';
    show(dashboard, isHome);
    show(portfolio, isHome);
    show(perfis, isHome);

    // Lista Geral sai da navegação principal.
    show(listaGeral, false);

    show(operacional, path === '/perfil/operacional');
    show(contratacao, path === '/perfil/contratacao');
    show(formal, path === '/perfil/formal');
  }

  private aplicarFiltrosImoveis(): void {
    console.log('🔍 Aplicando filtros de imóveis...');
    
    const filtroContrato = (document.getElementById('filtroContrato') as HTMLInputElement)?.value.toLowerCase() || '';
    const filtroUtilizacao = (document.getElementById('filtroUtilizacao') as HTMLSelectElement)?.value || '';
    const filtroStatus = (document.getElementById('filtroStatus') as HTMLSelectElement)?.value || '';
    const filtroDenominacao = (document.getElementById('filtroDenominacao') as HTMLInputElement)?.value.toLowerCase() || '';
    const filtroDataInicio = (document.getElementById('filtroDataInicio') as HTMLInputElement)?.value || '';
    const filtroDataFim = (document.getElementById('filtroDataFim') as HTMLInputElement)?.value || '';

    this.imoveis = this.imoveisOriginais.filter(imovel => {
      // Filtro por código de contrato
      if (filtroContrato && !imovel.codigo.toLowerCase().includes(filtroContrato)) {
        return false;
      }

      // Filtro por utilização
      if (filtroUtilizacao && imovel.utilizacaoPrincipal !== filtroUtilizacao) {
        return false;
      }

      // Filtro por status
      if (filtroStatus) {
        const statusMap: { [key: string]: string } = {
          'Ativo': 'ativo',
          'Em Prospecção': 'prospeccao',
          'Em Mobilização': 'mobilizacao',
          'Em Desmobilização': 'desmobilizacao',
          'Desativado': 'desativado'
        };
        if (imovel.status !== statusMap[filtroStatus]) {
          return false;
        }
      }

      // Filtro por denominação
      if (filtroDenominacao && !imovel.denominacao.toLowerCase().includes(filtroDenominacao)) {
        return false;
      }

      // Filtro por data (se fimValidade estiver disponível)
      if (filtroDataInicio || filtroDataFim) {
        if (imovel.fimValidade) {
          // Converter dd/mm/aaaa para Date
          const [dia, mes, ano] = imovel.fimValidade.split('/');
          const dataValidade = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));

          if (filtroDataInicio) {
            const dataInicio = new Date(filtroDataInicio);
            if (dataValidade < dataInicio) return false;
          }

          if (filtroDataFim) {
            const dataFim = new Date(filtroDataFim);
            if (dataValidade > dataFim) return false;
          }
        } else {
          // Se não tem data de validade, não passa no filtro de data
          if (filtroDataInicio || filtroDataFim) return false;
        }
      }

      return true;
    });

    this.currentPageImoveis = 1;
    this.atualizarTabelaImoveis();
    this.atualizarDashboard();
    
    console.log(`✅ Filtros aplicados: ${this.imoveis.length} imóveis encontrados`);
  }

  private limparFiltrosImoveis(): void {
    // Limpar todos os campos
    const filtroContrato = document.getElementById('filtroContrato') as HTMLInputElement;
    const filtroUtilizacao = document.getElementById('filtroUtilizacao') as HTMLSelectElement;
    const filtroStatus = document.getElementById('filtroStatus') as HTMLSelectElement;
    const filtroDenominacao = document.getElementById('filtroDenominacao') as HTMLInputElement;
    const filtroDataInicio = document.getElementById('filtroDataInicio') as HTMLInputElement;
    const filtroDataFim = document.getElementById('filtroDataFim') as HTMLInputElement;

    if (filtroContrato) filtroContrato.value = '';
    if (filtroUtilizacao) filtroUtilizacao.value = '';
    if (filtroStatus) filtroStatus.value = '';
    if (filtroDenominacao) filtroDenominacao.value = '';
    if (filtroDataInicio) filtroDataInicio.value = '';
    if (filtroDataFim) filtroDataFim.value = '';

    // Restaurar todos os imóveis
    this.imoveis = [...this.imoveisOriginais];
    this.currentPageImoveis = 1;
    this.atualizarTabelaImoveis();
    this.atualizarDashboard();
    
    console.log('🧹 Filtros limpos');
  }

  private atualizarDashboard(): void {
    const stats = this.calcularEstatisticas();
    
    // Atualizar cards do dashboard
    this.setElementText('totalImoveis', stats.totalImoveis.toString());
    this.setElementText('imoveisAtivos', stats.imoveisAtivos.toString());
    this.setElementText('imoveisProspeccao', stats.imoveisProspeccao.toString());
    this.setElementText('imoveisMobilizacao', stats.imoveisMobilizacao.toString());
    this.setElementText('imoveisDesmobilizacao', stats.imoveisDesmobilizacao.toString());

    // Relatório de cobertura dos cenários A–D
    this.atualizarCoberturaCenarios();
  }

  private calcularEstatisticas(): DashboardStats {
    return {
      totalImoveis: this.imoveis.length,
      imoveisAtivos: this.imoveis.filter(i => i.status === 'ativo').length,
      imoveisProspeccao: this.imoveis.filter(i => i.status === 'prospeccao').length,
      imoveisMobilizacao: this.imoveis.filter(i => i.status === 'mobilizacao').length,
      imoveisDesmobilizacao: this.imoveis.filter(i => i.status === 'desmobilizacao').length,
      totalLocadores: this.locadores.length
    };
  }

  /**
   * Atualiza a cobertura de cenários A–D na UI e loga no console
   */
  private atualizarCoberturaCenarios(): void {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    const scenarioLetters = ['A','B','C','D'];
    this.imoveis.forEach(imo => {
      const idx = this.extrairIndiceImovel(imo.id);
      if (idx !== null) {
        const s = scenarioLetters[idx % scenarioLetters.length];
        counts[s] = (counts[s] || 0) + 1;
      }
    });

    const covEl = document.getElementById('cenariosCoverage');
    if (covEl) {
      covEl.innerHTML = '';
      scenarioLetters.forEach(letter => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = `${letter}: ${counts[letter]}`;
        covEl.appendChild(chip);
      });
    }

    console.log(`📊 Cobertura de cenários A–D: A=${counts.A}, B=${counts.B}, C=${counts.C}, D=${counts.D}`);
  }

  /**
   * Extrai o índice numérico a partir de ids no formato 'imo-<n>'
   */
  private extrairIndiceImovel(id: string): number | null {
    const m = id.match(/^imo-(\d+)$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (Number.isNaN(n)) return null;
    return n - 1; // índice zero-based usado na geração
  }
}

// Removido bloco de protótipo temporário

// Função para voltar ao portal SILIC
export function voltarAoPortal(): void {
  const portalUrl = 'https://osvaldojeronymo.github.io/silic-portal-imoveis/';
  
  const referrer = document.referrer;
  const hasPortalParam = window.location.search.includes('from=portal');
  
  if (referrer.includes('silic-portal') || hasPortalParam) {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = portalUrl;
    }
  } else {
    window.location.href = portalUrl;
  }
}
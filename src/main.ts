import { Imovel, Locador, DashboardStats, VisualizationMode } from './types/index.js';
import { Utils } from './utils/index.js';
import { SAPDataLoader } from './utils/sapDataLoader.js';
import { labelCategoria, labelAcao, labelModalidade } from './labels.js';
import './styles/style.css';

/**
 * Classe principal do Sistema SILIC 2.0
 */
export class SistemaSILIC {
  private imoveis: Imovel[] = [];
  private imoveisOriginais: Imovel[] = []; // Lista completa sem filtros
  private locadores: Locador[] = [];
  private usandoDadosSAP = false;
  
  // Paginação
  private currentPage = 1;
  private itemsPerPage = 10;
  private currentPageImoveis = 1;
  private itemsPerPageImoveis = 10;
  private currentView: VisualizationMode = 'table';

  constructor() {
    this.usandoDadosSAP = false;
    this.carregarDadosDemo();
    this.configurarFiltrosImoveisImediato();
    this.configurarItemsPorPagina();
    this.atualizarTabelaImoveis();
    this.atualizarDashboard();
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
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      }
    ];

    this.imoveisOriginais = this.gerarImoveisDemo(100);
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

      out.push({
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
        fimRelacao: `31/12/${ano}`
      });
    }
    return out;
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
    const tbody = document.querySelector('.imoveis-table tbody');
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
    const modal = document.getElementById('modalDetalhes');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Abre o modal de detalhes do imóvel
   */
  private abrirModalDetalhes(imovelId: string): void {
    const imovel = this.imoveis.find(i => i.id === imovelId);
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

    // Inicializar aba de serviços com o imóvel atual
    this.inicializarAbaServicos(imovel);
  }

  /**
   * Preenche os dados do modal de detalhes
   */
  private preencherModalDetalhes(imovel: Imovel): void {
    // Título do modal
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
      modalTitle.textContent = `Detalhes`;
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
        const card = makeCard(label);
        card.onclick = () => {
          acaoSel = a;
          modalidadeSel = '';
          // Re-render para refletir seleção visual
          renderAcoes();
          renderModalidades();
          renderCenario();
          atualizarResumo();
        };
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
          tabContents[index].classList.add('active');
        }
      });
    });
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

    // Botão Anterior
    const btnAnterior = document.createElement('button');
    btnAnterior.innerHTML = '← Anterior';
    btnAnterior.disabled = this.currentPageImoveis === 1;
    btnAnterior.addEventListener('click', () => {
      if (this.currentPageImoveis > 1) {
        this.currentPageImoveis--;
        this.atualizarTabelaImoveis();
      }
    });
    paginationControls.appendChild(btnAnterior);

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

    // Botão Próximo
    const btnProximo = document.createElement('button');
    btnProximo.innerHTML = 'Próximo →';
    btnProximo.disabled = this.currentPageImoveis === totalPaginas;
    btnProximo.addEventListener('click', () => {
      if (this.currentPageImoveis < totalPaginas) {
        this.currentPageImoveis++;
        this.atualizarTabelaImoveis();
      }
    });
    paginationControls.appendChild(btnProximo);
  }

  private configurarItemsPorPagina(): void {
    const select = document.getElementById('imoveisPorPaginaSelect') as HTMLSelectElement | null;
    if (select) {
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
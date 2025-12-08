import { Imovel, Locador, DashboardStats, VisualizationMode, ContratoEdit, ImovelEdit, LocadorEdit } from './types/index.js';
import { Utils } from './utils/index.js';
import { SAPDataLoader } from './utils/sapDataLoader.js';
import './styles/style.css';

/**
 * Classe principal do Sistema SILIC 2.0
 */
export class SistemaSILIC {
  private imoveis: Imovel[] = [];
  private imoveisOriginais: Imovel[] = []; // Lista completa sem filtros
  private locadores: Locador[] = [];
  
  // Paginação
  private currentPage = 1;
  private itemsPerPage = 10;
  private currentPageImoveis = 1;
  private itemsPerPageImoveis = 10;
  
  private currentView: VisualizationMode = 'table';
  private usandoDadosSAP = false;
  private contratoEdits: Map<string, ContratoEdit> = new Map();
  private imovelEdits: Map<string, ImovelEdit> = new Map();
  private locadorEdits: Map<string, LocadorEdit> = new Map();

  constructor() {
    this.inicializar();
  }

  /**
   * Inicializa o sistema e configura event listeners
   */
  private inicializar(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupEventListeners();
        this.carregarDados();
      });
    } else {
      setTimeout(() => {
        this.setupEventListeners();
        this.carregarDados();
      }, 100);
    }
  }

  /**
   * Configura todos os event listeners
   */
  private setupEventListeners(): void {
    // Toggle de visualização
    this.addEventListenerSafe('viewTable', 'click', () => this.alterarVisualizacao('table'));
    this.addEventListenerSafe('viewCards', 'click', () => this.alterarVisualizacao('cards'));
    
    // Filtros e busca
    this.addEventListenerSafe('buscaLocador', 'input', () => this.filtrarLocadores());
    this.addEventListenerSafe('filtroTipo', 'change', () => this.filtrarLocadores());
    this.addEventListenerSafe('filtroStatus', 'change', () => this.filtrarLocadores());
    this.addEventListenerSafe('limparFiltros', 'click', () => this.limparFiltros());
    
    // Paginação de locadores
    this.addEventListenerSafe('itensPorPaginaSelect', 'change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.itemsPerPage = parseInt(target.value);
      this.currentPage = 1;
      this.atualizarListaLocadores();
    });

    // Paginação de imóveis
    this.addEventListenerSafe('imoveisPorPaginaSelect', 'change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.itemsPerPageImoveis = parseInt(target.value);
      this.currentPageImoveis = 1;
      this.atualizarTabelaImoveis();
    });

    // Máscara para CEP
    this.aplicarMascaraCEP();
    
    // Event listener para fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.fecharModalDetalhes();
      }
    });
    
    // Configurar filtros imediatamente
    this.configurarFiltrosImoveisImediato();
  }

  /**
   * Adiciona event listener de forma segura (verifica se elemento existe)
   */
  private addEventListenerSafe(elementId: string, event: string, handler: (e: Event) => void): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  /**
   * Carrega dados (tenta SAP primeiro, depois dados demo)
   */
  private async carregarDados(): Promise<void> {
    console.log('🔄 Iniciando carregamento de dados...');
    
    // Tenta carregar dados do SAP
    const dadosSAP = await SAPDataLoader.carregarDados();
    
    if (dadosSAP && dadosSAP.imoveis.length > 0) {
      // Usa dados do SAP
      this.imoveis = dadosSAP.imoveis;
      this.imoveisOriginais = [...dadosSAP.imoveis]; // Cópia para filtros
      this.locadores = dadosSAP.locadores;
      this.usandoDadosSAP = true;
      
      console.log('✅ Dados do SAP carregados!');
      console.log(SAPDataLoader.formatarInfo(dadosSAP));
      
      // Mostra notificação ao usuário
      this.mostrarNotificacao('✅ Dados do SAP carregados com sucesso!', 'success');
    } else {
      // Carrega dados demo
      console.log('📋 Carregando dados de demonstração...');
      this.carregarDadosDemo();
      this.usandoDadosSAP = false;
      
      this.mostrarNotificacao('📋 Usando dados de demonstração', 'info');
    }
    
    // Atualiza interface
    this.atualizarDashboard();
    this.atualizarTabelaImoveis();
    this.atualizarListaLocadores();
    this.configurarFiltrosImoveisImediato();
    
    // Atualiza indicador de fonte de dados
    this.atualizarIndicadorFonteDados();
  }

  /**
   * Atualiza indicador visual da fonte de dados
   */
  private atualizarIndicadorFonteDados(): void {
    const header = document.querySelector('.title-section');
    if (!header) return;
    
    // Remove indicador existente se houver
    const indicadorExistente = header.querySelector('.data-source-indicator');
    if (indicadorExistente) {
      indicadorExistente.remove();
    }
    
    // Cria novo indicador
    const indicador = document.createElement('div');
    indicador.className = 'data-source-indicator';
    indicador.style.cssText = `
      margin-top: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-block;
      ${this.usandoDadosSAP 
        ? 'background: #e8f5e9; color: #2e7d32;' 
        : 'background: #fff3e0; color: #f57c00;'}
    `;
    indicador.textContent = this.usandoDadosSAP 
      ? '🗂️ Dados do SAP' 
      : '📋 Dados Demo';
    
    const subtitle = header.querySelector('.subtitle');
    if (subtitle) {
      subtitle.after(indicador);
    }
  }

  /**
   * Mostra notificação temporária
   */
  private mostrarNotificacao(mensagem: string, tipo: 'success' | 'info' | 'warning' | 'error'): void {
    const cores = {
      success: { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' },
      info: { bg: '#e3f2fd', text: '#1565c0', border: '#2196f3' },
      warning: { bg: '#fff3e0', text: '#e65100', border: '#ff9800' },
      error: { bg: '#ffebee', text: '#c62828', border: '#f44336' }
    };
    
    const cor = cores[tipo];
    
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${cor.bg};
      color: ${cor.text};
      border-left: 4px solid ${cor.border};
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
      font-weight: 500;
    `;
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
      notificacao.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notificacao.remove(), 300);
    }, 5000);
  }

  /**
   * Carrega dados de demonstração
   */
  private carregarDadosDemo(): void {
    console.log('Iniciando carregamento de dados demo...');
    
    try {
      // Gerar exatamente 100 imóveis para demonstração
      console.log('Gerando imóveis...');
      this.imoveis = this.gerarImoveisDemo(100);
      this.imoveisOriginais = [...this.imoveis]; // Cópia para filtros
      console.log(`${this.imoveis.length} imóveis gerados`);
      
      if (!this.imoveis || this.imoveis.length === 0) {
        throw new Error('Falha na geração de imóveis');
      }
      
      console.log('Gerando locadores...');
      try {
        this.locadores = this.gerarLocadoresDemo();
        console.log(`${this.locadores ? this.locadores.length : 'null'} locadores gerados`);
      } catch (error) {
        console.error('Erro na geração de locadores:', error);
        this.locadores = this.gerarLocadoresBasicos();
      }
      
      console.log('Atualizando dashboard...');
      this.atualizarDashboard();
      
      console.log('Atualizando tabela...');
      this.atualizarTabelaImoveis();
      
      console.log('Configurando filtros...');
      this.configurarFiltrosImoveisImediato();
      
      console.log(`Sistema carregado com sucesso! ${this.imoveis.length} imóveis, ${this.locadores.length} locadores`);
      
    } catch (error) {
      console.error('Erro no carregamento de dados:', error);
    }
  }

  /**
   * Gera imóveis de demonstração
   */
  private gerarImoveisDemo(quantidade: number): Imovel[] {
    const cidades = [
      'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 
      'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia'
    ];

    const bairros = [
      'Centro', 'Vila Madalena', 'Copacabana', 'Ipanema', 'Leblon',
      'Savassi', 'Funcionários', 'Boa Viagem', 'Aldeota', 'Meireles'
    ];

    const tipos: Array<Imovel['tipo']> = ['residencial', 'comercial', 'terreno', 'industrial'];
    const status: Array<Imovel['status']> = ['ativo', 'prospeccao', 'mobilizacao', 'desmobilizacao'];

    const imoveis: Imovel[] = [];

    for (let i = 1; i <= quantidade; i++) {
      const cidade = cidades[Math.floor(Math.random() * cidades.length)];
      const bairro = bairros[Math.floor(Math.random() * bairros.length)];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const statusImovel = status[Math.floor(Math.random() * status.length)];
      
      // Gerar data de fim de validade variada (entre 2025 e 2030)
      const ano = 2025 + Math.floor(Math.random() * 6);
      const mes = Math.floor(Math.random() * 12) + 1;
      const dia = Math.floor(Math.random() * 28) + 1;
      const fimValidade = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
      
      const imovel: Imovel = {
        id: Utils.generateId(),
        codigo: `IM${String(i).padStart(4, '0')}`,
        denominacao: `CT - AG ${cidade.toUpperCase()}, ${this.getEstadoByCidade(cidade)}`,
        tipoContrato: 'Contrato de Locação - Imóveis',
        utilizacaoPrincipal: 'Próprio',
        fimValidade: fimValidade,
        endereco: `Rua ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}, ${Math.floor(Math.random() * 9999) + 1}`,
        bairro,
        cidade,
        cep: `${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        estado: this.getEstadoByCidade(cidade),
        tipo,
        status: statusImovel,
        area: Math.floor(Math.random() * 500) + 50,
        valor: Math.floor(Math.random() * 500000) + 100000,
        dataRegistro: new Date().toISOString(),
        caracteristicas: tipo === 'residencial' ? {
          quartos: Math.floor(Math.random() * 4) + 1,
          banheiros: Math.floor(Math.random() * 3) + 1,
          garagem: Math.floor(Math.random() * 3)
        } : undefined
      };

      imoveis.push(imovel);
    }

    return imoveis;
  }

  /**
   * Gera locadores de demonstração
   */
  private gerarLocadoresDemo(): Locador[] {
    const nomes = [
      'João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira',
      'Carlos Ferreira', 'Lucia Almeida', 'Roberto Lima', 'Fernanda Rodrigues'
    ];

    const empresas = [
      'Construtora ABC Ltda', 'Imobiliária XYZ S.A.', 'Incorporadora DEF',
      'Administradora GHI', 'Investimentos JKL'
    ];

    const locadores: Locador[] = [];

    // Pessoas físicas
    for (let i = 0; i < nomes.length; i++) {
      const locador: Locador = {
        id: Utils.generateId(),
        nome: nomes[i],
        tipo: 'fisica',
        documento: this.gerarCPF(),
        email: `${nomes[i].toLowerCase().replace(' ', '.')}@email.com`,
        telefone: this.gerarTelefone(),
        status: Math.random() > 0.1 ? 'ativo' : 'inativo',
        dataRegistro: new Date().toISOString()
      };
      locadores.push(locador);
    }

    // Pessoas jurídicas
    for (let i = 0; i < empresas.length; i++) {
      const locador: Locador = {
        id: Utils.generateId(),
        nome: empresas[i],
        tipo: 'juridica',
        documento: this.gerarCNPJ(),
        email: `contato@${empresas[i].toLowerCase().replace(/\s+/g, '').slice(0, 10)}.com.br`,
        telefone: this.gerarTelefone(),
        status: Math.random() > 0.1 ? 'ativo' : 'inativo',
        dataRegistro: new Date().toISOString()
      };
      locadores.push(locador);
    }

    return locadores;
  }

  /**
   * Gera locadores básicos como fallback
   */
  private gerarLocadoresBasicos(): Locador[] {
    return [
      {
        id: Utils.generateId(),
        nome: 'João Silva',
        tipo: 'fisica',
        documento: '123.456.789-01',
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      },
      {
        id: Utils.generateId(),
        nome: 'Construtora ABC Ltda',
        tipo: 'juridica', 
        documento: '12.345.678/0001-01',
        status: 'ativo',
        dataRegistro: new Date().toISOString()
      }
    ];
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

    // Configurar máscaras e regras dos campos de contrato
    this.configurarCamposContrato();

    // Configurar máscaras dos campos do imóvel
    this.configurarCamposImovel();

    // Configurar ação de salvar imóvel
    const btnSalvarImovel = document.getElementById('btnSalvarImovel');
    if (btnSalvarImovel) {
      btnSalvarImovel.addEventListener('click', () => this.salvarImovel(imovelId));
    }

    // Configurar máscaras/validações dos campos do locador
    this.configurarCamposLocador();

    // Configurar ação de salvar locador
    const btnSalvarLocador = document.getElementById('btnSalvarLocador');
    if (btnSalvarLocador) {
      btnSalvarLocador.addEventListener('click', () => this.salvarLocador(imovelId));
    }

    // Configurar ação de salvar contrato
    const btnSalvar = document.getElementById('btnSalvarContrato');
    if (btnSalvar) {
      btnSalvar.addEventListener('click', () => this.salvarContrato(imovelId));
    }
  }

  /**
   * Preenche os dados do modal de detalhes
   */
  private preencherModalDetalhes(imovel: Imovel): void {
    // Título do modal
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
      modalTitle.textContent = `Detalhes do Imóvel`;
    }

    // Tab Contrato (preenche valores iniciais)
    this.setInputValue('contratoNumero', '');
    this.setInputValue('contratoDenominacao', imovel.denominacao || `${imovel.endereco}, ${imovel.bairro}`);
    this.setInputValue('contratoTipoEdificio', '');
    this.setInputValue('contratoCriadoPor', '');
    this.setInputValue('contratoInicio', imovel.dataRegistro ? new Date(imovel.dataRegistro).toLocaleDateString('pt-BR') : '');
    this.setInputValue('contratoFimValidade', imovel.fimValidade || '');
    this.setInputValue('contratoRescisao', '');

    // Tab Imóvel (inputs) com preferências salvas
    const edits = this.imovelEdits.get(imovel.id);
    this.setInputValue('imovelCep', edits?.cep ?? imovel.cep ?? '');
    this.setInputValue('imovelEndereco', edits?.endereco ?? imovel.endereco ?? '');
    this.setInputValue('imovelNumero', edits?.numero ?? '');
    this.setInputValue('imovelBairro', edits?.bairro ?? imovel.bairro ?? '');
    this.setInputValue('imovelLocal', edits?.local ?? imovel.cidade ?? '');
    this.setInputValue('imovelUf', edits?.uf ?? imovel.estado ?? '');

    // Tab Locador (inputs) com preferências salvas
    const locadorEd = this.locadorEdits.get(imovel.id);
    const locador = this.locadores.find(l => l.id === imovel.id);
    this.setInputValue('locadorParceiro', locadorEd?.parceiro ?? '');
    this.setInputValue('locadorTipoIdFiscal', locadorEd?.tipoIdFiscal ?? (locador ? (locador.tipo === 'fisica' ? 'CPF' : 'CNPJ') : ''));
    this.setInputValue('locadorDenominacaoFuncao', locadorEd?.denominacaoFuncao ?? 'Proponente Credor');
    this.setInputValue('locadorInicioRelacao', locadorEd?.inicioRelacao ?? '');
    this.setInputValue('locadorFimRelacao', locadorEd?.fimRelacao ?? '');
    this.setInputValue('locadorNome', locadorEd?.nome ?? (locador?.nome || ''));
    this.setInputValue('locadorCep', locadorEd?.cep ?? '');
    this.setInputValue('locadorEndereco', locadorEd?.endereco ?? '');
    this.setInputValue('locadorNumero', locadorEd?.numero ?? '');
    this.setInputValue('locadorBairro', locadorEd?.bairro ?? '');
    this.setInputValue('locadorLocal', locadorEd?.local ?? '');
    this.setInputValue('locadorUf', locadorEd?.uf ?? '');
    this.setInputValue('locadorEmail', locadorEd?.email ?? (locador?.email || ''));
    this.setInputValue('locadorTelefoneFixo', locadorEd?.telefoneFixo ?? (locador?.telefone || ''));
    this.setInputValue('locadorTelefoneCelular', locadorEd?.telefoneCelular ?? '');
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

  private setInputValue(id: string, value: string): void {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = value || '';
  }

  private configurarCamposContrato(): void {
    const numero = document.getElementById('contratoNumero') as HTMLInputElement | null;
    const tipoEdificio = document.getElementById('contratoTipoEdificio') as HTMLInputElement | null;
    const criadoPor = document.getElementById('contratoCriadoPor') as HTMLInputElement | null;
    const inicio = document.getElementById('contratoInicio') as HTMLInputElement | null;
    const fim = document.getElementById('contratoFimValidade') as HTMLInputElement | null;
    const rescisao = document.getElementById('contratoRescisao') as HTMLInputElement | null;

    // Número do contrato: apenas dígitos, máximo 8
    if (numero) {
      numero.addEventListener('input', () => {
        numero.value = numero.value.replace(/\D/g, '').slice(0, 8);
      });
    }

    // Tipo de edifício: apenas dígitos, máximo 2
    if (tipoEdificio) {
      tipoEdificio.addEventListener('input', () => {
        tipoEdificio.value = tipoEdificio.value.replace(/\D/g, '').slice(0, 2);
      });
    }

    // Criado por: primeira letra + 6 dígitos (ex: C088576)
    if (criadoPor) {
      criadoPor.addEventListener('input', () => {
        const v = criadoPor.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const letra = v.replace(/[^A-Z]/g, '').slice(0, 1);
        const numeros = v.replace(/[^0-9]/g, '').slice(0, 6);
        criadoPor.value = `${letra}${numeros}`;
      });
    }

    // Datas: DD/MM/AAAA máscara simples
    const aplicarMascaraData = (input: HTMLInputElement) => {
      input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 8);
        if (v.length >= 5) input.value = `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4,8)}`;
        else if (v.length >= 3) input.value = `${v.slice(0,2)}/${v.slice(2,4)}`;
        else input.value = v;
      });
    };

    if (inicio) aplicarMascaraData(inicio);
    if (fim) aplicarMascaraData(fim);
    if (rescisao) aplicarMascaraData(rescisao);

    // Regra: Rescisão em fica vazio desabilitado até Fim da validade ser preenchido
    if (rescisao) {
      rescisao.disabled = true;
    }
    if (fim && rescisao) {
      const toggleRescisao = () => {
        rescisao.disabled = fim.value.trim().length === 0;
        if (rescisao.disabled) rescisao.value = '';
      };
      fim.addEventListener('input', toggleRescisao);
      toggleRescisao();
    }
  }

  private configurarCamposImovel(): void {
    const cep = document.getElementById('imovelCep') as HTMLInputElement | null;
    const numero = document.getElementById('imovelNumero') as HTMLInputElement | null;
    const uf = document.getElementById('imovelUf') as HTMLInputElement | null;

    if (cep) {
      cep.addEventListener('input', () => {
        let v = cep.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) cep.value = `${v.slice(0,5)}-${v.slice(5)}`;
        else cep.value = v;
      });
    }
    if (numero) {
      numero.addEventListener('input', () => {
        numero.value = numero.value.replace(/\D/g, '').slice(0, 6);
      });
    }
    if (uf) {
      uf.addEventListener('input', () => {
        uf.value = uf.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      });
    }
  }

  private configurarCamposLocador(): void {
    const cep = document.getElementById('locadorCep') as HTMLInputElement | null;
    const numero = document.getElementById('locadorNumero') as HTMLInputElement | null;
    const uf = document.getElementById('locadorUf') as HTMLInputElement | null;
    const fixo = document.getElementById('locadorTelefoneFixo') as HTMLInputElement | null;
    const celular = document.getElementById('locadorTelefoneCelular') as HTMLInputElement | null;
    const inicio = document.getElementById('locadorInicioRelacao') as HTMLInputElement | null;
    const fim = document.getElementById('locadorFimRelacao') as HTMLInputElement | null;

    if (cep) {
      cep.addEventListener('input', () => {
        let v = cep.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) cep.value = `${v.slice(0,5)}-${v.slice(5)}`;
        else cep.value = v;
      });
    }
    if (numero) {
      numero.addEventListener('input', () => {
        numero.value = numero.value.replace(/\D/g, '').slice(0, 6);
      });
    }
    if (uf) {
      uf.addEventListener('input', () => {
        uf.value = uf.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      });
    }
    if (fixo) {
      fixo.addEventListener('input', () => {
        let v = fixo.value.replace(/\D/g, '').slice(0, 10);
        // (00) 0000-0000
        if (v.length >= 7) fixo.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6,10)}`;
        else if (v.length >= 3) fixo.value = `(${v.slice(0,2)}) ${v.slice(2,6)}`;
        else fixo.value = v;
      });
    }
    if (celular) {
      celular.addEventListener('input', () => {
        let v = celular.value.replace(/\D/g, '').slice(0, 11);
        // (00) 00000-0000
        if (v.length >= 7) celular.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7,11)}`;
        else if (v.length >= 3) celular.value = `(${v.slice(0,2)}) ${v.slice(2,7)}`;
        else celular.value = v;
      });
    }
    const aplicarMascaraData = (input: HTMLInputElement) => {
      input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 8);
        if (v.length >= 5) input.value = `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4,8)}`;
        else if (v.length >= 3) input.value = `${v.slice(0,2)}/${v.slice(2,4)}`;
        else input.value = v;
      });
    };
    if (inicio) aplicarMascaraData(inicio);
    if (fim) aplicarMascaraData(fim);
  }

  private salvarLocador(imovelId: string): void {
    const parceiro = (document.getElementById('locadorParceiro') as HTMLInputElement | null)?.value || '';
    const tipoIdFiscal = (document.getElementById('locadorTipoIdFiscal') as HTMLInputElement | null)?.value || '';
    const denominacaoFuncao = (document.getElementById('locadorDenominacaoFuncao') as HTMLInputElement | null)?.value || '';
    const inicioRelacao = (document.getElementById('locadorInicioRelacao') as HTMLInputElement | null)?.value || '';
    const fimRelacao = (document.getElementById('locadorFimRelacao') as HTMLInputElement | null)?.value || '';
    const nome = (document.getElementById('locadorNome') as HTMLInputElement | null)?.value || '';
    const cep = (document.getElementById('locadorCep') as HTMLInputElement | null)?.value || '';
    const endereco = (document.getElementById('locadorEndereco') as HTMLInputElement | null)?.value || '';
    const numero = (document.getElementById('locadorNumero') as HTMLInputElement | null)?.value || '';
    const bairro = (document.getElementById('locadorBairro') as HTMLInputElement | null)?.value || '';
    const local = (document.getElementById('locadorLocal') as HTMLInputElement | null)?.value || '';
    const uf = (document.getElementById('locadorUf') as HTMLInputElement | null)?.value || '';
    const email = (document.getElementById('locadorEmail') as HTMLInputElement | null)?.value || '';
    const telefoneFixo = (document.getElementById('locadorTelefoneFixo') as HTMLInputElement | null)?.value || '';
    const telefoneCelular = (document.getElementById('locadorTelefoneCelular') as HTMLInputElement | null)?.value || '';

    const statusSalvar = document.getElementById('statusSalvarLocador');

    // Validações
    const obrigatorio = (v: string) => v.trim().length > 0;
    const cepOk = /^\d{5}-\d{3}$/.test(cep);
    const numeroOk = /^\d+$/.test(numero) || numero.trim().length === 0; // opcional
    const ufOk = /^[A-Z]{2}$/.test(uf);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.trim().length === 0; // opcional
    const fixoOk = /^\(\d{2}\) \d{4}-\d{4}$/.test(telefoneFixo) || telefoneFixo.trim().length === 0; // opcional
    const celularOk = /^\(\d{2}\) \d{5}-\d{4}$/.test(telefoneCelular) || telefoneCelular.trim().length === 0; // opcional
    const inicioOk = this.validarData(inicioRelacao, true);
    const fimOk = this.validarData(fimRelacao, true);

    this.mostrarErro('erroLocadorParceiro', !obrigatorio(parceiro));
    this.mostrarErro('erroLocadorTipoIdFiscal', !obrigatorio(tipoIdFiscal));
    this.mostrarErro('erroLocadorDenominacaoFuncao', !obrigatorio(denominacaoFuncao));
    this.mostrarErro('erroLocadorInicioRelacao', !inicioOk);
    this.mostrarErro('erroLocadorFimRelacao', !fimOk);
    this.mostrarErro('erroLocadorNome', !obrigatorio(nome));
    this.mostrarErro('erroLocadorCep', !cepOk);
    this.mostrarErro('erroLocadorEndereco', !obrigatorio(endereco));
    this.mostrarErro('erroLocadorNumero', !numeroOk);
    this.mostrarErro('erroLocadorBairro', !obrigatorio(bairro));
    this.mostrarErro('erroLocadorLocal', !obrigatorio(local));
    this.mostrarErro('erroLocadorUf', !ufOk);
    this.mostrarErro('erroLocadorEmail', !emailOk);
    this.mostrarErro('erroLocadorTelefoneFixo', !fixoOk);
    this.mostrarErro('erroLocadorTelefoneCelular', !celularOk);

    const ok = obrigatorio(parceiro) && obrigatorio(tipoIdFiscal) && obrigatorio(denominacaoFuncao)
      && inicioOk && fimOk && obrigatorio(nome) && cepOk && obrigatorio(endereco) && numeroOk
      && obrigatorio(bairro) && obrigatorio(local) && ufOk && emailOk && fixoOk && celularOk;

    if (!ok) {
      if (statusSalvar) {
        statusSalvar.textContent = 'Há erros nos campos.';
        (statusSalvar as HTMLElement).style.color = '#c62828';
        (statusSalvar as HTMLElement).style.display = 'inline';
        setTimeout(() => (statusSalvar as HTMLElement).style.display = 'none', 3000);
      }
      return;
    }

    this.locadorEdits.set(imovelId, {
      parceiro, tipoIdFiscal, denominacaoFuncao, inicioRelacao, fimRelacao, nome,
      cep, endereco, numero, bairro, local, uf, email, telefoneFixo, telefoneCelular
    });

    if (statusSalvar) {
      statusSalvar.textContent = 'Salvo com sucesso.';
      (statusSalvar as HTMLElement).style.color = '#2e7d32';
      (statusSalvar as HTMLElement).style.display = 'inline';
      setTimeout(() => (statusSalvar as HTMLElement).style.display = 'none', 2000);
    }
  }

  private salvarImovel(imovelId: string): void {
    const cep = (document.getElementById('imovelCep') as HTMLInputElement | null)?.value || '';
    const endereco = (document.getElementById('imovelEndereco') as HTMLInputElement | null)?.value || '';
    const numero = (document.getElementById('imovelNumero') as HTMLInputElement | null)?.value || '';
    const bairro = (document.getElementById('imovelBairro') as HTMLInputElement | null)?.value || '';
    const local = (document.getElementById('imovelLocal') as HTMLInputElement | null)?.value || '';
    const uf = (document.getElementById('imovelUf') as HTMLInputElement | null)?.value || '';

    const statusSalvar = document.getElementById('statusSalvarImovel');

    // Validações básicas
    const cepOk = /^\d{5}-\d{3}$/.test(cep);
    const enderecoOk = endereco.trim().length > 0;
    const numeroOk = /^\d+$/.test(numero) || numero.trim().length === 0; // número opcional
    const bairroOk = bairro.trim().length > 0;
    const localOk = local.trim().length > 0;
    const ufOk = /^[A-Z]{2}$/.test(uf);

    this.mostrarErro('erroImovelCep', !cepOk);
    this.mostrarErro('erroImovelEndereco', !enderecoOk);
    this.mostrarErro('erroImovelNumero', !numeroOk);
    this.mostrarErro('erroImovelBairro', !bairroOk);
    this.mostrarErro('erroImovelLocal', !localOk);
    this.mostrarErro('erroImovelUf', !ufOk);

    const ok = cepOk && enderecoOk && numeroOk && bairroOk && localOk && ufOk;
    if (!ok) {
      if (statusSalvar) {
        statusSalvar.textContent = 'Há erros nos campos.';
        (statusSalvar as HTMLElement).style.color = '#c62828';
        (statusSalvar as HTMLElement).style.display = 'inline';
        setTimeout(() => (statusSalvar as HTMLElement).style.display = 'none', 3000);
      }
      return;
    }

    this.imovelEdits.set(imovelId, { cep, endereco, numero, bairro, local, uf });

    if (statusSalvar) {
      statusSalvar.textContent = 'Salvo com sucesso.';
      (statusSalvar as HTMLElement).style.color = '#2e7d32';
      (statusSalvar as HTMLElement).style.display = 'inline';
      setTimeout(() => (statusSalvar as HTMLElement).style.display = 'none', 2000);
    }
  }

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

  private salvarContrato(imovelId: string): void {
    const numero = (document.getElementById('contratoNumero') as HTMLInputElement | null)?.value || '';
    const denominacao = (document.getElementById('contratoDenominacao') as HTMLInputElement | null)?.value || '';
    const tipoEdificio = (document.getElementById('contratoTipoEdificio') as HTMLInputElement | null)?.value || '';
    const criadoPor = (document.getElementById('contratoCriadoPor') as HTMLInputElement | null)?.value || '';
    const inicio = (document.getElementById('contratoInicio') as HTMLInputElement | null)?.value || '';
    const fimValidade = (document.getElementById('contratoFimValidade') as HTMLInputElement | null)?.value || '';
    const rescisao = (document.getElementById('contratoRescisao') as HTMLInputElement | null)?.value || '';

    // Validações
    let ok = true;
    const onlyDigits = (v: string) => v.replace(/\D/g, '');

    const numOk = onlyDigits(numero).length === 8;
    this.mostrarErro('erroContratoNumero', !numOk);
    ok = ok && numOk;

    const denomOk = denominacao.trim().length > 0;
    this.mostrarErro('erroContratoDenominacao', !denomOk);
    ok = ok && denomOk;

    const tipoOk = onlyDigits(tipoEdificio).length === 2;
    this.mostrarErro('erroContratoTipoEdificio', !tipoOk);
    ok = ok && tipoOk;

    const criadoOk = /^[A-Z]{1}\d{6}$/.test(criadoPor.toUpperCase());
    this.mostrarErro('erroContratoCriadoPor', !criadoOk);
    ok = ok && criadoOk;

    const inicioOk = this.validarData(inicio, true);
    this.mostrarErro('erroContratoInicio', !inicioOk);
    ok = ok && inicioOk;

    const fimOk = this.validarData(fimValidade, true);
    this.mostrarErro('erroContratoFimValidade', !fimOk);
    ok = ok && fimOk;

    const rescPermitido = fimValidade.trim().length > 0;
    const rescOk = rescPermitido ? this.validarData(rescisao, true) : rescisao.trim().length === 0;
    this.mostrarErro('erroContratoRescisao', !rescOk, rescPermitido ? 'Data inválida.' : 'Preencha Fim da validade para habilitar.');
    ok = ok && rescOk;

    const statusSalvar = document.getElementById('statusSalvarContrato');
    if (!ok) {
      if (statusSalvar) {
        statusSalvar.textContent = 'Há erros nos campos.';
        (statusSalvar as HTMLElement).style.color = '#c62828';
        (statusSalvar as HTMLElement).style.display = 'inline';
        setTimeout(() => (statusSalvar as HTMLElement).style.display = 'none', 3000);
      }
      return;
    }

    // Persistência em memória
    this.contratoEdits.set(imovelId, {
      numero: onlyDigits(numero),
      denominacao: denominacao.trim(),
      tipoEdificio: onlyDigits(tipoEdificio),
      criadoPor: criadoPor.toUpperCase(),
      inicio,
      fimValidade,
      rescisao
    });

    if (statusSalvar) {
      statusSalvar.textContent = 'Salvo com sucesso.';
      (statusSalvar as HTMLElement).style.color = '#2e7d32';
      (statusSalvar as HTMLElement).style.display = 'inline';
      setTimeout(() => (statusSalvar as HTMLElement).style.display = 'none', 2000);
    }
  }

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
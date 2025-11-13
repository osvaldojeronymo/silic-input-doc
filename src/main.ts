import { Imovel, Locador, DashboardStats, VisualizationMode } from './types/index.js';
import { Utils } from './utils/index.js';
import { SAPDataLoader } from './utils/sapDataLoader.js';

/**
 * Classe principal do Sistema SILIC 2.0
 */
export class SistemaSILIC {
  private imoveis: Imovel[] = [];
  private locadores: Locador[] = [];
  
  // Paginação
  private currentPage = 1;
  private itemsPerPage = 10;
  private currentPageImoveis = 1;
  private itemsPerPageImoveis = 10;
  
  private currentView: VisualizationMode = 'table';
  private usandoDadosSAP = false;

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
      
      const imovel: Imovel = {
        id: Utils.generateId(),
        codigo: `IM${String(i).padStart(4, '0')}`,
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
      
      // Data de vigência (se disponível)
      const vigencia = imovel.dataRegistro 
        ? new Date(imovel.dataRegistro).toLocaleDateString('pt-BR')
        : '-';

      tr.innerHTML = `
        <td>${imovel.codigo}</td>
        <td>${imovel.endereco}, ${imovel.bairro}</td>
        <td>${imovel.cidade} - ${imovel.estado}</td>
        <td style="text-transform: capitalize;">${imovel.tipo}</td>
        <td><span class="${badgeClass}">${this.formatarStatus(imovel.status)}</span></td>
        <td>${vigencia}</td>
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

    // Tab Contrato
    this.setElementText('detNumeroContrato', imovel.codigo);
    this.setElementText('detDenominacao', `${imovel.endereco}, ${imovel.bairro}`);
    this.setElementText('detTipoContrato', this.capitalize(imovel.tipo));
    this.setElementText('detDataInicio', imovel.dataRegistro 
      ? new Date(imovel.dataRegistro).toLocaleDateString('pt-BR')
      : ''
    );
    this.setElementText('detDataFim', '');
    this.setElementText('detParceiro', '');
    this.setElementText('detEnderecoContrato', imovel.endereco);
    this.setElementText('detNumeroEndereco', '');

    // Tab Imóvel
    this.setElementText('detCodPostal', imovel.cep);
    this.setElementText('detLocal', `${imovel.cidade} - ${imovel.estado}`);
    this.setElementText('detRua', imovel.endereco);
    this.setElementText('detBairro', imovel.bairro);
    this.setElementText('detCidade', imovel.cidade);
    this.setElementText('detEstado', imovel.estado);
    this.setElementText('detCep', imovel.cep);
    this.setElementText('detTipoEdificio', this.capitalize(imovel.tipo));
    this.setElementText('detArea', imovel.area ? `${imovel.area} m²` : '');
    this.setElementText('detValor', imovel.valor ? Utils.formatCurrency(imovel.valor) : '');

    // Tab Locador (se disponível)
    const locador = this.locadores.find(l => l.id === imovel.id);
    if (locador) {
      this.setElementText('detNomeLocador', locador.nome);
      this.setElementText('detCpfCnpj', locador.documento);
      this.setElementText('detTipoLocador', locador.tipo === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica');
      this.setElementText('detTelefone', locador.telefone || '');
      this.setElementText('detCelular', '');
      this.setElementText('detEmail', locador.email || '');
    } else {
      this.setElementText('detNomeLocador', '');
      this.setElementText('detCpfCnpj', '');
      this.setElementText('detTipoLocador', '');
      this.setElementText('detTelefone', '');
      this.setElementText('detCelular', '');
      this.setElementText('detEmail', '');
    }
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
  }

  private configurarFiltrosImoveisImediato(): void {
    // TODO: Implementar
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
import { Imovel, Locador, DashboardStats, VisualizationMode } from './types/index.js';
import { Utils } from './utils/index.js';

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
        this.carregarDadosDemo();
      });
    } else {
      setTimeout(() => {
        this.setupEventListeners();
        this.carregarDadosDemo();
      }, 100);
    }
  }

  /**
   * Configura todos os event listeners
   */
  private setupEventListeners(): void {
    // Botões principais
    this.addEventListenerSafe('btnNovoImovel', 'click', () => this.mostrarFormulario());
    this.addEventListenerSafe('adicionarImovel', 'click', () => this.adicionarImovel());
    this.addEventListenerSafe('limparFormulario', 'click', () => this.limparFormulario());
    this.addEventListenerSafe('adicionarLocador', 'click', () => this.adicionarLocador());
    
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
    const status: Array<Imovel['status']> = ['disponivel', 'ocupado', 'manutencao', 'vendido'];

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

  private atualizarTabelaImoveis(): void {
    // TODO: Implementar
  }

  private aplicarMascaraCEP(): void {
    const cepInput = document.getElementById('cep') as HTMLInputElement;
    if (cepInput) {
      Utils.applyMask(cepInput, 'cep');
    }
  }

  private fecharModalDetalhes(): void {
    // TODO: Implementar
  }

  private configurarFiltrosImoveisImediato(): void {
    // TODO: Implementar
  }

  private atualizarDashboard(): void {
    const stats = this.calcularEstatisticas();
    
    const totalElement = document.getElementById('totalImoveis');
    if (totalElement) {
      totalElement.textContent = stats.totalImoveis.toString();
    }
    
    // TODO: Implementar outras atualizações do dashboard
  }

  private calcularEstatisticas(): DashboardStats {
    return {
      totalImoveis: this.imoveis.length,
      imoveisDisponiveis: this.imoveis.filter(i => i.status === 'disponivel').length,
      imoveisOcupados: this.imoveis.filter(i => i.status === 'ocupado').length,
      imoveisManutencao: this.imoveis.filter(i => i.status === 'manutencao').length,
      imoveisVendidos: this.imoveis.filter(i => i.status === 'vendido').length,
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
import { Imovel, Locador, DashboardStats, VisualizationMode, ParticipacaoLocadorImovel, Pagamento, FormaPagamento, TermoAditivo, PainelVencimentosContrato } from './types/index.js';
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
  private painelVencimentos: PainelVencimentosContrato[] = [];
  private painelVencimentosFiltrado: PainelVencimentosContrato[] = [];
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
    this.inicializarPainelVencimentos();
    this.configurarFiltrosImoveisImediato();
    this.configurarExportacaoPortfolio();
    this.configurarPainelVencimentos();
    this.configurarItemsPorPagina();
    this.atualizarTabelaImoveis();
    this.atualizarDashboard();
    this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
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
    this.configurarDrawersDetalhes();

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

  private configurarPainelVencimentos(): void {
    this.addEventListenerSafe('painelBuscarBtn', 'click', () => this.aplicarFiltrosPainelVencimentos());
    this.addEventListenerSafe('painelLimparBtn', 'click', () => this.limparFiltrosPainelVencimentos());
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
    this.atualizarPainelVencimentos(this.painelVencimentosFiltrado);
  }

  private atualizarPainelVencimentos(dados: PainelVencimentosContrato[]): void {
    const tbody = document.getElementById('painelVencimentosBody') as HTMLTableSectionElement | null;
    const resumo = document.getElementById('painelResumo');
    if (!tbody) return;

    tbody.innerHTML = '';

    dados.forEach((item) => {
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

    if (resumo) {
      const qtd = dados.length;
      const pendentes = dados.filter((d) => d.conciliacaoStatus === 'pendente_conciliacao').length;
      const d30 = dados.filter((d) => typeof d.diasParaVencimento === 'number' && d.diasParaVencimento <= 30).length;
      resumo.textContent = `${qtd} contrato(s) no painel • ${pendentes} pendente(s) de conciliação • ${d30} em janela D-30`;
    }
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
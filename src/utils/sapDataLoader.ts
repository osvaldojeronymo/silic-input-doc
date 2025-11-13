import { Imovel, Locador } from '../types/index.js';

/**
 * Interface para os dados importados do SAP
 */
interface DadosSAP {
  imoveis: Imovel[];
  locadores: Locador[];
  metadados: {
    dataImportacao: string;
    fonte: string;
    totalImoveis: number;
    totalLocadores: number;
  };
}

/**
 * Classe para gerenciar importação de dados do SAP
 */
export class SAPDataLoader {
  private static readonly DATA_PATH = '/show-input-doc/dados-sap.json';

  /**
   * Carrega dados do arquivo JSON gerado a partir do SAP
   */
  static async carregarDados(): Promise<DadosSAP | null> {
    try {
      console.log('🔄 Carregando dados do SAP...');
      
      const response = await fetch(this.DATA_PATH);
      
      if (!response.ok) {
        console.warn('⚠️ Arquivo de dados SAP não encontrado. Usando dados demo.');
        return null;
      }

      const dados: DadosSAP = await response.json();
      
      console.log('✅ Dados do SAP carregados com sucesso!');
      console.log(`   📊 ${dados.metadados.totalImoveis} imóveis`);
      console.log(`   👥 ${dados.metadados.totalLocadores} locadores`);
      console.log(`   📅 Importação: ${new Date(dados.metadados.dataImportacao).toLocaleString('pt-BR')}`);
      
      return dados;
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do SAP:', error);
      return null;
    }
  }

  /**
   * Verifica se existem dados do SAP disponíveis
   */
  static async temDadosDisponiveis(): Promise<boolean> {
    try {
      const response = await fetch(this.DATA_PATH, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Retorna estatísticas dos dados carregados
   */
  static obterEstatisticas(dados: DadosSAP): {
    totalImoveis: number;
    porTipo: Record<string, number>;
    porStatus: Record<string, number>;
    totalLocadores: number;
    porTipoLocador: Record<string, number>;
  } {
    const stats = {
      totalImoveis: dados.imoveis.length,
      porTipo: {} as Record<string, number>,
      porStatus: {} as Record<string, number>,
      totalLocadores: dados.locadores.length,
      porTipoLocador: {} as Record<string, number>
    };

    // Estatísticas de imóveis
    dados.imoveis.forEach(imovel => {
      stats.porTipo[imovel.tipo] = (stats.porTipo[imovel.tipo] || 0) + 1;
      stats.porStatus[imovel.status] = (stats.porStatus[imovel.status] || 0) + 1;
    });

    // Estatísticas de locadores
    dados.locadores.forEach(locador => {
      stats.porTipoLocador[locador.tipo] = (stats.porTipoLocador[locador.tipo] || 0) + 1;
    });

    return stats;
  }

  /**
   * Formata informações dos dados para exibição
   */
  static formatarInfo(dados: DadosSAP): string {
    const stats = this.obterEstatisticas(dados);
    
    let info = `📊 Dados do SAP (${dados.metadados.fonte})\n`;
    info += `📅 Importado em: ${new Date(dados.metadados.dataImportacao).toLocaleString('pt-BR')}\n\n`;
    
    info += `🏢 IMÓVEIS (${stats.totalImoveis} total):\n`;
    Object.entries(stats.porTipo).forEach(([tipo, count]) => {
      info += `   • ${tipo}: ${count}\n`;
    });
    
    info += `\n📈 STATUS:\n`;
    Object.entries(stats.porStatus).forEach(([status, count]) => {
      info += `   • ${status}: ${count}\n`;
    });
    
    info += `\n👥 LOCADORES (${stats.totalLocadores} total):\n`;
    Object.entries(stats.porTipoLocador).forEach(([tipo, count]) => {
      info += `   • ${tipo === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}: ${count}\n`;
    });
    
    return info;
  }
}

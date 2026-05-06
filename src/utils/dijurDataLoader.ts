interface DijurRegistro {
  imovel_sap: string;
  codigo_sijur: string;
  numero_processo_dijur: string;
  situacao_sijur: string;
  situacao_cefor: string;
  data_entrada_dijur?: string;
  partes_dijur?: string;
  last_sync_at?: string;
}

interface DijurPayload {
  registros: DijurRegistro[];
}

export class DIJURDataLoader {
  private static readonly DATA_PATH = '/silic-input-doc/dados-dijur.json';

  private static normalizarRegistro(registro: DijurRegistro | (Partial<DijurRegistro> & { contrato_sap?: string })): DijurRegistro {
    const contratoSapLegado = 'contrato_sap' in registro ? registro.contrato_sap : undefined;

    return {
      imovel_sap: String(registro.imovel_sap || contratoSapLegado || ''),
      codigo_sijur: registro.codigo_sijur || '',
      numero_processo_dijur: registro.numero_processo_dijur || '',
      situacao_sijur: registro.situacao_sijur || '',
      situacao_cefor: registro.situacao_cefor || '',
      data_entrada_dijur: registro.data_entrada_dijur,
      partes_dijur: registro.partes_dijur,
      last_sync_at: registro.last_sync_at
    };
  }

  static async carregarDados(): Promise<DijurRegistro[] | null> {
    try {
      const response = await fetch(this.DATA_PATH);
      if (!response.ok) {
        return null;
      }

      const payload = await response.json() as DijurPayload | Array<DijurRegistro | (Partial<DijurRegistro> & { contrato_sap?: string })>;
      if (Array.isArray(payload)) {
        return payload.map((registro) => this.normalizarRegistro(registro));
      }

      if (Array.isArray(payload.registros)) {
        return payload.registros.map((registro) => this.normalizarRegistro(registro));
      }

      return null;
    } catch {
      return null;
    }
  }
}

export type { DijurRegistro };
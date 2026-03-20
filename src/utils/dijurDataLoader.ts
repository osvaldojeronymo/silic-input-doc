interface DijurRegistro {
  contrato_sap: string;
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

  static async carregarDados(): Promise<DijurRegistro[] | null> {
    try {
      const response = await fetch(this.DATA_PATH);
      if (!response.ok) {
        return null;
      }

      const payload = await response.json() as DijurPayload | DijurRegistro[];
      if (Array.isArray(payload)) {
        return payload;
      }

      if (Array.isArray(payload.registros)) {
        return payload.registros;
      }

      return null;
    } catch {
      return null;
    }
  }
}

export type { DijurRegistro };
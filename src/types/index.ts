// Tipos para o sistema SILIC 2.0

export interface Imovel {
  id: string;
  codigo: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  estado: string;
  tipo: 'residencial' | 'comercial' | 'terreno' | 'industrial';
  status: 'ativo' | 'prospeccao' | 'mobilizacao' | 'desmobilizacao';
  area?: number;
  valor?: number;
  descricao?: string;
  fotos?: string[];
  caracteristicas?: {
    quartos?: number;
    banheiros?: number;
    garagem?: number;
    [key: string]: any;
  };
  locadorId?: string;
  dataRegistro: string;
  dataAtualizacao?: string;
}

export interface Locador {
  id: string;
  nome: string;
  tipo: 'fisica' | 'juridica';
  documento: string; // CPF ou CNPJ
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  status: 'ativo' | 'inativo';
  dataRegistro: string;
  dataAtualizacao?: string;
}

export interface FiltroImoveis {
  busca?: string;
  tipo?: string;
  status?: string;
  cidade?: string;
  valorMin?: number;
  valorMax?: number;
}

export interface FiltroLocadores {
  busca?: string;
  tipo?: string;
  status?: string;
}

export interface DashboardStats {
  totalImoveis: number;
  imoveisAtivos: number;
  imoveisProspeccao: number;
  imoveisMobilizacao: number;
  imoveisDesmobilizacao: number;
  totalLocadores: number;
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export type VisualizationMode = 'table' | 'cards';

// Eventos customizados
export interface SilicEventDetail {
  imovel?: Imovel;
  locador?: Locador;
  action?: string;
}

export interface SilicEvent extends CustomEvent {
  detail: SilicEventDetail;
}
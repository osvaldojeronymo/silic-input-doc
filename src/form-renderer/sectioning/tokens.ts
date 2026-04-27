import type { SectionConfig, SectionThemeTokens, ThemeKey } from './types';

export const SECTION_THEME_MAP: Record<ThemeKey, SectionThemeTokens> = {
  contract: {
    bgSoft: '#EAF3FF',
    border: '#8DB8FF',
    dot: '#2F6FED',
    badgeBg: '#DCEBFF',
    badgeText: '#123A74',
    title: '#123A74'
  },
  payment: {
    bgSoft: '#E7F8F5',
    border: '#7FD8C6',
    dot: '#1D9E84',
    badgeBg: '#D6F2EC',
    badgeText: '#0F5C4E',
    title: '#0F5C4E'
  },
  conditions: {
    bgSoft: '#FFF4E5',
    border: '#FFD08A',
    dot: '#C98500',
    badgeBg: '#FFE8C2',
    badgeText: '#7A4B00',
    title: '#7A4B00'
  },
  registry: {
    bgSoft: '#F3ECFF',
    border: '#C9AEFF',
    dot: '#7B4BC9',
    badgeBg: '#E7DAFF',
    badgeText: '#4E2D86',
    title: '#4E2D86'
  },
  attachments: {
    bgSoft: '#FFEDEA',
    border: '#FFB8AD',
    dot: '#E25D4F',
    badgeBg: '#FFDCD6',
    badgeText: '#8A2F27',
    title: '#8A2F27'
  }
};

export const FORM_SECTION_CONFIGS: SectionConfig[] = [
  {
    id: 'dados-contrato',
    key: 'contract-data',
    title: 'Dados do contrato',
    badgeLabel: 'Vigencia e valores',
    themeKey: 'contract',
    icon: 'calendar',
    order: 1,
    anchorId: 'sec-contrato',
    required: true,
    collapsible: true,
    defaultExpanded: true
  },
  {
    id: 'pagamento-reajuste',
    key: 'payment-adjustment',
    title: 'Pagamento e reajuste',
    badgeLabel: 'Financeiro recorrente',
    themeKey: 'payment',
    icon: 'currency',
    order: 2,
    anchorId: 'sec-pagamento',
    required: true,
    collapsible: true,
    defaultExpanded: true
  },
  {
    id: 'condicoes-contratuais',
    key: 'contract-conditions',
    title: 'Condicoes contratuais',
    badgeLabel: 'Clausulas e modalidade',
    themeKey: 'conditions',
    icon: 'document-check',
    order: 3,
    anchorId: 'sec-condicoes',
    required: true,
    collapsible: true,
    defaultExpanded: true
  },
  {
    id: 'alteracoes-cadastrais',
    key: 'registry-updates',
    title: 'Alteracoes cadastrais',
    badgeLabel: 'Titularidade e percentuais',
    themeKey: 'registry',
    icon: 'user-switch',
    order: 4,
    anchorId: 'sec-cadastro',
    required: false,
    collapsible: true,
    defaultExpanded: false
  },
  {
    id: 'anexos',
    key: 'attachments',
    title: 'Anexos',
    badgeLabel: 'Documentos obrigatorios',
    themeKey: 'attachments',
    icon: 'paperclip',
    order: 5,
    anchorId: 'sec-anexos',
    required: true,
    collapsible: true,
    defaultExpanded: true
  }
];

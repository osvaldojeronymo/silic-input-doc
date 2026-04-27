export type ThemeKey =
  | 'contract'
  | 'payment'
  | 'conditions'
  | 'registry'
  | 'attachments';

export type SectionStatus =
  | 'default'
  | 'active'
  | 'complete'
  | 'warning'
  | 'error'
  | 'disabled'
  | 'readonly';

export type SectionVariant = 'soft-header' | 'left-border';

export type IconName =
  | 'calendar'
  | 'currency'
  | 'document-check'
  | 'user-switch'
  | 'paperclip';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: 'warning' | 'error';
  fieldId?: string;
}

export interface SectionProgress {
  totalFields: number;
  filledFields: number;
  requiredFields: number;
  validRequiredFields: number;
}

export interface SectionThemeTokens {
  bgSoft: string;
  border: string;
  dot: string;
  badgeBg: string;
  badgeText: string;
  title: string;
}

export interface SectionConfig<TData = unknown> {
  id: string;
  key: string;
  title: string;
  badgeLabel: string;
  themeKey: ThemeKey;
  icon: IconName;
  order: number;
  anchorId: string;
  required?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  renderMode?: 'form' | 'review';
  data?: TData;
}

export interface SectionRuntimeState {
  status: SectionStatus;
  progress: SectionProgress;
  issues: ValidationIssue[];
  isExpanded: boolean;
  isVisible: boolean;
  isDirty: boolean;
}

export interface SectionCardProps<TData = unknown> {
  config: SectionConfig<TData>;
  state: SectionRuntimeState;
  tokens: SectionThemeTokens;
  variant: SectionVariant;
  onToggleExpand?: (sectionId: string, expanded: boolean) => void;
  onFocusSection?: (sectionId: string) => void;
  children?: React.ReactNode;
}

export interface LegendItem {
  sectionId: string;
  title: string;
  themeKey: ThemeKey;
  status: SectionStatus;
  completionPercent: number;
  pendingCount: number;
}

export interface SectionLegendProps {
  items: LegendItem[];
  activeSectionId?: string;
  onSelect: (sectionId: string) => void;
}

import { useMemo } from 'react';
import { SectionIcon } from './SectionIcon';
import type { SectionCardProps } from '../types';

function getStatusLabel(status: SectionCardProps['state']['status']) {
  switch (status) {
    case 'complete':
      return 'Completo';
    case 'warning':
      return 'Atencao';
    case 'error':
      return 'Erro';
    case 'readonly':
      return 'Somente leitura';
    case 'disabled':
      return 'Desabilitado';
    case 'active':
      return 'Ativo';
    default:
      return 'Em edicao';
  }
}

export function SectionCard({ config, state, tokens, variant, onFocusSection, children }: SectionCardProps) {
  const completionPercent = useMemo(() => {
    if (state.progress.totalFields <= 0) {
      return 0;
    }
    return Math.round((state.progress.filledFields / state.progress.totalFields) * 100);
  }, [state.progress.filledFields, state.progress.totalFields]);

  return (
    <article
      id={config.anchorId}
      className={`section-ui-card section-ui-${variant} is-${state.status}`}
      style={{
        ['--section-bg-soft' as string]: tokens.bgSoft,
        ['--section-border' as string]: tokens.border,
        ['--section-dot' as string]: tokens.dot,
        ['--section-badge-bg' as string]: tokens.badgeBg,
        ['--section-badge-text' as string]: tokens.badgeText,
        ['--section-title' as string]: tokens.title
      }}
      aria-labelledby={`${config.id}-title`}
    >
      <header className="section-ui-header">
        <button
          type="button"
          className="section-ui-title-wrap"
          onClick={() => onFocusSection?.(config.id)}
          aria-label={`Focar secao ${config.title}`}
        >
          <span className="section-ui-dot" aria-hidden="true" />
          <span className="section-ui-icon">
            <SectionIcon name={config.icon} />
          </span>
          <strong id={`${config.id}-title`} className="section-ui-title">
            {config.title}
          </strong>
        </button>
        <span className="section-ui-badge">{config.badgeLabel}</span>
      </header>

      <div className="section-ui-meta">
        <span className={`section-ui-status status-${state.status}`}>{getStatusLabel(state.status)}</span>
        <span className="section-ui-progress">{completionPercent}% completo</span>
      </div>

      <div className="section-ui-body">{children}</div>
    </article>
  );
}

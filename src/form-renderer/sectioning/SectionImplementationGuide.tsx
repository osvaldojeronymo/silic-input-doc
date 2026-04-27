import { useMemo, useState } from 'react';
import { SectionCard } from './components/SectionCard';
import { SectionLegend } from './components/SectionLegend';
import { FORM_SECTION_CONFIGS, SECTION_THEME_MAP } from './tokens';
import type { LegendItem, SectionRuntimeState, SectionStatus, SectionVariant } from './types';

const SECTION_STATUS_ORDER: SectionStatus[] = ['default', 'active', 'complete', 'warning', 'error'];

function buildDemoState(index: number, status: SectionStatus): SectionRuntimeState {
  const totalFields = 5 + index;
  const filled = Math.max(1, Math.min(totalFields, index + 2));
  const hasWarning = status === 'warning';
  const hasError = status === 'error';

  return {
    status,
    progress: {
      totalFields,
      filledFields: status === 'complete' ? totalFields : filled,
      requiredFields: 3,
      validRequiredFields: status === 'error' ? 2 : 3
    },
    issues: hasError
      ? [{ code: 'required-missing', message: 'Campo obrigatorio ausente', severity: 'error' }]
      : hasWarning
        ? [{ code: 'review', message: 'Revisar dado preenchido', severity: 'warning' }]
        : [],
    isExpanded: true,
    isVisible: true,
    isDirty: status !== 'default'
  };
}

interface SectionVariantPanelProps {
  variant: SectionVariant;
  title: string;
}

function SectionVariantPanel({ variant, title }: SectionVariantPanelProps) {
  const [activeSectionId, setActiveSectionId] = useState(FORM_SECTION_CONFIGS[0]?.id ?? '');

  const legendItems = useMemo<LegendItem[]>(() => {
    return FORM_SECTION_CONFIGS.map((config, index) => {
      const status = SECTION_STATUS_ORDER[index % SECTION_STATUS_ORDER.length];
      const runtime = buildDemoState(index, status);
      const completion = Math.round((runtime.progress.filledFields / runtime.progress.totalFields) * 100);
      return {
        sectionId: config.id,
        title: config.title,
        themeKey: config.themeKey,
        status,
        completionPercent: completion,
        pendingCount: runtime.issues.length
      };
    });
  }, []);

  return (
    <div className="section-ui-variant-panel">
      <h4>{title}</h4>
      <div className="section-ui-variant-content">
        <SectionLegend items={legendItems} activeSectionId={activeSectionId} onSelect={setActiveSectionId} />
        <div className="section-ui-list">
          {FORM_SECTION_CONFIGS.map((config, index) => {
            const status = SECTION_STATUS_ORDER[index % SECTION_STATUS_ORDER.length];
            const runtime = buildDemoState(index, config.id === activeSectionId ? 'active' : status);
            const tokens = SECTION_THEME_MAP[config.themeKey];

            return (
              <SectionCard
                key={`${variant}-${config.id}`}
                config={config}
                state={runtime}
                tokens={tokens}
                variant={variant}
                onFocusSection={setActiveSectionId}
              >
                <p>
                  Exemplo de conteudo da secao com contrato de props tipado. Campos podem ser renderizados
                  aqui por componentes de formulario reais.
                </p>
              </SectionCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SectionImplementationGuide() {
  return (
    <section className="section-ui-guide">
      <header>
        <h3>Guia tecnico de secoes</h3>
        <p>
          Assinaturas React prontas com duas variacoes visuais: cabecalho suave e barra lateral colorida.
        </p>
      </header>

      <div className="section-ui-grid">
        <SectionVariantPanel variant="soft-header" title="Variacao: soft-header" />
        <SectionVariantPanel variant="left-border" title="Variacao: left-border" />
      </div>
    </section>
  );
}

import { SECTION_THEME_MAP } from '../tokens';
import type { SectionLegendProps } from '../types';

export function SectionLegend({ items, activeSectionId, onSelect }: SectionLegendProps) {
  return (
    <nav className="section-ui-legend" aria-label="Mapa de secoes">
      <h3>Mapa do formulario</h3>
      <ul>
        {items.map((item) => {
          const tokens = SECTION_THEME_MAP[item.themeKey];
          const activeClass = activeSectionId === item.sectionId ? 'is-active' : '';
          return (
            <li key={item.sectionId}>
              <button
                type="button"
                className={`legend-item ${activeClass}`}
                onClick={() => onSelect(item.sectionId)}
              >
                <span className="legend-dot" style={{ backgroundColor: tokens.dot }} aria-hidden="true" />
                <span className="legend-title">{item.title}</span>
                <span className="legend-progress">{item.completionPercent}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

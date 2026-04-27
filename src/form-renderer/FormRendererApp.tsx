import { useCallback, useMemo, useRef, useState } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import ReactQuill from 'react-quill';
import { DndContext, DragOverlay, useDroppable, useDraggable } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { adaptedSchema } from './schemaAdapter';
import type { FieldMeta, SectionDescriptor } from './types';
import { FORM_SECTION_CONFIGS, SECTION_THEME_MAP, SectionCard } from './sectioning';
import type { IconName, SectionConfig, SectionRuntimeState, SectionVariant, ThemeKey } from './sectioning';
import 'react-quill/dist/quill.snow.css';
import './form-renderer.css';

const editorDropzoneId = 'form-renderer-editor';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2
});

function formatValue(field: FieldMeta, value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const type = field.tipo.toLowerCase();
  if (type === 'money') {
    const numberValue = typeof value === 'number' ? value : Number(value);
    return currencyFormatter.format(Number.isNaN(numberValue) ? 0 : numberValue);
  }

  if (type === 'percent') {
    const numberValue = typeof value === 'number' ? value : Number(value);
    const safeNumber = Number.isNaN(numberValue) ? 0 : numberValue;
    return `${safeNumber}%`;
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  if (type === 'date' && typeof value === 'string' && value.includes('-')) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return String(value);
}

interface ChipProps {
  field: FieldMeta;
  value: unknown;
  onInsert?: (field: FieldMeta) => void;
}

function SilicChip({ field, value, onInsert }: ChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: { field }
  });

  const chipStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      type="button"
      className={`silic-chip ${isDragging ? 'dragging' : ''}`}
      ref={setNodeRef}
      style={chipStyle}
      onClick={() => onInsert?.(field)}
      {...listeners}
      {...attributes}
    >
      <div className="silic-chip-label">{field.label}</div>
      <div className="silic-chip-value">{formatValue(field, value)}</div>
      <div className="silic-chip-meta">
        <span className="origin">{field.origin.toUpperCase()}</span>
        {field.tokens?.[0] && <span className="token">[{field.tokens[0]}]</span>}
      </div>
    </button>
  );
}

function ChipPreview({ field, value }: ChipProps) {
  return (
    <div className="silic-chip overlay">
      <div className="silic-chip-label">{field.label}</div>
      <div className="silic-chip-value">{formatValue(field, value)}</div>
    </div>
  );
}

interface SectionProps {
  section: SectionDescriptor;
  sectionIndex: number;
  sectionVariant: SectionVariant;
  formData: Record<string, unknown>;
  onChange: (partial: Record<string, unknown>) => void;
}

const themeCycle: ThemeKey[] = ['contract', 'payment', 'conditions', 'registry', 'attachments'];

const fallbackIconByTheme: Record<ThemeKey, IconName> = {
  contract: 'calendar',
  payment: 'currency',
  conditions: 'document-check',
  registry: 'user-switch',
  attachments: 'paperclip'
};

function hasFieldValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function resolveSectionConfig(section: SectionDescriptor, sectionIndex: number): SectionConfig {
  const mappedConfig = FORM_SECTION_CONFIGS.find(
    (item) => item.id === section.id || item.title === section.title
  );

  if (mappedConfig) {
    return mappedConfig;
  }

  const fallbackTheme = themeCycle[sectionIndex % themeCycle.length];

  return {
    id: section.id,
    key: section.id,
    title: section.title,
    badgeLabel: 'Secao de formulario',
    themeKey: fallbackTheme,
    icon: fallbackIconByTheme[fallbackTheme],
    order: sectionIndex + 1,
    anchorId: `secao-${section.id}`,
    required: true,
    collapsible: false,
    defaultExpanded: true
  };
}

function buildSectionState(section: SectionDescriptor, sectionData: Record<string, unknown>): SectionRuntimeState {
  const requiredFields = Array.isArray(section.schema.required) ? section.schema.required.length : 0;
  const validRequiredFields = Array.isArray(section.schema.required)
    ? section.schema.required.filter((fieldId) => hasFieldValue(sectionData[fieldId])).length
    : 0;
  const filledFields = section.fieldIds.filter((fieldId) => hasFieldValue(sectionData[fieldId])).length;
  const status = requiredFields > 0 && validRequiredFields === requiredFields ? 'complete' : 'default';

  return {
    status,
    progress: {
      totalFields: section.fieldIds.length,
      filledFields,
      requiredFields,
      validRequiredFields
    },
    issues: [],
    isExpanded: true,
    isVisible: true,
    isDirty: false
  };
}

function SectionForm({ section, sectionIndex, sectionVariant, formData, onChange }: SectionProps) {
  const sectionData = useMemo(() => {
    return section.fieldIds.reduce<Record<string, unknown>>((acc, fieldId) => {
      acc[fieldId] = formData[fieldId];
      return acc;
    }, {});
  }, [formData, section.fieldIds]);

  const sectionConfig = useMemo(
    () => resolveSectionConfig(section, sectionIndex),
    [section, sectionIndex]
  );

  const sectionState = useMemo(
    () => buildSectionState(section, sectionData),
    [section, sectionData]
  );

  const sectionTokens = SECTION_THEME_MAP[sectionConfig.themeKey];

  return (
    <SectionCard
      config={sectionConfig}
      state={sectionState}
      tokens={sectionTokens}
      variant={sectionVariant}
    >
      <Form
        schema={section.schema}
        uiSchema={section.uiSchema}
        formData={sectionData}
        validator={validator}
        showErrorList={false}
        liveValidate
        onChange={(event) => onChange(event.formData ?? {})}
      >
        <div className="hidden-submit" />
      </Form>
    </SectionCard>
  );
}

export function FormRendererApp() {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    () => ({ ...adaptedSchema.initialData })
  );
  const [editorContent, setEditorContent] = useState('<p>Monte o texto base do edital aqui…</p>');
  const [activeField, setActiveField] = useState<FieldMeta | null>(null);
  const [dragMode, setDragMode] = useState(
    adaptedSchema.dragModes[0] ?? 'inserir_variavel'
  );
  const [sectionVariant, setSectionVariant] = useState<SectionVariant>('soft-header');

  const quillRef = useRef<ReactQuill | null>(null);
  const { setNodeRef: setEditorDropRef, isOver } = useDroppable({
    id: editorDropzoneId
  });

  const handleSectionChange = useCallback((partial: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  }, []);

  const insertFieldIntoEditor = useCallback(
    (field: FieldMeta) => {
      const valueFromForm = formData[field.id];
      const insertion =
        dragMode === 'inserir_valor'
          ? String(valueFromForm ?? field.mockValue ?? '')
          : `[${field.tokens?.[0] ?? field.id}]`;
      const quill = quillRef.current?.getEditor();

      if (quill) {
        const selection = quill.getSelection(true);
        const index = selection ? selection.index : quill.getLength() - 1;
        quill.insertText(index, insertion);
        quill.setSelection(index + insertion.length, 0);
        setEditorContent(quill.root.innerHTML);
      } else {
        setEditorContent((prev) => `${prev}${insertion}`);
      }
    },
    [dragMode, formData]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const field = event.active.data.current?.field as FieldMeta | undefined;
    setActiveField(field ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const field = event.active.data.current?.field as FieldMeta | undefined;
      if (field && event.over?.id === editorDropzoneId) {
        insertFieldIntoEditor(field);
      }
      setActiveField(null);
    },
    [insertFieldIntoEditor]
  );

  const handleDragCancel = useCallback(() => {
    setActiveField(null);
  }, []);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="form-renderer">
        <header className="renderer-header">
          <div>
            <h1>Form Renderer – Gerador de Edital CAIXA</h1>
            <p>
              Selecione os campos do SILIC, edite o formulário nas seções e arraste/solte chips para
              preencher o texto-base do edital.
            </p>
          </div>
          <div className="renderer-controls">
            <div className="drag-mode-toggle">
              <span>Modo de inserção:</span>
              {adaptedSchema.dragModes.map((mode) => (
                <label key={mode}>
                  <input
                    type="radio"
                    value={mode}
                    checked={dragMode === mode}
                    onChange={() => setDragMode(mode)}
                  />
                  {mode === 'inserir_valor' ? 'Valor mockado' : 'Variável [TOKEN]'}
                </label>
              ))}
            </div>
            <div className="section-variant-toggle">
              <span>Visual das seções:</span>
              <label>
                <input
                  type="radio"
                  value="soft-header"
                  checked={sectionVariant === 'soft-header'}
                  onChange={() => setSectionVariant('soft-header')}
                />
                Header colorido
              </label>
              <label>
                <input
                  type="radio"
                  value="left-border"
                  checked={sectionVariant === 'left-border'}
                  onChange={() => setSectionVariant('left-border')}
                />
                Barra lateral
              </label>
            </div>
          </div>
        </header>

        <div className="renderer-columns">
          <section className="column column-preview">
            <h2>Coluna A · Formulário</h2>
            <div className="accordion-list">
              {adaptedSchema.sections.map((section, sectionIndex) => (
                <SectionForm
                  key={section.id}
                  section={section}
                  sectionIndex={sectionIndex}
                  sectionVariant={sectionVariant}
                  formData={formData}
                  onChange={handleSectionChange}
                />
              ))}
            </div>
          </section>

          <section
            className={`column column-editor ${isOver ? 'dropping' : ''}`}
            ref={setEditorDropRef}
          >
            <h2>Coluna B · Texto-base (TipTap/Quill)</h2>
            <p className="editor-hint">Arraste um chip e solte dentro do editor para inserir.</p>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={editorContent}
              onChange={setEditorContent}
              placeholder="Clique e comece a editar..."
            />
          </section>

          <section className="column column-chips">
            <h2>Coluna C · Dados SILIC</h2>
            <p>Arraste um campo para o editor ou clique para copiar o valor.</p>
            <div className="chips-list">
              {adaptedSchema.silicFields.map((field) => (
                <SilicChip
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onInsert={insertFieldIntoEditor}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <DragOverlay>
        {activeField ? (
          <ChipPreview field={activeField} value={formData[activeField.id]} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Both guide panes remain visible without JavaScript; GuideSetupScript selects one before paint.
import * as stylex from '@stylexjs/stylex';
import type {ReactNode} from 'react';
import {Step, Stepper} from '@astryxdesign/core/Stepper';
import {VStack} from '@astryxdesign/core/Layout';
import {outlineItems} from '../../markdown/outline';
import {useMessage} from '../../i18n/useMessage';
import {SPACE} from '../../theme/scale';
import {MarkdownBlock, SectionPage, type SectionPageProps} from '../section/SectionPage';
import type {GuidePanes, GuideStep} from '../../content/guides';

export type {GuidePanes, GuideStep} from '../../content/guides';

const styles = stylex.create({
  anchor: {
    scrollMarginTop: 'calc(var(--appshell-header-height, 0rem) + var(--spacing-6))',
    contain: 'inline-size',
  },
});

interface ProcedureStep {
  id?: string;
  title: string;
  description?: string;
  body?: ReactNode;
}

export function GuideProcedure({label, steps}: {label: string; steps: ReadonlyArray<ProcedureStep>}) {
  return (
    <Stepper activeStep={-1} orientation="vertical" label={label}>
      {steps.map((step, index) => (
        <Step key={step.id ?? index} step={index} label={step.title} description={step.description} indicator="number">
          <VStack id={step.id} gap={SPACE.code} xstyle={styles.anchor}>{step.body}</VStack>
        </Step>
      ))}
    </Stepper>
  );
}

export interface GuidePageProps extends Omit<SectionPageProps, 'body' | 'children'> {
  body: string;
  steps?: ReadonlyArray<GuideStep>;
  panes?: GuidePanes;
  setupAnchor?: string;
}

export const STEPS_MARKER = '<!-- steps -->';

export function GuidePage({steps = [], slots: sourceSlots = {}, body, panes, setupAnchor, ...page}: GuidePageProps) {
  const t = useMessage();
  const slots = setupAnchor == null ? sourceSlots : {
    ...sourceSlots,
    setup: <VStack id={setupAnchor} xstyle={styles.anchor}>{sourceSlots.setup as ReactNode}</VStack>,
  };
  const markdown = (source: string) => <MarkdownBlock locale={page.locale} pages={page.pages}>{source}</MarkdownBlock>;
  const procedure = {
    node: <GuideProcedure label={t('gz.start.steps')} steps={steps.map(step => ({...step, body: markdown(step.body)}))} />,
    outline: steps.flatMap(step => [{id: step.id, label: step.title, level: panes == null ? 2 : 3}, ...outlineItems(step.body)]),
  };
  if (panes != null) {
    const pane = (id: 'manual' | 'quick', label: string, content: ReactNode) => (
      // A plain box, since a Stack's display would override the `hidden` attribute that switches panes.
      <div id={id} role="tabpanel" aria-label={label} data-gz-pane={id} {...stylex.props(styles.anchor)}>
        <VStack gap={SPACE.code}>{content}</VStack>
      </div>
    );
    const setup = slots.setup as ReactNode;
    const tabbed = {
      node: (
        <VStack gap={SPACE.block}>
          {setup}
          {pane('manual', t('gz.guide.manual'), steps.length > 0 ? procedure.node : markdown(panes.manual ?? ''))}
          {pane('quick', t('gz.guide.quick'), markdown(panes.quick))}
        </VStack>
      ),
      outline: steps.length > 0 ? procedure.outline : [],
    };
    return <SectionPage {...page} body={body} slots={{...slots, setup: tabbed}} />;
  }
  return (
    <SectionPage
      {...page}
      body={steps.length === 0 || body.includes(STEPS_MARKER) ? body : `${body}\n\n${STEPS_MARKER}\n`}
      slots={{...slots, ...(steps.length === 0 ? {} : {steps: procedure})}}
    />
  );
}

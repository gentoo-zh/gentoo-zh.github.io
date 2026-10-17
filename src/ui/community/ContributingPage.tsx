// The contributing guide: Markdown, except that a run between `<!-- steps -->` and
// `<!-- /steps -->` becomes an Astryx Stepper. Each `### Label {#id}` inside the run starts a
// step; the Markdown under it (prose and code blocks) is the step's content.
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {VStack} from '@astryxdesign/core/Layout';
import {SPACE} from '../../theme/scale';
import {MarkdownBlock, SectionPage, type SectionPageProps} from '../section/SectionPage';

type Props = Omit<SectionPageProps, 'body' | 'children'> & {body: string};

function parseSteps(source: string, title: string) {
  const parts = source.split(/^### (.+?) \{#([a-z-]+)\}$/m);
  const steps = [];
  for (let index = 1; index < parts.length; index += 3) steps.push({label: parts[index], id: parts[index + 1], body: parts[index + 2].trim()});
  if (steps.length === 0) throw new Error(`${title}: a steps run without "### Label {#id}" headings`);
  return steps;
}

function Steps({steps, ...page}: {steps: ReturnType<typeof parseSteps>} & Pick<Props, 'locale' | 'pages' | 'title'>) {
  return (
    <Stepper orientation="vertical" activeStep={steps.length} label={page.title}>
      {steps.map((step, index) => (
        <Step key={step.id} step={index} label={step.label} indicator="number">
          <VStack id={step.id} gap={SPACE.code}>
            <MarkdownBlock locale={page.locale} pages={page.pages}>
              {step.body}
            </MarkdownBlock>
          </VStack>
        </Step>
      ))}
    </Stepper>
  );
}

export function ContributingPage({body, ...page}: Props) {
  const parts = body.split(/^<!-- (?:steps|\/steps) -->$/m);
  if (parts.length !== 3) throw new Error(`${page.title}: expected one steps run`);
  const steps = parseSteps(parts[1], page.title);
  return (
    <SectionPage
      {...page}
      body={`${parts[0]}<!-- slot:steps -->${parts[2]}`}
      slots={{
        steps: {
          node: <Steps steps={steps} locale={page.locale} pages={page.pages} title={page.title} />,
          outline: steps.map(step => ({id: step.id, label: step.label, level: 3})),
        },
      }}
    />
  );
}

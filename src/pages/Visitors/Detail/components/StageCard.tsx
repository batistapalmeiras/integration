// React
import { ReactNode } from 'react';
// Libs
import { LucideIcon } from 'lucide-react';
// Components
import { PanelTitle } from '../../../../components/Panel';
// Local
import { Eyebrow, Hint, StageIconTile, StageStack, StageSummary, StageSummaryTitle, StageSurface } from '../styles';

interface Summary {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface Props {
  title: string;
  summary: Summary;
  children?: ReactNode;
}

export function StageCard({ title, summary, children }: Props) {
  const Icon = summary.icon;

  return (
    <StageSurface>
      <StageStack>
        <div>
          <Eyebrow>Próximo passo</Eyebrow>
          <PanelTitle>{title}</PanelTitle>
        </div>
        <StageSummary>
          <StageIconTile>
            <Icon size={24} aria-hidden="true" />
          </StageIconTile>
          <div>
            <StageSummaryTitle>{summary.title}</StageSummaryTitle>
            <Hint>{summary.text}</Hint>
          </div>
        </StageSummary>
        {children}
      </StageStack>
    </StageSurface>
  );
}

// React
import { ReactNode } from 'react';
// Local
import icon from '../../assets/icon.png';
import {
  Body,
  BrandRow,
  PageTitle,
  Progress,
  ProgressSegment,
  Shell,
  StepCount,
  TopBar,
  TopBarInner,
  TopTitle,
} from './styles';

interface Props {
  title?: string;
  barTitle?: string;
  progress?: { current: number; total: number };
  children: ReactNode;
}

export function PublicPage({ title, barTitle = 'Igreja Batista Palmeiras', progress, children }: Props) {
  return (
    <Shell>
      <TopBar>
        <TopBarInner>
          <BrandRow>
            <img src={icon} alt="" />
            <TopTitle>{barTitle}</TopTitle>
            {progress && (
              <StepCount>
                Etapa {progress.current} de {progress.total}
              </StepCount>
            )}
          </BrandRow>
          {progress && (
            <Progress $steps={progress.total} aria-hidden>
              {Array.from({ length: progress.total }, (_, index) => (
                <ProgressSegment key={index} $done={index < progress.current} />
              ))}
            </Progress>
          )}
        </TopBarInner>
      </TopBar>
      <Body>
        {title && <PageTitle>{title}</PageTitle>}
        {children}
      </Body>
    </Shell>
  );
}

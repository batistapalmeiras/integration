// React
import { ReactNode } from 'react';
// Libs
import { Card } from 'bp-kit';
// Components
import { PanelTitle } from '../../../../components/Panel';
// Local
import { StageStack } from '../styles';

interface Props {
  title: string;
  children: ReactNode;
}

export function StageCard({ title, children }: Props) {
  return (
    <Card>
      <StageStack>
        <PanelTitle>{title}</PanelTitle>
        {children}
      </StageStack>
    </Card>
  );
}

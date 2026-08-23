// React
import { ReactNode } from 'react';
// Libs
import { Brand, Typography } from 'bp-kit';
// Local
import icon from '../../assets/icon.png';
import { Content, Header, Page } from './styles';

interface Props {
  title: string;
  children: ReactNode;
}

export function PublicPage({ title, children }: Props) {
  return (
    <Page>
      <Content>
        <Header>
          <Brand icon={icon} alt="Batista Palmeiras" name="Igreja Batista de Palmeiras" />
          <Typography type="h4">{title}</Typography>
        </Header>
        {children}
      </Content>
    </Page>
  );
}

// React
import { Link } from 'react-router-dom';
// Libs
import { Card, StatValue } from 'bp-kit';
import styled from 'styled-components';

export const Page = styled.div`
  container: dashboard / inline-size;
`;

export const Highlights = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};

  @container dashboard (max-width: 960px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @container dashboard (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @container dashboard (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const StatText = styled.div`
  flex: 1;
  min-width: 0;

  p {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
`;

export const AgendaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

export const HighlightValue = styled(StatValue)`
  font-size: ${({ theme }) => theme.typography.displayXl.fontSize};
`;

export const StageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @container dashboard (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Panel = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;

export const PanelText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.body};
`;

export const Detail = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const Columns = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const MainColumn = styled.div`
  flex: 999 1 460px;
  min-width: 0;
`;

export const SideColumn = styled.div`
  flex: 1 1 300px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const AgendaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const AgendaTitle = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const CardLink = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryActive};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.luxe};
  }
`;

export const BirthdaysPanel = styled(Panel)`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const BirthdayHeading = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  > a {
    margin-top: 0;
  }
`;

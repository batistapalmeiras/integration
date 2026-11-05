// Libs
import { Card, StatValue } from 'bp-kit';
import styled from 'styled-components';

export const Highlights = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const AgendaCell = styled.div`
  display: flex;
  flex-direction: column;

  > * {
    flex: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-column: span 2;
  }
`;

export const HighlightValue = styled(StatValue)`
  font-size: ${({ theme }) => theme.typography.displayXl.fontSize};
`;

export const StageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
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

export const AgendaDate = styled.span`
  flex: none;
  width: 48px;
  height: 52px;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.luxe};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
  font-size: 18px;
  font-weight: 700;

  small {
    font-size: ${({ theme }) => theme.typography.badge.fontSize};
    font-weight: 600;
    text-transform: uppercase;
  }
`;

export const AgendaTitle = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

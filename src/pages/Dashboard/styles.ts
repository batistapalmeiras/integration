// React
import { Link } from 'react-router-dom';
// Libs
import { Card, StatValue } from 'bp-kit';
import styled from 'styled-components';

export const Page = styled.div`
  container: dashboard / inline-size;
`;

export const Highlights = styled.div<{ $count: number; $minCardWidth: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count}, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};

  @container dashboard (max-width: ${({ $count, $minCardWidth }) => $count * $minCardWidth}px) {
    grid-template-columns: repeat(${({ $count }) => Math.ceil($count / 2)}, minmax(0, 1fr));
  }

  @container dashboard (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @container (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const StageLink = styled(Link)`
  display: flex;
  color: inherit;
  text-decoration: none;

  & > div {
    flex: 1;
    display: flex;
    align-items: center;
    transition: border-color 0.15s;
  }

  &:hover > div {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

export const StatText = styled.div<{ $singleLine?: boolean }>`
  flex: 1;
  min-width: 0;

  p {
    white-space: ${({ $singleLine }) => ($singleLine ? 'nowrap' : 'normal')};
    overflow: ${({ $singleLine }) => ($singleLine ? 'hidden' : 'visible')};
    text-overflow: ${({ $singleLine }) => ($singleLine ? 'ellipsis' : 'clip')};
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
  align-content: start;
  gap: ${({ theme }) => theme.spacing.md};

  @container (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

export const GeneralAdminGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'members' 'birthdays' 'agenda-title' 'agenda' 'title' 'funnel';
  gap: ${({ theme }) => theme.spacing.md};

  @container dashboard (min-width: 720px) {
    grid-template-columns: minmax(max-content, 1fr) minmax(0, 2fr);
    grid-template-areas:
      'members birthdays'
      'agenda-title title'
      'agenda funnel';
  }
`;

export const GridArea = styled.div<{ $area: string }>`
  grid-area: ${({ $area }) => $area};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;

  & > :first-child {
    flex: 1;
  }
`;

export const AreaTitle = styled(PanelTitle)<{ $area: string }>`
  grid-area: ${({ $area }) => $area};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const FunnelArea = styled.div`
  grid-area: funnel;
  container-type: inline-size;
  min-width: 0;
  display: flex;

  & > * {
    flex: 1;
  }
`;

export const StageStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ChurchCard = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.rounded.lg};
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
`;

export const ChurchCardIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: rgba(255, 255, 255, 0.2);
`;

export const ChurchCardLabel = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
`;

export const ChurchCardValue = styled.span`
  font-size: ${({ theme }) => theme.typography.displayXl.fontSize};
  font-weight: 700;
  line-height: 1.1;
`;

export const ChurchRecent = styled.span`
  margin: ${({ theme }) => theme.spacing.xs} 0 ${({ theme }) => theme.spacing.base};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 500;
`;

export const ChurchActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: auto;

  @container dashboard (min-width: 720px) {
    flex-wrap: nowrap;
  }
`;

export const ChurchButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.canvas};
  color: ${({ theme }) => theme.colors.luxe};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primarySoft};
  }
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

export const EnterArea = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const SpacedSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

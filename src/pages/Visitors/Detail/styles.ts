// Libs
import { Card, TabBar } from 'bp-kit';
import styled from 'styled-components';

export { Form } from 'bp-kit';

export const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'action' 'side' 'notes';
  gap: ${({ theme }) => theme.spacing.base};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: minmax(0, 1fr) 300px;
    grid-template-areas: 'action side' 'notes side';
    align-items: start;
  }
`;

export const ActionArea = styled.div`
  grid-area: action;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
  min-width: 0;
`;

export const SideArea = styled.div`
  grid-area: side;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing.base};
  }
`;

export const NotesArea = styled.div`
  grid-area: notes;
  min-width: 0;
`;

export const StatusLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const PersonCardRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
`;

export const PersonCardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const LessonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const LessonRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  white-space: nowrap;
`;

export const LessonMakeupAction = styled.span`
  margin-left: auto;
`;

export const SectionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

export const DetailLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const InfoBoxAction = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const Hint = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const SensitiveBlock = styled.div<{ $wide: boolean }>`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
`;

export const InfoTabBar = styled(TabBar)`
  margin-bottom: 0;
`;

export const SensitiveValue = styled.span<{ $muted?: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme, $muted }) => ($muted ? theme.colors.mutedSoft : theme.colors.ink)};
  font-style: ${({ $muted }) => ($muted ? 'italic' : 'normal')};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export const StepBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const CompactRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.xs};

  & > :first-child {
    flex: 1;
    min-width: 0;
  }

  & > :last-child {
    flex-shrink: 0;
    width: auto;
  }
`;

export const NoticeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const NoticeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`;

export const StageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
`;

export const StageSurface = styled(Card)`
  background: ${({ theme }) => theme.colors.primarySoft};
  border-color: ${({ theme }) => theme.colors.primaryDisabled};
`;

export const Eyebrow = styled.span`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primaryActive};
`;

export const StageSummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const StageIconTile = styled.span`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.rounded.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primaryDisabled};
  color: ${({ theme }) => theme.colors.primaryActive};
`;

export const StageSummaryTitle = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const StageNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.primaryDisabled};
  color: ${({ theme }) => theme.colors.muted};

  & > svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

export const FlagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

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

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.base};
`;

export const TimelineList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
`;

export const TimelineDot = styled.span`
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.primary};
`;

export const TimelineItem = styled.li<{ $spacious?: boolean }>`
  position: relative;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme, $spacious }) => ($spacious ? theme.spacing.xl : theme.spacing.base)};

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 16px;
    bottom: -1px;
    width: 2px;
    background: ${({ theme }) => theme.colors.hairline};
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

export const TimelineDate = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const TimelineLabel = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
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

export const TimelineDetail = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.mutedSoft};
`;

export const TimelineBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const TimelineHeadline = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const TimelineActor = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.muted};

  & > svg {
    align-self: center;
  }
`;

export const TimelineGap = styled.li`
  position: relative;
  display: flex;
  padding-bottom: ${({ theme }) => theme.spacing.base};

  &::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 0;
    bottom: -1px;
    width: 2px;
    background: ${({ theme }) => theme.colors.hairline};
  }
`;

export const GapDots = styled.span`
  position: relative;
  width: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 3px 0;
  background: ${({ theme }) => theme.colors.canvas};

  &::before,
  &::after {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: ${({ theme }) => theme.rounded.full};
    background: ${({ theme }) => theme.colors.primary};
  }

  & > span {
    width: 4px;
    height: 4px;
    border-radius: ${({ theme }) => theme.rounded.full};
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const ModalHeading = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

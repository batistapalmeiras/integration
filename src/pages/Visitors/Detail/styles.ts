// Libs
import { TabBar } from 'bp-kit';
import styled from 'styled-components';

export { Form } from 'bp-kit';

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};

  & > button {
    width: 100%;
  }
`;

export const Content = styled.div`
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
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

export const StagePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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

export const SectionDivider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  padding-top: ${({ theme }) => theme.spacing.xl};
`;

export const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const DetailRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.base};
`;

export const DetailLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const DetailValue = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 400;
  color: ${({ theme }) => theme.colors.ink};
  text-align: right;
`;


export const InfoBoxAction = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const SensitiveBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: ${({ theme }) => theme.spacing.base};

  &:first-child {
    margin-top: 0;
  }
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
`;

export const Steps = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const Step = styled.li`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const StepNumber = styled.span<{ $active: boolean }>`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.rounded.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: ${({ theme }) => theme.typography.microLabel.fontWeight};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surfaceStrong)};
  color: ${({ theme, $active }) => ($active ? theme.colors.onPrimary : theme.colors.muted)};
`;

export const StepBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

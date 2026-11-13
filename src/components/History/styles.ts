// Libs
import styled from 'styled-components';

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

export const EmptyText = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

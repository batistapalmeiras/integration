// Libs
import styled from 'styled-components';
// Components
import { IconBadge } from '../MenuOptions';

export const Item = styled.div<{ $empty: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: ${({ $empty }) => ($empty ? 400 : 600)};
  color: ${({ theme, $empty }) => ($empty ? theme.colors.mutedSoft : theme.colors.ink)};
`;

export const Badge = styled(IconBadge)<{ $empty: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.rounded.sm};

  ${({ $empty, theme }) => $empty && `background: ${theme.colors.surfaceStrong}; color: ${theme.colors.mutedSoft};`}

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 36px;
    height: 36px;
    border-radius: ${({ theme }) => theme.rounded.sm};
  }
`;

export const Body = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.muted};
`;

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.canvas};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: 14px;

  & > * {
    flex: 1 1 0;
    align-items: flex-start;
    padding: ${({ theme }) => theme.spacing.base};
  }

  & > * + * {
    border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: row;

    & > * + * {
      border-top: 0;
      border-left: 1px solid ${({ theme }) => theme.colors.hairline};
    }
  }
`;

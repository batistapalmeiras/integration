// Libs
import styled from 'styled-components';

export const Badge = styled.div`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.base} 0;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  color: ${({ theme }) => theme.colors.ink};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;

  svg {
    color: ${({ theme }) => theme.colors.muted};
    flex-shrink: 0;
  }
`;

const NARROW_SCREEN = '480px';
const VERY_NARROW_SCREEN = '400px';
const SMALLEST_SCREEN = '380px';

export const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${NARROW_SCREEN}) {
    flex-wrap: nowrap;
    gap: ${({ theme }) => theme.spacing.xs};

    & > * {
      flex-shrink: 0;
      gap: ${({ theme }) => theme.spacing.xs};
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      font-size: 13px;
      white-space: nowrap;
    }
  }

  @media (max-width: ${VERY_NARROW_SCREEN}) {
    & > * svg {
      display: none;
    }
  }

  @media (max-width: ${SMALLEST_SCREEN}) {
    & > * {
      font-size: 12px;
    }
  }
`;

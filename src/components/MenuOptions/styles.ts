// Libs
import { Card } from 'bp-kit';
import styled from 'styled-components';

export const OptionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: ${({ theme }) => theme.spacing.base};
  }
`;

export const OptionCard = styled(Card)<{ $disabled?: boolean }>`
  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${({ $disabled }) =>
    $disabled &&
    `
      cursor: default;
      opacity: 0.6;
    `}
`;

export const ComingSoonTag = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 2px;
  padding: 2px ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.surfaceStrong};
  color: ${({ theme }) => theme.colors.muted};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 600;
`;

export const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.base};
  }
`;

export const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme }) => `${theme.colors.primary}1f`};
  color: ${({ theme }) => theme.colors.primaryActive};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 48px;
    height: 48px;
    border-radius: ${({ theme }) => theme.rounded.md};
  }
`;

export const OptionLabel = styled.div`
  flex: 1;
`;

export const Chevron = styled.span`
  display: flex;
  color: ${({ theme }) => theme.colors.muted};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

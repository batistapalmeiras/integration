// Libs
import styled from 'styled-components';

export const MemberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.sm};
  }
`;

export const MemberCard = styled.div<{ $clickable: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

export const MemberCardName = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  line-height: 1.3;
  min-height: 2.6em;
  color: ${({ theme }) => theme.colors.ink};
`;

export const CoupleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CoupleCard = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ActiveFilters = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.base};
`;

export const RecentChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-right: auto;
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.ink};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.canvas};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  transition: background 0.15s;

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.muted};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }
`;

export const TopBar = styled.div<{ $scrolled: boolean }>`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: calc(-1 * (${({ theme }) => theme.spacing.lg} + env(safe-area-inset-top))) calc(-1 * var(--page-gutter, 0px))
    ${({ theme }) => theme.spacing.md};
  min-height: 64px;
  box-sizing: border-box;
  padding: calc(${({ theme }) => theme.spacing.sm} + env(safe-area-inset-top))
    calc(var(--page-gutter, 0px) + ${({ $scrolled }) => ($scrolled ? '0px' : 'var(--profile-reserve, 0px)')})
    ${({ theme }) => theme.spacing.sm} var(--page-gutter, 0px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 1px 0 ${({ theme, $scrolled }) => ($scrolled ? theme.colors.hairline : 'transparent')};

  @media (min-width: 745px) {
    margin-top: calc(-1 * ${({ theme }) => theme.spacing.xl});
    padding-top: ${({ theme }) => theme.spacing.sm};
  }
`;

export const BackLink = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0;
  border: none;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
`;

export const BarTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;

export const BarButton = styled.button<{ $outlined?: boolean }>`
  margin-left: auto;
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid ${({ theme, $outlined }) => ($outlined ? theme.colors.hairline : 'transparent')};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: transparent;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
`;

export const FilterCount = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 600;
`;

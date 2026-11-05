// Libs
import { Card } from 'bp-kit';
import styled from 'styled-components';

export const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const DesktopTitle = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

export const MenuSection = styled.section`
  & + & {
    margin-top: ${({ theme }) => theme.spacing.xl};
  }
`;

export const MenuSectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

export const MobileMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

export const MobileBrand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const MobileBrandLogo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

export const MobileBrandName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.primary};
`;

export const ProfileCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
`;

export const Avatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 700;
`;

export const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProfileName = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ProfileRole = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 2px;
`;

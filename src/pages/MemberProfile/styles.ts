// Libs
import styled from 'styled-components';
// Components
import { IconBadge } from '../../components/MenuOptions';

export const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 1040px;
`;

export const HeroText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  & > button {
    width: auto;
    padding: 0;
  }
`;

export const Community = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const CommunityItem = styled.span<{ $empty: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: ${({ $empty }) => ($empty ? 400 : 600)};
  color: ${({ theme, $empty }) => ($empty ? theme.colors.mutedSoft : theme.colors.ink)};
`;

export const CommunityBadge = styled(IconBadge)<{ $empty: boolean }>`
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

export const Columns = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};

  & > div {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.base};
    min-width: 0;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    align-items: start;
  }
`;

export const SideColumn = styled.div`
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing.base};
  }
`;

export const Fields = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.base} ${({ theme }) => theme.spacing.lg};
`;

export const Field = styled.div<{ $wide: boolean }>`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
`;

export const FieldLabel = styled.dt`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.muted};
`;

export const FieldValue = styled.dd<{ $empty: boolean }>`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  color: ${({ theme, $empty }) => ($empty ? theme.colors.mutedSoft : theme.colors.ink)};
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  a {
    color: ${({ theme }) => theme.colors.primaryActive};
    font-weight: 600;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export const RelativeLinks = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const LegacyNote = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.rounded.sm};
  background: ${({ theme }) => theme.colors.surfaceSoft};
`;

export const RecordInfo = styled.p`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.base};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

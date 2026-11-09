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

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.base};
  padding: 18px ${({ theme }) => theme.spacing.base};
  background: ${({ theme }) => theme.colors.canvas};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: 14px;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  & > button {
    width: auto;
    padding: 0;
    flex-shrink: 0;
  }
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
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

export const Notes = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;

  & > li {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: ${({ theme }) => theme.spacing.md} 0;
  }

  & > li:first-child {
    padding-top: 0;
  }

  & > li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  }
`;

export const NoteBody = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.ink};
  white-space: pre-wrap;
`;

export const NoteDate = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
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

export const ChildRows = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.sm};
`;

export const ChildRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 52px;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.xs}
    ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  color: ${({ theme }) => theme.colors.ink};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  }

  & > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  & > button {
    width: auto;
    flex-shrink: 0;
  }
`;

export const ChildPicker = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
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

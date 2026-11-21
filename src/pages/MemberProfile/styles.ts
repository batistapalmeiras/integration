// Libs
import styled from 'styled-components';
// Components
import { Fields } from '../../components/Panel';

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  & > button {
    width: auto;
    padding: 0;
  }
`;

export const RelativeGrid = styled(Fields)`
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
`;

export const GroupNameList = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
`;

export const GroupName = styled.span`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const MoreGroups = styled.button`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryActive};
  cursor: pointer;
`;

export const ChildLinks = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'photo status'
    'cards cards';
  align-items: center;
  gap: ${({ theme }) => theme.spacing.base};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-areas:
      'photo status'
      'photo cards';
    grid-template-rows: auto 1fr;
    align-items: start;
    row-gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const HeroStatus = styled(StatusRow)`
  grid-area: status;
  flex-wrap: wrap;
`;

export const HeroCards = styled.div`
  grid-area: cards;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const FlagDate = styled.span`
  display: block;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const PhotoButton = styled.button<{ $empty: boolean }>`
  grid-area: photo;
  position: relative;
  flex-shrink: 0;
  width: 104px;
  height: 104px;
  padding: 0;
  border: ${({ $empty, theme }) => ($empty ? `1.5px dashed ${theme.colors.borderStrong}` : 'none')};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const PhotoBadge = styled.span`
  position: absolute;
  right: -10px;
  bottom: -10px;
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.rounded.full};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.canvas};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  color: ${({ theme }) => theme.colors.ink};
`;

export const PhotoPreview = styled.div`
  display: flex;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.base} 0;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const PhotoActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};

  & > button {
    width: 100%;
    padding-left: ${({ theme }) => theme.spacing.sm};
    padding-right: ${({ theme }) => theme.spacing.sm};
  }
`;

export const ChecklistItems = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: ${({ theme }) => theme.spacing.base} 0 0;
  padding: 0;
  list-style: none;
`;

export const ChecklistItem = styled.li`
  padding: ${({ theme }) => theme.spacing.xs} 0;
`;

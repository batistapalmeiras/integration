// Libs
import styled from 'styled-components';
// Local
import { twoColumnsWhenRoom } from '../FormLayout';

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

export const ItemRows = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.sm};
`;

export const ItemRow = styled.li`
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

  & > :first-child {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  & > button {
    width: auto;
    flex-shrink: 0;
  }
`;

export const ItemPicker = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Fields = styled.dl`
  margin: 0;
  ${twoColumnsWhenRoom}
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


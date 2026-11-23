// Libs
import styled from 'styled-components';
// Local
import { List } from '../../components/List';

export const GroupCard = styled.section`
  margin-top: ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.canvas};
  overflow: hidden;
`;

export const GroupHeader = styled.header`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
`;

export const GroupTitle = styled.h3`
  flex: 1;
  min-width: 0;
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const GroupList = styled(List)`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: 0;
`;

export const TargetList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
`;

export const TargetOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  min-height: 48px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:last-child {
    border-bottom: 0;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }

  &[aria-checked='true'] {
    background: ${({ theme }) => theme.colors.primarySoft};
    font-weight: 600;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.muted};
    cursor: not-allowed;
  }

  & > svg {
    flex-shrink: 0;
  }
`;

export const CurrentTag = styled.span`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const GroupCell = styled.span`
  flex-shrink: 0;
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

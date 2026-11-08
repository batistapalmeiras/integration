// Libs
import styled from 'styled-components';

export const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

export const EmptySectionHint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const ModuleSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const ModuleTitle = styled.h2`
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairline};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
  color: ${({ theme }) => theme.colors.ink};
`;

export const DropZone = styled.div<{ $active: boolean; $accepts: boolean; $over: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: -${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px dashed
    ${({ $active, $accepts, $over, theme }) =>
      $over ? theme.colors.primary : $active && $accepts ? theme.colors.hairline : 'transparent'};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ $over, theme }) => ($over ? theme.colors.primarySoft : 'transparent')};
  opacity: ${({ $active, $accepts }) => ($active && !$accepts ? 0.45 : 1)};
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    opacity 0.15s ease;
`;

export const DragChip = styled.div`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme }) => theme.colors.canvas};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  cursor: grabbing;
`;

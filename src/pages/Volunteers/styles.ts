// Libs
import styled from 'styled-components';

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const FilterItem = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.base};
  border: 0;
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme, $active }) => ($active ? theme.gradients.primary : 'transparent')};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme, $active }) => ($active ? theme.colors.onPrimary : theme.colors.ink)};
  cursor: pointer;
  scroll-snap-align: center;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.gradients.primary : theme.colors.surfaceSoft)};
  }
`;

export const FilterCount = styled.span<{ $active: boolean }>`
  min-width: 22px;
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.rounded.full};
  background: ${({ theme, $active }) => ($active ? 'rgba(255, 255, 255, 0.28)' : theme.colors.surfaceSoft)};
  font-size: ${({ theme }) => theme.typography.captionSm.fontSize};
  font-weight: 600;
  text-align: center;
  color: ${({ theme, $active }) => ($active ? theme.colors.onPrimary : theme.colors.muted)};
`;

export const Modules = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
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

export const GroupCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.hairline};
  border-radius: ${({ theme }) => theme.rounded.md};
  background: ${({ theme }) => theme.colors.canvas};
  overflow: hidden;
`;

export const GroupLabel = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
`;

export const GroupToggle = styled.button<{ $open: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  min-height: 72px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.base};
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }

  & > svg:last-child {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.muted};
    transition: transform 0.15s;
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  }
`;

export const GroupName = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.titleMd.fontSize};
  font-weight: ${({ theme }) => theme.typography.titleMd.fontWeight};
`;

export const GroupBody = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export const PersonList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  }
`;

export const PersonRow = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  min-height: 56px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.base};
  border: 0;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMd.fontSize};
  color: ${({ theme }) => theme.colors.ink};
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceSoft};
  }
`;

export const PersonName = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const EmptySectionHint = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  color: ${({ theme }) => theme.colors.muted};
`;

export const DropZone = styled.div<{ $active: boolean; $accepts: boolean; $over: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
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

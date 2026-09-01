// Libs
import styled from 'styled-components';
// Local
import { DisplayStatusInput, getDisplayStatusMeta } from '../../types/person';

const Pill = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  white-space: nowrap;
  padding: 2px 10px;
  border-radius: ${({ theme }) => theme.rounded.full};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.badge.fontSize};
  font-weight: 600;

  ${({ $tone, theme }) => {
    switch ($tone) {
      case 'success':
        return `background: ${theme.colors.successSurface}; color: ${theme.colors.success}; border: 1px solid ${theme.colors.successBorder};`;
      case 'warning':
        return `background: ${theme.colors.warningSurface}; color: ${theme.colors.warning}; border: 1px solid ${theme.colors.warningBorder};`;
      case 'danger':
        return `background: ${theme.colors.surfaceSoft}; color: ${theme.colors.danger}; border: 1px solid ${theme.colors.hairline};`;
      case 'info':
        return `background: ${theme.colors.infoSurface}; color: ${theme.colors.info}; border: 1px solid ${theme.colors.infoBorder};`;
      default:
        return `background: ${theme.colors.surfaceSoft}; color: ${theme.colors.muted}; border: 1px solid ${theme.colors.hairline};`;
    }
  }}
`;

interface Props {
  person: DisplayStatusInput;
  // Lists/tables pass this to use the shorter label where one exists (e.g.
  // "Café" instead of "Café de Boas-vindas") — single-person views (the
  // Visitor detail PersonCard) omit it and get the full label.
  compact?: boolean;
}

export function StatusPill({ person, compact }: Props) {
  const meta = getDisplayStatusMeta(person);
  const Icon = meta.icon;
  const label = compact ? (meta.compactLabel ?? meta.label) : meta.label;
  return (
    <Pill $tone={meta.tone}>
      <Icon size={12} />
      {label}
    </Pill>
  );
}

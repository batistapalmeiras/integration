// Libs
import styled from 'styled-components';
// Local
import { PersonStatus, STATUS_META } from '../../types/person';

const Pill = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
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

export function StatusPill({ status }: { status: PersonStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Pill $tone={meta.tone}>
      <Icon size={12} />
      {meta.label}
    </Pill>
  );
}

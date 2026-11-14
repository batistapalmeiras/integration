// Libs
import styled from 'styled-components';

export const StickyBar = styled.div<{ $stuck: boolean }>`
  position: sticky;
  top: var(--sticky-top, 0px);
  z-index: 40;
  background: ${({ theme }) => theme.colors.canvas};
  margin-inline: calc(-1 * var(--page-gutter, 0px));
  padding-inline: var(--page-gutter, 0px);
  padding-block: ${({ $stuck, theme }) => ($stuck ? theme.spacing.sm : '0')};
  border-bottom: 1px solid ${({ $stuck, theme }) => ($stuck ? theme.colors.hairline : 'transparent')};
`;

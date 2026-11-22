// Libs
import styled, { css } from 'styled-components';

const PROFILE_ROW_HEIGHT = '48px';

export const ReserveProfile = styled.div<{ $profileSlot: boolean }>`
  padding-right: var(--profile-reserve, 0px);

  ${({ $profileSlot, theme }) =>
    $profileSlot &&
    css`
      display: flex;
      align-items: center;
      min-height: ${PROFILE_ROW_HEIGHT};
      margin-bottom: ${theme.spacing.md};

      && > * {
        flex: 1;
        min-width: 0;
        margin-bottom: 0;
      }
    `}
`;

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

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: 744px) {
    & > button:not([aria-label]) {
      width: 100%;
    }
  }
`;

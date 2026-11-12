// Libs
import styled from 'styled-components';
// Components
import { SIDEMENU_MEDIA } from '../Layout/styles/Layout';

export const Wrapper = styled.div`
  min-height: 85dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.base};
  text-align: center;
`;

export const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Action = styled.div`
  width: 100%;
  max-width: 320px;

  @media ${SIDEMENU_MEDIA} {
    display: none;
  }
`;

export const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.rounded.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surfaceStrong};
  color: ${({ theme }) => theme.colors.muted};
`;

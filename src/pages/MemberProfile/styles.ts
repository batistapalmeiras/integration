// Libs
import styled from 'styled-components';

export const HeroText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  & > button {
    width: auto;
    padding: 0;
  }
`;

export const AddressLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;


// Libs
import styled from 'styled-components';

export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ItemImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.rounded.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const ItemMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

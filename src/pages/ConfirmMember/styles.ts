// Libs
import styled from 'styled-components';
// Components
import { EndActions } from '../../components/FormLayout';

export const Actions = styled(EndActions)`
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
`;

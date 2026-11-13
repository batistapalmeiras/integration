// Libs
import { UserPlus } from 'lucide-react';
import styled from 'styled-components';
// Local
import { TonePill } from '../StatusPill';

const Flag = styled(TonePill)`
  align-self: flex-start;
  width: fit-content;
`;

export function DirectSignupFlag() {
  return (
    <Flag $tone="info" title="Fez o cadastro direto de membresia, sem passar pela Integração">
      <UserPlus size={12} aria-hidden="true" />
      Cadastro direto
    </Flag>
  );
}

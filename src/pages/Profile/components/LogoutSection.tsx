// Libs
import { Button } from 'bp-kit';
import { LogOut } from 'lucide-react';
import styled from 'styled-components';
// Local
import { useLogout } from '../../../features/access/useLogout';

const Section = styled.section`
  max-width: 560px;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
`;

export function LogoutSection() {
  const logout = useLogout();

  return (
    <Section aria-label="Sessão">
      <Button variant="secondary" size="lg" fullWidth onClick={logout}>
        <LogOut size={16} />
        Sair da conta
      </Button>
    </Section>
  );
}

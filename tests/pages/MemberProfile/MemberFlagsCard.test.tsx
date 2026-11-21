// Libs
import { screen } from '@testing-library/react';
// Local
import { MemberFlagsCard } from '../../../src/pages/MemberProfile/components/MemberFlagsCard';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

describe('member flags card', () => {
  it('explains the flag and tells when the member was flagged', () => {
    renderScreen(<MemberFlagsCard flags={[{ flag: 'absent', flaggedAt: '2026-11-16T15:00:00Z' }]} />, {
      role: UserRole.GeneralAdmin,
    });

    expect(screen.getByRole('note')).toHaveTextContent('Membro ausente');
    expect(screen.getByText('Está faltando com frequência e precisa de acompanhamento.')).toBeInTheDocument();
    expect(screen.getByText('Sinalizado em 16/11/2026')).toBeInTheDocument();
  });

  it('explains the members the general admin is following closely', () => {
    renderScreen(<MemberFlagsCard flags={[{ flag: 'attention', flaggedAt: '2026-11-20T15:00:00Z' }]} />, {
      role: UserRole.GeneralAdmin,
    });

    expect(screen.getByRole('note')).toHaveTextContent('Membro em atenção');
    expect(screen.getByText('Está passando por um momento delicado e precisa de acompanhamento próximo.')).toBeInTheDocument();
    expect(screen.getByText('Sinalizado em 20/11/2026')).toBeInTheDocument();
  });
});

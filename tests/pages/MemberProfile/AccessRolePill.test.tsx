// Libs
import { screen } from '@testing-library/react';
// Local
import { AccessRolePill } from '../../../src/pages/MemberProfile/components/AccessRolePill';
import { getPersonAccessRole } from '../../../src/repositories/profiles';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/repositories/profiles', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/repositories/profiles')>()),
  getPersonAccessRole: vi.fn(),
}));

describe('access role pill on the member screen', () => {
  it('says the role of a person who has access to the system', async () => {
    vi.mocked(getPersonAccessRole).mockResolvedValue(UserRole.IntegrationTeam);
    renderScreen(<AccessRolePill personId="person-1" />, { role: UserRole.GeneralAdmin });

    expect(await screen.findByText('Equipe de Integração')).toBeInTheDocument();
    expect(screen.getByTitle('Cargo no sistema')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows nothing for a person with no access', async () => {
    vi.mocked(getPersonAccessRole).mockResolvedValue(null);
    const { container } = renderScreen(<AccessRolePill personId="person-2" />, { role: UserRole.GeneralAdmin });

    await vi.waitFor(() => expect(getPersonAccessRole).toHaveBeenCalledWith('person-2'));
    expect(container).toBeEmptyDOMElement();
  });
});

// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { MembershipInterestPage } from '../../../src/pages/MembershipInterest';
import { MembershipInterestCheck } from '../../../src/repositories/publicForms';
import { renderScreen } from '../../support/render';

const found = (alreadySubmitted: boolean): MembershipInterestCheck => ({
  name: 'Ana Souza',
  alreadySubmitted,
  lessonsAttended: 4,
  lessonsTotal: 4,
  saved: {
    email: '',
    birthDate: '',
    gender: '',
    cpf: '',
    maritalStatus: '',
    otherPhone: '',
    zip: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    entryType: '',
    baptismChurch: '',
    baptismDate: '',
    originChurch: '',
    previousChurch: '',
    baptismInfo: '',
    maritalStatusStory: '',
    ministryInterests: [],
    wantsSmallGroup: '',
    smallGroupId: '',
    secretSociety: '',
    membershipNote: '',
  },
});

let next: MembershipInterestCheck = found(false);

vi.mock('../../../src/pages/MembershipInterest/components/IdentificationStep', () => ({
  IdentificationStep: ({ onFound }: { onFound: (phone: string, check: MembershipInterestCheck) => void }) => (
    <button type="button" onClick={() => onFound('31999990000', next)}>
      Entrar
    </button>
  ),
}));

vi.mock('../../../src/features/membershipForm', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  MembershipFormFlow: () => <p>Formulário aberto</p>,
}));

describe('membership interest page', () => {
  beforeEach(() => sessionStorage.clear());

  it('opens the form for someone who has not sent it yet', async () => {
    next = found(false);
    renderScreen(<MembershipInterestPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByText('Formulário aberto')).toBeInTheDocument();
  });

  it('does not let someone who already sent the form fill it in a second time', async () => {
    next = found(true);
    renderScreen(<MembershipInterestPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.queryByText('Formulário aberto')).not.toBeInTheDocument();
    expect(screen.getByText(/Recebemos sua ficha de interesse/)).toBeInTheDocument();
  });
});

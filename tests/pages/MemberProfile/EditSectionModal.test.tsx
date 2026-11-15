// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { MemberFlag } from '../../../src/domain/memberFlags';
import { MemberRecord } from '../../../src/domain/memberRecords';
import { MEMBER_RECORD_SECTIONS, saveRecord } from '../../../src/features/memberRecord';
import { EditSectionModal } from '../../../src/pages/MemberProfile/components/EditSectionModal';
import { saveMemberFlags } from '../../../src/repositories/memberFlags';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/features/memberRecord', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/features/memberRecord')>()),
  saveRecord: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../src/repositories/memberFlags', () => ({ saveMemberFlags: vi.fn().mockResolvedValue(undefined) }));

const record: MemberRecord = {
  name: 'Ana',
  phone: '',
  email: '',
  membershipStatus: 'active',
  birthDate: '',
  gender: '',
  maritalStatus: '',
  otherPhone: '',
  addressZip: '',
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressReference: '',
  cpf: '',
  baptismDate: '',
  baptismChurch: '',
  entryType: '',
  originChurch: '',
  councilId: '',
};

const membership = MEMBER_RECORD_SECTIONS.find((section) => section.id === 'membership')!;

const renderModal = (flags: MemberFlag[] = []) => {
  const close = vi.fn();
  renderScreen(
    <EditSectionModal
      personId="p1"
      record={record}
      section={membership}
      optionalPhone={false}
      flags={flags}
      close={close}
    />,
    { role: UserRole.Pastor },
  );
  return close;
};

describe('edit section modal', () => {
  afterEach(() => vi.clearAllMocks());

  it('flags an active member as absent without touching the record', async () => {
    const close = renderModal();

    expect(screen.getByRole('region', { name: 'Sinalizações' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Membro ausente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(saveMemberFlags).toHaveBeenCalledWith('p1', [], ['absent']);
    expect(saveRecord).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('drops the flag when the member is no longer active', async () => {
    renderModal(['absent']);

    expect(screen.getByRole('checkbox', { name: 'Membro ausente' })).toBeChecked();
    await userEvent.selectOptions(screen.getByRole('combobox'), 'removed');

    expect(screen.queryByRole('checkbox', { name: 'Membro ausente' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(saveRecord).toHaveBeenCalled();
    expect(saveMemberFlags).toHaveBeenCalledWith('p1', ['absent'], []);
  });
});

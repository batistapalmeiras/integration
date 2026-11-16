// Libs
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Local
import { MemberFlag } from '../../../src/domain/memberFlags';
import { MemberRecord } from '../../../src/domain/memberRecords';
import { MEMBER_RECORD_SECTIONS, saveRecord } from '../../../src/features/memberRecord';
import { EditSectionModal } from '../../../src/pages/MemberProfile/components/EditSectionModal';
import {
  addMemberFlags,
  listMemberFlags,
  removeMemberFlags,
  saveMemberFlags,
} from '../../../src/repositories/memberFlags';
import { UserRole } from '../../../src/types/enums';
import { renderScreen } from '../../support/render';

vi.mock('../../../src/features/memberRecord', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/features/memberRecord')>()),
  saveRecord: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../src/repositories/memberFlags', () => ({
  addMemberFlags: vi.fn().mockResolvedValue(undefined),
  listMemberFlags: vi.fn().mockResolvedValue([]),
  removeMemberFlags: vi.fn().mockResolvedValue(undefined),
  saveMemberFlags: vi.fn().mockResolvedValue(undefined),
}));

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

const renderModal = (flags: MemberFlag[] = [], spouse: { id: string; name: string } | null = null) => {
  const close = vi.fn();
  renderScreen(
    <EditSectionModal
      personId="p1"
      record={record}
      section={membership}
      optionalPhone={false}
      flags={flags}
      spouse={spouse}
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

  it('offers to flag the spouse too, and flags only when the pastor says yes', async () => {
    const close = renderModal([], { id: 'p2', name: 'Bruno Lima' });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Membro ausente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('Deseja marcar Bruno Lima também como membro ausente?')).toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Sim, marcar Bruno' }));

    expect(addMemberFlags).toHaveBeenCalledWith('p2', ['absent']);
    expect(close).toHaveBeenCalled();
  });

  it('does not ask about the spouse on removal when the spouse is not flagged', async () => {
    const close = renderModal(['absent'], { id: 'p2', name: 'Bruno Lima' });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Membro ausente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(saveMemberFlags).toHaveBeenCalledWith('p1', ['absent'], []);
    expect(addMemberFlags).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });

  it('offers to unflag the spouse when both were flagged', async () => {
    vi.mocked(listMemberFlags).mockResolvedValueOnce(['absent']);
    const close = renderModal(['absent'], { id: 'p2', name: 'Bruno Lima' });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Membro ausente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('Bruno Lima também está como membro ausente. Deseja desmarcar?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Sim, desmarcar Bruno' }));

    expect(removeMemberFlags).toHaveBeenCalledWith('p2', ['absent']);
    expect(close).toHaveBeenCalled();
  });
});

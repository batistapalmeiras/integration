// Libs
import { renderHook, waitFor } from '@testing-library/react';
// Local
import { MemberRecord } from '../../../src/domain/memberRecords';
import { saveRecord } from '../../../src/features/memberRecord';
import { clearQueries, useQuery } from '../../../src/lib/queryCache';
import { queryKeys } from '../../../src/lib/queryKeys';

vi.mock('../../../src/repositories/memberRecords', () => ({ saveMemberRecord: vi.fn().mockResolvedValue(undefined) }));

const record: MemberRecord = {
  name: 'Ana',
  phone: '',
  email: '',
  membershipStatus: 'removed',
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

describe('saveRecord', () => {
  afterEach(() => clearQueries());

  it('reloads the member page so the small group and ministries stay current', async () => {
    const summary = vi.fn().mockResolvedValue({ smallGroupName: 'PG Teste' });
    const { result } = renderHook(() => useQuery(queryKeys.memberPage('p1'), summary));
    await waitFor(() => expect(result.current.data).toBeDefined());

    await saveRecord('p1', record);

    expect(summary).toHaveBeenCalledTimes(2);
  });
});

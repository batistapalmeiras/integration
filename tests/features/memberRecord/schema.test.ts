// Local
import { memberRecordSchema } from '../../../src/features/memberRecord/schema';

const cpfError = (cpf: string) => memberRecordSchema(false).shape.cpf.safeParse(cpf).error?.issues[0]?.message ?? null;

describe('member record CPF', () => {
  it('accepts an empty CPF and a valid one with or without punctuation', () => {
    expect(cpfError('')).toBeNull();
    expect(cpfError('529.982.247-25')).toBeNull();
    expect(cpfError('52998224725')).toBeNull();
  });

  it('rejects wrong check digits, repeated digits and incomplete numbers', () => {
    expect(cpfError('529.982.247-24')).toBe('CPF inválido. Confira os números.');
    expect(cpfError('111.111.111-11')).toBe('CPF inválido. Confira os números.');
    expect(cpfError('529.982.247')).toBe('CPF inválido. Confira os números.');
  });
});

// Local
import { isValidCpf } from './cpf';

describe('isValidCpf', () => {
  it('accepts a valid CPF with or without punctuation', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('rejects wrong check digits, repeated digits and incomplete numbers', () => {
    expect(isValidCpf('529.982.247-24')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('529.982.247')).toBe(false);
  });
});

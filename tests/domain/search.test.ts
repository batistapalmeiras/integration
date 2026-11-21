// Local
import { matchesNameOrPhone } from '../../src/domain/search';

const ana = { name: 'Ana Lima', phone: '5531988887777' };

describe('matchesNameOrPhone', () => {
  it('finds a person by part of the name, ignoring case', () => {
    expect(matchesNameOrPhone(ana, 'lima')).toBe(true);
    expect(matchesNameOrPhone(ana, 'souza')).toBe(false);
  });

  it('finds a person by part of the phone, typed with or without a mask', () => {
    expect(matchesNameOrPhone(ana, '98888')).toBe(true);
    expect(matchesNameOrPhone(ana, '(31) 98888-7777')).toBe(true);
    expect(matchesNameOrPhone(ana, '91111')).toBe(false);
  });

  it('does not search the phone with fewer than three digits, nor fail without a phone', () => {
    expect(matchesNameOrPhone(ana, '98')).toBe(false);
    expect(matchesNameOrPhone({ name: 'Ana Lima', phone: null }, '98888')).toBe(false);
  });

  it('ignores accents on either side', () => {
    expect(matchesNameOrPhone({ name: 'João Antônio', phone: null }, 'joao antonio')).toBe(true);
    expect(matchesNameOrPhone({ name: 'Joao Antonio', phone: null }, 'João')).toBe(true);
  });

  it('matches everyone when the search is empty', () => {
    expect(matchesNameOrPhone(ana, '  ')).toBe(true);
  });
});

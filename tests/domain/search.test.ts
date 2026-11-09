// Local
import { matchesNameOrPhone, nameOrPhoneFilter, phoneDigits } from '../../src/domain/search';

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

  it('matches everyone when the search is empty', () => {
    expect(matchesNameOrPhone(ana, '  ')).toBe(true);
  });
});

describe('nameOrPhoneFilter', () => {
  it('searches only the name when there are not enough digits', () => {
    expect(nameOrPhoneFilter('Ana')).toBe('name.ilike.%Ana%');
  });

  it('adds the phone digits and strips the characters that break the filter', () => {
    expect(nameOrPhoneFilter('(31) 98888')).toBe('name.ilike.% 31  98888%,phone.ilike.%3198888%');
  });

  it('keeps only the digits when reading a phone search', () => {
    expect(phoneDigits('(31) 9')).toBe('319');
    expect(phoneDigits('31')).toBe('');
  });
});

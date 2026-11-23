// Local
import { initialsOf } from '../../src/domain/text';

describe('initials of a name', () => {
  it('uses the first and the last word', () => {
    expect(initialsOf('Fabio e Marinez')).toBe('FM');
    expect(initialsOf('luciana e fábio')).toBe('LF');
  });

  it('uses a single letter for a single word', () => {
    expect(initialsOf('Doris')).toBe('D');
  });

  it('completes with the first letters of a single word when two letters are required', () => {
    expect(initialsOf('Doris', 2)).toBe('DO');
    expect(initialsOf('Fabio e Marinez', 2)).toBe('FM');
  });
});

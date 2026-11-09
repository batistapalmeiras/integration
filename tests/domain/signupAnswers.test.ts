// Local
import {
  baptismAnswer,
  maritalStatusAnswer,
  readBaptismAnswer,
  readMaritalStatusAnswer,
} from '../../src/domain/signupAnswers';

describe('baptism answer', () => {
  it('reads back what the signup wrote', () => {
    expect(readBaptismAnswer(baptismAnswer('yes', 'Igreja Batista Central'))).toEqual({
      baptized: 'yes',
      church: 'Igreja Batista Central',
    });
    expect(readBaptismAnswer(baptismAnswer('no', ''))).toEqual({ baptized: 'no', church: '' });
  });

  it('ignores free text from before the structured signup', () => {
    expect(readBaptismAnswer('Fui batizado aos 9 anos')).toEqual({ baptized: '', church: '' });
  });
});

describe('marital status answer', () => {
  it('reads back the status with or without the story', () => {
    expect(readMaritalStatusAnswer(maritalStatusAnswer('married', 'Casados há 5 anos.'))).toBe('married');
    expect(readMaritalStatusAnswer(maritalStatusAnswer('stable_union', ''))).toBe('stable_union');
  });

  it('ignores free text from before the structured signup', () => {
    expect(readMaritalStatusAnswer('Sou casada com Josiel')).toBe('');
  });
});

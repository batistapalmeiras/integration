// Local
import { firstNameOf } from '../../src/domain/text';
import { initialContactMessage } from '../../src/domain/whatsapp';

describe('firstNameOf', () => {
  it('keeps only the first name, ignoring extra spaces', () => {
    expect(firstNameOf('  Ismael   Inacio de Aredês ')).toBe('Ismael');
    expect(firstNameOf('Ana')).toBe('Ana');
  });
});

describe('initialContactMessage', () => {
  it('greets the visitor and signs with the first name of each', () => {
    expect(initialContactMessage('Felipe da Silva', 'Ismael Inacio de Aredês')).toBe(
      'Olá, Felipe! Tudo bem? Sou Ismael e tenho um convite especial para você:',
    );
  });
});

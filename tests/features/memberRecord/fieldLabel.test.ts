// Local
import { recordFieldLabel } from '../../../src/features/memberRecord';

describe('recordFieldLabel', () => {
  it('turns a column of the database into the label the screen uses', () => {
    expect(recordFieldLabel('cpf')).toBe('CPF');
    expect(recordFieldLabel('address_zip')).toBe('CEP');
  });

  it('keeps the column when the screen has no field for it', () => {
    expect(recordFieldLabel('something_else')).toBe('something_else');
  });
});

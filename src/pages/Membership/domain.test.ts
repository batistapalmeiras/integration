// Local
import { membershipReviewReasons, needsBaptismReview, needsSecretSocietyReview } from './domain';

describe('needsSecretSocietyReview', () => {
  it('lets every way of writing "no" through', () => {
    ['Não', 'não ', 'Nao', 'NÃO', 'Não.', 'Não. '].forEach((answer) => {
      expect(needsSecretSocietyReview(answer)).toBe(false);
    });
  });

  it('flags anything that is not a plain no', () => {
    expect(needsSecretSocietyReview('Fazia, hoje não mais. (GLMMG)')).toBe(true);
    expect(needsSecretSocietyReview('Sim, maçonaria')).toBe(true);
  });

  it('does not flag a form that left it blank', () => {
    expect(needsSecretSocietyReview(null)).toBe(false);
    expect(needsSecretSocietyReview('  ')).toBe(false);
  });
});

describe('needsBaptismReview', () => {
  it('flags a missing or blank answer', () => {
    expect(needsBaptismReview(null)).toBe(true);
    expect(needsBaptismReview('   ')).toBe(true);
  });

  it('accepts any written answer, including "not baptized"', () => {
    expect(needsBaptismReview('Sim, na PIB Salgado Filho')).toBe(false);
    expect(needsBaptismReview('Ainda não sou batizado')).toBe(false);
  });
});

describe('membershipReviewReasons', () => {
  it('lists every reason that applies, secret society first', () => {
    expect(membershipReviewReasons({ secretSociety: 'Sim', baptismInfo: null })).toEqual([
      'Sociedade secreta',
      'Batismo não informado',
    ]);
  });

  it('is empty for a clean form', () => {
    expect(membershipReviewReasons({ secretSociety: 'Não', baptismInfo: 'Sim, em 2010' })).toEqual([]);
  });
});

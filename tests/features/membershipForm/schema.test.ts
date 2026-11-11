// Local
import { stepSchemas } from '../../../src/features/membershipForm/schema';

const journey = stepSchemas(false)[2];

const answers = (entryType: string, baptismChurch: string) => ({
  entryType,
  baptismChurch,
  baptismDate: '',
  lastChurch: 'Igreja Batista Central',
});

describe('membership form journey step', () => {
  it('asks for the baptism church from whoever was already baptized', () => {
    for (const entryType of ['transfer_letter', 'acclamation', 'reconciliation']) {
      expect([entryType, journey.safeParse(answers(entryType, '')).success]).toEqual([entryType, false]);
      expect([entryType, journey.safeParse(answers(entryType, 'PIB')).success]).toEqual([entryType, true]);
    }
  });

  it('does not ask it from who is joining by baptism', () => {
    expect(journey.safeParse(answers('baptism', '')).success).toBe(true);
  });
});

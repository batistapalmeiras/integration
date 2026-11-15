// Local
import { stepSchemas } from '../../../src/features/membershipForm/schema';

const photo = stepSchemas(false)[1];
const journey = stepSchemas(false)[3];

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

describe('membership form photo step', () => {
  it('does not move on without a sent photo', () => {
    expect(photo.safeParse({ photoToken: '' }).success).toBe(false);
    expect(photo.safeParse({ photoToken: '2f1d5c3e-1b2a-4c3d-9e8f-0a1b2c3d4e5f' }).success).toBe(true);
  });
});

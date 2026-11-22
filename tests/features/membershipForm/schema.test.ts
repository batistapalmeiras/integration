// Local
import { stepSchemas } from '../../../src/features/membershipForm/schema';

const photo = stepSchemas(false)[1];
const journey = stepSchemas(false)[3];

const answers = (entryType: string, baptismChurch: string) => ({
  entryType,
  baptismChurch,
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
  it('does not move on without a chosen photo', () => {
    const frame = { imageWidth: 800, imageHeight: 600, viewport: 280, zoom: 1, offsetX: -46, offsetY: 0 };
    expect(photo.safeParse({ photo: null }).success).toBe(false);
    expect(photo.safeParse({ photo: { source: 'data:image/jpeg;base64,AAAA', frame } }).success).toBe(true);
  });
});

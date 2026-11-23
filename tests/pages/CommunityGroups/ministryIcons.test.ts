// Libs
import { Baby, Coffee, HeartHandshake, Music } from 'lucide-react';
// Local
import { ministryIconFor } from '../../../src/pages/CommunityGroups/ministryIcons';

describe('ministry icons', () => {
  it('picks the icon from the ministry name, ignoring case and accents', () => {
    expect(ministryIconFor('Louvor')).toBe(Music);
    expect(ministryIconFor('Kids Palmeiras')).toBe(Baby);
    expect(ministryIconFor('Café Integração')).toBe(Coffee);
  });

  it('falls back to a generic icon for a ministry with no match', () => {
    expect(ministryIconFor('Jardinagem')).toBe(HeartHandshake);
  });
});

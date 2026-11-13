// Local
import { previewTimeline } from '../../src/domain/timeline';

describe('previewTimeline', () => {
  const entries = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      date: `2026-10-${String(index + 1).padStart(2, '0')}`,
      at: null,
      label: `Evento ${index + 1}`,
      detail: null,
      actor: null,
    }));

  it('shows everything while it still fits', () => {
    expect(previewTimeline(entries(4)).map((item) => item.kind)).toEqual(['entry', 'entry', 'entry', 'entry']);
  });

  it('shows the first three, the gap and the most recent one when there is more', () => {
    const preview = previewTimeline(entries(9));

    expect(preview.map((item) => (item.kind === 'gap' ? 'gap' : item.entry.label))).toEqual([
      'Evento 1',
      'Evento 2',
      'Evento 3',
      'gap',
      'Evento 9',
    ]);
  });
});

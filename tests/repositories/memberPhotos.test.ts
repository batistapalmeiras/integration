// Local
import { clearSignedPhotoUrls, memberPhotoUrls } from '../../src/repositories/memberPhotos';

const { signed, supabase } = vi.hoisted(() => {
  const signed: string[][] = [];
  let counter = 0;
  const bucket = {
    createSignedUrls: (paths: string[]) => {
      signed.push(paths);
      counter += 1;
      return Promise.resolve({
        data: paths.map((path) => ({ path, signedUrl: `https://cdn.test/${path}?token=${counter}` })),
        error: null,
      });
    },
  };
  return { signed, supabase: { storage: { from: () => bucket } } };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

const DAY_MS = 24 * 60 * 60_000;
const ana = { personId: 'a', folder: 'a', version: '2026-11-01' };
const bia = { personId: 'b', folder: 'b', version: '2026-11-02' };

describe('memberPhotoUrls', () => {
  beforeEach(() => {
    clearSignedPhotoUrls();
    signed.splice(0);
    vi.useRealTimers();
  });

  it('reuses the link of a photo on other pages, signing only the new ones', async () => {
    const first = await memberPhotoUrls([ana], ['thumb']);
    const second = await memberPhotoUrls([ana, bia], ['thumb']);

    expect(second.thumb.a).toBe(first.thumb.a);
    expect(signed).toEqual([['a/thumb.jpg'], ['b/thumb.jpg']]);
  });

  it('signs again when the photo changes', async () => {
    const before = await memberPhotoUrls([ana], ['photo']);
    const after = await memberPhotoUrls([{ ...ana, version: '2026-11-16' }], ['photo']);

    expect(after.photo.a).not.toBe(before.photo.a);
    expect(signed).toHaveLength(2);
  });

  it('renews a link on its last day', async () => {
    vi.useFakeTimers();
    await memberPhotoUrls([ana], ['photo']);

    vi.advanceTimersByTime(5 * DAY_MS);
    await memberPhotoUrls([ana], ['photo']);
    vi.advanceTimersByTime(1.5 * DAY_MS);
    await memberPhotoUrls([ana], ['photo']);

    expect(signed).toHaveLength(2);
  });

  it('keeps the links on the device between visits', async () => {
    await memberPhotoUrls([ana], ['photo']);

    expect(JSON.parse(window.localStorage.getItem('member-photo-urls') ?? '{}')).toHaveProperty('a/photo.jpg');
  });
});

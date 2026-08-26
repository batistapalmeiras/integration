const MAKEUP_VIDEO_IDS: Record<number, string> = {
  1: 'VZc_rnebzeE',
  2: '9rIJwA6Io8A',
  3: 'sD9awKZbztM',
  4: 'gnaSsTxkkug',
};

export function getMakeupVideoId(lessonNumber: number): string | null {
  return MAKEUP_VIDEO_IDS[lessonNumber] ?? null;
}

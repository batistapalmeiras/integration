// Local
import { firstNameOf } from './text';

export interface TimelineEntry {
  date: string;
  at: string | null;
  label: string;
  detail: string | null;
  actor: string | null;
}

export const SYSTEM_ACTOR = 'Sistema';

const PREVIEW_HEAD = 3;

export const actorName = (authorName: string | null): string => (authorName ? firstNameOf(authorName) : SYSTEM_ACTOR);

export type TimelinePreview = { kind: 'entry'; entry: TimelineEntry } | { kind: 'gap' };

export const sortTimeline = (entries: TimelineEntry[]): TimelineEntry[] =>
  [...entries].sort((a, b) => (a.at ?? `${a.date}T00:00:00`).localeCompare(b.at ?? `${b.date}T00:00:00`));

export function previewTimeline(entries: TimelineEntry[]): TimelinePreview[] {
  if (entries.length <= PREVIEW_HEAD + 1) return entries.map((entry) => ({ kind: 'entry', entry }));
  return [
    ...entries.slice(0, PREVIEW_HEAD).map((entry): TimelinePreview => ({ kind: 'entry', entry })),
    { kind: 'gap' },
    { kind: 'entry', entry: entries[entries.length - 1] },
  ];
}

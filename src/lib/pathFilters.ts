export type ListFilters<K extends string> = Partial<Record<K, string[]>>;

interface TableFilter<K extends string> {
  key: K;
  slugs: Record<string, string>;
}

interface PatternFilter<K extends string> {
  key: K;
  toSlug: (value: string) => string;
  fromSlug: (segment: string) => string | null;
}

export type PathFilter<K extends string> = TableFilter<K> | PatternFilter<K>;

export interface DecodedPathFilters<K extends string> {
  values: ListFilters<K>;
  unresolved: string[];
}

const SEPARATOR = '-';

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, SEPARATOR)
    .replace(/^-+|-+$/g, '');

export const slugTable = (labels: Record<string, string>, only?: readonly string[]): Record<string, string> =>
  Object.fromEntries(
    Object.entries(labels)
      .filter(([value]) => !only || only.includes(value))
      .map(([value, label]) => [value, slugify(label)]),
  );

function tokenize(tokens: string[], slugs: Record<string, string>): string[] | null {
  const options = Object.entries(slugs).map(([value, slug]) => ({ value, tokens: slug.split(SEPARATOR) }));
  const reach: (string[] | null)[] = [[], ...tokens.map(() => null)];
  reach.forEach((found, start) => {
    if (!found) return;
    options.forEach((option) => {
      const end = start + option.tokens.length;
      const matches = option.tokens.every((token, index) => tokens[start + index] === token);
      if (matches && end <= tokens.length && !reach[end]) reach[end] = [...found, option.value];
    });
  });
  return reach[tokens.length] ?? null;
}

function decodeSegment<K extends string>(filter: PathFilter<K>, segment: string, tokens: string[]) {
  if ('slugs' in filter) return tokenize(tokens, filter.slugs);
  const value = filter.fromSlug(segment.toLowerCase());
  return value === null ? null : [value];
}

export function decodePathFilters<K extends string>(
  filters: PathFilter<K>[],
  segments: string[],
): DecodedPathFilters<K> {
  const values: ListFilters<K> = {};
  const unresolved: string[] = [];
  segments.forEach((segment) => {
    const tokens = segment.toLowerCase().split(SEPARATOR);
    const match = filters
      .map((filter) => ({ key: filter.key, found: decodeSegment(filter, segment, tokens) }))
      .find((candidate) => candidate.found);
    if (match?.found) values[match.key] = [...(values[match.key] ?? []), ...match.found];
    else unresolved.push(segment);
  });
  return { values, unresolved };
}

export function encodePathFilters<K extends string>(filters: PathFilter<K>[], values: ListFilters<K>): string[] {
  return filters.flatMap((filter) => {
    const chosen = values[filter.key] ?? [];
    if (!('slugs' in filter)) return chosen.slice(0, 1).map(filter.toSlug);
    const slugs = Object.entries(filter.slugs)
      .filter(([value]) => chosen.includes(value))
      .map(([, slug]) => slug);
    return slugs.length > 0 ? [slugs.join(SEPARATOR)] : [];
  });
}

const DATE_SLUG = /^(\d{2})-(\d{2})-(\d{4})$/;

export const datePathFilter = <K extends string>(key: K): PathFilter<K> => ({
  key,
  toSlug: (date) => date.split('-').reverse().join(SEPARATOR),
  fromSlug: (segment) => {
    const match = DATE_SLUG.exec(segment);
    if (!match) return null;
    const [, day, month, year] = match;
    const date = `${year}-${month}-${day}`;
    return new Date(`${date}T12:00:00Z`).toISOString().startsWith(date) ? date : null;
  },
});

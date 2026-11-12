// Local
import {
  datePathFilter,
  decodePathFilters,
  encodePathFilters,
  PathFilter,
  slugify,
  slugTable,
} from '../../src/lib/pathFilters';
import { MEMBERS_FILTERS } from '../../src/pages/Members/persistence';
import { peopleFiltersFor } from '../../src/pages/People/persistence';
import { VISITOR_FILTERS } from '../../src/pages/Visitors/persistence';

const RESERVED = ['pendencias', 'aniversariantes', 'novo'];

const allSlugs = <K extends string>(filters: PathFilter<K>[]) =>
  filters.flatMap((filter) => ('slugs' in filter ? Object.values(filter.slugs) : []));

describe('slugify', () => {
  it('turns labels into lowercase path words without accents', () => {
    expect(slugify('Carta de Transferência')).toBe('carta-de-transferencia');
    expect(slugify('Café de Boas-vindas')).toBe('cafe-de-boas-vindas');
    expect(slugify('Turma 15/11/2026')).toBe('turma-15-11-2026');
  });
});

describe('path filters', () => {
  it('writes each filter as one segment and reads it back', () => {
    const values = { status: ['active', 'removed'], entryType: ['transfer_letter'] };
    const segments = encodePathFilters(MEMBERS_FILTERS, values);
    expect(segments).toEqual(['ativo-desligado', 'carta-de-transferencia']);
    expect(decodePathFilters(MEMBERS_FILTERS, segments)).toEqual({ values, unresolved: [] });
  });

  it('keeps the order of the options, whatever order they were picked in', () => {
    expect(encodePathFilters(MEMBERS_FILTERS, { status: ['deceased', 'active'] })).toEqual(['ativo-falecido']);
  });

  it('reports segments it cannot read', () => {
    expect(decodePathFilters(MEMBERS_FILTERS, ['ativo', 'qualquer-coisa'])).toEqual({
      values: { status: ['active'] },
      unresolved: ['qualquer-coisa'],
    });
  });

  it('reads cohorts by their names', () => {
    const filters = peopleFiltersFor(['Turma 15/11/2026']);
    expect(encodePathFilters(filters, { cohort: ['Turma 15/11/2026'] })).toEqual(['turma-15-11-2026']);
    expect(decodePathFilters(filters, ['integracao', 'turma-15-11-2026']).values).toEqual({
      status: ['integration'],
      cohort: ['Turma 15/11/2026'],
    });
  });

  it('reads dates as day, month and year', () => {
    const filters = [datePathFilter('cafe')];
    expect(encodePathFilters(filters, { cafe: ['2026-12-06'] })).toEqual(['06-12-2026']);
    expect(decodePathFilters(filters, ['06-12-2026']).values).toEqual({ cafe: ['2026-12-06'] });
    expect(decodePathFilters(filters, ['31-02-2026']).unresolved).toEqual(['31-02-2026']);
  });

  it('gives every option its own slug, apart from the screens next to the lists', () => {
    for (const filters of [MEMBERS_FILTERS, VISITOR_FILTERS, peopleFiltersFor([])]) {
      const slugs = allSlugs(filters);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(slugs.filter((slug) => RESERVED.includes(slug))).toEqual([]);
    }
    expect(slugTable({ a: 'Ativo', b: 'Inativo' }, ['b'])).toEqual({ b: 'inativo' });
  });
});

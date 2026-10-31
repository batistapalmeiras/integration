export function fromIntegration<Query extends { is(column: string, value: null): Query }>(query: Query): Query {
  return query.is('legacy_id', null);
}

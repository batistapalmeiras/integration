export function keyParser<Key extends string>(labels: Record<Key, unknown>, what: string) {
  const isKey = (value: string): value is Key => Object.prototype.hasOwnProperty.call(labels, value);
  return (value: string): Key => {
    if (isKey(value)) return value;
    throw new Error(`${what} desconhecido: ${value}`);
  };
}

export function optional<Value>(parse: (value: string) => Value) {
  return (value: string | null): Value | null => (value === null ? null : parse(value));
}

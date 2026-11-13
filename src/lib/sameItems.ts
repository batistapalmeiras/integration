export function sameItems(a: string[], b: string[]): boolean {
  const sortedB = [...b].sort();
  return a.length === b.length && [...a].sort().every((item, index) => item === sortedB[index]);
}

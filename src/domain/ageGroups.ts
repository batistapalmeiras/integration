export const AGE_GROUPS = ['children', 'teens', 'youth', 'adults', 'seniors'] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

export const AGE_GROUP_NAMES: Record<AgeGroup, string> = {
  children: 'Crianças',
  teens: 'Adolescentes',
  youth: 'Jovens',
  adults: 'Adultos',
  seniors: 'Idosos',
};

const AGE_GROUP_FLOORS: Record<AgeGroup, number> = {
  children: 0,
  teens: 12,
  youth: 18,
  adults: 30,
  seniors: 60,
};

export function ageGroupLabel(group: AgeGroup): string {
  const index = AGE_GROUPS.indexOf(group);
  const floor = AGE_GROUP_FLOORS[group];
  const next = AGE_GROUPS[index + 1];
  if (!next) return `${AGE_GROUP_NAMES[group]} (${floor} ou mais)`;
  const ceiling = AGE_GROUP_FLOORS[next] - 1;
  return `${AGE_GROUP_NAMES[group]} (${floor === 0 ? `até ${ceiling}` : `${floor} a ${ceiling}`})`;
}

export function ageOn(birthDate: string, today: string): number {
  const years = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return today.slice(5) < birthDate.slice(5) ? years - 1 : years;
}

export function ageGroupOf(age: number): AgeGroup {
  return AGE_GROUPS.reduce<AgeGroup>((found, group) => (age >= AGE_GROUP_FLOORS[group] ? group : found), 'children');
}

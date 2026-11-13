export const FAMILY_RELATIONS = [
  'spouse',
  'son',
  'daughter',
  'grandfather',
  'grandmother',
  'father',
  'mother',
  'brother',
  'sister',
  'stepfather',
  'stepmother',
  'stepson',
  'stepdaughter',
  'grandson',
  'granddaughter',
  'father_in_law',
  'mother_in_law',
  'son_in_law',
  'daughter_in_law',
  'brother_in_law',
  'sister_in_law',
  'uncle',
  'aunt',
  'nephew',
  'niece',
  'male_cousin',
  'female_cousin',
] as const;

export type FamilyRelation = (typeof FAMILY_RELATIONS)[number];

const RELATION_LABELS: Record<FamilyRelation, string> = {
  spouse: 'Cônjuge',
  son: 'Filho',
  daughter: 'Filha',
  grandfather: 'Avô',
  grandmother: 'Avó',
  father: 'Pai',
  mother: 'Mãe',
  brother: 'Irmão',
  sister: 'Irmã',
  stepfather: 'Padrasto',
  stepmother: 'Madrasta',
  stepson: 'Enteado',
  stepdaughter: 'Enteada',
  grandson: 'Neto',
  granddaughter: 'Neta',
  father_in_law: 'Sogro',
  mother_in_law: 'Sogra',
  son_in_law: 'Genro',
  daughter_in_law: 'Nora',
  brother_in_law: 'Cunhado',
  sister_in_law: 'Cunhada',
  uncle: 'Tio',
  aunt: 'Tia',
  nephew: 'Sobrinho',
  niece: 'Sobrinha',
  male_cousin: 'Primo',
  female_cousin: 'Prima',
};

export const isFamilyRelation = (value: string): value is FamilyRelation =>
  FAMILY_RELATIONS.some((relation) => relation === value);

export const relationLabel = (relation: FamilyRelation): string => RELATION_LABELS[relation];

export const relationRank = (relation: FamilyRelation): number => FAMILY_RELATIONS.indexOf(relation);

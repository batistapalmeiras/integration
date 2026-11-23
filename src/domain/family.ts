// Local
import { Gender } from './memberRecords';

export const FAMILY_RELATIONS = [
  'spouse',
  'child',
  'grandfather',
  'grandmother',
  'father',
  'mother',
  'sibling',
  'friend',
  'grandchild',
  'parent_in_law',
  'son_in_law',
  'daughter_in_law',
  'sibling_in_law',
  'uncle',
  'nephew',
  'cousin',
] as const;

export type FamilyRelation = (typeof FAMILY_RELATIONS)[number];

const SINGLE_RELATIONS: readonly FamilyRelation[] = ['spouse', 'father', 'mother'];

export const availableRelations = (taken: string[]): FamilyRelation[] =>
  FAMILY_RELATIONS.filter((relation) => !(SINGLE_RELATIONS.includes(relation) && taken.includes(relation)));

interface RelationLabel {
  option: string;
  male?: string;
  female?: string;
}

const RELATION_LABELS: Record<FamilyRelation, RelationLabel> = {
  spouse: { option: 'Cônjuge' },
  child: { option: 'Filho(a)', male: 'Filho', female: 'Filha' },
  grandfather: { option: 'Avô' },
  grandmother: { option: 'Avó' },
  father: { option: 'Pai' },
  mother: { option: 'Mãe' },
  sibling: { option: 'Irmão(ã)', male: 'Irmão', female: 'Irmã' },
  grandchild: { option: 'Neto(a)', male: 'Neto', female: 'Neta' },
  parent_in_law: { option: 'Sogro(a)', male: 'Sogro', female: 'Sogra' },
  son_in_law: { option: 'Genro' },
  daughter_in_law: { option: 'Nora' },
  sibling_in_law: { option: 'Cunhado(a)', male: 'Cunhado', female: 'Cunhada' },
  uncle: { option: 'Tio(a)', male: 'Tio', female: 'Tia' },
  nephew: { option: 'Sobrinho(a)', male: 'Sobrinho', female: 'Sobrinha' },
  cousin: { option: 'Primo(a)', male: 'Primo', female: 'Prima' },
  friend: { option: 'Amigo(a)', male: 'Amigo', female: 'Amiga' },
};

export const isFamilyRelation = (value: string): value is FamilyRelation =>
  FAMILY_RELATIONS.some((relation) => relation === value);

export const relationLabel = (relation: FamilyRelation, gender: Gender | null = null): string => {
  const labels = RELATION_LABELS[relation];
  return (gender && labels[gender]) ?? labels.option;
};

export const relationRank = (relation: FamilyRelation): number => FAMILY_RELATIONS.indexOf(relation);

export interface FamilyTraits {
  gender: Gender | null;
  spouseId: string | null;
  fatherId: string | null;
  motherId: string | null;
}

const RELATIVE_GENDER: Partial<Record<FamilyRelation, Gender>> = {
  father: 'male',
  grandfather: 'male',
  son_in_law: 'male',
  mother: 'female',
  grandmother: 'female',
  daughter_in_law: 'female',
};

const taken = (holder: string | null, personId: string) => holder !== null && holder !== personId;

export function fitsRelation(
  relation: FamilyRelation,
  personId: string,
  person: FamilyTraits | undefined,
  relative: FamilyTraits | undefined,
): boolean {
  const expected = RELATIVE_GENDER[relation];
  if (expected && relative?.gender && relative.gender !== expected) return false;
  if (relation === 'spouse') return !taken(relative?.spouseId ?? null, personId);
  if (relation === 'child') {
    if (person?.gender === 'male') return !taken(relative?.fatherId ?? null, personId);
    if (person?.gender === 'female') return !taken(relative?.motherId ?? null, personId);
  }
  return true;
}

const RELATION_GROUPS: Record<FamilyRelation, { key: string; plural: string }> = {
  spouse: { key: 'spouse', plural: 'Cônjuges' },
  child: { key: 'child', plural: 'Filhos' },
  grandfather: { key: 'grandparent', plural: 'Avós' },
  grandmother: { key: 'grandparent', plural: 'Avós' },
  father: { key: 'parent', plural: 'Pais' },
  mother: { key: 'parent', plural: 'Pais' },
  sibling: { key: 'sibling', plural: 'Irmãos' },
  friend: { key: 'friend', plural: 'Amigos' },
  grandchild: { key: 'grandchild', plural: 'Netos' },
  parent_in_law: { key: 'parent_in_law', plural: 'Sogros' },
  son_in_law: { key: 'child_in_law', plural: 'Genros e noras' },
  daughter_in_law: { key: 'child_in_law', plural: 'Genros e noras' },
  sibling_in_law: { key: 'sibling_in_law', plural: 'Cunhados' },
  uncle: { key: 'uncle', plural: 'Tios' },
  nephew: { key: 'nephew', plural: 'Sobrinhos' },
  cousin: { key: 'cousin', plural: 'Primos' },
};

export interface RelativeGroup<T> {
  key: string;
  label: string;
  members: T[];
}

export function groupRelatives<T extends { relation: FamilyRelation; gender: Gender | null }>(
  relatives: T[],
): RelativeGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const relative of relatives) {
    const key = RELATION_GROUPS[relative.relation].key;
    groups.set(key, [...(groups.get(key) ?? []), relative]);
  }
  return [...groups.entries()].map(([key, members]) => ({
    key,
    label:
      members.length === 1
        ? relationLabel(members[0].relation, members[0].gender)
        : RELATION_GROUPS[members[0].relation].plural,
    members,
  }));
}

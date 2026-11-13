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
  'stepfather',
  'stepmother',
  'stepchild',
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
  stepfather: { option: 'Padrasto' },
  stepmother: { option: 'Madrasta' },
  stepchild: { option: 'Enteado(a)', male: 'Enteado', female: 'Enteada' },
  grandchild: { option: 'Neto(a)', male: 'Neto', female: 'Neta' },
  parent_in_law: { option: 'Sogro(a)', male: 'Sogro', female: 'Sogra' },
  son_in_law: { option: 'Genro' },
  daughter_in_law: { option: 'Nora' },
  sibling_in_law: { option: 'Cunhado(a)', male: 'Cunhado', female: 'Cunhada' },
  uncle: { option: 'Tio(a)', male: 'Tio', female: 'Tia' },
  nephew: { option: 'Sobrinho(a)', male: 'Sobrinho', female: 'Sobrinha' },
  cousin: { option: 'Primo(a)', male: 'Primo', female: 'Prima' },
};

export const isFamilyRelation = (value: string): value is FamilyRelation =>
  FAMILY_RELATIONS.some((relation) => relation === value);

export const relationLabel = (relation: FamilyRelation, gender: Gender | null = null): string => {
  const labels = RELATION_LABELS[relation];
  return (gender && labels[gender]) ?? labels.option;
};

export const relationRank = (relation: FamilyRelation): number => FAMILY_RELATIONS.indexOf(relation);

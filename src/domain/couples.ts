// Local
import { FamilyTraits } from './family';
import { Gender } from './memberRecords';
import { byName } from './text';

export type MemberGrouping = 'individual' | 'couple';

export const MEMBER_GROUPING_LABELS: Record<MemberGrouping, string> = {
  individual: 'Individual',
  couple: 'Casal',
};

export const GROUPING_PATH_LABELS: Record<Exclude<MemberGrouping, 'individual'>, string> = {
  couple: 'Casais',
};

export type ChildrenStatus = 'with' | 'without';

export const CHILDREN_STATUS_LABELS: Record<ChildrenStatus, string> = {
  with: 'Com filhos',
  without: 'Sem filhos',
};

export type Couple<T> = [T, T];

interface Spouse {
  id: string;
  name: string;
  gender: Gender | null;
}

const GENDER_ORDER: Record<Gender, number> = { male: 0, female: 1 };

const genderRank = (person: Spouse) => (person.gender ? GENDER_ORDER[person.gender] : 2);

export function pairCouples<T extends Spouse>(people: T[], traits: Record<string, FamilyTraits>): Couple<T>[] {
  const byId = new Map(people.map((person) => [person.id, person]));
  return people
    .flatMap((person): Couple<T>[] => {
      const spouse = byId.get(traits[person.id]?.spouseId ?? '');
      if (!spouse || person.id > spouse.id) return [];
      const ordered = [person, spouse].sort((a, b) => genderRank(a) - genderRank(b) || byName(a, b));
      return [[ordered[0], ordered[1]]];
    })
    .sort((a, b) => byName(a[0], b[0]));
}

export const parentIdsOf = (traits: Record<string, FamilyTraits>): Set<string> =>
  new Set(
    Object.values(traits)
      .flatMap((entry) => [entry.fatherId, entry.motherId])
      .filter((id): id is string => id !== null),
  );

export const coupleChildrenStatus = (couple: Couple<{ id: string }>, parents: Set<string>): ChildrenStatus =>
  couple.some((person) => parents.has(person.id)) ? 'with' : 'without';

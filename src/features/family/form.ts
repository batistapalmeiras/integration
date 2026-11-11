// Local
import { invalidateQueries } from '../../lib/queryCache';
import { Family, setFamily } from '../../repositories/family';

export interface FamilyFormValues {
  spouseId: string;
  childIds: string[];
}

export const familyFormValues = (family: Family): FamilyFormValues => ({
  spouseId: family.spouse?.id ?? '',
  childIds: family.children.map((child) => child.id),
});

export async function saveFamily(personId: string, family: Family, values: FamilyFormValues): Promise<void> {
  await setFamily(personId, {
    spouseId: values.spouseId || null,
    fatherId: family.father?.id ?? null,
    motherId: family.mother?.id ?? null,
    childIds: values.childIds,
  });
  await invalidateQueries((key) => key[0] === 'person' && key[2] === 'family');
}

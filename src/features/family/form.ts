// Local
import { invalidateQueries } from '../../lib/queryCache';
import { Family, setFamily } from '../../repositories/family';

export interface FamilyFormValues {
  spouseId: string;
  fatherId: string;
  motherId: string;
  childIds: string[];
}

export const familyFormValues = (family: Family): FamilyFormValues => ({
  spouseId: family.spouse?.id ?? '',
  fatherId: family.father?.id ?? '',
  motherId: family.mother?.id ?? '',
  childIds: family.children.map((child) => child.id),
});

const orNull = (id: string) => id || null;

export async function saveFamily(personId: string, values: FamilyFormValues): Promise<void> {
  await setFamily(personId, {
    spouseId: orNull(values.spouseId),
    fatherId: orNull(values.fatherId),
    motherId: orNull(values.motherId),
    childIds: values.childIds,
  });
  await invalidateQueries((key) => key[0] === 'person' && key[2] === 'family');
}

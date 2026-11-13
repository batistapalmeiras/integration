// Local
import { isFamilyRelation } from '../../domain/family';
import { invalidateQueries } from '../../lib/queryCache';
import { FamilyLink, Relative, setFamily } from '../../repositories/family';

export interface FamilyLinkValue {
  relativeId: string;
  relation: string;
}

export interface FamilyFormValues {
  links: FamilyLinkValue[];
}

export const familyFormValues = (family: Relative[]): FamilyFormValues => ({
  links: family.map((relative) => ({ relativeId: relative.id, relation: relative.relation })),
});

export async function saveFamily(personId: string, values: FamilyFormValues): Promise<void> {
  const links = values.links.flatMap((link): FamilyLink[] =>
    link.relativeId && isFamilyRelation(link.relation) ? [{ relativeId: link.relativeId, relation: link.relation }] : [],
  );
  await setFamily(personId, links);
  await invalidateQueries((key) => key[0] === 'person' && key[2] === 'family');
}

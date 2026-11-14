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
  hidden: string[];
}

export const familyFormValues = (family: Relative[]): FamilyFormValues => ({
  hidden: [],
  links: family
    .filter((relative) => !relative.derived)
    .map((relative) => ({ relativeId: relative.id, relation: relative.relation })),
});

export async function saveFamily(personId: string, values: FamilyFormValues): Promise<void> {
  const links = values.links.flatMap((link): FamilyLink[] =>
    link.relativeId && isFamilyRelation(link.relation)
      ? [{ relativeId: link.relativeId, relation: link.relation }]
      : [],
  );
  await setFamily(personId, links, values.hidden);
  await invalidateQueries((key) => (key[0] === 'person' && key[2] === 'family') || key[0] === 'family');
}

// Local
import { formatDate } from '../../../domain/dates';
import { Person } from './types';

export interface DetailRow {
  label: string;
  value: string;
}

interface ProfileDetails {
  coffeeDate: string | null;
  cohortName: string | null;
  smallGroupNames: string[];
  ministryNames: string[];
}

export function generalDetailRows(person: Person, profile: ProfileDetails, withCommunity: boolean): DetailRow[] {
  return [
    person.visited_on && { label: 'Visitou em', value: formatDate(person.visited_on) },
    profile.cohortName && { label: 'Turma', value: profile.cohortName },
    profile.coffeeDate && { label: 'Café', value: formatDate(profile.coffeeDate) },
    withCommunity &&
      profile.smallGroupNames.length > 0 && {
        label: profile.smallGroupNames.length === 1 ? 'Pequeno Grupo' : 'Pequenos Grupos',
        value: profile.smallGroupNames.join(', '),
      },
    withCommunity &&
      profile.ministryNames.length > 0 && { label: 'Ministérios', value: profile.ministryNames.join(', ') },
  ].filter((row): row is DetailRow => !!row);
}

export function hasPersonDetails(person: Person, profile: ProfileDetails): boolean {
  return person.status === 'member' || generalDetailRows(person, profile, true).length > 0;
}

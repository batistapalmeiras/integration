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
  smallGroupName: string | null;
  ministryNames: string[];
}

export function generalDetailRows(person: Person, profile: ProfileDetails, withCommunity: boolean): DetailRow[] {
  return [
    person.visited_on && { label: 'Visitou em', value: formatDate(person.visited_on) },
    profile.cohortName && { label: 'Turma', value: profile.cohortName },
    profile.coffeeDate && { label: 'Café', value: formatDate(profile.coffeeDate) },
    withCommunity && profile.smallGroupName && { label: 'Pequeno Grupo', value: profile.smallGroupName },
    withCommunity &&
      profile.ministryNames.length > 0 && { label: 'Ministérios', value: profile.ministryNames.join(', ') },
  ].filter((row): row is DetailRow => !!row);
}

export function hasPersonDetails(person: Person, profile: ProfileDetails): boolean {
  return person.status === 'member' || generalDetailRows(person, profile, true).length > 0;
}

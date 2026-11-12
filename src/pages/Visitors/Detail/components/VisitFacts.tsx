// Libs
import { CalendarDays, Coffee, GraduationCap } from 'lucide-react';
// Local
import { InfoLine, InfoPanel } from '../../../../components/InfoLine';
import { formatDate } from '../../../../domain/dates';
import { Person } from '../../../../features/visitors';
import { PersonProfileSummary } from '../../../../repositories/people';

interface Props {
  person: Person;
  profile: PersonProfileSummary;
}

export function VisitFacts({ person, profile }: Props) {
  return (
    <InfoPanel>
      <InfoLine icon={CalendarDays} label="Visitou em" empty={!person.visited_on}>
        {person.visited_on ? formatDate(person.visited_on) : 'Não informado'}
      </InfoLine>
      <InfoLine icon={Coffee} label="Café" empty={!profile.coffeeDate}>
        {profile.coffeeDate ? formatDate(profile.coffeeDate) : 'Ainda não foi a um café'}
      </InfoLine>
      <InfoLine icon={GraduationCap} label="Turma" empty={!profile.cohortName}>
        {profile.cohortName ?? 'Ainda não fez a turma'}
      </InfoLine>
    </InfoPanel>
  );
}

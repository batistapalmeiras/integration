// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, Skeleton } from 'bp-kit';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { AppRoute } from '../../../routes/paths';
import { useVisitorDetail } from '../../../features/visitors';
import { FormContent } from '../../../components/FormLayout';
import { NextStep } from './components/NextStep';
import { PersonCard } from './components/PersonCard';
import { PersonDetailsCard } from './components/PersonDetailsCard';
import { ProgressStepper } from './components/ProgressStepper';

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detail = useVisitorDetail(id ?? '');
  const { person, loading, error, profileCoffeeDate, profileCohortName } = detail;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  return (
    <FormContent>
      <PageHeader title={person.name} subtitle={person.status === 'member' ? 'Membro' : 'Visitante'} back />

      {person.status !== 'member' && <ProgressStepper status={person.status} />}

      <PersonCard person={person} onClick={() => navigate(`${AppRoute.Visitors}/${id}/editar`)} />

      <PersonDetailsCard
        person={person}
        coffeeDate={profileCoffeeDate}
        cohortName={profileCohortName}
        onClick={() => navigate(`${AppRoute.Visitors}/${id}/detalhes`)}
      />

      <NextStep detail={detail} onContactRegistered={() => navigate(AppRoute.Visitors)} />
    </FormContent>
  );
}

// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, PageHeader, Skeleton } from 'bp-kit';
// Local
import { AppRoute } from '../../../routes/paths';
import { NextStep } from './components/NextStep';
import { PersonCard } from './components/PersonCard';
import { PersonDetailsCard } from './components/PersonDetailsCard';
import { ProgressStepper } from './components/ProgressStepper';
import { useVisitorDetail } from '../../../features/visitors';
import { Content } from './styles';

export function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detail = useVisitorDetail(id ?? '');
  const { person, loading, error, profileCoffeeDate, profileCohortName } = detail;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !person) return <Empty title="Visitante não encontrado" description={error ?? ''} />;

  return (
    <Content>
      <PageHeader title={person.name} subtitle="Visitante" back />

      <ProgressStepper status={person.status} />

      <PersonCard person={person} onClick={() => navigate(`${AppRoute.Visitors}/${id}/editar`)} />

      <PersonDetailsCard
        person={person}
        coffeeDate={profileCoffeeDate}
        cohortName={profileCohortName}
        onClick={() => navigate(`${AppRoute.Visitors}/${id}/detalhes`)}
      />

      <NextStep detail={detail} onContactRegistered={() => navigate(AppRoute.Visitors)} />
    </Content>
  );
}

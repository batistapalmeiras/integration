// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, PageHeader, Skeleton, text } from 'bp-kit';
// Local
import { StatusPill } from '../../../components/StatusPill';
import { AppRoute } from '../../../routes/paths';
import { useCohortRoster } from '../hooks';
import { CountBadge, HideOnMobile, NameCell, NameSubtitle, PlainTable, PlainTableWrap } from '../styles';

export function CohortRosterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cohort, roster, loading, error, closeCohort } = useCohortRoster(id ?? '');

  if (loading) return <Skeleton $h="320px" />;
  if (error || !cohort) return <Empty title="Turma não encontrada" description={error ?? ''} />;

  return (
    <div>
      <PageHeader
        title={cohort.name}
        subtitle={cohort.status === 'active' ? 'Turma ativa' : 'Turma encerrada'}
        back
        action={
          cohort.status === 'active' ? (
            <Button variant="secondary" onClick={closeCohort}>
              Encerrar turma
            </Button>
          ) : undefined
        }
      />

      {roster.length === 0 ? (
        <Empty title="Ninguém matriculado" description="Essa turma não teve matrículas." />
      ) : (
        <PlainTableWrap>
          <PlainTable>
            <thead>
              <tr>
                <th>{text.fields.name}</th>
                <th>{text.fields.status}</th>
                <HideOnMobile>Presenças</HideOnMobile>
              </tr>
            </thead>
            <tbody>
              {roster.map((row) => (
                <tr key={row.enrollmentId} onClick={() => navigate(`${AppRoute.Visitors}/${row.personId}`)}>
                  <td>
                    <NameCell>
                      {row.name}
                      <NameSubtitle>
                        {row.lessonsAttended}/{row.totalLessons} presenças
                      </NameSubtitle>
                    </NameCell>
                  </td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                  <HideOnMobile as="td">
                    <CountBadge $eligible={row.lessonsAttended >= 3}>
                      {row.lessonsAttended}/{row.totalLessons}
                    </CountBadge>
                  </HideOnMobile>
                </tr>
              ))}
            </tbody>
          </PlainTable>
        </PlainTableWrap>
      )}
    </div>
  );
}

// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, LinkButton, Skeleton, useAuthCtx, useModal } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Components
import { EntryTypeTable } from '../../../components/EntryTypeTable';
import { PageHeader } from '../../../components/PageHeader';
// Local
import { PeopleCount } from '../../../components/PeopleCount';
import { formatDate } from '../../../domain/dates';
import { CouncilModal } from '../../../features/councils';
import { errorMessage } from '../../../lib/queryCache';
import { useCouncilRoster } from '../../../queries/councils';
import { AppRoute, COUNCILS_PATH } from '../../../routes/paths';
import { UserRole } from '../../../types/enums';

export function CouncilRosterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { open, close, modal } = useModal('drawer');
  const { data, loading, error } = useCouncilRoster(id ?? '');
  const council = data?.council;
  const members = data?.members ?? [];
  const isPastor = user?.role === UserRole.Pastor;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !council)
    return <Empty title="Conselho Administrativo não encontrado" description={errorMessage(error) ?? ''} />;

  return (
    <div>
      <PageHeader
        title="Conselho Administrativo"
        subtitle={formatDate(council.meetingDate)}
        back
        action={
          isPastor && (
            <LinkButton
              icon={<Pencil size={16} />}
              onClick={() =>
                open(
                  <CouncilModal
                    council={council}
                    close={close}
                    onDeleted={() => navigate(COUNCILS_PATH, { replace: true })}
                  />,
                )
              }
            >
              Editar
            </LinkButton>
          )
        }
      />

      <PeopleCount count={members.length} />

      {members.length === 0 ? (
        <Empty
          title="Ninguém aprovado ainda"
          description="Quem for confirmado como membro com este Conselho Administrativo aparece aqui."
        />
      ) : (
        <EntryTypeTable
          rows={members.map((member) => ({ id: member.personId, name: member.name, entryType: member.entryType }))}
          onSelect={isPastor ? (personId) => navigate(`${AppRoute.Members}/${personId}`) : undefined}
        />
      )}
      {modal}
    </div>
  );
}

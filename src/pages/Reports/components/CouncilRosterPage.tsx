// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Button, Empty, Skeleton, useModal } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Components
import { CountRow } from '../../../components/CountRow';
import { EntryTypeTable } from '../../../components/EntryTypeTable';
import { PageHeader } from '../../../components/PageHeader';
// Local
import { useRole } from '../../../features/access/useRole';
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
  const role = useRole();
  const { open, close, modal } = useModal('drawer');
  const { data, loading, error } = useCouncilRoster(id ?? '');
  const council = data?.council;
  const members = data?.members ?? [];
  const isGeneralAdmin = role === UserRole.GeneralAdmin;

  if (loading) return <Skeleton $h="320px" />;
  if (error || !council)
    return <Empty title="Conselho Administrativo não encontrado" description={errorMessage(error) ?? ''} />;

  return (
    <div>
      <PageHeader
        title="Conselho Administrativo"
        subtitle={formatDate(council.meetingDate)}
        back
      />

      <CountRow>
        <PeopleCount count={members.length} />
        {isGeneralAdmin && (
          <Button
            variant="secondary"
            size="sm"
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
            <Pencil size={16} />
            Editar
          </Button>
        )}
      </CountRow>

      {members.length === 0 ? (
        <Empty
          title="Ninguém aprovado ainda"
          description="Quem for confirmado como membro com este Conselho Administrativo aparece aqui."
        />
      ) : (
        <EntryTypeTable
          rows={members.map((member) => ({ id: member.personId, name: member.name, entryType: member.entryType }))}
          onSelect={isGeneralAdmin ? (personId) => navigate(`${AppRoute.Members}/${personId}`) : undefined}
        />
      )}
      {modal}
    </div>
  );
}

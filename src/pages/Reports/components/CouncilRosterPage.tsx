// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import { Empty, LinkButton, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { Pencil } from 'lucide-react';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { PeopleCount } from '../../../components/PeopleCount';
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { formatDate } from '../../../domain/dates';
import { CouncilModal } from '../../../features/councils';
import { errorMessage } from '../../../lib/queryCache';
import { useCouncils } from '../../../queries/councils';
import { AppRoute, COUNCILS_PATH } from '../../../routes/paths';
import { ENTRY_TYPE_LABELS } from '../../../types/church';
import { UserRole } from '../../../types/enums';

export function CouncilRosterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { open, close, modal } = useModal('drawer');
  const { data: councils, loading, error } = useCouncils();
  const council = councils?.find((item) => item.id === id);
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

      <PeopleCount count={council.members.length} />

      {council.members.length === 0 ? (
        <Empty
          title="Ninguém aprovado ainda"
          description="Quem for confirmado como membro com este Conselho Administrativo aparece aqui."
        />
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th $shrink>Forma de entrada</Th>
              </tr>
            </thead>
            <tbody>
              {council.members.map((member) => (
                <Tr
                  key={member.personId}
                  $clickable={isPastor}
                  onClick={isPastor ? () => navigate(`${AppRoute.Members}/${member.personId}`) : undefined}
                >
                  <Td $truncate title={member.name}>
                    {member.name}
                  </Td>
                  <Td $shrink>{member.entryType ? ENTRY_TYPE_LABELS[member.entryType] : '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
      {modal}
    </div>
  );
}

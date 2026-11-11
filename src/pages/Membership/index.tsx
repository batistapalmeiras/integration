// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, LinkButton, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { AlertTriangle, CalendarDays, ChevronRight, Plus } from 'lucide-react';
// Components
import { PageHeader } from '../../components/PageHeader';
import { PeopleCount } from '../../components/PeopleCount';
import { NameCell, NameText, ReviewFlag, Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { currentCouncil } from '../../domain/councils';
import { CouncilModal } from '../../features/councils';
import { formatDate } from '../../domain/dates';
import { useCouncils } from '../../queries/councils';
import { AppRoute, councilPath } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { ENTRY_TYPE_LABELS } from '../../types/church';
// Local
import { useMembershipQueue } from './hooks/useMembershipQueue';
import { CouncilBar, CouncilLabel } from './styles';

export function MembershipPage() {
  const navigate = useNavigate();
  const { user } = useAuthCtx();
  const { open, close, modal } = useModal('drawer');
  const { rows, loading, error } = useMembershipQueue();
  const council = currentCouncil(useCouncils().data ?? []);
  const isPastor = user?.role === UserRole.Pastor;

  return (
    <div>
      <PageHeader
        title="Membresia"
        action={
          isPastor && (
            <Button variant="secondary" onClick={() => open(<CouncilModal close={close} />)}>
              <Plus size={16} />
              Novo conselho
            </Button>
          )
        }
      />

      <CouncilBar>
        <CouncilLabel>
          <CalendarDays size={16} aria-hidden="true" />
          {council ? `Conselho atual: ${formatDate(council.meetingDate)}` : 'Nenhum conselho criado'}
        </CouncilLabel>
        {council && (
          <LinkButton icon={<ChevronRight size={16} />} onClick={() => navigate(councilPath(council.id))}>
            Ver lista
          </LinkButton>
        )}
      </CouncilBar>

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && rows.length === 0 && (
        <Empty
          title="Ninguém aguardando o Conselho"
          description="Quem concluir as aulas e preencher a ficha aparece aqui."
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <PeopleCount count={rows.length} />
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>{text.fields.name}</Th>
                  <Th $shrink>Forma de entrada</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Tr
                    key={row.id}
                    $clickable
                    onClick={() => navigate(`${AppRoute.Visitors}/${row.id}/detalhes?tab=membership&from=membership`)}
                  >
                    <Td $truncate title={row.name}>
                      <NameCell>
                        <NameText>{row.name}</NameText>
                        {row.reviewReasons.map((reason) => (
                          <ReviewFlag key={reason}>
                            <AlertTriangle size={12} />
                            {reason}
                          </ReviewFlag>
                        ))}
                      </NameCell>
                    </Td>
                    <Td $shrink>{row.entryType ? ENTRY_TYPE_LABELS[row.entryType] : '—'}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </>
      )}
      {modal}
    </div>
  );
}

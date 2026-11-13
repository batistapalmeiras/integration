// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, LinkButton, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { AlertTriangle, CalendarDays, ChevronRight, Plus } from 'lucide-react';
// Components
import { PageHeader } from '../../components/PageHeader';
import { PeopleCount } from '../../components/PeopleCount';
import { DirectSignupFlag } from '../../components/DirectSignupFlag';
import { TonePill } from '../../components/StatusPill';
import { NameCell, NameLine, NameText, ReviewFlag, Table, TableWrapper, Td, Th, Tr } from '../../components/Table';
import { currentCouncil } from '../../domain/councils';
import { CouncilModal } from '../../features/councils';
import { formatDate } from '../../domain/dates';
import { useCouncils } from '../../queries/councils';
import { AppRoute, COUNCILS_PATH } from '../../routes/paths';
import { UserRole } from '../../types/enums';
import { ENTRY_TYPE_LABELS, ENTRY_TYPE_TONES } from '../../types/church';
// Local
import { useMembershipQueue } from './hooks/useMembershipQueue';
import { CouncilBar, CouncilLabel, WideOnly } from './styles';

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
              Novo Conselho
            </Button>
          )
        }
      />

      <CouncilBar>
        <CouncilLabel>
          <CalendarDays size={16} aria-hidden="true" />
          {council
            ? `Conselho Administrativo: ${formatDate(council.meetingDate)}`
            : 'Nenhum Conselho Administrativo criado'}
        </CouncilLabel>
        {council && (
          <LinkButton icon={<ChevronRight size={16} />} onClick={() => navigate(COUNCILS_PATH)}>
            Ver lista
          </LinkButton>
        )}
      </CouncilBar>

      {loading && <Skeleton $h="240px" />}

      {!loading && error && <Empty title={text.feedback.loadError} description={error} />}

      {!loading && !error && rows.length === 0 && (
        <Empty
          title="Ninguém aguardando o Conselho Administrativo"
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
                  <Th $shrink>
                    <WideOnly>Forma de entrada</WideOnly>
                  </Th>
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
                        <NameLine>
                          <NameText>{row.name}</NameText>
                          {row.directSignup && <DirectSignupFlag />}
                        </NameLine>
                        {row.reviewReasons.map((reason) => (
                          <ReviewFlag key={reason}>
                            <AlertTriangle size={12} />
                            {reason}
                          </ReviewFlag>
                        ))}
                      </NameCell>
                    </Td>
                    <Td $shrink>
                      {row.entryType ? (
                        <TonePill $tone={ENTRY_TYPE_TONES[row.entryType]}>{ENTRY_TYPE_LABELS[row.entryType]}</TonePill>
                      ) : (
                        '—'
                      )}
                    </Td>
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

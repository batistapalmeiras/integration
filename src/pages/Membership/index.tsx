// React
import { useNavigate } from 'react-router-dom';
// Libs
import { Button, Empty, LinkButton, Skeleton, text, useAuthCtx, useModal } from 'bp-kit';
import { CalendarDays, ChevronRight, Plus } from 'lucide-react';
// Components
import { EntryTypeTable } from '../../components/EntryTypeTable';
import { PageHeader } from '../../components/PageHeader';
import { PeopleCount } from '../../components/PeopleCount';
import { currentCouncil } from '../../domain/councils';
import { CouncilModal } from '../../features/councils';
import { formatDate } from '../../domain/dates';
import { useCouncils } from '../../queries/councils';
import { AppRoute, COUNCILS_PATH } from '../../routes/paths';
import { UserRole } from '../../types/enums';
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
          <EntryTypeTable
            rows={rows}
            onSelect={(id) => navigate(`${AppRoute.Visitors}/${id}/detalhes?tab=membership&from=membership`)}
          />
        </>
      )}
      {modal}
    </div>
  );
}

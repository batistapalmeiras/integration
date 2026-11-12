// React
import { useNavigate, useParams } from 'react-router-dom';
// Libs
import {
  Button,
  Empty,
  IconButton,
  ModalActions,
  ModalTitle,
  Skeleton,
  text,
  Typography,
  useModal,
  useToast,
} from 'bp-kit';
import { Pencil, Plus, Trash2, UserMinus } from 'lucide-react';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { AddButton } from '../../../components/AddButton';
import { TonePill } from '../../../components/StatusPill';
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import { CommunityGroup, GroupInput, PersonInGroup, WEEK_DAY_LABELS } from '../../../domain/communityGroups';
import {
  addPeopleToMinistry,
  addPeopleToSmallGroup,
  deleteMinistry,
  deleteSmallGroup,
  getMinistry,
  getSmallGroup,
  listPeopleInMinistry,
  listPeopleInSmallGroup,
  removePersonFromMinistry,
  removePersonFromSmallGroup,
  updateMinistry,
  updateSmallGroup,
} from '../../../repositories/communityGroups';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { refreshGroupLists } from '../hooks/useCommunityGroupsList';
import { AppRoute } from '../../../routes/paths';
import { AddMembersModal } from '../components/AddMembersModal';
import { GroupModal } from '../components/GroupModal';
import { GroupSummary, LeaderList, NameCell, Stack, SummaryItem } from '../styles';

type GroupType = 'ministerios' | 'pgs';

export function CommunityGroupDetailPage() {
  const { type, id } = useParams<{ type: GroupType; id: string }>();
  const navigate = useNavigate();
  const { open, close, modal } = useModal('drawer');
  const { show: showToast, toast } = useToast();
  const isPg = type === 'pgs';
  const groupType = isPg ? 'small-groups' : 'ministries';
  const label = isPg ? 'Pequeno Grupo' : 'Ministério';
  const listRoute = isPg ? AppRoute.SmallGroups : AppRoute.Ministries;

  const query = useQuery(
    queryKeys.groupDetail(groupType, id ?? ''),
    async (): Promise<{ group: CommunityGroup; people: PersonInGroup[] }> => {
      const getGroup = isPg ? getSmallGroup : getMinistry;
      const listPeople = isPg ? listPeopleInSmallGroup : listPeopleInMinistry;
      const [group, people] = await Promise.all([getGroup(id ?? ''), listPeople(id ?? '')]);
      return { group, people };
    },
    { enabled: !!id },
  );
  const group = query.data?.group ?? null;
  const people = query.data?.people ?? [];
  const loading = query.loading;
  const error = query.error ? (errorMessage(query.error) ?? 'Erro ao carregar.') : null;

  const load = async () => {
    await refreshGroupLists(groupType);
    await query.refetch();
  };

  if (loading) return <Skeleton $h="320px" />;
  if (error || !group) return <Empty title={`${label} não encontrado`} description={error ?? ''} />;

  const roleOf = (personId: string) =>
    [group.leaderIds.includes(personId) && 'Líder', group.hostIds.includes(personId) && 'Anfitrião'].filter(
      (role): role is string => !!role,
    );
  const namesOf = (ids: string[]) => people.filter((person) => ids.includes(person.id));

  const save = async (input: GroupInput) => {
    if (isPg) await updateSmallGroup(group.id, input);
    else await updateMinistry(group.id, input);
    close();
    await load();
  };

  const openEdit = () =>
    open(
      <GroupModal
        title={`Editar ${group.name}`}
        fieldLabel={label}
        group={group}
        smallGroup={isPg}
        groupMembers={people}
        onDelete={people.length === 0 ? openDelete : undefined}
        close={close}
        onSave={save}
      />,
    );

  const openAddMembers = () =>
    open(
      <AddMembersModal
        title={`Adicionar membros a ${group.name}`}
        currentIds={people.map((person) => person.id)}
        withoutSmallGroup={isPg}
        close={close}
        onAdd={async (personIds) => {
          try {
            if (isPg) await addPeopleToSmallGroup(group.id, personIds);
            else await addPeopleToMinistry(group.id, personIds);
            await load();
          } catch (e) {
            showToast((e as { message?: string }).message ?? 'Não foi possível adicionar.');
          }
        }}
      />,
    );

  const openRemovePerson = (person: PersonInGroup) =>
    open(
      <>
        <ModalTitle onClose={close}>Remover {person.name}?</ModalTitle>
        <Typography type="p">
          O cadastro não é apagado. A pessoa apenas deixa de participar deste {label.toLowerCase()}
          {roleOf(person.id).length > 0 && ` e deixa de ser ${roleOf(person.id).join(' e ').toLowerCase()}`}.
        </Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              try {
                if (isPg) await removePersonFromSmallGroup(person.id);
                else await removePersonFromMinistry(group.id, person.id);
                close();
                await load();
              } catch (e) {
                showToast((e as { message?: string }).message ?? 'Não foi possível remover.');
              }
            }}
          >
            <UserMinus size={16} />
            Remover
          </Button>
        </ModalActions>
      </>,
    );

  const openDelete = () =>
    open(
      <>
        <ModalTitle onClose={close}>Excluir {group.name}?</ModalTitle>
        <Typography type="p">Essa ação não pode ser desfeita.</Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              try {
                const remove = isPg ? deleteSmallGroup : deleteMinistry;
                await remove(group.id);
                await refreshGroupLists(groupType);
                close();
                navigate(listRoute);
              } catch (e) {
                showToast(e instanceof Error ? e.message : 'Não foi possível excluir.');
              }
            }}
          >
            <Trash2 size={16} />
            Excluir
          </Button>
        </ModalActions>
      </>,
    );

  return (
    <Stack>
      <PageHeader
        title={group.name}
        subtitle={label}
        back
        action={
          <Button variant="secondary" onClick={openEdit}>
            <Pencil size={16} />
            Editar
          </Button>
        }
      />

      <GroupSummary>
        {isPg && (
          <SummaryItem>
            <Typography type="label">Dia</Typography>
            <Typography type="caption">
              {group.meetingDay ? WEEK_DAY_LABELS[group.meetingDay] : 'Nenhum dia cadastrado.'}
            </Typography>
          </SummaryItem>
        )}
        <SummaryItem>
          <Typography type="label">Líder(es)</Typography>
          <PeoplePills people={namesOf(group.leaderIds)} emptyText="Nenhum líder cadastrado." />
        </SummaryItem>
        {isPg && (
          <SummaryItem>
            <Typography type="label">Anfitrião(ões)</Typography>
            <PeoplePills people={namesOf(group.hostIds)} emptyText="Nenhum anfitrião cadastrado." />
          </SummaryItem>
        )}
      </GroupSummary>

      {people.length === 0 && (
        <Empty title="Ninguém vinculado ainda" description="Use o botão acima para adicionar pessoas." />
      )}

      {people.length > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>{text.fields.name}</Th>
                <Th $shrink />
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <Tr key={person.id} $clickable onClick={() => navigate(`${person.isMember ? AppRoute.Members : AppRoute.Visitors}/${person.id}`)}>
                  <Td data-label={text.fields.name}>
                    <NameCell>
                      {person.name}
                      {roleOf(person.id).map((role) => (
                        <TonePill key={role} $tone="success">
                          {role}
                        </TonePill>
                      ))}
                    </NameCell>
                  </Td>
                  <Td $shrink>
                    <IconButton
                      icon={<UserMinus size={14} />}
                      iconPosition="center"
                      variant="secondary"
                      size="sm"
                      aria-label={`Remover ${person.name}`}
                      title="Remover"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRemovePerson(person);
                      }}
                    />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      <AddButton type="button" onClick={openAddMembers}>
        <Plus size={18} />
        Adicionar membros
      </AddButton>

      {modal}
      {toast}
    </Stack>
  );
}

interface PeoplePillsProps {
  people: PersonInGroup[];
  emptyText: string;
}

function PeoplePills({ people, emptyText }: PeoplePillsProps) {
  if (people.length === 0) return <Typography type="caption">{emptyText}</Typography>;
  return (
    <LeaderList>
      {people.map((person) => (
        <TonePill key={person.id} $tone="success">
          {person.name}
        </TonePill>
      ))}
    </LeaderList>
  );
}

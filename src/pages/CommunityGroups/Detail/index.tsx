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
import { FieldGroup, LeaderList, LeaderRow, NameCell, Stack } from '../styles';

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

  const memberNames = people.map((person) => person.name);
  const roleOf = (name: string) =>
    [group.leaders.includes(name) && 'Líder', group.hosts.includes(name) && 'Anfitrião'].filter(
      (role): role is string => !!role,
    );

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
        groupMembers={memberNames}
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
          {roleOf(person.name).length > 0 && ` e deixa de ser ${roleOf(person.name).join(' e ').toLowerCase()}`}.
        </Typography>
        <ModalActions>
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              try {
                if (isPg) await removePersonFromSmallGroup(person.id);
                else await removePersonFromMinistry(group.id, person.id);
                if (roleOf(person.name).length > 0) {
                  await (isPg ? updateSmallGroup : updateMinistry)(group.id, {
                    ...group,
                    leaders: group.leaders.filter((name) => name !== person.name),
                    hosts: group.hosts.filter((name) => name !== person.name),
                  });
                }
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
        subtitle={isPg && group.meetingDay ? `${label} · ${WEEK_DAY_LABELS[group.meetingDay]}` : label}
        back
        action={
          <Button variant="secondary" onClick={openEdit}>
            <Pencil size={16} />
            Editar
          </Button>
        }
      />

      <FieldGroup>
        <Typography type="label">Líder(es)</Typography>
        <LeaderList>
          {group.leaders.length === 0 && <Typography type="caption">Nenhum líder cadastrado.</Typography>}
          {group.leaders.map((leader) => (
            <LeaderRow key={leader} $readOnly>
              <Typography type="caption">{leader}</Typography>
            </LeaderRow>
          ))}
        </LeaderList>
      </FieldGroup>

      {isPg && (
        <FieldGroup>
          <Typography type="label">Anfitrião(ões)</Typography>
          <LeaderList>
            {group.hosts.length === 0 && <Typography type="caption">Nenhum anfitrião cadastrado.</Typography>}
            {group.hosts.map((host) => (
              <LeaderRow key={host} $readOnly>
                <Typography type="caption">{host}</Typography>
              </LeaderRow>
            ))}
          </LeaderList>
        </FieldGroup>
      )}

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
                <Tr key={person.id} $clickable onClick={() => navigate(`${AppRoute.Visitors}/${person.id}`)}>
                  <Td data-label={text.fields.name}>
                    <NameCell>
                      {person.name}
                      {roleOf(person.name).map((role) => (
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

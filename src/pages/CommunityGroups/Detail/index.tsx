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
  Typography,
  text,
  useModal,
  useToast,
} from 'bp-kit';
import { Plus, Trash2, UserMinus } from 'lucide-react';
// Components
import { PageHeader } from '../../../components/PageHeader';
// Local
import { AddButton } from '../../../components/AddButton';
import { Table, TableWrapper, Td, Th, Tr } from '../../../components/Table';
import {
  CommunityGroup,
  PersonInGroup,
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
} from '../../../domain/communityGroups';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { refreshGroupLists } from '../hooks/useCommunityGroupsList';
import { AppRoute } from '../../../routes/paths';
import { AddMembersModal } from '../components/AddMembersModal';
import { GroupModal } from '../components/GroupModal';
import { FieldGroup, HeaderActions, LeaderList, LeaderRow, Stack } from '../styles';

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
  const error = query.error ? errorMessage(query.error) ?? 'Erro ao carregar.' : null;

  const load = async () => {
    await refreshGroupLists(groupType);
    await query.refetch();
  };

  if (loading) return <Skeleton $h="320px" />;
  if (error || !group) return <Empty title={`${label} não encontrado`} description={error ?? ''} />;

  const save = async (name: string, leaders: string[], hosts: string[]) => {
    if (isPg) await updateSmallGroup(group.id, name, leaders, hosts);
    else await updateMinistry(group.id, name, leaders);
    close();
    await load();
  };

  const openEdit = () =>
    open(
      <GroupModal
        title={`Editar ${group.name}`}
        fieldLabel={label}
        initialName={group.name}
        initialLeaders={group.leaders}
        initialHosts={group.hosts}
        hasHosts={isPg}
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
        <ModalTitle onClose={close}>Remover {person.name} de {group.name}?</ModalTitle>
        <Typography type="p">
          A pessoa continua cadastrada; só deixa de fazer parte deste {label.toLowerCase()}.
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
          <HeaderActions>
            <Button variant="secondary" onClick={openEdit}>
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={openDelete}
              disabled={people.length > 0}
              title={people.length > 0 ? `${people.length} pessoa(s) vinculada(s)` : 'Excluir'}
            >
              <Trash2 size={16} />
              Excluir
            </Button>
          </HeaderActions>
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

      {people.length === 0 && <Empty title="Ninguém vinculado ainda" description="" />}

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
                  <Td data-label={text.fields.name}>{person.name}</Td>
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

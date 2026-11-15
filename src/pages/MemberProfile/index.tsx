// React
import { useParams } from 'react-router-dom';
// Libs
import { Empty, LinkButton, Skeleton, useModal } from 'bp-kit';
import { Camera, ImagePlus, HeartHandshake, Pencil, UsersRound } from 'lucide-react';
// Components
import { MemberPhoto } from '../../components/MemberPhoto';
import { NotesPanel } from '../../components/NotesPanel';
import { PageHeader } from '../../components/PageHeader';
import { Columns, SideColumn, WideContent } from '../../components/PageColumns';
import { Field, FieldLabel, Fields, FieldValue, Panel, PanelHeader, PanelTitle } from '../../components/Panel';
// Local
import { InfoLine, InfoPanel } from '../../components/InfoLine';
import { MembershipAlerts } from '../../components/MembershipAlerts';
import { CouncilDate } from '../../domain/councils';
import { DirectSignupFlag } from '../../components/DirectSignupFlag';
import { TonePill } from '../../components/StatusPill';
import { formatTimestampDate } from '../../domain/dates';
import { MEMBER_FLAG_LABELS } from '../../domain/memberFlags';
import { isDirectSignup } from '../../domain/origin';
import {
  canLeavePhoneEmpty,
  MemberRecord,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_TONES,
} from '../../domain/memberRecords';
import { displayValue, MEMBER_RECORD_SECTIONS, RecordSection } from '../../features/memberRecord';
import { errorMessage, invalidateQueries, markPipelineStale } from '../../lib/queryCache';
import { queryKeys } from '../../lib/queryKeys';
import { useMemberPhotoUrls } from '../../queries/memberPhotos';
import { useFamily, useMemberPage, usePersonNotes } from '../../queries/person';
import { useMinistries, useSmallGroups } from '../../queries/reference';
import { savePersonCommunity } from '../../repositories/communityGroups';
import { GroupChecklistModal } from './components/GroupChecklistModal';
import { EditSectionModal } from './components/EditSectionModal';
import { FamilyModal } from './components/FamilyModal';
import { FamilyPanel } from './components/FamilyPanel';
import { GroupNames } from './components/GroupNames';
import { MemberHistory } from './components/MemberHistory';
import { PhotoModal } from './components/PhotoModal';
import { HeroCards, HeroGrid, HeroStatus, PhotoBadge, PhotoButton } from './styles';

const MEMBERSHIP_SECTION = 'membership';
const SIDE_SECTIONS = ['contact'];
const FAMILY_AFTER = 'personal';
const CHURCH_SECTION = 'church';

const MEMBERSHIP = MEMBER_RECORD_SECTIONS.find((section) => section.id === MEMBERSHIP_SECTION);
const SIDE = MEMBER_RECORD_SECTIONS.filter((section) => SIDE_SECTIONS.includes(section.id));
const MAIN = MEMBER_RECORD_SECTIONS.filter(
  (section) => section.id !== MEMBERSHIP_SECTION && !SIDE_SECTIONS.includes(section.id),
);

export function MemberProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { open, close, modal } = useModal('drawer', { fullScreenOnMobile: true });
  const familyModal = useModal('drawer', { fullScreenOnMobile: true });
  const pageQuery = useMemberPage(id);
  const allSmallGroups = useSmallGroups().data ?? [];
  const allMinistries = useMinistries().data ?? [];
  const notesQuery = usePersonNotes(id);
  const family = useFamily(id).data;
  const page = pageQuery.data ?? null;
  const photoFolder = page?.info.photoFolder ?? null;
  const photoUrl =
    useMemberPhotoUrls(photoFolder ? [{ personId: id, folder: photoFolder }] : [], ['photo']).data?.photo[id] ?? null;
  const loadError = errorMessage(pageQuery.error);

  if (loadError) return <Empty title="Membro não encontrado" description={loadError} />;
  if (!page) return <Skeleton $h="320px" />;

  const { record, info, community, flags } = page;
  const councils = info.council ? [info.council] : [];
  const smallGroups = community.smallGroupNames;
  const ministries = community.ministryNames;
  const notes = notesQuery.data ?? [];
  const smallGroupRoles = (groupId: string) => [
    ...(community.leaderOfSmallGroupIds.includes(groupId) ? ['Líder'] : []),
    ...(community.hostOfSmallGroupIds.includes(groupId) ? ['Anfitrião'] : []),
  ];
  const ministryRoles = (ministryId: string) => (community.leaderOfMinistryIds.includes(ministryId) ? ['Líder'] : []);
  const smallGroupsWithRoles = community.smallGroupIds.map((groupId, index) => ({
    id: groupId,
    name: community.smallGroupNames[index],
    roles: smallGroupRoles(groupId),
  }));
  const ministriesWithRoles = community.ministryIds.map((ministryId, index) => ({
    id: ministryId,
    name: community.ministryNames[index],
    roles: ministryRoles(ministryId),
  }));

  const saveCommunity = async (smallGroupIds: string[], ministryIds: string[]) => {
    await savePersonCommunity(id, smallGroupIds, ministryIds);
    await markPipelineStale();
    await invalidateQueries(queryKeys.memberPage(id));
  };

  const editSmallGroups = () =>
    open(
      <GroupChecklistModal
        title="Pequenos Grupos"
        emptyText="Nenhum Pequeno Grupo cadastrado."
        searchPlaceholder="Buscar pelo Pequeno Grupo…"
        groups={allSmallGroups.map((group) => ({ ...group, roles: smallGroupRoles(group.id) }))}
        selected={community.smallGroupIds}
        onSave={(ids) => saveCommunity(ids, community.ministryIds)}
        close={close}
      />,
    );

  const editMinistries = () =>
    open(
      <GroupChecklistModal
        title="Ministérios"
        emptyText="Nenhum ministério cadastrado."
        searchPlaceholder="Buscar pelo Ministério…"
        groups={allMinistries.map((ministry) => ({ ...ministry, roles: ministryRoles(ministry.id) }))}
        selected={community.ministryIds}
        onSave={(ids) => saveCommunity(community.smallGroupIds, ids)}
        close={close}
      />,
    );

  const edit = (section: RecordSection) =>
    open(
      <EditSectionModal
        personId={id}
        record={record}
        section={section}
        optionalPhone={canLeavePhoneEmpty(info.origin)}
        flags={section.id === MEMBERSHIP_SECTION ? flags : undefined}
        close={close}
      />,
    );

  const churchInfo: InfoField[] = [{ label: 'Cadastrado em', value: formatTimestampDate(info.createdAt) }];

  const renderPanel = (section: RecordSection) => (
    <SectionPanel
      key={section.id}
      section={section}
      record={record}
      councils={councils}
      info={section.id === CHURCH_SECTION ? churchInfo : []}
      onEdit={() => edit(section)}
    />
  );

  return (
    <WideContent>
      <PageHeader title={record.name} back sticky />

      <HeroGrid>
        <PhotoButton
          type="button"
          $empty={!photoFolder}
          aria-label={photoFolder ? 'Trocar foto' : 'Adicionar foto'}
          onClick={() =>
            open(
              <PhotoModal
                personId={id}
                photoUrl={photoUrl}
                photoFolder={photoFolder}
                spouse={family?.find((relative) => relative.relation === 'spouse') ?? null}
                close={close}
              />,
            )
          }
        >
          {photoFolder ? (
            <>
              <MemberPhoto url={photoUrl} size={104} />
              <PhotoBadge>
                <Camera size={14} aria-hidden="true" />
              </PhotoBadge>
            </>
          ) : (
            <>
              <ImagePlus size={24} aria-hidden="true" />
              Adicionar
            </>
          )}
        </PhotoButton>
        <HeroStatus>
          <TonePill $tone={MEMBERSHIP_STATUS_TONES[record.membershipStatus]}>
            {MEMBERSHIP_STATUS_LABELS[record.membershipStatus]}
          </TonePill>
          {isDirectSignup(info.origin) && <DirectSignupFlag />}
          {flags.map((flag) => (
            <TonePill key={flag} $tone="warning">
              {MEMBER_FLAG_LABELS[flag]}
            </TonePill>
          ))}
          {MEMBERSHIP && (
            <LinkButton icon={<Pencil size={14} />} onClick={() => edit(MEMBERSHIP)}>
              Alterar
            </LinkButton>
          )}
        </HeroStatus>
        <HeroCards>
          <InfoPanel>
            <InfoLine
              icon={UsersRound}
              label={smallGroups.length === 1 ? 'Pequeno Grupo' : 'Pequenos Grupos'}
              empty={smallGroups.length === 0}
              action={
                <LinkButton icon={<Pencil size={14} />} onClick={editSmallGroups}>
                  Editar
                </LinkButton>
              }
            >
              {smallGroups.length > 0 ? <GroupNames groups={smallGroupsWithRoles} /> : 'Não participa de um PG'}
            </InfoLine>
            <InfoLine
              icon={HeartHandshake}
              label={ministries.length === 1 ? 'Ministério' : 'Ministérios'}
              empty={ministries.length === 0}
              action={
                <LinkButton icon={<Pencil size={14} />} onClick={editMinistries}>
                  Editar
                </LinkButton>
              }
            >
              {ministries.length > 0 ? <GroupNames groups={ministriesWithRoles} /> : 'Não serve em um ministério'}
            </InfoLine>
          </InfoPanel>
        </HeroCards>
      </HeroGrid>

      <MembershipAlerts personId={id} onlyPending />

      <Columns>
        <SideColumn>{SIDE.map(renderPanel)}</SideColumn>
        <div>
          {MAIN.flatMap((section) =>
            section.id === FAMILY_AFTER && family
              ? [
                  renderPanel(section),
                  <FamilyPanel
                    key="family"
                    family={family}
                    onEdit={() =>
                      familyModal.open(<FamilyModal personId={id} family={family} close={familyModal.close} />)
                    }
                  />,
                ]
              : [renderPanel(section)],
          )}
          <MemberHistory personId={id} name={record.name} info={info} />
          <NotesPanel personId={id} notes={notes} />
        </div>
      </Columns>

      {modal}
      {familyModal.modal}
    </WideContent>
  );
}

interface InfoField {
  label: string;
  value: string;
  wide?: boolean;
}

interface SectionPanelProps {
  section: RecordSection;
  record: MemberRecord;
  councils: CouncilDate[];
  info: InfoField[];
  onEdit: () => void;
}

function SectionPanel({ section, record, councils, info, onEdit }: SectionPanelProps) {
  const fields: InfoField[] = [
    ...section.fields.map((field) => ({
      label: field.label,
      value: displayValue(record, field, councils),
      wide: field.kind === 'textarea',
    })),
    ...info,
  ];
  return (
    <Panel aria-label={section.title}>
      <PanelHeader>
        <PanelTitle>{section.title}</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      {section.summary ? (
        <SummaryLines lines={section.summary(record)} />
      ) : (
        <Fields>
          {fields.map((field) => (
            <Field key={field.label} $wide={!!field.wide}>
              <FieldLabel>{field.label}</FieldLabel>
              <FieldValue $empty={!field.value}>{field.value || '—'}</FieldValue>
            </Field>
          ))}
        </Fields>
      )}
    </Panel>
  );
}

function SummaryLines({ lines }: { lines: string[] }) {
  if (lines.length === 0)
    return (
      <FieldValue as="p" $empty>
        —
      </FieldValue>
    );
  return (
    <FieldValue as="p" $empty={false}>
      {lines.join(' · ')}
    </FieldValue>
  );
}

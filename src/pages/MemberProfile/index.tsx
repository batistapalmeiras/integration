// React
import { useParams } from 'react-router-dom';
// Libs
import { Empty, LinkButton, Skeleton, useModal } from 'bp-kit';
import { HeartHandshake, Pencil, UsersRound } from 'lucide-react';
// Components
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
import { isDirectSignup } from '../../domain/origin';
import {
  canLeavePhoneEmpty,
  MemberRecord,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_TONES,
} from '../../domain/memberRecords';
import { displayValue, MEMBER_RECORD_SECTIONS, RecordSection } from '../../features/memberRecord';
import { errorMessage } from '../../lib/queryCache';
import { useFamily, useMemberPage, usePersonNotes } from '../../queries/person';
import { CommunityModal } from './components/CommunityModal';
import { EditSectionModal } from './components/EditSectionModal';
import { FamilyModal } from './components/FamilyModal';
import { FamilyPanel } from './components/FamilyPanel';
import { GroupNames } from './components/GroupNames';
import { MemberHistory } from './components/MemberHistory';
import { HeroText, StatusRow } from './styles';

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
  const notesQuery = usePersonNotes(id);
  const family = useFamily(id).data;
  const page = pageQuery.data ?? null;
  const loadError = errorMessage(pageQuery.error);

  if (loadError) return <Empty title="Membro não encontrado" description={loadError} />;
  if (!page) return <Skeleton $h="320px" />;

  const { record, info, community } = page;
  const councils = info.council ? [info.council] : [];
  const smallGroups = community.smallGroupNames;
  const ministries = community.ministryNames;
  const notes = notesQuery.data ?? [];
  const smallGroupsWithRoles = community.smallGroupIds.map((groupId, index) => ({
    id: groupId,
    name: community.smallGroupNames[index],
    roles: [
      ...(community.leaderOfSmallGroupIds.includes(groupId) ? ['Líder'] : []),
      ...(community.hostOfSmallGroupIds.includes(groupId) ? ['Anfitrião'] : []),
    ],
  }));
  const ministriesWithRoles = community.ministryIds.map((ministryId, index) => ({
    id: ministryId,
    name: community.ministryNames[index],
    roles: community.leaderOfMinistryIds.includes(ministryId) ? ['Líder'] : [],
  }));

  const edit = (section: RecordSection) =>
    open(
      <EditSectionModal
        personId={id}
        record={record}
        section={section}
        optionalPhone={canLeavePhoneEmpty(info.origin)}
        close={close}
      />,
    );

  const churchInfo: InfoField[] = [
    { label: 'Cadastrado em', value: formatTimestampDate(info.createdAt) },
  ];

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
      <PageHeader title={record.name} back />

      <HeroText>
        <StatusRow>
          <TonePill $tone={MEMBERSHIP_STATUS_TONES[record.membershipStatus]}>
            {MEMBERSHIP_STATUS_LABELS[record.membershipStatus]}
          </TonePill>
          {isDirectSignup(info.origin) && <DirectSignupFlag />}
          {MEMBERSHIP && (
            <LinkButton icon={<Pencil size={14} />} onClick={() => edit(MEMBERSHIP)}>
              Alterar
            </LinkButton>
          )}
        </StatusRow>
        <InfoPanel>
          <InfoLine
            icon={UsersRound}
            label={smallGroups.length === 1 ? 'Pequeno Grupo' : 'Pequenos Grupos'}
            empty={smallGroups.length === 0}
          >
            {smallGroups.length > 0 ? <GroupNames groups={smallGroupsWithRoles} /> : 'Não participa de um PG'}
          </InfoLine>
          <InfoLine
            icon={HeartHandshake}
            label={ministries.length === 1 ? 'Ministério' : 'Ministérios'}
            empty={ministries.length === 0}
          >
            {ministries.length > 0 ? <GroupNames groups={ministriesWithRoles} /> : 'Não serve em um ministério'}
          </InfoLine>
        </InfoPanel>
        <StatusRow>
          <LinkButton
            icon={<Pencil size={14} />}
            onClick={() => open(<CommunityModal personId={id} community={community} close={close} />)}
          >
            Alterar PG e ministérios
          </LinkButton>
        </StatusRow>
      </HeroText>

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
                      familyModal.open(
                        <FamilyModal
                          personId={id}
                          family={family}
                          close={familyModal.close}
                        />,
                      )
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
  if (lines.length === 0) return <FieldValue as="p" $empty>—</FieldValue>;
  return (
    <FieldValue as="p" $empty={false}>
      {lines.join(' · ')}
    </FieldValue>
  );
}

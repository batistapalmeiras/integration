// React
import { useParams } from 'react-router-dom';
// Libs
import { Empty, LinkButton, Skeleton, useModal } from 'bp-kit';
import { HeartHandshake, LucideIcon, Pencil, UsersRound } from 'lucide-react';
// Components
import { PageHeader } from '../../components/PageHeader';
// Local
import { MembershipAlerts } from '../../components/MembershipAlerts';
import { TonePill } from '../../components/StatusPill';
import { formatTimestampDate } from '../../domain/dates';
import { MemberRecord, MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_TONES } from '../../domain/memberRecords';
import { displayValue, MEMBER_RECORD_SECTIONS, RecordSection } from '../../features/memberRecord';
import { errorMessage } from '../../lib/queryCache';
import { useFamily, useMemberRecord, usePastoralNotes, usePersonProfileSummary } from '../../queries/person';
import { EditSectionModal } from './components/EditSectionModal';
import { FamilyModal } from './components/FamilyModal';
import { FamilyPanel } from './components/FamilyPanel';
import {
  Columns,
  Community,
  CommunityBadge,
  CommunityItem,
  Field,
  FieldLabel,
  Fields,
  FieldValue,
  HeroText,
  NoteBody,
  NoteDate,
  Notes,
  Panel,
  PanelHeader,
  PanelTitle,
  ProfileContent,
  SideColumn,
  StatusRow,
} from './styles';

const MEMBERSHIP_SECTION = 'membership';
const SIDE_SECTIONS = ['contact'];
const FAMILY_AFTER = 'personal';

const MEMBERSHIP = MEMBER_RECORD_SECTIONS.find((section) => section.id === MEMBERSHIP_SECTION);
const SIDE = MEMBER_RECORD_SECTIONS.filter((section) => SIDE_SECTIONS.includes(section.id));
const MAIN = MEMBER_RECORD_SECTIONS.filter(
  (section) => section.id !== MEMBERSHIP_SECTION && !SIDE_SECTIONS.includes(section.id),
);

export function MemberProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { open, close, modal } = useModal('drawer');
  const recordQuery = useMemberRecord(id);
  const summaryQuery = usePersonProfileSummary(id);
  const notesQuery = usePastoralNotes(id);
  const family = useFamily(id).data;
  const record = recordQuery.data ?? null;
  const loadError = errorMessage(recordQuery.error);

  if (loadError) return <Empty title="Membro não encontrado" description={loadError} />;
  if (!record) return <Skeleton $h="320px" />;

  const smallGroup = summaryQuery.data?.smallGroupName ?? null;
  const ministries = summaryQuery.data?.ministryNames ?? [];
  const pastoralNotes = notesQuery.data ?? [];

  const edit = (section: RecordSection) =>
    open(<EditSectionModal personId={id} record={record} section={section} close={close} />);

  const renderPanel = (section: RecordSection) => (
    <SectionPanel key={section.id} section={section} record={record} onEdit={() => edit(section)} />
  );

  return (
    <ProfileContent>
      <PageHeader title={record.name} back />

      <HeroText>
        <StatusRow>
          <TonePill $tone={MEMBERSHIP_STATUS_TONES[record.membershipStatus]}>
            {MEMBERSHIP_STATUS_LABELS[record.membershipStatus]}
          </TonePill>
          {MEMBERSHIP && (
            <LinkButton icon={<Pencil size={14} />} onClick={() => edit(MEMBERSHIP)}>
              Alterar
            </LinkButton>
          )}
        </StatusRow>
        <Community>
          <CommunityLine icon={UsersRound} value={smallGroup} emptyText="Não participa de um PG" />
          <CommunityLine
            icon={HeartHandshake}
            value={ministries.length > 0 ? ministries.join(', ') : null}
            emptyText="Não serve em um ministério"
          />
        </Community>
      </HeroText>

      <MembershipAlerts personId={id} />

      <Columns>
        <SideColumn>{SIDE.map(renderPanel)}</SideColumn>
        <div>
          {MAIN.flatMap((section) =>
            section.id === FAMILY_AFTER && family
              ? [
                  renderPanel(section),
                  <FamilyPanel
                    key="family"
                    record={record}
                    family={family}
                    onEdit={() => open(<FamilyModal personId={id} record={record} family={family} close={close} />)}
                  />,
                ]
              : [renderPanel(section)],
          )}
          {pastoralNotes.length > 0 && (
            <Panel aria-label="Anotações dos líderes">
              <PanelHeader>
                <PanelTitle>Anotações dos líderes</PanelTitle>
              </PanelHeader>
              <Notes>
                {pastoralNotes.map((note) => (
                  <li key={note.id}>
                    <NoteBody>{note.body}</NoteBody>
                    <NoteDate>Importada do sistema antigo em {formatTimestampDate(note.createdAt)}</NoteDate>
                  </li>
                ))}
              </Notes>
            </Panel>
          )}
        </div>
      </Columns>

      {modal}
    </ProfileContent>
  );
}

interface CommunityLineProps {
  icon: LucideIcon;
  value: string | null;
  emptyText: string;
}

function CommunityLine({ icon: Icon, value, emptyText }: CommunityLineProps) {
  return (
    <CommunityItem $empty={!value}>
      <CommunityBadge $empty={!value}>
        <Icon size={18} aria-hidden="true" />
      </CommunityBadge>
      {value ?? emptyText}
    </CommunityItem>
  );
}

interface SectionPanelProps {
  section: RecordSection;
  record: MemberRecord;
  onEdit: () => void;
}

function SectionPanel({ section, record, onEdit }: SectionPanelProps) {
  return (
    <Panel aria-label={section.title}>
      <PanelHeader>
        <PanelTitle>{section.title}</PanelTitle>
        <LinkButton icon={<Pencil size={14} />} onClick={onEdit}>
          Editar
        </LinkButton>
      </PanelHeader>
      <Fields>
        {section.fields.map((field) => {
          const value = displayValue(record, field);
          return (
            <Field key={field.name} $wide={field.kind === 'textarea'}>
              <FieldLabel>{field.label}</FieldLabel>
              <FieldValue $empty={!value}>{value || '—'}</FieldValue>
            </Field>
          );
        })}
      </Fields>
    </Panel>
  );
}

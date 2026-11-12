// React
import { useParams } from 'react-router-dom';
// Libs
import { Empty, LinkButton, Skeleton, useModal } from 'bp-kit';
import { HeartHandshake, Pencil, UsersRound } from 'lucide-react';
// Components
import { NotesPanel } from '../../components/NotesPanel';
import { PageHeader } from '../../components/PageHeader';
import { Columns, SideColumn, WideContent } from '../../components/PageColumns';
import { Panel, PanelHeader, PanelTitle } from '../../components/Panel';
// Local
import { InfoLine, InfoPanel } from '../../components/InfoLine';
import { MembershipAlerts } from '../../components/MembershipAlerts';
import { CouncilDate } from '../../domain/councils';
import { TonePill } from '../../components/StatusPill';
import { formatTimestampDate } from '../../domain/dates';
import {
  canLeavePhoneEmpty,
  MemberRecord,
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_TONES,
} from '../../domain/memberRecords';
import { displayValue, MEMBER_RECORD_SECTIONS, RecordSection } from '../../features/memberRecord';
import { errorMessage } from '../../lib/queryCache';
import { MEMBERSHIP_ANSWER_LABELS } from '../../types/church';
import { useFamily, useMemberPage, usePersonNotes } from '../../queries/person';
import { CommunityModal } from './components/CommunityModal';
import { EditSectionModal } from './components/EditSectionModal';
import { FamilyModal } from './components/FamilyModal';
import { FamilyPanel } from './components/FamilyPanel';
import {
  Field,
  FieldLabel,
  Fields,
  FieldValue,
  HeroText,
  AddressLines,
  StatusRow,
} from './styles';

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
  const { open, close, modal } = useModal('drawer');
  const pageQuery = useMemberPage(id);
  const notesQuery = usePersonNotes(id);
  const family = useFamily(id).data;
  const page = pageQuery.data ?? null;
  const loadError = errorMessage(pageQuery.error);

  if (loadError) return <Empty title="Membro não encontrado" description={loadError} />;
  if (!page) return <Skeleton $h="320px" />;

  const { record, info, community } = page;
  const councils = info.council ? [info.council] : [];
  const smallGroup = community.smallGroupName;
  const ministries = community.ministryNames;
  const notes = notesQuery.data ?? [];

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
    {
      label: MEMBERSHIP_ANSWER_LABELS.statuteAgreedAt,
      value: info.statuteAgreedAt ? formatTimestampDate(info.statuteAgreedAt) : '',
    },
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
          {MEMBERSHIP && (
            <LinkButton icon={<Pencil size={14} />} onClick={() => edit(MEMBERSHIP)}>
              Alterar
            </LinkButton>
          )}
        </StatusRow>
        <InfoPanel>
          <InfoLine icon={UsersRound} label="Pequeno Grupo" empty={!smallGroup}>
            {smallGroup ?? 'Não participa de um PG'}
          </InfoLine>
          <InfoLine
            icon={HeartHandshake}
            label={ministries.length === 1 ? 'Ministério' : 'Ministérios'}
            empty={ministries.length === 0}
          >
            {ministries.length > 0 ? ministries.join(', ') : 'Não serve em um ministério'}
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
                    onEdit={() => open(<FamilyModal personId={id} family={family} close={close} />)}
                  />,
                ]
              : [renderPanel(section)],
          )}
          <NotesPanel personId={id} notes={notes} />
        </div>
      </Columns>

      {modal}
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
    <AddressLines>
      {lines.map((line) => (
        <FieldValue as="p" key={line} $empty={false}>
          {line}
        </FieldValue>
      ))}
    </AddressLines>
  );
}

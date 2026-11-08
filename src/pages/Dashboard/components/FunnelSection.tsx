// Libs
import { StatCard, StatLabel, StatValue } from 'bp-kit';
// Components
import { IconBadge } from '../../../components/MenuOptions';
import { PersonStatus, STATUS_META } from '../../../types/person';
// Local
import { Detail, PanelTitle, Section, StageGrid, StatRow, StatText } from '../styles';

export interface FunnelStage {
  status: PersonStatus;
  owner: string;
}

export type FunnelCounts = Partial<Record<PersonStatus, number>>;

export const INTEGRATION_FUNNEL: FunnelStage[] = [
  { status: 'initial_contact', owner: 'Equipe de Integração' },
  { status: 'retry_contact', owner: 'Equipe de Integração' },
  { status: 'welcome_coffee', owner: 'Equipe de Integração' },
  { status: 'pending_signup', owner: 'A própria pessoa' },
  { status: 'integration', owner: 'Professor' },
  { status: 'membership_pending', owner: 'Conselho Administrativo' },
];

export function countInIntegration(counts: FunnelCounts): number {
  return INTEGRATION_FUNNEL.filter((stage) => stage.status !== 'membership_pending').reduce(
    (sum, stage) => sum + (counts[stage.status] ?? 0),
    0,
  );
}

interface Props {
  counts: FunnelCounts;
}

function StageIcon({ status }: { status: PersonStatus }) {
  const Icon = STATUS_META[status].icon;
  return <Icon size={22} />;
}

export function FunnelSection({ counts }: Props) {
  return (
    <Section aria-labelledby="integration">
      <PanelTitle id="integration">Integração</PanelTitle>
      <StageGrid>
        {INTEGRATION_FUNNEL.map((stage) => (
          <StatCard key={stage.status}>
            <StatRow>
              <IconBadge>
                <StageIcon status={stage.status} />
              </IconBadge>
              <StatText>
                <StatLabel>{STATUS_META[stage.status].label}</StatLabel>
                <StatValue>{counts[stage.status] ?? 0}</StatValue>
                <Detail>{stage.owner}</Detail>
              </StatText>
            </StatRow>
          </StatCard>
        ))}
      </StageGrid>
    </Section>
  );
}

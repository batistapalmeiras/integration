// Libs
import { StatCard, StatLabel, StatValue } from 'bp-kit';
// Components
import { IconBadge } from '../../../components/MenuOptions';
import { NAV_ITEMS } from '../../../routes/navigation';
import { PersonStatus, STATUS_META } from '../../../types/person';
import { visitorsPath } from '../../Visitors/persistence';
// Local
import { StageGrid, StageLink, StatRow, StatText } from '../styles';

interface FunnelStage {
  status: PersonStatus;
  path: string;
}

export type FunnelCounts = Partial<Record<PersonStatus, number>>;

const INTEGRATION_FUNNEL: FunnelStage[] = [
  { status: 'initial_contact', path: visitorsPath({ status: ['initial_contact'] }) },
  { status: 'retry_contact', path: visitorsPath({ status: ['retry_contact'] }) },
  { status: 'welcome_coffee', path: NAV_ITEMS.coffee.path },
  { status: 'pending_signup', path: NAV_ITEMS.coffee.path },
  { status: 'integration', path: NAV_ITEMS.classes.path },
  { status: 'membership_pending', path: NAV_ITEMS.membership.path },
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

export function FunnelCards({ counts }: Props) {
  return (
    <StageGrid aria-labelledby="integration">
      {INTEGRATION_FUNNEL.map((stage) => (
        <StageLink key={stage.status} to={stage.path}>
          <StatCard>
            <StatRow>
              <IconBadge>
                <StageIcon status={stage.status} />
              </IconBadge>
              <StatText>
                <StatLabel>{STATUS_META[stage.status].label}</StatLabel>
                <StatValue>{counts[stage.status] ?? 0}</StatValue>
              </StatText>
            </StatRow>
          </StatCard>
        </StageLink>
      ))}
    </StageGrid>
  );
}

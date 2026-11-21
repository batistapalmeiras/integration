// Libs
import { InfoBox } from 'bp-kit';
import { AlertTriangle, HeartPulse, LucideIcon } from 'lucide-react';
// Local
import { formatTimestampDate } from '../../../domain/dates';
import { MEMBER_FLAG_DESCRIPTIONS, MEMBER_FLAG_LABELS, MemberFlag, MemberFlagMark } from '../../../domain/memberFlags';
import { FlagDate } from '../styles';

const FLAG_LOOK: Record<MemberFlag, { variant: 'warning' | 'info'; icon: LucideIcon }> = {
  absent: { variant: 'warning', icon: AlertTriangle },
  attention: { variant: 'info', icon: HeartPulse },
};

export function MemberFlagsCard({ flags }: { flags: MemberFlagMark[] }) {
  return flags.map(({ flag, flaggedAt }) => (
    <InfoBox key={flag} variant={FLAG_LOOK[flag].variant} icon={FLAG_LOOK[flag].icon} title={MEMBER_FLAG_LABELS[flag]}>
      {MEMBER_FLAG_DESCRIPTIONS[flag]}
      <FlagDate>Sinalizado em {formatTimestampDate(flaggedAt)}</FlagDate>
    </InfoBox>
  ));
}

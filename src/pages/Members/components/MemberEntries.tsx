// Components
import { MEMBER_PHOTO_SIZE, MemberPhoto } from '../../../components/MemberPhoto';
import { TonePill } from '../../../components/StatusPill';
// Local
import { Couple } from '../../../domain/couples';
import { MEMBERSHIP_STATUS_LABELS, MEMBERSHIP_STATUS_TONES } from '../../../domain/memberRecords';
import { MemberRow } from '../../../repositories/memberRecords';
import { CoupleCard, CoupleGrid, MemberCard, MemberCardName } from '../styles';

type PhotoUrls = Record<string, string>;

interface EntryProps {
  member: MemberRow;
  photoUrl: string | null;
  interactive?: boolean;
}

function StatusPill({ member }: { member: MemberRow }) {
  return (
    <TonePill $tone={MEMBERSHIP_STATUS_TONES[member.membership_status]}>
      {MEMBERSHIP_STATUS_LABELS[member.membership_status]}
    </TonePill>
  );
}

export function MemberTileContent({ member, photoUrl, interactive = false }: EntryProps) {
  return (
    <>
      <MemberPhoto url={photoUrl} size={MEMBER_PHOTO_SIZE} shape="square" interactive={interactive} fluid />
      <MemberCardName>{member.name}</MemberCardName>
      <StatusPill member={member} />
    </>
  );
}

interface CouplesProps {
  couples: Couple<MemberRow>[];
  photoUrls: PhotoUrls;
  onOpen?: (memberId: string) => void;
}

export function CoupleCards({
  couples,
  photoUrls,
  onOpen,
  gridRef,
}: CouplesProps & { gridRef: (element: HTMLElement | null) => void }) {
  return (
    <CoupleGrid ref={gridRef}>
      {couples.map((couple) => (
        <CoupleCard key={couple[0].id} role="group" aria-label={couple.map((member) => member.name).join(' e ')}>
          {couple.map((member) => (
            <MemberCard
              key={member.id}
              as={onOpen ? 'button' : 'div'}
              type={onOpen ? 'button' : undefined}
              $clickable={!!onOpen}
              onClick={onOpen ? () => onOpen(member.id) : undefined}
            >
              <MemberTileContent member={member} photoUrl={photoUrls[member.id] ?? null} interactive={!!onOpen} />
            </MemberCard>
          ))}
        </CoupleCard>
      ))}
    </CoupleGrid>
  );
}

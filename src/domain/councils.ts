// Local
import { EntryType } from '../types/church';

interface CouncilMember {
  personId: string;
  name: string;
  entryType: EntryType | null;
}

export interface Council {
  id: string;
  meetingDate: string;
  memberCount: number;
}

export interface CouncilRoster {
  council: Council;
  members: CouncilMember[];
}

export type CouncilDate = Pick<Council, 'id' | 'meetingDate'>;

export const currentCouncil = (councils: Council[]): Council | null =>
  councils.reduce<Council | null>(
    (latest, council) => (!latest || council.meetingDate > latest.meetingDate ? council : latest),
    null,
  );

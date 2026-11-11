// Local
import { EntryType } from '../types/church';

export interface CouncilMember {
  personId: string;
  name: string;
  entryType: EntryType | null;
}

export interface Council {
  id: string;
  meetingDate: string;
  members: CouncilMember[];
}

export const currentCouncil = (councils: Council[]): Council | null =>
  councils.reduce<Council | null>(
    (latest, council) => (!latest || council.meetingDate > latest.meetingDate ? council : latest),
    null,
  );

import { PersonStatus } from '../../types/person';

export type StatusCounts = Partial<Record<PersonStatus, number>>;

export interface PendingMember {
  id: string;
  name: string;
}

export interface ActiveCohortInfo {
  id: string;
  name: string;
}

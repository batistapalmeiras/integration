import { PersonStatus } from '../../types/person';

export interface CohortRow {
  id: string;
  name: string;
  status: 'active' | 'closed';
  createdAt: string;
  enrollmentCount: number;
}

export interface CohortRosterRow {
  enrollmentId: string;
  personId: string;
  name: string;
  status: PersonStatus;
  lessonsAttended: number;
  totalLessons: number;
}

export interface PersonReportRow {
  id: string;
  name: string;
  status: PersonStatus;
  cohortNames: string;
}

export interface AnnualCounts {
  initialContact: number;
  welcomeCoffee: number;
  integration: number;
  member: number;
  archived: number;
}

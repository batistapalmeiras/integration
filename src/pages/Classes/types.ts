import { Person } from '../../types/person';

export interface Cohort {
  id: string;
  name: string;
  status: 'active' | 'closed';
}

export interface Lesson {
  id: string;
  cohort_id: string;
  number: number;
  date: string;
}

export interface LessonAttendance {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  attended: boolean;
}

export interface EnrollmentRow {
  id: string;
  person: Pick<Person, 'id' | 'name' | 'status' | 'membership_interest_sent_at'>;
  attendanceByLesson: Record<string, LessonAttendance | undefined>;
  attendedCount: number;
}

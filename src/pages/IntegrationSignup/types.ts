export interface CohortSchedule {
  cohort_name: string;
  lesson_dates: string[];
}

export type SignupStep = 'intro' | 'phone' | 'form' | 'confirmation';

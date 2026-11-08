// Local
import { comparePeopleByPipeline, PersonStatus } from '../types/person';
import { supabase } from '../lib/supabase';
import { countIntegrationPeopleByStatus } from './integrationPeople';

export async function listAnnualYears(): Promise<number[]> {
  const { data, error } = await supabase.rpc('integration_people_years');
  if (error) throw error;
  const years = new Set(((data ?? []) as { year: number }[]).map((row) => row.year));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export interface AnnualCountsRow {
  initial_contact: number;
  welcome_coffee: number;
  integration: number;
  member: number;
  archived: number;
}

export async function loadAnnualCounts(year: number): Promise<AnnualCounts> {
  const { data, error } = await supabase.rpc('annual_pipeline_counts', { p_year: year }).single();
  if (error) throw error;
  const row = data as AnnualCountsRow;
  return {
    initialContact: Number(row.initial_contact),
    welcomeCoffee: Number(row.welcome_coffee),
    integration: Number(row.integration),
    member: Number(row.member),
    archived: Number(row.archived),
  };
}

export async function listCohortsReport(): Promise<CohortRow[]> {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*, enrollments(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    createdAt: c.created_at,
    enrollmentCount: (c.enrollments as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

export async function loadStatusCounts(): Promise<{ counts: StatusCounts; totalCohorts: number }> {
  const [counts, cohortsResult] = await Promise.all([
    countIntegrationPeopleByStatus(),
    supabase.from('cohorts').select('id', { count: 'exact', head: true }),
  ]);
  if (cohortsResult.error) throw cohortsResult.error;
  return { counts, totalCohorts: cohortsResult.count ?? 0 };
}

export interface CohortRosterData {
  cohort: CohortRow;
  roster: CohortRosterRow[];
}

export async function loadCohortRoster(cohortId: string): Promise<CohortRosterData> {
  const [cohortResult, enrollmentsResult, summaryResult, lessonsResult] = await Promise.all([
    supabase.from('cohorts').select('*').eq('id', cohortId).single(),
    supabase.from('enrollments').select('id, person:people(id,name,status)').eq('cohort_id', cohortId),
    supabase.from('enrollment_attendance_summary').select('enrollment_id, lessons_attended').eq('cohort_id', cohortId),
    supabase.from('lessons').select('id').eq('cohort_id', cohortId),
  ]);
  const failure = cohortResult.error ?? enrollmentsResult.error ?? summaryResult.error ?? lessonsResult.error;
  if (failure) throw failure;

  const cohortData = cohortResult.data;
  const enrollments = (enrollmentsResult.data ?? []) as unknown as {
    id: string;
    person: { id: string; name: string; status: PersonStatus };
  }[];
  const attendedByEnrollment = new Map(
    (summaryResult.data ?? []).map((s) => [s.enrollment_id as string, s.lessons_attended as number]),
  );
  const totalLessons = (lessonsResult.data ?? []).length || 4;

  return {
    cohort: {
      id: cohortData.id,
      name: cohortData.name,
      status: cohortData.status,
      createdAt: cohortData.created_at,
      enrollmentCount: enrollments.length,
    },
    roster: enrollments
      .map((enrollment) => ({
        enrollmentId: enrollment.id,
        personId: enrollment.person.id,
        name: enrollment.person.name,
        status: enrollment.person.status,
        lessonsAttended: attendedByEnrollment.get(enrollment.id) ?? 0,
        totalLessons,
      }))
      .sort(comparePeopleByPipeline),
  };
}

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

export type StatusCounts = Partial<Record<PersonStatus, number>>;

export interface AnnualCounts {
  initialContact: number;
  welcomeCoffee: number;
  integration: number;
  member: number;
  archived: number;
}

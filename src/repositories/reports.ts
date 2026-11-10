// Local
import { comparePeopleByPipeline, PersonStatus, toPersonStatus } from '../types/person';
import { supabase } from '../lib/supabase';
import { CohortStatus, toCohortStatus } from '../domain/classesRoster';
import { countIntegrationPeopleByStatus } from './integrationPeople';

export async function listAnnualYears(): Promise<number[]> {
  const { data, error } = await supabase.rpc('integration_people_years');
  if (error) throw error;
  const years = new Set(((data ?? []) as { year: number }[]).map((row) => row.year));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

export async function loadAnnualCounts(year: number): Promise<AnnualCounts> {
  const { data, error } = await supabase.rpc('annual_pipeline_counts', { p_year: year }).single();
  if (error) throw error;
  const row = data;
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
    status: toCohortStatus(c.status),
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
  if (!cohortData) throw new Error('Turma não encontrada.');
  const visible = (enrollmentsResult.data ?? []).flatMap((enrollment) =>
    enrollment.person ? [{ enrollment, person: enrollment.person }] : [],
  );
  const attendedByEnrollment = new Map(
    (summaryResult.data ?? []).flatMap((summary) =>
      summary.enrollment_id ? [[summary.enrollment_id, summary.lessons_attended ?? 0] as const] : [],
    ),
  );
  const totalLessons = (lessonsResult.data ?? []).length || 4;

  return {
    cohort: {
      id: cohortData.id,
      name: cohortData.name,
      status: toCohortStatus(cohortData.status),
      createdAt: cohortData.created_at,
      enrollmentCount: visible.length,
    },
    roster: visible
      .map(({ enrollment, person }) => ({
        enrollmentId: enrollment.id,
        personId: person.id,
        name: person.name,
        status: toPersonStatus(person.status),
        lessonsAttended: attendedByEnrollment.get(enrollment.id) ?? 0,
        totalLessons,
      }))
      .sort(comparePeopleByPipeline),
  };
}

export interface CohortRow {
  id: string;
  name: string;
  status: CohortStatus;
  createdAt: string;
  enrollmentCount: number;
}

interface CohortRosterRow {
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

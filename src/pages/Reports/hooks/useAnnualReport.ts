// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { AnnualCounts } from '../types';

const EMPTY_COUNTS: AnnualCounts = {
  initialContact: 0,
  welcomeCoffee: 0,
  integration: 0,
  member: 0,
  archived: 0,
};

async function listAnnualYears(): Promise<number[]> {
  const { data, error } = await supabase.rpc('integration_people_years');
  if (error) throw error;
  const years = new Set(((data ?? []) as { year: number }[]).map((row) => row.year));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

interface AnnualCountsRow {
  initial_contact: number;
  welcome_coffee: number;
  integration: number;
  member: number;
  archived: number;
}

async function loadAnnualCounts(year: number): Promise<AnnualCounts> {
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

export function useAnnualYears() {
  return useQuery(queryKeys.annualYears, listAnnualYears).data ?? [new Date().getFullYear()];
}

export function useAnnualReport(year: number) {
  const query = useQuery(queryKeys.annualReport(year), () => loadAnnualCounts(year));
  return { counts: query.data ?? EMPTY_COUNTS, loading: query.loading, error: errorMessage(query.error) };
}

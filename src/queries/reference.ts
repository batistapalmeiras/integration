// Local
import { getUpcomingCoffeeEventDate, hasUpcomingCoffeeEvent } from '../domain/cafeSchedule';
import { hasUpcomingCohort } from '../domain/classesRoster';
import { listMembers, listMinistries, listSmallGroups } from '../domain/communityGroups';
import { supabase } from '../lib/supabase';
import { useQuery } from '../lib/queryCache';
import { queryKeys, REFERENCE_STALE_TIME } from '../lib/queryKeys';

async function listCohortNames(): Promise<string[]> {
  const { data, error } = await supabase.from('cohorts').select('name').order('name');
  if (error) throw error;
  return (data ?? []).map((c) => c.name as string);
}

export const useSmallGroups = (enabled = true) =>
  useQuery(queryKeys.smallGroups, listSmallGroups, { enabled, staleTime: REFERENCE_STALE_TIME });

export const useMinistries = (enabled = true) =>
  useQuery(queryKeys.ministries, listMinistries, { enabled, staleTime: REFERENCE_STALE_TIME });

export const useMemberNames = (withoutSmallGroup = false) =>
  useQuery(queryKeys.memberNames(withoutSmallGroup), () => listMembers({ withoutSmallGroup }));

export const useCohortNames = () => useQuery(queryKeys.cohortNames, listCohortNames);

export const useHasUpcomingCoffeeEvent = (enabled = true) =>
  useQuery(queryKeys.hasUpcomingCoffeeEvent, hasUpcomingCoffeeEvent, { enabled });

export const useUpcomingCoffeeEventDate = () => useQuery(queryKeys.upcomingCoffeeEventDate, getUpcomingCoffeeEventDate);

export const useHasUpcomingCohort = (enabled = true) => useQuery(queryKeys.hasUpcomingCohort, hasUpcomingCohort, { enabled });

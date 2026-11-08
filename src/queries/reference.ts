// Local
import { getUpcomingCoffeeEventDate, hasUpcomingCoffeeEvent } from '../repositories/cafeSchedule';
import { hasUpcomingCohort, listCohortNames } from '../repositories/classesRoster';
import { listMembers, listMinistries, listSmallGroups } from '../repositories/communityGroups';
import { useQuery } from '../lib/queryCache';
import { queryKeys, REFERENCE_STALE_TIME } from '../lib/queryKeys';

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

export const useHasUpcomingCohort = (enabled = true) =>
  useQuery(queryKeys.hasUpcomingCohort, hasUpcomingCohort, { enabled });

import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardStats,
  fetchProjects,
  fetchClients,
  fetchBlockedTasks,
  fetchTasks,
  fetchOverdueTasks,
  fetchEpics,
  fetchStatusDistribution,
  fetchProjectsProgress,
  fetchFilterOptions,
} from '../api/dashboard';
import { DashboardFilters } from '../types';

const REFETCH_INTERVAL = 5 * 1000; // 5 segundos

export function useDashboardStats(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => fetchDashboardStats(filters),
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useProjects(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(filters),
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useBlockedTasks(projectKey?: string, epicKey?: string) {
  return useQuery({
    queryKey: ['blocked-tasks', projectKey, epicKey],
    queryFn: () => fetchBlockedTasks(projectKey, epicKey),
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useEpics(projectKey?: string) {
  return useQuery({
    queryKey: ['epics', projectKey],
    queryFn: () => fetchEpics(projectKey!),
    enabled: !!projectKey,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTasks(filters: DashboardFilters = {}, enabled = false) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    refetchInterval: REFETCH_INTERVAL,
    enabled,
  });
}

export function useStatusDistribution(projectKey?: string, epicKey?: string) {
  return useQuery({
    queryKey: ['status-distribution', projectKey, epicKey],
    queryFn: () => fetchStatusDistribution(projectKey, epicKey),
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useProjectsProgress(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: ['projects-progress', filters],
    queryFn: () => fetchProjectsProgress(filters),
    refetchInterval: REFETCH_INTERVAL,
  });
}

export function useOverdueTasks(filters: DashboardFilters = {}, enabled = false) {
  return useQuery({
    queryKey: ['overdue-tasks', filters],
    queryFn: () => fetchOverdueTasks(filters),
    refetchInterval: REFETCH_INTERVAL,
    enabled,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: fetchFilterOptions,
    staleTime: 5 * 60 * 1000,
  });
}

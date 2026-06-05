import apiClient from './client';
import {
  DashboardStats,
  ProjectSummary,
  ClientSummary,
  BlockedTask,
  TaskDetail,
  StatusDistribution,
  ProjectProgress,
  FilterOptions,
  EpicOption,
  DashboardFilters,
  ApiResponse,
} from '../types';

function buildParams(filters: DashboardFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.projectKey) params.projectKey = filters.projectKey;
  if (filters.sprintId) params.sprintId = filters.sprintId;
  if (filters.status) params.status = filters.status;
  if (filters.assigneeId) params.assigneeId = filters.assigneeId;
  if (filters.epicKey) params.epicKey = filters.epicKey;
  if (filters.clientId) params.clientId = filters.clientId;
  return params;
}

export async function fetchDashboardStats(filters: DashboardFilters = {}): Promise<DashboardStats> {
  const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats', {
    params: buildParams(filters),
  });
  return res.data.data;
}

export async function fetchProjects(filters: DashboardFilters = {}): Promise<ProjectSummary[]> {
  const res = await apiClient.get<ApiResponse<ProjectSummary[]>>('/dashboard/projects', {
    params: buildParams(filters),
  });
  return res.data.data;
}

export async function fetchClients(): Promise<ClientSummary[]> {
  const res = await apiClient.get<ApiResponse<ClientSummary[]>>('/dashboard/clients');
  return res.data.data;
}

export async function fetchBlockedTasks(projectKey?: string, epicKey?: string): Promise<BlockedTask[]> {
  const params: Record<string, string> = {};
  if (projectKey) params.projectKey = projectKey;
  if (epicKey) params.epicKey = epicKey;
  const res = await apiClient.get<ApiResponse<BlockedTask[]>>('/dashboard/blocked', { params });
  return res.data.data;
}

export async function fetchEpics(projectKey: string): Promise<EpicOption[]> {
  const res = await apiClient.get<ApiResponse<EpicOption[]>>('/dashboard/epics', {
    params: { projectKey },
  });
  return res.data.data;
}

export async function fetchTasks(filters: DashboardFilters = {}): Promise<TaskDetail[]> {
  const res = await apiClient.get<ApiResponse<TaskDetail[]>>('/dashboard/tasks', {
    params: buildParams(filters),
  });
  return res.data.data;
}

export async function fetchStatusDistribution(projectKey?: string, epicKey?: string): Promise<StatusDistribution[]> {
  const params: Record<string, string> = {};
  if (projectKey) params.projectKey = projectKey;
  if (epicKey) params.epicKey = epicKey;
  const res = await apiClient.get<ApiResponse<StatusDistribution[]>>('/dashboard/status-distribution', { params });
  return res.data.data;
}

export async function fetchProjectsProgress(filters: DashboardFilters = {}): Promise<ProjectProgress[]> {
  const res = await apiClient.get<ApiResponse<ProjectProgress[]>>('/dashboard/projects-progress', {
    params: buildParams(filters),
  });
  return res.data.data;
}

export async function fetchOverdueTasks(filters: DashboardFilters = {}): Promise<TaskDetail[]> {
  const res = await apiClient.get<ApiResponse<TaskDetail[]>>('/dashboard/overdue', {
    params: buildParams(filters),
  });
  return res.data.data;
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const res = await apiClient.get<ApiResponse<FilterOptions>>('/dashboard/filter-options');
  return res.data.data;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  openTasks: number;
  blockedTasks: number;
  progressPercentage: number;
  totalProjects: number;
  totalClients: number;
  totalEpics: number;
}

export interface ProjectSummary {
  id: string;
  key: string;
  name: string;
  clientName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  openTasks: number;
  blockedTasks: number;
  progressPercentage: number;
  epics: EpicSummary[];
}

export interface EpicSummary {
  id: string;
  key: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  openTasks: number;
  blockedTasks: number;
  progressPercentage: number;
}

export interface ClientSummary {
  id: string;
  name: string;
  projectCount: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  openTasks: number;
  blockedTasks: number;
  progressPercentage: number;
}

export interface TaskDetail {
  id: string;
  key: string;
  summary: string;
  status: string;
  statusCategory: string;
  assignee: string | null;
  assigneeEmail?: string;
  priority: string;
  labels: string[];
  isBlocked: boolean;
  projectKey: string;
  projectName: string;
  epicKey?: string;
  epicName?: string;
  sprintName?: string;
  created: string;
  updated: string;
  dueDate: string | null;
  storyPoints?: number;
}

export interface BlockedTask {
  id: string;
  key: string;
  summary: string;
  status: string;
  assignee: string | null;
  priority: string;
  labels: string[];
  projectName: string;
  epicName?: string;
  blockReason: string;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ProjectProgress {
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  open: number;
  blocked: number;
  progress: number;
}

export interface FilterOptions {
  clients: { id: string; name: string }[];
  projects: { id: string; key: string; name: string }[];
  sprints: { id: number; name: string; state: string; projectKey: string }[];
  statuses: string[];
  assignees: { accountId: string; displayName: string }[];
}

export interface DashboardFilters {
  clientId?: string;
  projectKey?: string;
  sprintId?: string;
  status?: string;
  assigneeId?: string;
  epicKey?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

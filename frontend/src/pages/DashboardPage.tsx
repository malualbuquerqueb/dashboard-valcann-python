import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { QuickNavBar } from '@/components/dashboard/QuickNavBar';
import { BlockedTasksTable } from '@/components/dashboard/BlockedTasksTable';
import { ProjectsTable } from '@/components/dashboard/ProjectsTable';
import { TasksModal, CardType } from '@/components/dashboard/TasksModal';
import { StatusPieChart } from '@/components/charts/StatusPieChart';
import { ProjectsBarChart, ProgressBarsChart } from '@/components/charts/ProjectsBarChart';
import { DashboardFiltersBar } from '@/components/filters/DashboardFilters';
import {
  useDashboardStats,
  useProjects,
  useClients,
  useBlockedTasks,
  useOverdueTasks,
  useEpics,
  useStatusDistribution,
  useProjectsProgress,
  useFilterOptions,
  useTasks,
} from '@/hooks/useDashboard';
import { DashboardFilters } from '@/types';
import { AlertCircle, Activity } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export function DashboardPage() {
  const { logout } = useAuth();
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const statsQuery = useDashboardStats(filters);
  const projectsQuery = useProjects(filters);
  const clientsQuery = useClients();
  const blockedQuery = useBlockedTasks(filters.projectKey, filters.epicKey);
  const epicsQuery = useEpics(filters.projectKey);
  const statusDistQuery = useStatusDistribution(filters.projectKey, filters.epicKey);
  const progressQuery = useProjectsProgress(filters);
  const filterOptionsQuery = useFilterOptions();
  const tasksQuery = useTasks(filters, activeCard !== null && activeCard !== 'projects' && activeCard !== 'clients' && activeCard !== 'overdue');
  const overdueQuery = useOverdueTasks(filters, true);

  const isAnyLoading =
    statsQuery.isLoading ||
    projectsQuery.isLoading ||
    blockedQuery.isLoading;

  useEffect(() => {
    if (!isAnyLoading) {
      setLastUpdated(new Date());
    }
  }, [isAnyLoading]);

  const hasError = statsQuery.isError || projectsQuery.isError;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Valcann Dash</h1>
              <p className="text-xs text-muted-foreground">Integração Jira Cloud</p>
            </div>
          </div>
        <button
    onClick={logout}
    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-2 py-1.5 rounded-lg hover:bg-card border border-transparent hover:border-border/50"
    title="Sair"
  >
    <LogOut className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Sair</span>
  </button>
        </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4">
        {/* Erro de conexão */}
        {hasError && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Erro ao conectar com o backend</p>
              <p className="text-xs text-red-400/80 mt-0.5">
                Verifique se o servidor está rodando em http://localhost:3001 e se as credenciais Jira estão configuradas no .env
              </p>
            </div>
          </div>
        )}

        {/* Barra de navegação rápida */}
        <div className="bg-card/50 rounded-xl border border-border/50 px-3 py-2.5">
          <QuickNavBar
            totalClients={statsQuery.data?.totalClients}
            totalProjects={statsQuery.data?.totalProjects}
            lastUpdated={lastUpdated}
            isLoading={isAnyLoading}
            onClientsClick={() => setActiveTab('clientes')}
            onProjectsClick={() => setActiveTab('clientes')}
          />
        </div>

        {/* Filtros */}
        <div className="bg-card/50 rounded-xl border border-border/50 p-3">
          <DashboardFiltersBar
            filters={filters}
            options={filterOptionsQuery.data}
            epics={epicsQuery.data}
            epicsLoading={epicsQuery.isLoading}
            isLoading={isAnyLoading}
            onChange={setFilters}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* Stats Cards */}
        <StatsCards
          stats={statsQuery.data}
          overdueCount={overdueQuery.data?.length ?? 0}
          isLoading={statsQuery.isLoading}
          onCardClick={setActiveCard}
        />

        {/* Tabs de conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="clientes">Clientes & Projetos</TabsTrigger>
            <TabsTrigger value="blocked">
              Impedimentos
              {blockedQuery.data && blockedQuery.data.length > 0 && (
                <span className="ml-1.5 bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">
                  {blockedQuery.data.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <StatusPieChart
                data={statusDistQuery.data}
                isLoading={statusDistQuery.isLoading}
              />
              <ProgressBarsChart
                data={progressQuery.data}
                isLoading={progressQuery.isLoading}
              />
            </div>
            <ProjectsBarChart
              data={progressQuery.data}
              isLoading={progressQuery.isLoading}
            />
          </TabsContent>

          {/* Aba: Clientes e Projetos (Space = Cliente, Épico = Projeto) */}
          <TabsContent value="clientes">
            <ProjectsTable
              projects={projectsQuery.data}
              isLoading={projectsQuery.isLoading}
            />
          </TabsContent>

          {/* Aba: Impedimentos */}
          <TabsContent value="blocked">
            <BlockedTasksTable
              tasks={blockedQuery.data}
              isLoading={blockedQuery.isLoading}
            />
          </TabsContent>
        </Tabs>
      </main>

      <TasksModal
        cardType={activeCard}
        tasks={tasksQuery.data}
        overdueTasks={overdueQuery.data}
        projects={projectsQuery.data}
        clients={clientsQuery.data}
        isLoading={
          activeCard === 'projects' ? projectsQuery.isLoading
          : activeCard === 'clients' ? clientsQuery.isLoading
          : activeCard === 'overdue' ? overdueQuery.isLoading
          : tasksQuery.isLoading
        }
        onClose={() => setActiveCard(null)}
      />
    </div>
  );
}

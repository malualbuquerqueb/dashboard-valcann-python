import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { TaskDetail, ProjectSummary, ClientSummary } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { getPriorityColor, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

export type CardType =
  | 'total'
  | 'completed'
  | 'inprogress'
  | 'open'
  | 'blocked'
  | 'progress'
  | 'projects'
  | 'clients';

const JIRA_BASE = import.meta.env.VITE_JIRA_BASE_URL || 'https://valcann-project.atlassian.net';

const TASK_CARD_CONFIG: Record<
  Exclude<CardType, 'projects' | 'clients'>,
  { title: string; color: string; borderColor: string; filter: (t: TaskDetail) => boolean }
> = {
  total: {
    title: 'Total de Tasks',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    filter: () => true,
  },
  completed: {
    title: 'Tasks Concluídas',
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    filter: (t) => t.statusCategory === 'done',
  },
  inprogress: {
    title: 'Tasks Em Andamento',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    filter: (t) => t.statusCategory === 'inprogress',
  },
  open: {
    title: 'Tasks Em Aberto',
    color: 'text-slate-400',
    borderColor: 'border-slate-500/30',
    filter: (t) => t.statusCategory === 'todo',
  },
  blocked: {
    title: 'Tasks Bloqueadas',
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    filter: (t) => t.isBlocked,
  },
  progress: {
    title: 'Progresso Geral',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    filter: () => true,
  },
};

interface TasksModalProps {
  cardType: CardType | null;
  tasks?: TaskDetail[];
  projects?: ProjectSummary[];
  clients?: ClientSummary[];
  isLoading?: boolean;
  onClose: () => void;
}

export function TasksModal({ cardType, tasks, projects, clients, isLoading, onClose }: TasksModalProps) {
  useEffect(() => {
    if (!cardType) return;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [cardType, onClose]);

  if (!cardType) return null;

  if (cardType === 'projects') {
    return (
      <ModalShell
        title="Projetos"
        subtitle={isLoading ? 'Carregando...' : `${projects?.length ?? 0} projeto${(projects?.length ?? 0) !== 1 ? 's' : ''}`}
        color="text-cyan-400"
        borderColor="border-cyan-500/30"
        onClose={onClose}
      >
        {isLoading ? <LoadingSkeleton /> : <ProjectsTable projects={projects ?? []} />}
      </ModalShell>
    );
  }

  if (cardType === 'clients') {
    return (
      <ModalShell
        title="Clientes"
        subtitle={isLoading ? 'Carregando...' : `${clients?.length ?? 0} cliente${(clients?.length ?? 0) !== 1 ? 's' : ''}`}
        color="text-orange-400"
        borderColor="border-orange-500/30"
        onClose={onClose}
      >
        {isLoading ? <LoadingSkeleton /> : <ClientsTable clients={clients ?? []} />}
      </ModalShell>
    );
  }

  const config = TASK_CARD_CONFIG[cardType];
  const filteredTasks = tasks ? tasks.filter(config.filter) : [];
  const count = filteredTasks.length;

  return (
    <ModalShell
      title={config.title}
      subtitle={isLoading ? 'Carregando tarefas...' : `${count} task${count !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''}`}
      color={config.color}
      borderColor={config.borderColor}
      onClose={onClose}
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredTasks.length === 0 ? (
        <EmptyState />
      ) : (
        <TasksTable tasks={filteredTasks} />
      )}
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Shell

interface ModalShellProps {
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalShell({ title, subtitle, color, borderColor, onClose, children }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-6xl max-h-[85vh] bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden',
          borderColor
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
          <div>
            <h2 className={cn('text-lg font-bold', color)}>{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tasks table

function TasksTable({ tasks }: { tasks: TaskDetail[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-card z-10 border-b border-border/50">
        <tr>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Key</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Resumo</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">Projeto</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden lg:table-cell whitespace-nowrap">Épico</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden lg:table-cell whitespace-nowrap">Responsável</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">Prioridade</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Status</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden xl:table-cell whitespace-nowrap">Sprint</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden xl:table-cell whitespace-nowrap">Entrega</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden xl:table-cell whitespace-nowrap">SP</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
            <td className="py-2.5 px-4">
              <a
                href={`${JIRA_BASE}/browse/${task.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono text-xs whitespace-nowrap"
              >
                {task.key}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </td>
            <td className="py-2.5 px-4 max-w-xs">
              <span className="line-clamp-2 text-foreground leading-snug">{task.summary}</span>
            </td>
            <td className="py-2.5 px-4 hidden md:table-cell">
              <span className="text-muted-foreground text-xs whitespace-nowrap">{task.projectName}</span>
            </td>
            <td className="py-2.5 px-4 hidden lg:table-cell">
              <span className="text-muted-foreground text-xs">{task.epicName || '-'}</span>
            </td>
            <td className="py-2.5 px-4 hidden lg:table-cell">
              <span className="text-muted-foreground text-xs whitespace-nowrap">{task.assignee || '-'}</span>
            </td>
            <td className="py-2.5 px-4 hidden md:table-cell">
              <span className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                />
                {task.priority}
              </span>
            </td>
            <td className="py-2.5 px-4">
              <StatusBadge status={task.status} category={task.statusCategory} isBlocked={task.isBlocked} />
            </td>
            <td className="py-2.5 px-4 hidden xl:table-cell">
              <span className="text-xs text-muted-foreground">{task.sprintName || '-'}</span>
            </td>
            <td className="py-2.5 px-4 hidden xl:table-cell">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(task.dueDate)}</span>
            </td>
            <td className="py-2.5 px-4 hidden xl:table-cell text-right">
              <span className="text-xs text-muted-foreground">{task.storyPoints ?? '-'}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Projects table

function ProjectsTable({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) return <EmptyState message="Nenhum projeto encontrado" />;
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-card z-10 border-b border-border/50">
        <tr>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Projeto</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">Cliente</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Total</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell whitespace-nowrap">Concluídas</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell whitespace-nowrap">Andamento</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">Em Aberto</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">Bloqueadas</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Progresso</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
            <td className="py-3 px-4">
              <div>
                <a
                  href={`${JIRA_BASE}/jira/software/projects/${p.key}/boards`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium text-xs whitespace-nowrap"
                >
                  {p.key}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
                <span className="text-foreground text-xs">{p.name}</span>
              </div>
            </td>
            <td className="py-3 px-4 hidden md:table-cell">
              <span className="text-muted-foreground text-xs">{p.clientName}</span>
            </td>
            <td className="py-3 px-4 text-right">
              <span className="text-foreground font-medium text-xs">{p.totalTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden sm:table-cell">
              <span className="text-green-400 text-xs">{p.completedTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden sm:table-cell">
              <span className="text-yellow-400 text-xs">{p.inProgressTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden md:table-cell">
              <span className="text-slate-400 text-xs">{p.openTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden md:table-cell">
              <span className={cn('text-xs', p.blockedTasks > 0 ? 'text-red-400' : 'text-muted-foreground')}>
                {p.blockedTasks}
              </span>
            </td>
            <td className="py-3 px-4 min-w-[120px]">
              <div className="flex items-center gap-2">
                <Progress
                  value={p.progressPercentage}
                  className="h-1.5 flex-1"
                  indicatorClassName="bg-green-500"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap w-9 text-right">
                  {p.progressPercentage}%
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Clients table

function ClientsTable({ clients }: { clients: ClientSummary[] }) {
  if (clients.length === 0) return <EmptyState message="Nenhum cliente encontrado" />;
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-card z-10 border-b border-border/50">
        <tr>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cliente</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Projetos</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Total Tasks</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell whitespace-nowrap">Concluídas</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell whitespace-nowrap">Andamento</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">Em Aberto</th>
          <th className="text-right py-3 px-4 text-muted-foreground font-medium hidden md:table-cell whitespace-nowrap">Bloqueadas</th>
          <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Progresso</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
            <td className="py-3 px-4">
              <span className="text-foreground font-medium text-sm">{c.name}</span>
            </td>
            <td className="py-3 px-4 text-right">
              <span className="text-cyan-400 text-xs">{c.projectCount}</span>
            </td>
            <td className="py-3 px-4 text-right">
              <span className="text-foreground font-medium text-xs">{c.totalTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden sm:table-cell">
              <span className="text-green-400 text-xs">{c.completedTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden sm:table-cell">
              <span className="text-yellow-400 text-xs">{c.inProgressTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden md:table-cell">
              <span className="text-slate-400 text-xs">{c.openTasks}</span>
            </td>
            <td className="py-3 px-4 text-right hidden md:table-cell">
              <span className={cn('text-xs', c.blockedTasks > 0 ? 'text-red-400' : 'text-muted-foreground')}>
                {c.blockedTasks}
              </span>
            </td>
            <td className="py-3 px-4 min-w-[120px]">
              <div className="flex items-center gap-2">
                <Progress
                  value={c.progressPercentage}
                  className="h-1.5 flex-1"
                  indicatorClassName="bg-orange-500"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap w-9 text-right">
                  {c.progressPercentage}%
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Shared helpers

function StatusBadge({ status, category, isBlocked }: { status: string; category: string; isBlocked: boolean }) {
  if (isBlocked) return <Badge variant="blocked" className="text-xs whitespace-nowrap">{status}</Badge>;
  if (category === 'done') return <Badge variant="success" className="text-xs whitespace-nowrap">{status}</Badge>;
  if (category === 'inprogress') return <Badge variant="info" className="text-xs whitespace-nowrap">{status}</Badge>;
  return <Badge variant="secondary" className="text-xs whitespace-nowrap">{status}</Badge>;
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message = 'Nenhuma task encontrada' }: { message?: string }) {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <svg className="mx-auto h-12 w-12 opacity-30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectSummary } from '@/types';

const JIRA_BASE = import.meta.env.VITE_JIRA_BASE_URL || 'https://valcann-project.atlassian.net';

interface ProjectsTableProps {
  projects?: ProjectSummary[];
  isLoading?: boolean;
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-green-500' :
    value >= 50 ? 'bg-blue-500' :
    value >= 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={value}
        className="h-1.5 flex-1"
        indicatorClassName={color}
      />
      <span className="text-xs text-muted-foreground w-10 text-right">{value}%</span>
    </div>
  );
}

function ProjectRow({ project }: { project: ProjectSummary }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-3">
          <button className="text-muted-foreground hover:text-foreground">
            {project.epics.length > 0
              ? expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              : <span className="w-4 h-4 inline-block" />
            }
          </button>
        </td>
        <td className="py-3 px-3">
          <a
            href={`${JIRA_BASE}/jira/software/projects/${project.key}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono text-xs"
          >
            {project.key}
            <ExternalLink className="h-3 w-3" />
          </a>
        </td>
        <td className="py-3 px-3 font-medium text-foreground">{project.name}</td>
        <td className="py-3 px-3 text-center text-muted-foreground">{project.totalTasks}</td>
        <td className="py-3 px-3 text-center text-green-400">{project.completedTasks}</td>
        <td className="py-3 px-3 text-center text-yellow-400">{project.inProgressTasks}</td>
        <td className="py-3 px-3 text-center text-slate-400">{project.openTasks}</td>
        <td className="py-3 px-3 text-center">
          {project.blockedTasks > 0
            ? <Badge variant="blocked">{project.blockedTasks}</Badge>
            : <span className="text-muted-foreground">0</span>
          }
        </td>
        <td className="py-3 px-3 min-w-[140px]">
          <ProgressBar value={project.progressPercentage} />
        </td>
      </tr>
      {expanded && project.epics.map(epic => (
        <tr key={epic.id} className="border-b border-border/20 bg-secondary/20">
          <td className="py-2 px-3" />
          <td className="py-2 px-3">
            <a
              href={`${JIRA_BASE}/browse/${epic.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-mono text-xs"
            >
              {epic.key}
              <ExternalLink className="h-3 w-3" />
            </a>
          </td>
          <td className="py-2 px-3 text-sm text-muted-foreground pl-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
              {epic.name}
            </span>
          </td>
          <td className="py-2 px-3 text-center text-xs text-muted-foreground">{epic.totalTasks}</td>
          <td className="py-2 px-3 text-center text-xs text-green-400/80">{epic.completedTasks}</td>
          <td className="py-2 px-3 text-center text-xs text-yellow-400/80">{epic.inProgressTasks}</td>
          <td className="py-2 px-3 text-center text-xs text-slate-400/80">{epic.openTasks}</td>
          <td className="py-2 px-3 text-center">
            {epic.blockedTasks > 0
              ? <Badge variant="blocked" className="text-xs">{epic.blockedTasks}</Badge>
              : <span className="text-muted-foreground text-xs">0</span>
            }
          </td>
          <td className="py-2 px-3">
            <ProgressBar value={epic.progressPercentage} />
          </td>
        </tr>
      ))}
    </>
  );
}

export function ProjectsTable({ projects, isLoading }: ProjectsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground">Projetos e Épicos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Nenhum projeto encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="w-8 py-2 px-3" />
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Key</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Nome</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Total</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Concluídas</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Andamento</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Abertas</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Bloqueadas</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium min-w-[140px]">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

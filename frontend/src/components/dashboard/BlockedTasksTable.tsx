import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BlockedTask } from '@/types';
import { getPriorityColor } from '@/utils/format';

const JIRA_BASE = import.meta.env.VITE_JIRA_BASE_URL || 'https://valcann-project.atlassian.net';

interface BlockedTasksTableProps {
  tasks?: BlockedTask[];
  isLoading?: boolean;
}

function PriorityDot({ priority }: { priority: string }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1.5"
      style={{ backgroundColor: getPriorityColor(priority) }}
    />
  );
}

export function BlockedTasksTable({ tasks, isLoading }: BlockedTasksTableProps) {
  return (
    <Card className="border-red-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Impedimentos / Tasks Bloqueadas
          {tasks && tasks.length > 0 && (
            <Badge variant="blocked" className="ml-auto">{tasks.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircleIcon />
            <p className="mt-2 text-sm">Nenhum impedimento ativo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Key</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Resumo</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">Projeto</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">Responsável</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">Prioridade</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden xl:table-cell">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <a
                        href={`${JIRA_BASE}/browse/${task.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono text-xs"
                      >
                        {task.key}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <span className="line-clamp-1 text-foreground">{task.summary}</span>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className="text-muted-foreground text-xs">{task.projectName}</span>
                    </td>
                    <td className="py-2.5 px-3 hidden lg:table-cell">
                      <span className="text-muted-foreground text-xs">{task.assignee || '-'}</span>
                    </td>
                    <td className="py-2.5 px-3 hidden lg:table-cell">
                      <span className="flex items-center text-xs">
                        <PriorityDot priority={task.priority} />
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="blocked" className="text-xs">{task.status}</Badge>
                    </td>
                    <td className="py-2.5 px-3 hidden xl:table-cell">
                      <span className="text-xs text-muted-foreground">{task.blockReason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="mx-auto h-12 w-12 text-green-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

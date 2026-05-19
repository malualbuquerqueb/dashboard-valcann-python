import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectProgress } from '@/types';

interface ProjectsBarChartProps {
  data?: ProjectProgress[];
  isLoading?: boolean;
}

export function ProjectsBarChart({ data, isLoading }: ProjectsBarChartProps) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'hsl(222 47% 14%)',
      border: '1px solid hsl(222 47% 20%)',
      borderRadius: '8px',
      color: 'hsl(213 31% 91%)',
    },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-base">Tasks por Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Sem dados disponíveis</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.slice(0, 8)}
              margin={{ top: 5, right: 10, left: -20, bottom: 60 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 20%)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'hsl(215 20% 65%)', fontSize: '12px' }}>{value}</span>
                )}
              />
              <Bar dataKey="completed" name="Concluídas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inProgress" name="Andamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="open" name="Abertas" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="blocked" name="Bloqueadas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface ProgressBarsChartProps {
  data?: ProjectProgress[];
  isLoading?: boolean;
}

export function ProgressBarsChart({ data, isLoading }: ProgressBarsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progresso por Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-base">Progresso por Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((project) => {
            const color =
              project.progress >= 80 ? '#22c55e' :
              project.progress >= 50 ? '#3b82f6' :
              project.progress >= 25 ? '#f59e0b' : '#ef4444';

            return (
              <div key={project.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground font-medium truncate max-w-[160px]">{project.name}</span>
                  <span className="text-muted-foreground ml-2 tabular-nums">{project.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${project.progress}%`, backgroundColor: color }}
                  />
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="text-green-400">{project.completed} done</span>
                  <span className="text-blue-400">{project.inProgress} in progress</span>
                  {project.blocked > 0 && (
                    <span className="text-red-400">{project.blocked} blocked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

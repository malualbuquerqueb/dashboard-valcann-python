import { CheckCircle2, Clock, AlertTriangle, BarChart3, Layers, Users, TrendingUp, XCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStats } from '@/types';
import { cn } from '@/utils/cn';
import { CardType } from './TasksModal';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: { value: number; label: string };
  cardType?: CardType;
  onClick?: (type: CardType) => void;
}

function StatCard({ title, value, subtitle, icon, color, bgColor, cardType, onClick }: StatCardProps) {
  const isClickable = !!cardType && !!onClick;
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/20',
        isClickable
          ? 'cursor-pointer hover:border-border hover:scale-[1.02] active:scale-[0.99]'
          : 'hover:border-border'
      )}
      onClick={isClickable ? () => onClick(cardType!) : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className={cn('text-3xl font-bold', color)}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {isClickable && (
              <p className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-0.5">
                Ver detalhes <ChevronRight className="h-3 w-3" />
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', bgColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
      <div className={cn('absolute bottom-0 left-0 right-0 h-0.5', bgColor.replace('/20', '/60'))} />
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
  onCardClick?: (type: CardType) => void;
}

export function StatsCards({ stats, isLoading, onCardClick }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!stats) return null;

  const cards: StatCardProps[] = [
    {
      title: 'Total de Tasks',
      value: stats.totalTasks,
      subtitle: `${stats.totalProjects} projetos ativos`,
      icon: <Layers className="h-5 w-5 text-blue-400" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      cardType: 'total',
    },
    {
      title: 'Concluídas',
      value: stats.completedTasks,
      subtitle: `${stats.progressPercentage}% do total`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      cardType: 'completed',
    },
    {
      title: 'Em Andamento',
      value: stats.inProgressTasks,
      subtitle: 'Tarefas ativas',
      icon: <Clock className="h-5 w-5 text-yellow-400" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      cardType: 'inprogress',
    },
    {
      title: 'Em Aberto',
      value: stats.openTasks,
      subtitle: 'Aguardando início',
      icon: <XCircle className="h-5 w-5 text-slate-400" />,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      cardType: 'open',
    },
    {
      title: 'Bloqueadas',
      value: stats.blockedTasks,
      subtitle: 'Impedimentos ativos',
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      color: stats.blockedTasks > 0 ? 'text-red-400' : 'text-muted-foreground',
      bgColor: stats.blockedTasks > 0 ? 'bg-red-500/20' : 'bg-slate-500/20',
      cardType: 'blocked',
    },
    {
      title: 'Progresso Geral',
      value: `${stats.progressPercentage}%`,
      subtitle: `${stats.completedTasks} de ${stats.totalTasks} tasks`,
      icon: <TrendingUp className="h-5 w-5 text-purple-400" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      cardType: 'progress',
    },
    {
      title: 'Projetos',
      value: stats.totalProjects,
      subtitle: 'Total de projetos',
      icon: <BarChart3 className="h-5 w-5 text-cyan-400" />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      cardType: 'projects',
    },
    {
      title: 'Clientes',
      value: stats.totalClients,
      subtitle: 'Clientes ativos',
      icon: <Users className="h-5 w-5 text-orange-400" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      cardType: 'clients',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} onClick={onCardClick} />
      ))}
    </div>
  );
}

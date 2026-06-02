import { FolderOpen, Building2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuickNavBarProps {
  totalProjects?: number;
  totalClients?: number;
  lastUpdated?: Date;
  isLoading?: boolean;
  onClientsClick: () => void;
  onProjectsClick: () => void;
}

export function QuickNavBar({
  totalProjects = 0,
  totalClients = 0,
  lastUpdated,
  isLoading,
  onClientsClick,
  onProjectsClick,
}: QuickNavBarProps) {
  const updatedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {/* Clientes (Spaces) */}
      <button
        onClick={onClientsClick}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
          'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 active:scale-95',
          'border border-transparent hover:border-cyan-500/20'
        )}
      >
        <Building2 className="h-4 w-4 flex-shrink-0" />
        <span>
          <span className="font-bold">{totalClients}</span>
          <span className="text-muted-foreground font-normal ml-1 hidden sm:inline">Clientes Ativos</span>
          <span className="text-muted-foreground font-normal ml-1 sm:hidden">Cli.</span>
        </span>
      </button>

      <div className="w-px h-4 bg-border/50" />

      {/* Projetos (Épicos) */}
      <button
        onClick={onProjectsClick}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
          'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 active:scale-95',
          'border border-transparent hover:border-purple-500/20'
        )}
      >
        <FolderOpen className="h-4 w-4 flex-shrink-0" />
        <span>
          <span className="font-bold">{totalProjects}</span>
          <span className="text-muted-foreground font-normal ml-1 hidden sm:inline">Projetos Ativos</span>
          <span className="text-muted-foreground font-normal ml-1 sm:hidden">Proj.</span>
        </span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Atualizado às */}
      {lastUpdated && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Atualizado às </span>
          <span className="font-medium">{updatedTime}</span>
        </div>
      )}

      {/* Status ao vivo */}
      {isLoading ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="hidden sm:inline">Atualizando...</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="hidden sm:inline">Ao vivo</span>
        </div>
      )}
    </div>
  );
}

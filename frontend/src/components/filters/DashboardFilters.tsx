import { Filter, X, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FilterOptions, DashboardFilters } from '@/types';
import { cn } from '@/utils/cn';

interface DashboardFiltersProps {
  filters: DashboardFilters;
  options?: FilterOptions;
  isLoading?: boolean;
  onChange: (filters: DashboardFilters) => void;
  lastUpdated?: Date;
}

function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value?: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <Select value={value || 'all'} onValueChange={val => onChange(val === 'all' ? '' : val)} disabled={disabled}>
        <SelectTrigger className="h-9 text-sm min-w-[160px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function DashboardFiltersBar({
  filters,
  options,
  isLoading,
  onChange,
  lastUpdated,
}: DashboardFiltersProps) {
  const queryClient = useQueryClient();

  const activeFilters = Object.entries(filters).filter(([, v]) => v).length;

  function clearFilters() {
    onChange({});
  }

  function refreshData() {
    queryClient.invalidateQueries();
  }

  const projectOptions = (options?.projects || []).map(p => ({
    value: p.key,
    label: `${p.key} - ${p.name}`,
  }));

  const sprintOptions = (options?.sprints || []).map(s => ({
    value: String(s.id),
    label: `${s.name} (${s.state})`,
  }));

  const statusOptions = (options?.statuses || []).map(s => ({
    value: s,
    label: s,
  }));

  const assigneeOptions = (options?.assignees || []).map(a => ({
    value: a.accountId,
    label: a.displayName,
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros</span>
        {activeFilters > 0 && (
          <Badge variant="info" className="text-xs">{activeFilters}</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <FilterSelect
          label="Projeto"
          value={filters.projectKey}
          placeholder="Todos os projetos"
          options={projectOptions}
          onChange={(val) => onChange({ ...filters, projectKey: val || undefined })}
          disabled={isLoading}
        />

        <FilterSelect
          label="Sprint"
          value={filters.sprintId}
          placeholder="Todas as sprints"
          options={sprintOptions}
          onChange={(val) => onChange({ ...filters, sprintId: val || undefined })}
          disabled={isLoading}
        />

        <FilterSelect
          label="Status"
          value={filters.status}
          placeholder="Todos os status"
          options={statusOptions}
          onChange={(val) => onChange({ ...filters, status: val || undefined })}
          disabled={isLoading}
        />

        <FilterSelect
          label="Responsável"
          value={filters.assigneeId}
          placeholder="Todos"
          options={assigneeOptions}
          onChange={(val) => onChange({ ...filters, assigneeId: val || undefined })}
          disabled={isLoading}
        />

        <div className="flex gap-2 ml-auto items-end">
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors h-9 px-3 rounded-md border border-border/50 hover:border-border"
            >
              <X className="h-3 w-3" />
              Limpar
            </button>
          )}
          <button
            onClick={refreshData}
            className={cn(
              'flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors h-9 px-3 rounded-md border border-border/50 hover:border-border',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            Atualizar
          </button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-muted-foreground">
          Atualizado em {lastUpdated.toLocaleTimeString('pt-BR')} · Auto-atualiza a cada 30s
        </p>
      )}
    </div>
  );
}

import { Filter, X, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FilterOptions, EpicOption, DashboardFilters } from '@/types';
import { cn } from '@/utils/cn';

interface DashboardFiltersProps {
  filters: DashboardFilters;
  options?: FilterOptions;
  epics?: EpicOption[];
  epicsLoading?: boolean;
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
  hint,
}: {
  label: string;
  value?: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <Select value={value || 'all'} onValueChange={val => onChange(val === 'all' ? '' : val)} disabled={disabled}>
        <SelectTrigger className="h-8 text-xs min-w-[140px] lg:min-w-[160px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <p className="text-xs text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

export function DashboardFiltersBar({
  filters,
  options,
  epics,
  epicsLoading,
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

  // Cliente = Jira Project (Space)
  const clientOptions = (options?.projects || []).map(p => ({
    value: p.key,
    label: p.name,
  }));

  // Projeto = Épico dentro do Space selecionado
  const projectOptions = (epics || []).map(e => ({
    value: e.key,
    label: e.name,
  }));

  const statusOptions = (options?.statuses || []).map(s => ({
    value: s,
    label: s,
  }));

  const assigneeOptions = (options?.assignees || []).map(a => ({
    value: a.accountId,
    label: a.displayName,
  }));

  const noClientSelected = !filters.projectKey;

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
        {/* Cliente (Space = Jira Project) */}
        <FilterSelect
          label="Cliente"
          value={filters.projectKey}
          placeholder="Todos os clientes"
          options={clientOptions}
          onChange={(val) => {
            // Ao mudar o cliente, reseta o projeto (epicKey)
            onChange({ ...filters, projectKey: val || undefined, epicKey: undefined });
          }}
          disabled={isLoading}
        />

        {/* Projeto (Épico dentro do Space selecionado) */}
        <FilterSelect
          label="Projeto"
          value={filters.epicKey}
          placeholder={noClientSelected ? 'Selecione um cliente primeiro' : epicsLoading ? 'Carregando...' : 'Todos os projetos'}
          options={projectOptions}
          onChange={(val) => onChange({ ...filters, epicKey: val || undefined })}
          disabled={isLoading || noClientSelected || epicsLoading}
          hint={noClientSelected ? undefined : undefined}
        />

        {/* Status */}
        <FilterSelect
          label="Status"
          value={filters.status}
          placeholder="Todos os status"
          options={statusOptions}
          onChange={(val) => onChange({ ...filters, status: val || undefined })}
          disabled={isLoading}
        />

        {/* Responsável */}
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
          Atualizado em {lastUpdated.toLocaleTimeString('pt-BR')} · Auto-atualiza a cada 5s
        </p>
      )}
    </div>
  );
}

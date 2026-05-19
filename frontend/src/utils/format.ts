export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  return formatDate(dateStr);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    Highest: '#ef4444',
    High: '#f97316',
    Medium: '#f59e0b',
    Low: '#22c55e',
    Lowest: '#94a3b8',
  };
  return map[priority] || '#94a3b8';
}

export function getStatusCategoryColor(category: string): string {
  const map: Record<string, string> = {
    done: '#22c55e',
    inprogress: '#3b82f6',
    todo: '#94a3b8',
  };
  return map[category] || '#64748b';
}

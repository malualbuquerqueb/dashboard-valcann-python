import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusDistribution } from '@/types';

interface StatusPieChartProps {
  data?: StatusDistribution[];
  isLoading?: boolean;
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function StatusPieChart({ data, isLoading }: StatusPieChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-base">Distribuição por Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Skeleton className="h-56 w-56 rounded-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Sem dados disponíveis</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                innerRadius={40}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 14%)',
                  border: '1px solid hsl(222 47% 20%)',
                  borderRadius: '8px',
                  color: 'hsl(213 31% 91%)',
                }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'hsl(215 20% 65%)', fontSize: '12px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

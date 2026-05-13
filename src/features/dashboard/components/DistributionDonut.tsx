import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Slice = {
  name: string;
  value: number;
  color: string;
};

type DistributionDonutProps = {
  title: string;
  data: Slice[];
  summary?: string;
  className?: string;
};

export function DistributionDonut({
  title,
  data,
  summary,
  className,
}: DistributionDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card size="sm" className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-3">
        {total > 0 ? (
          <>
            <div className="relative">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={64}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="font-data text-lg font-semibold tabular-nums">
                  {total}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-data tabular-nums text-foreground">
                      {d.value}
                    </span>
                  </div>
                ))}
            </div>

            {summary ? (
              <p className="text-xs text-muted-foreground">{summary}</p>
            ) : null}
          </>
        ) : (
          <div className="flex h-[140px] items-center text-xs text-muted-foreground/50">
            No data yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

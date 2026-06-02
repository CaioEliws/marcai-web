import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { MeasuredChartFrame } from './MeasuredChartFrame'
import type { StatusChartItem } from './dashboardMetrics'

type AppointmentsStatusChartProps = {
  data: StatusChartItem[]
}

const chartColors = [
  'var(--primary)',
  'var(--ring)',
  'var(--secondary-foreground)',
  'var(--destructive)',
  'var(--muted-foreground)',
]

const legendDotClasses = [
  'bg-primary',
  'bg-ring',
  'bg-secondary-foreground',
  'bg-destructive',
  'bg-muted-foreground',
]

export function AppointmentsStatusChart({
  data,
}: AppointmentsStatusChartProps) {
  const visibleData = data.filter((item) => item.value > 0)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Agendamentos por status</CardTitle>
        <CardDescription>Distribuição dos agendamentos de hoje.</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {visibleData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum agendamento encontrado para montar o gráfico.
          </p>
        ) : (
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
            <MeasuredChartFrame className="h-64 min-h-64 overflow-hidden">
              {({ height, width }) => {
                const outerRadius = Math.max(
                  48,
                  Math.min(width, height) / 2 - 12,
                )

                return (
                  <PieChart width={width} height={height}>
                  <Pie
                    data={visibleData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={Math.max(32, outerRadius * 0.66)}
                    nameKey="label"
                    outerRadius={outerRadius}
                    paddingAngle={2}
                  >
                    {visibleData.map((item, index) => (
                      <Cell
                        key={item.status}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<StatusTooltip />} />
                  </PieChart>
                )
              }}
            </MeasuredChartFrame>

            <div className="grid content-center gap-2">
              {visibleData.map((item, index) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className={`size-2.5 rounded-full ${
                        legendDotClasses[index % legendDotClasses.length]
                      }`}
                    />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: StatusChartItem }>
}) {
  if (!active || !payload?.[0]) {
    return null
  }

  const item = payload[0].payload

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted-foreground">{item.value} agendamentos</p>
    </div>
  )
}

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { EmptyDashboardState } from './EmptyDashboardState'
import { MeasuredChartFrame } from './MeasuredChartFrame'
import type { OccupancyByWeekdayItem } from '../utils/dashboardMetrics'
import { formatPercent } from '../utils/dashboardFormatters'

type OccupancyByWeekdayChartProps = {
  data: OccupancyByWeekdayItem[]
}

export function OccupancyByWeekdayChart({ data }: OccupancyByWeekdayChartProps) {
  const hasAvailableMinutes = data.some((item) => item.availableMinutes > 0)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Ocupação por dia da semana</CardTitle>
        <CardDescription>
          Estimativa baseada em horários ativos e minutos agendados.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {!hasAvailableMinutes ? (
          <EmptyDashboardState
            title="Nenhum horário ativo configurado."
            description="Configure horários para estimar ocupação por dia da semana."
            actionLabel="Configurar horários"
            actionTo="/dashboard/availability"
          />
        ) : (
          <MeasuredChartFrame className="h-72 min-h-72 overflow-hidden">
            {({ height, width }) => (
              <BarChart
                width={width}
                height={height}
                data={data}
                margin={{ bottom: 8, left: 8, right: 8, top: 8 }}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickFormatter={(value) => formatPercent(Number(value))}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={56}
                />
                <Tooltip content={<OccupancyTooltip />} />
                <Bar
                  dataKey="occupancyRate"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </MeasuredChartFrame>
        )}
      </CardContent>
    </Card>
  )
}

function OccupancyTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: OccupancyByWeekdayItem }>
}) {
  if (!active || !payload?.[0]) {
    return null
  }

  const item = payload[0].payload

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted-foreground">
        {formatPercent(item.occupancyRate)} de ocupação estimada
      </p>
    </div>
  )
}

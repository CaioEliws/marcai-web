import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { MeasuredChartFrame } from './MeasuredChartFrame'
import { EmptyDashboardState } from './EmptyDashboardState'
import type { RevenueOverTimeItem } from '../utils/dashboardMetrics'
import { formatCurrency } from '../utils/dashboardFormatters'

type RevenueOverTimeChartProps = {
  data: RevenueOverTimeItem[]
  periodLabel: string
}

export function RevenueOverTimeChart({
  data,
  periodLabel,
}: RevenueOverTimeChartProps) {
  const visibleData = data.filter((item) => item.revenue > 0)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Receita ao longo do tempo</CardTitle>
        <CardDescription>
          Receita realizada em atendimentos concluídos · {periodLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {visibleData.length === 0 ? (
          <EmptyDashboardState
            title="Ainda não há receita realizada neste período."
            description="Conclua atendimentos com preço cadastrado para acompanhar a evolução da receita."
            actionLabel="Ver agendamentos"
            actionTo="/dashboard/appointments"
          />
        ) : (
          <MeasuredChartFrame className="h-72 min-h-72 overflow-hidden">
            {({ height, width }) => (
              <BarChart
                width={width}
                height={height}
                data={visibleData}
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
                  tickFormatter={(value) => formatCurrency(Number(value))}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={84}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </MeasuredChartFrame>
        )}
      </CardContent>
    </Card>
  )
}

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: RevenueOverTimeItem }>
}) {
  if (!active || !payload?.[0]) {
    return null
  }

  const item = payload[0].payload

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted-foreground">{formatCurrency(item.revenue)}</p>
    </div>
  )
}

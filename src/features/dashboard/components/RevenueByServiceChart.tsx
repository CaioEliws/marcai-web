import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { MeasuredChartFrame } from './MeasuredChartFrame'
import { formatCurrency } from './dashboardUtils'
import type { ServiceRevenueItem } from './dashboardMetrics'

type RevenueByServiceChartProps = {
  data: ServiceRevenueItem[]
}

export function RevenueByServiceChart({ data }: RevenueByServiceChartProps) {
  const visibleData = data.filter((item) => item.revenue > 0).slice(0, 6)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Receita por serviço</CardTitle>
        <CardDescription>
          Receita prevista ou realizada hoje, por serviço.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {visibleData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma receita encontrada para montar o gráfico.
          </p>
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
                  dataKey="name"
                  interval={0}
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
                <Bar
                  dataKey="revenue"
                  fill="var(--primary)"
                  name="Receita"
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

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ServiceRevenueItem }>
}) {
  if (!active || !payload?.[0]) {
    return null
  }

  const item = payload[0].payload

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">{formatCurrency(item.revenue)}</p>
    </div>
  )
}

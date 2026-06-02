import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { formatCurrency } from './dashboardUtils'
import type { DashboardMetrics } from './dashboardMetrics'

type DashboardRevenueCardsProps = {
  metrics: DashboardMetrics
}

export function DashboardRevenueCards({
  metrics,
}: DashboardRevenueCardsProps) {
  const items = [
    {
      description: 'Agendados e confirmados',
      label: 'Receita prevista hoje',
      value: formatCurrency(metrics.predictedRevenue),
    },
    {
      description: 'Agendamentos concluídos',
      label: 'Receita realizada hoje',
      value: formatCurrency(metrics.realizedRevenue),
    },
    {
      description: 'Cancelados e faltas',
      label: 'Receita perdida hoje',
      value: formatCurrency(metrics.lostRevenue),
    },
    {
      description: `${metrics.completedAppointments} concluídos`,
      label: 'Ticket médio',
      value: formatCurrency(metrics.averageTicket),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

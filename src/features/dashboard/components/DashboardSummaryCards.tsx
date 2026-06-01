import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

type DashboardSummaryCardsProps = {
  activeBusinessHours: number
  activeServices: number
  inactiveServices: number
  todayAppointments: number
}

const summaryLabels = {
  activeBusinessHours: 'Dias com horário ativo',
  activeServices: 'Serviços ativos',
  inactiveServices: 'Serviços inativos',
  todayAppointments: 'Agendamentos de hoje',
}

export function DashboardSummaryCards({
  activeBusinessHours,
  activeServices,
  inactiveServices,
  todayAppointments,
}: DashboardSummaryCardsProps) {
  const items = [
    { label: summaryLabels.activeServices, value: activeServices },
    { label: summaryLabels.inactiveServices, value: inactiveServices },
    { label: summaryLabels.activeBusinessHours, value: activeBusinessHours },
    { label: summaryLabels.todayAppointments, value: todayAppointments },
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
            <p className="text-3xl font-semibold tracking-tight">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

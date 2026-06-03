import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { EmptyDashboardState } from './EmptyDashboardState'
import type { TopServiceItem } from '../utils/dashboardMetrics'
import { formatCurrency, formatInteger } from '../utils/dashboardFormatters'

type TopServicesCardProps = {
  byAppointments: TopServiceItem[]
  byRevenue: TopServiceItem[]
}

function ServiceRanking({
  emptyDescription,
  services,
  title,
}: {
  emptyDescription: string
  services: TopServiceItem[]
  title: string
}) {
  const visibleServices = services.slice(0, 5)

  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      {visibleServices.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {visibleServices.map((service, index) => (
            <div
              key={`${title}-${service.name}`}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {index + 1}. {service.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatInteger(service.appointments)} agendamentos
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatCurrency(service.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopServicesCard({
  byAppointments,
  byRevenue,
}: TopServicesCardProps) {
  const hasServices = byAppointments.length > 0 || byRevenue.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top serviços</CardTitle>
        <CardDescription>
          Serviços que mais movimentam agenda e receita realizada.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        {!hasServices ? (
          <div className="lg:col-span-2">
            <EmptyDashboardState
              title="Ainda não há serviços ranqueados."
              description="Agendamentos no período vão formar o ranking automaticamente."
              actionLabel="Gerenciar serviços"
              actionTo="/dashboard/services"
            />
          </div>
        ) : (
          <>
            <ServiceRanking
              title="Por receita realizada"
              services={byRevenue.filter((service) => service.revenue > 0)}
              emptyDescription="Sem receita realizada por serviço no período."
            />
            <ServiceRanking
              title="Por quantidade"
              services={byAppointments}
              emptyDescription="Sem agendamentos no período."
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

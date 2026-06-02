import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { formatCurrency } from './dashboardUtils'
import type { ServiceRevenueItem } from './dashboardMetrics'

type TopServicesCardProps = {
  services: ServiceRevenueItem[]
}

export function TopServicesCard({ services }: TopServicesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top serviços de hoje</CardTitle>
        <CardDescription>
          Ranking por quantidade de agendamentos nos dados carregados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum serviço agendado hoje.
          </p>
        ) : (
          <div className="grid gap-3">
            {services.map((service, index) => (
              <div
                key={service.name}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {index + 1}. {service.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.appointments}{' '}
                    {service.appointments === 1
                      ? 'agendamento'
                      : 'agendamentos'}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium">
                  {formatCurrency(service.revenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

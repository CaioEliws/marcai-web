import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { PeriodMetrics } from '../utils/dashboardMetrics'
import { formatInteger } from '../utils/dashboardFormatters'

type CustomersBreakdownCardProps = {
  metrics: PeriodMetrics
}

export function CustomersBreakdownCard({ metrics }: CustomersBreakdownCardProps) {
  const total = metrics.customersNew + metrics.customersRecurring

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes novos x recorrentes</CardTitle>
        <CardDescription>
          Baseado no primeiro agendamento conhecido de cada cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Novos</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatInteger(metrics.customersNew)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Recorrentes</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatInteger(metrics.customersRecurring)}
          </p>
        </div>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Ainda não há agendamentos neste período.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

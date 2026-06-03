import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { StatusOverviewItem } from '../utils/dashboardMetrics'
import { formatInteger } from '../utils/dashboardFormatters'

type AppointmentsStatusOverviewProps = {
  data: StatusOverviewItem[]
}

export function AppointmentsStatusOverview({
  data,
}: AppointmentsStatusOverviewProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos por status</CardTitle>
        <CardDescription>
          Distribuição objetiva dos agendamentos no período.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há agendamentos neste período.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.map((item) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0

              return (
                <div key={item.status} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{item.label}</Badge>
                    <span className="text-lg font-semibold">
                      {formatInteger(item.value)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

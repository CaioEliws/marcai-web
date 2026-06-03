import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { DashboardKpi } from '../utils/dashboardMetrics'
import { formatComparisonPercent } from '../utils/dashboardFormatters'

type DashboardMetricCardProps = {
  metric: DashboardKpi
}

const comparisonToneClasses = {
  bad: 'text-destructive',
  good: 'text-primary',
  neutral: 'text-muted-foreground',
}

export function DashboardMetricCard({ metric }: DashboardMetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {metric.value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p>
        <p
          className={cn(
            'mt-3 text-xs font-medium',
            comparisonToneClasses[metric.comparison.tone],
          )}
        >
          {metric.comparison.value === null
            ? metric.comparison.helper
            : `${formatComparisonPercent(metric.comparison.value)} · ${
                metric.comparison.helper
              }`}
        </p>
      </CardContent>
    </Card>
  )
}

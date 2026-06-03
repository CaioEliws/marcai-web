import { DashboardMetricCard } from './DashboardMetricCard'
import type { DashboardKpi } from '../utils/dashboardMetrics'

type DashboardKpiGridProps = {
  isLoading: boolean
  metrics: DashboardKpi[]
}

export function DashboardKpiGrid({ isLoading, metrics }: DashboardKpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-lg border bg-muted/50"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <DashboardMetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  )
}

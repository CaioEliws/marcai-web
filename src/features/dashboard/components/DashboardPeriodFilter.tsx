import { dashboardPeriodOptions } from '../utils/dashboardDateRanges'
import type { DashboardPeriodKey } from '../utils/dashboardDateRanges'

type DashboardPeriodFilterProps = {
  period: DashboardPeriodKey
  onChange: (period: DashboardPeriodKey) => void
}

export function DashboardPeriodFilter({
  onChange,
  period,
}: DashboardPeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Filtro de período">
      {dashboardPeriodOptions.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={
            option.key === period
              ? 'rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground'
              : 'rounded-md border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

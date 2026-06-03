import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

type EmptyDashboardStateProps = {
  actionLabel?: string
  actionTo?: string
  description: string
  title: string
}

export function EmptyDashboardState({
  actionLabel,
  actionTo,
  description,
  title,
}: EmptyDashboardStateProps) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionTo ? (
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}

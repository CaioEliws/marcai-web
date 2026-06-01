import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

type BadgeProps = React.ComponentProps<'span'> & {
  variant?: 'default' | 'secondary' | 'outline'
}

const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  outline: 'text-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }

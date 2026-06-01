import { Button } from '@/shared/components/ui/button'

export type ServiceStatusFilterValue = 'active' | 'inactive' | 'all'

const serviceStatusFilterOptions: Array<{
  label: string
  value: ServiceStatusFilterValue
}> = [
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
  { label: 'Todos', value: 'all' },
]

type ServiceStatusFilterProps = {
  onChange: (value: ServiceStatusFilterValue) => void
  value: ServiceStatusFilterValue
}

export function ServiceStatusFilter({
  onChange,
  value,
}: ServiceStatusFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar serviços por status"
    >
      {serviceStatusFilterOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

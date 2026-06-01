import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

type AppointmentDateFilterProps = {
  date: string
  onChange: (date: string) => void
  onClear: () => void
}

export function AppointmentDateFilter({
  date,
  onChange,
  onClear,
}: AppointmentDateFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="grid gap-2 sm:max-w-xs sm:flex-1">
        <Label htmlFor="appointment-date">Filtrar por data</Label>
        <Input
          id="appointment-date"
          type="date"
          value={date}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        disabled={!date}
      >
        Mostrar todos
      </Button>
    </div>
  )
}

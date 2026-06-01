import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { formatTime, getTodayDateInputValue } from './publicBookingUtils'

type AvailableTimesSelectorProps = {
  availableTimes: string[]
  date: string
  isLoading: boolean
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  selectedServiceId: string
  selectedTime: string
}

export function AvailableTimesSelector({
  availableTimes,
  date,
  isLoading,
  onDateChange,
  onTimeChange,
  selectedServiceId,
  selectedTime,
}: AvailableTimesSelectorProps) {
  const canShowTimes = Boolean(selectedServiceId && date)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escolha data e horario</CardTitle>
        <CardDescription>
          Os horarios aparecem apos selecionar servico e data.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointment-date">Data</Label>
          <Input
            id="appointment-date"
            type="date"
            min={getTodayDateInputValue()}
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            disabled={!selectedServiceId}
          />
        </div>

        {!selectedServiceId ? (
          <p className="text-sm text-muted-foreground">
            Escolha um servico para ver datas e horarios.
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Buscando horarios disponiveis...
          </p>
        ) : null}

        {canShowTimes && !isLoading && availableTimes.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">Nenhum horario disponivel.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha outra data para continuar.
            </p>
          </div>
        ) : null}

        {availableTimes.length > 0 ? (
          <div className="grid gap-2">
            <Label>Horarios disponiveis</Label>
            <div className="flex flex-wrap gap-2">
              {availableTimes.map((time) => {
                const isSelected = selectedTime === time

                return (
                  <Button
                    key={time}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTimeChange(time)}
                  >
                    {formatTime(time)}
                    {isSelected ? (
                      <Badge className="ml-2" variant="secondary">
                        Selecionado
                      </Badge>
                    ) : null}
                  </Button>
                )
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
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
import { cn } from '@/shared/lib/utils'
import { createBusinessHourSchema } from '../schemas/businessHour.schema'
import type { BusinessHour } from '../types/businessHour.type'
import {
  formatTimeForApi,
  formatTimeForInput,
  getBusinessHourValidationMessage,
  getRequiredBusinessHourValidationMessage,
  weekDays,
} from './businessHourUtils'
import type {
  BusinessHourFormFieldErrors,
  BusinessHourFormValues,
} from './businessHourUtils'

type BusinessHourFormProps = {
  blockedDayOfWeeks: number[]
  error: string | null
  initialBusinessHour: BusinessHour | null
  isSubmitting: boolean
  onCancelEdit: () => void
  onSubmit: (values: BusinessHourFormValues) => Promise<void>
}

function getInitialValues(businessHour: BusinessHour | null) {
  return {
    closingTime: businessHour
      ? formatTimeForInput(businessHour.closingTime)
      : '',
    dayOfWeek: businessHour ? String(businessHour.dayOfWeek) : '',
    openingTime: businessHour
      ? formatTimeForInput(businessHour.openingTime)
      : '',
  }
}

export function BusinessHourForm({
  blockedDayOfWeeks,
  error,
  initialBusinessHour,
  isSubmitting,
  onCancelEdit,
  onSubmit,
}: BusinessHourFormProps) {
  const initialValues = getInitialValues(initialBusinessHour)
  const [dayOfWeek, setDayOfWeek] = useState(initialValues.dayOfWeek)
  const [openingTime, setOpeningTime] = useState(initialValues.openingTime)
  const [closingTime, setClosingTime] = useState(initialValues.closingTime)
  const [fieldErrors, setFieldErrors] = useState<BusinessHourFormFieldErrors>(
    {},
  )
  const isEditing = initialBusinessHour !== null
  const availableDays = weekDays.filter(
    (day) =>
      !blockedDayOfWeeks.includes(day.value) ||
      day.value === initialBusinessHour?.dayOfWeek,
  )
  const hasNoDaysAvailable = availableDays.length === 0 && !isEditing

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    if (!dayOfWeek) {
      setFieldErrors({
        dayOfWeek: getRequiredBusinessHourValidationMessage('dayOfWeek'),
      })
      return
    }

    const parsedDayOfWeek = Number(dayOfWeek)

    if (!isEditing && blockedDayOfWeeks.includes(parsedDayOfWeek)) {
      setFieldErrors({
        dayOfWeek: 'Este dia ja possui uma configuracao. Use a edicao.',
      })
      return
    }

    const payload = {
      closingTime: formatTimeForApi(closingTime),
      dayOfWeek: parsedDayOfWeek,
      openingTime: formatTimeForApi(openingTime),
    }

    const parsedPayload = createBusinessHourSchema.safeParse(payload)

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors

      setFieldErrors({
        closingTime: getBusinessHourValidationMessage(
          'closingTime',
          errors.closingTime?.[0],
        ),
        dayOfWeek: getBusinessHourValidationMessage(
          'dayOfWeek',
          errors.dayOfWeek?.[0],
        ),
        openingTime: getBusinessHourValidationMessage(
          'openingTime',
          errors.openingTime?.[0],
        ),
      })
      return
    }

    await onSubmit(parsedPayload.data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar horario' : 'Novo horario'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Atualize o horario de funcionamento selecionado.'
            : 'Cadastre os dias e horarios disponiveis para agendamento.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {error ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {hasNoDaysAvailable ? (
            <Alert>
              <AlertDescription>
                Todos os dias da semana ja possuem horario cadastrado. Edite ou
                remova uma configuracao existente para alterar a agenda.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="business-hour-day">Dia da semana</Label>
              <select
                id="business-hour-day"
                value={dayOfWeek}
                onChange={(event) => setDayOfWeek(event.target.value)}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                  fieldErrors.dayOfWeek &&
                    'border-destructive focus-visible:ring-destructive/20',
                )}
                aria-invalid={Boolean(fieldErrors.dayOfWeek)}
                aria-describedby={
                  fieldErrors.dayOfWeek ? 'business-hour-day-error' : undefined
                }
                disabled={isSubmitting || hasNoDaysAvailable}
              >
                <option value="">Selecione</option>
                {availableDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              {fieldErrors.dayOfWeek ? (
                <p
                  id="business-hour-day-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.dayOfWeek}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-hour-opening">Abertura</Label>
              <Input
                id="business-hour-opening"
                type="time"
                value={openingTime}
                onChange={(event) => setOpeningTime(event.target.value)}
                aria-invalid={Boolean(fieldErrors.openingTime)}
                aria-describedby={
                  fieldErrors.openingTime
                    ? 'business-hour-opening-error'
                    : undefined
                }
                disabled={isSubmitting || hasNoDaysAvailable}
              />
              {fieldErrors.openingTime ? (
                <p
                  id="business-hour-opening-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.openingTime}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-hour-closing">Fechamento</Label>
              <Input
                id="business-hour-closing"
                type="time"
                value={closingTime}
                onChange={(event) => setClosingTime(event.target.value)}
                aria-invalid={Boolean(fieldErrors.closingTime)}
                aria-describedby={
                  fieldErrors.closingTime
                    ? 'business-hour-closing-error'
                    : undefined
                }
                disabled={isSubmitting || hasNoDaysAvailable}
              />
              {fieldErrors.closingTime ? (
                <p
                  id="business-hour-closing-error"
                  className="text-sm text-destructive"
                >
                  {fieldErrors.closingTime}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSubmitting}
              >
                Cancelar edicao
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting || hasNoDaysAvailable}>
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alteracoes'
                  : 'Adicionar horario'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

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
  apiFieldErrors: BusinessHourFormFieldErrors
  blockedDayOfWeeks: number[]
  error: string | null
  hideHeader?: boolean
  idPrefix?: string
  initialBusinessHour: BusinessHour | null
  isSubmitting: boolean
  onCancelEdit: () => void
  onSubmit: (values: BusinessHourFormValues) => Promise<void>
  presentation?: 'card' | 'plain'
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
  apiFieldErrors,
  blockedDayOfWeeks,
  error,
  hideHeader = false,
  idPrefix = 'business-hour',
  initialBusinessHour,
  isSubmitting,
  onCancelEdit,
  onSubmit,
  presentation = 'card',
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
  const visibleFieldErrors = { ...apiFieldErrors, ...fieldErrors }
  const dayInputId = `${idPrefix}-day`
  const dayErrorId = `${idPrefix}-day-error`
  const openingInputId = `${idPrefix}-opening`
  const openingErrorId = `${idPrefix}-opening-error`
  const closingInputId = `${idPrefix}-closing`
  const closingErrorId = `${idPrefix}-closing-error`

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

  const header = hideHeader ? null : (
    <CardHeader>
        <CardTitle>{isEditing ? 'Editar horario' : 'Novo horario'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Atualize o horario de funcionamento selecionado.'
            : 'Cadastre os dias e horarios disponiveis para agendamento.'}
        </CardDescription>
      </CardHeader>
  )
  const form = (
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
              <Label htmlFor={dayInputId}>Dia da semana</Label>
              <select
                id={dayInputId}
                value={dayOfWeek}
                onChange={(event) => {
                  setDayOfWeek(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    dayOfWeek: undefined,
                  }))
                }}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                  visibleFieldErrors.dayOfWeek &&
                    'border-destructive focus-visible:ring-destructive/20',
                )}
                aria-invalid={Boolean(visibleFieldErrors.dayOfWeek)}
                aria-describedby={
                  visibleFieldErrors.dayOfWeek
                    ? dayErrorId
                    : undefined
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
              {visibleFieldErrors.dayOfWeek ? (
                <p
                  id={dayErrorId}
                  className="text-sm text-destructive"
                >
                  {visibleFieldErrors.dayOfWeek}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={openingInputId}>Abertura</Label>
              <Input
                id={openingInputId}
                type="time"
                value={openingTime}
                onChange={(event) => {
                  setOpeningTime(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    openingTime: undefined,
                  }))
                }}
                aria-invalid={Boolean(visibleFieldErrors.openingTime)}
                aria-describedby={
                  visibleFieldErrors.openingTime
                    ? openingErrorId
                    : undefined
                }
                disabled={isSubmitting || hasNoDaysAvailable}
              />
              {visibleFieldErrors.openingTime ? (
                <p
                  id={openingErrorId}
                  className="text-sm text-destructive"
                >
                  {visibleFieldErrors.openingTime}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={closingInputId}>Fechamento</Label>
              <Input
                id={closingInputId}
                type="time"
                value={closingTime}
                onChange={(event) => {
                  setClosingTime(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    closingTime: undefined,
                  }))
                }}
                aria-invalid={Boolean(visibleFieldErrors.closingTime)}
                aria-describedby={
                  visibleFieldErrors.closingTime
                    ? closingErrorId
                    : undefined
                }
                disabled={isSubmitting || hasNoDaysAvailable}
              />
              {visibleFieldErrors.closingTime ? (
                <p
                  id={closingErrorId}
                  className="text-sm text-destructive"
                >
                  {visibleFieldErrors.closingTime}
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
  )

  if (presentation === 'plain') {
    return (
      <div className="grid gap-4">
        {header}
        {form}
      </div>
    )
  }

  return (
    <Card>
      {header}
      <CardContent>{form}</CardContent>
    </Card>
  )
}

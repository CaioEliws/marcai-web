import { useState } from 'react'
import type * as React from 'react'
import { z } from 'zod'
import { ApiError, getApiFieldErrors } from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useActiveServicesQuery } from '@/features/services/hooks/useServices'
import type { Service } from '@/features/services/types/service.type'
import { manualAppointmentPayloadSchema } from '../schemas/appointment.schema'
import type { ManualAppointmentPayload } from '../types/appointment.type'
import { formatAppointmentTime, formatLocalDateForApi } from './appointmentUtils'
import { useDashboardAvailableTimesQuery } from '../hooks/useAppointments'

const appointmentFields = [
  'appointmentDate',
  'clientName',
  'clientPhone',
  'notes',
  'serviceId',
  'startTime',
] as const

type AppointmentField = (typeof appointmentFields)[number]
export type AppointmentFieldErrors = Partial<Record<AppointmentField, string>>

type CreateAppointmentDialogProps = {
  error: string | null
  fieldErrors: AppointmentFieldErrors
  isSubmitting: boolean
  onCreate: (payload: ManualAppointmentPayload) => Promise<void>
  onFieldErrors: (fieldErrors: AppointmentFieldErrors) => void
  onOpenChange?: (open: boolean) => void
  onResetMessages: () => void
}

type FormValues = {
  appointmentDate: string
  clientName: string
  clientPhone: string
  notes: string
  serviceId: string
  startTime: string
}

const initialFormValues: FormValues = {
  appointmentDate: '',
  clientName: '',
  clientPhone: '',
  notes: '',
  serviceId: '',
  startTime: '',
}

function getZodFieldErrors(error: z.ZodError) {
  const fieldErrors: AppointmentFieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      typeof field === 'string' &&
      appointmentFields.includes(field as AppointmentField)
    ) {
      fieldErrors[field as AppointmentField] = issue.message
    }
  }

  return fieldErrors
}

function buildPayload(values: FormValues): ManualAppointmentPayload {
  return manualAppointmentPayloadSchema.parse({
    appointmentDate: values.appointmentDate,
    clientName: values.clientName,
    clientPhone: values.clientPhone,
    notes: values.notes.trim() ? values.notes.trim() : undefined,
    serviceId: values.serviceId,
    startTime: values.startTime,
  })
}

function getServicesErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    return 'Sua sessão expirou. Faça login novamente.'
  }

  return 'Não foi possível carregar os serviços ativos.'
}

function getAvailableTimesMessage(
  serviceId: string,
  appointmentDate: string,
  isFetching: boolean,
  availableTimes: string[],
) {
  if (!serviceId || !appointmentDate) {
    return 'Selecione serviço e data para ver horários disponíveis.'
  }

  if (isFetching) {
    return 'Carregando horários disponíveis...'
  }

  if (availableTimes.length === 0) {
    return 'Nenhum horário disponível para este serviço nesta data.'
  }

  return null
}

function renderServiceLabel(service: Service) {
  const price =
    service.price === null
      ? 'preço não informado'
      : new Intl.NumberFormat('pt-BR', {
          currency: 'BRL',
          style: 'currency',
        }).format(service.price)

  return `${service.name} · ${service.durationMinutes} min · ${price}`
}

export function CreateAppointmentDialog({
  error,
  fieldErrors,
  isSubmitting,
  onCreate,
  onFieldErrors,
  onOpenChange,
  onResetMessages,
}: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<FormValues>(initialFormValues)
  const today = formatLocalDateForApi(new Date())
  const servicesQuery = useActiveServicesQuery()
  const availableTimesQuery = useDashboardAvailableTimesQuery(
    values.serviceId,
    values.appointmentDate,
  )
  const services = servicesQuery.data ?? []
  const availableTimes = availableTimesQuery.data?.availableTimes ?? []
  const availableTimesMessage = getAvailableTimesMessage(
    values.serviceId,
    values.appointmentDate,
    availableTimesQuery.isFetching,
    availableTimes,
  )

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)

    if (nextOpen) {
      onResetMessages()
      return
    }

    setValues(initialFormValues)
    onFieldErrors({})
  }

  function updateField(field: keyof FormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
      ...(field === 'appointmentDate' || field === 'serviceId'
        ? { startTime: '' }
        : {}),
    }))
    onFieldErrors({ ...fieldErrors, [field]: undefined })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onResetMessages()

    try {
      const payload = buildPayload(values)
      onFieldErrors({})
      await onCreate(payload)
      setValues(initialFormValues)
      setOpen(false)
    } catch (submitError) {
      if (submitError instanceof z.ZodError) {
        onFieldErrors(getZodFieldErrors(submitError))
        return
      }

      onFieldErrors(getApiFieldErrors(submitError, appointmentFields))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">Novo agendamento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>
            Crie um horário manual para um cliente sem expor dados internos da
            empresa.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          {error ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manual-client-name">Cliente</Label>
              <Input
                id="manual-client-name"
                value={values.clientName}
                onChange={(event) => updateField('clientName', event.target.value)}
                disabled={isSubmitting}
                autoComplete="name"
              />
              {fieldErrors.clientName ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.clientName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-client-phone">Telefone</Label>
              <Input
                id="manual-client-phone"
                value={values.clientPhone}
                onChange={(event) =>
                  updateField('clientPhone', event.target.value)
                }
                disabled={isSubmitting}
                autoComplete="tel"
              />
              {fieldErrors.clientPhone ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.clientPhone}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-service">Serviço</Label>
            <select
              id="manual-service"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              value={values.serviceId}
              onChange={(event) => updateField('serviceId', event.target.value)}
              disabled={isSubmitting || servicesQuery.isPending}
            >
              <option value="">Selecione um serviço</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {renderServiceLabel(service)}
                </option>
              ))}
            </select>
            {servicesQuery.isError ? (
              <p className="text-sm text-destructive">
                {getServicesErrorMessage(servicesQuery.error)}
              </p>
            ) : null}
            {fieldErrors.serviceId ? (
              <p className="text-sm text-destructive">{fieldErrors.serviceId}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manual-date">Data</Label>
              <Input
                id="manual-date"
                type="date"
                min={today}
                value={values.appointmentDate}
                onChange={(event) =>
                  updateField('appointmentDate', event.target.value)
                }
                disabled={isSubmitting}
              />
              {fieldErrors.appointmentDate ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.appointmentDate}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-start-time">Horário disponível</Label>
              <select
                id="manual-start-time"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                value={values.startTime}
                onChange={(event) => updateField('startTime', event.target.value)}
                disabled={
                  isSubmitting ||
                  availableTimesQuery.isFetching ||
                  availableTimes.length === 0
                }
              >
                <option value="">Selecione um horário</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {formatAppointmentTime(time)}
                  </option>
                ))}
              </select>
              {availableTimesMessage ? (
                <p className="text-sm text-muted-foreground">
                  {availableTimesMessage}
                </p>
              ) : null}
              {availableTimesQuery.isError ? (
                <p className="text-sm text-destructive">
                  Não foi possível carregar os horários para esta data.
                </p>
              ) : null}
              {fieldErrors.startTime ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.startTime}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-notes">Observações</Label>
            <Textarea
              id="manual-notes"
              value={values.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              placeholder="Opcional"
            />
            {fieldErrors.notes ? (
              <p className="text-sm text-destructive">{fieldErrors.notes}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || availableTimes.length === 0}
            >
              {isSubmitting ? 'Criando...' : 'Criar agendamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

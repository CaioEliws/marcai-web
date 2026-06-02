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
import { createPublicAppointmentSchema } from '../schemas/publicBooking.schema'
import {
  getPublicAppointmentValidationMessage,
  normalizePhone,
} from './publicBookingUtils'
import type { PublicAppointmentFieldErrors } from './publicBookingUtils'

type PublicAppointmentFormProps = {
  appointmentDate: string
  apiFieldErrors: PublicAppointmentFieldErrors
  error: string | null
  isSubmitting: boolean
  onSubmit: (values: {
    clientName: string
    clientPhone: string
  }) => Promise<void>
  selectedServiceId: string
  selectedTime: string
}

export function PublicAppointmentForm({
  appointmentDate,
  apiFieldErrors,
  error,
  isSubmitting,
  onSubmit,
  selectedServiceId,
  selectedTime,
}: PublicAppointmentFormProps) {
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [fieldErrors, setFieldErrors] = useState<PublicAppointmentFieldErrors>(
    {},
  )
  const visibleFieldErrors = { ...apiFieldErrors, ...fieldErrors }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    const payload = {
      appointmentDate,
      clientName,
      clientPhone: normalizePhone(clientPhone),
      serviceId: selectedServiceId,
      startTime: selectedTime,
    }

    const parsedPayload = createPublicAppointmentSchema.safeParse(payload)

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors

      setFieldErrors({
        appointmentDate: errors.appointmentDate?.[0]
          ? getPublicAppointmentValidationMessage('appointmentDate')
          : undefined,
        clientName: errors.clientName?.[0]
          ? getPublicAppointmentValidationMessage('clientName')
          : undefined,
        clientPhone: errors.clientPhone?.[0]
          ? getPublicAppointmentValidationMessage('clientPhone')
          : undefined,
        serviceId: errors.serviceId?.[0]
          ? getPublicAppointmentValidationMessage('serviceId')
          : undefined,
        startTime: errors.startTime?.[0]
          ? getPublicAppointmentValidationMessage('startTime')
          : undefined,
      })
      return
    }

    await onSubmit({
      clientName: parsedPayload.data.clientName,
      clientPhone: parsedPayload.data.clientPhone,
    })
  }

  const selectionError =
    visibleFieldErrors.serviceId ||
    visibleFieldErrors.appointmentDate ||
    visibleFieldErrors.startTime

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus dados</CardTitle>
        <CardDescription>
          Informe nome e telefone para confirmar o agendamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {error ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {selectionError ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>{selectionError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nome</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(event) => {
                  setClientName(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    clientName: undefined,
                  }))
                }}
                autoComplete="name"
                maxLength={120}
                aria-invalid={Boolean(visibleFieldErrors.clientName)}
                aria-describedby={
                  visibleFieldErrors.clientName ? 'client-name-error' : undefined
                }
                disabled={isSubmitting}
              />
              {visibleFieldErrors.clientName ? (
                <p id="client-name-error" className="text-sm text-destructive">
                  {visibleFieldErrors.clientName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-phone">Telefone</Label>
              <Input
                id="client-phone"
                value={clientPhone}
                onChange={(event) => {
                  setClientPhone(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    clientPhone: undefined,
                  }))
                }}
                autoComplete="tel"
                inputMode="tel"
                maxLength={30}
                placeholder="11999999999"
                aria-invalid={Boolean(visibleFieldErrors.clientPhone)}
                aria-describedby={
                  visibleFieldErrors.clientPhone ? 'client-phone-error' : undefined
                }
                disabled={isSubmitting}
              />
              {visibleFieldErrors.clientPhone ? (
                <p id="client-phone-error" className="text-sm text-destructive">
                  {visibleFieldErrors.clientPhone}
                </p>
              ) : null}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

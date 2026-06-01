import { AlertCircle, CheckCircle2, UserX, XCircle } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { Appointment } from '../types/appointment.type'
import {
  type AppointmentAction,
  canManageAppointment,
  formatAppointmentDate,
  formatAppointmentTime,
  formatServicePrice,
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from './appointmentUtils'

type AppointmentCardProps = {
  appointment: Appointment
  onAction: (appointment: Appointment, action: AppointmentAction) => void
  pendingActionId: string | null
}

export function AppointmentCard({
  appointment,
  onAction,
  pendingActionId,
}: AppointmentCardProps) {
  const isPending = pendingActionId === appointment.id
  const canManage = canManageAppointment(appointment.status)
  const notes = appointment.notes?.trim()

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{appointment.clientName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {appointment.clientPhone}
            </p>
          </div>

          <Badge variant={getAppointmentStatusVariant(appointment.status)}>
            {getAppointmentStatusLabel(appointment.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-medium text-muted-foreground">Serviço</dt>
            <dd className="mt-1 font-medium">{appointment.serviceName}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Preço</dt>
            <dd className="mt-1">{formatServicePrice(appointment.servicePrice)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Duração</dt>
            <dd className="mt-1">
              {appointment.serviceDurationMinutes} minutos
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Data</dt>
            <dd className="mt-1">
              {formatAppointmentDate(appointment.appointmentDate)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Horário</dt>
            <dd className="mt-1">
              {formatAppointmentTime(appointment.startTime)} às{' '}
              {formatAppointmentTime(appointment.endTime)}
            </dd>
          </div>
        </dl>

        {notes ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium">Observações</p>
            <p className="mt-1 text-muted-foreground">{notes}</p>
          </div>
        ) : null}

        {canManage ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onAction(appointment, 'complete')}
              disabled={isPending}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Concluir
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAction(appointment, 'no-show')}
              disabled={isPending}
            >
              <UserX className="h-4 w-4" aria-hidden="true" />
              Marcar falta
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onAction(appointment, 'cancel')}
              disabled={isPending}
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cancelar
            </Button>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Este agendamento não possui ações disponíveis.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

import { AlertCircle, CheckCircle2, UserX, XCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { buttonVariants } from '@/shared/components/ui/button.variants'
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

const actionContent: Record<
  AppointmentAction,
  {
    buttonLabel: string
    confirmLabel: string
    description: (appointment: Appointment) => string
    icon: typeof CheckCircle2
    title: string
    variant: 'destructive' | 'outline'
  }
> = {
  cancel: {
    buttonLabel: 'Cancelar',
    confirmLabel: 'Cancelar agendamento',
    description: (appointment) =>
      `O agendamento de ${appointment.clientName} será cancelado.`,
    icon: XCircle,
    title: 'Cancelar agendamento?',
    variant: 'destructive',
  },
  complete: {
    buttonLabel: 'Concluir',
    confirmLabel: 'Concluir agendamento',
    description: (appointment) =>
      `O agendamento de ${appointment.clientName} será marcado como concluído.`,
    icon: CheckCircle2,
    title: 'Concluir agendamento?',
    variant: 'outline',
  },
  'no-show': {
    buttonLabel: 'Marcar falta',
    confirmLabel: 'Marcar falta',
    description: (appointment) =>
      `O agendamento de ${appointment.clientName} será marcado como falta.`,
    icon: UserX,
    title: 'Marcar falta?',
    variant: 'outline',
  },
}

function AppointmentActionButton({
  action,
  appointment,
  disabled,
  onAction,
}: {
  action: AppointmentAction
  appointment: Appointment
  disabled: boolean
  onAction: (appointment: Appointment, action: AppointmentAction) => void
}) {
  const content = actionContent[action]
  const Icon = content.icon

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={content.variant} disabled={disabled}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          {content.buttonLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {content.description(appointment)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>Voltar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: content.variant })}
            disabled={disabled}
            onClick={() => onAction(appointment, action)}
          >
            {content.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
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
            <AppointmentActionButton
              action="complete"
              appointment={appointment}
              disabled={isPending}
              onAction={onAction}
            />
            <AppointmentActionButton
              action="no-show"
              appointment={appointment}
              disabled={isPending}
              onAction={onAction}
            />
            <AppointmentActionButton
              action="cancel"
              appointment={appointment}
              disabled={isPending}
              onAction={onAction}
            />
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

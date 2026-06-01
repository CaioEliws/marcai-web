import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import type { Appointment } from '../types/appointment.type'
import { AppointmentCard } from './AppointmentCard'
import type { AppointmentAction } from './appointmentUtils'

type AppointmentsListProps = {
  appointments: Appointment[]
  emptyMessage: string
  errorMessage: string | null
  isError: boolean
  isLoading: boolean
  onAction: (appointment: Appointment, action: AppointmentAction) => void
  pendingActionId: string | null
}

export function AppointmentsList({
  appointments,
  emptyMessage,
  errorMessage,
  isError,
  isLoading,
  onAction,
  pendingActionId,
}: AppointmentsListProps) {
  if (isLoading) {
    return (
      <Alert>
        <AlertDescription>Carregando agendamentos...</AlertDescription>
      </Alert>
    )
  }

  if (isError) {
    return (
      <Alert>
        <AlertDescription>
          {errorMessage ?? 'Não foi possível carregar os agendamentos.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (appointments.length === 0) {
    return (
      <Alert>
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onAction={onAction}
          pendingActionId={pendingActionId}
        />
      ))}
    </div>
  )
}

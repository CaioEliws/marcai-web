import { useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { ApiContractError, ApiError } from '@/shared/api/httpClient'
import { AppointmentDateFilter } from '@/features/appointments/components/AppointmentDateFilter'
import { AppointmentsList } from '@/features/appointments/components/AppointmentsList'
import type { Appointment } from '@/features/appointments/types/appointment.type'
import type { AppointmentAction } from '@/features/appointments/components/appointmentUtils'
import {
  useAppointmentsByDateQuery,
  useAppointmentsQuery,
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
  useNoShowAppointmentMutation,
} from '@/features/appointments/hooks/useAppointments'

function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApiContractError) {
    return 'A API retornou uma resposta inesperada.'
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Sua sessão expirou. Faça login novamente.'
    }

    if (error.status === 403) {
      return 'Você não tem permissão para realizar esta ação.'
    }

    if (error.status === 404) {
      return 'Agendamento não encontrado.'
    }

    if (error.status === 409) {
      return 'Este agendamento não pode ser alterado no estado atual.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
    }
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

function getConfirmationMessage(
  appointment: Appointment,
  action: AppointmentAction,
) {
  const messages: Record<AppointmentAction, string> = {
    cancel: `Cancelar o agendamento de ${appointment.clientName}?`,
    complete: `Concluir o agendamento de ${appointment.clientName}?`,
    'no-show': `Marcar falta para o agendamento de ${appointment.clientName}?`,
  }

  return messages[action]
}

export function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  const appointmentsQuery = useAppointmentsQuery()
  const appointmentsByDateQuery = useAppointmentsByDateQuery(selectedDate)
  const activeQuery = selectedDate ? appointmentsByDateQuery : appointmentsQuery

  const cancelMutation = useCancelAppointmentMutation()
  const completeMutation = useCompleteAppointmentMutation()
  const noShowMutation = useNoShowAppointmentMutation()

  async function handleAction(
    appointment: Appointment,
    action: AppointmentAction,
  ) {
    const confirmed = window.confirm(getConfirmationMessage(appointment, action))

    if (!confirmed) {
      return
    }

    setActionError(null)
    setSuccessMessage(null)
    setPendingActionId(appointment.id)

    try {
      if (action === 'cancel') {
        await cancelMutation.mutateAsync(appointment.id)
        setSuccessMessage('Agendamento cancelado com sucesso.')
      }

      if (action === 'complete') {
        await completeMutation.mutateAsync(appointment.id)
        setSuccessMessage('Agendamento concluído com sucesso.')
      }

      if (action === 'no-show') {
        await noShowMutation.mutateAsync(appointment.id)
        setSuccessMessage('Falta registrada com sucesso.')
      }
    } catch (error) {
      setActionError(getSafeErrorMessage(error))
    } finally {
      setPendingActionId(null)
    }
  }

  const emptyMessage = selectedDate
    ? 'Nenhum agendamento encontrado para a data selecionada.'
    : 'Nenhum agendamento encontrado.'

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Agendamentos</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Acompanhe e gerencie os horários agendados pelos clientes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre por uma data específica ou visualize todos os agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentDateFilter
            date={selectedDate}
            onChange={setSelectedDate}
            onClear={() => setSelectedDate('')}
          />
        </CardContent>
      </Card>

      {actionError ? (
        <Alert>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <AppointmentsList
        appointments={activeQuery.data ?? []}
        emptyMessage={emptyMessage}
        errorMessage={getSafeErrorMessage(activeQuery.error)}
        isError={activeQuery.isError}
        isLoading={activeQuery.isLoading}
        onAction={handleAction}
        pendingActionId={pendingActionId}
      />
    </section>
  )
}

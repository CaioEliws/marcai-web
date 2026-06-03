import { useState } from 'react'
import {
  ApiContractError,
  ApiError,
  getApiFieldErrors,
} from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { BusinessHourForm } from '@/features/availability/components/BusinessHourForm'
import { BusinessHoursList } from '@/features/availability/components/BusinessHoursList'
import type { BusinessHourFormValues } from '@/features/availability/components/businessHourUtils'
import type { BusinessHourFormFieldErrors } from '@/features/availability/components/businessHourUtils'
import {
  useBusinessHoursQuery,
  useCreateBusinessHourMutation,
  useDeleteBusinessHourMutation,
  useUpdateBusinessHourMutation,
} from '@/features/availability/hooks/useBusinessHours'
import type { BusinessHour } from '@/features/availability/types/businessHour.type'

function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Revise os dados informados e tente novamente.'
    }

    if (error.status === 401) {
      return 'Sua sessao expirou. Entre novamente para continuar.'
    }

    if (error.status === 403) {
      return 'Voce nao tem permissao para executar esta acao.'
    }

    if (error.status === 404) {
      return 'Horario nao encontrado ou indisponivel.'
    }

    if (error.status === 409) {
      return 'Ja existe uma configuracao para este dia da semana.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.'
    }
  }

  if (error instanceof ApiContractError) {
    return 'A API retornou uma resposta inesperada. Atualize a pagina e tente novamente.'
  }

  return 'Nao foi possivel concluir a acao. Tente novamente em instantes.'
}

function sortBusinessHours(businessHours: BusinessHour[]) {
  return [...businessHours].sort((first, second) => {
    return first.dayOfWeek - second.dayOfWeek
  })
}

export function AvailabilityPage() {
  const businessHoursQuery = useBusinessHoursQuery()
  const createBusinessHourMutation = useCreateBusinessHourMutation()
  const updateBusinessHourMutation = useUpdateBusinessHourMutation()
  const deleteBusinessHourMutation = useDeleteBusinessHourMutation()
  const [editingBusinessHour, setEditingBusinessHour] =
    useState<BusinessHour | null>(null)
  const [formResetSignal, setFormResetSignal] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [formFieldErrors, setFormFieldErrors] =
    useState<BusinessHourFormFieldErrors>({})
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingBusinessHourId, setPendingBusinessHourId] = useState<
    string | null
  >(null)

  function resetForm() {
    setEditingBusinessHour(null)
    setFormError(null)
    setFormFieldErrors({})
    setFormResetSignal((currentValue) => currentValue + 1)
  }

  async function handleSubmitBusinessHour(values: BusinessHourFormValues) {
    setFormError(null)
    setFormFieldErrors({})
    setSuccessMessage(null)

    try {
      if (editingBusinessHour) {
        await updateBusinessHourMutation.mutateAsync({
          id: editingBusinessHour.id,
          payload: {
            ...values,
            active: editingBusinessHour.active,
          },
        })
        setSuccessMessage('Horario atualizado com sucesso.')
      } else {
        await createBusinessHourMutation.mutateAsync(values)
        setSuccessMessage('Horario adicionado com sucesso.')
      }

      resetForm()
    } catch (error) {
      setFormFieldErrors(
        getApiFieldErrors(error, [
          'closingTime',
          'dayOfWeek',
          'openingTime',
        ] as const),
      )
      setFormError(getSafeErrorMessage(error))
    }
  }

  async function handleToggleBusinessHour(businessHour: BusinessHour) {
    setActionError(null)
    setSuccessMessage(null)
    setPendingBusinessHourId(businessHour.id)

    try {
      await updateBusinessHourMutation.mutateAsync({
        id: businessHour.id,
        payload: {
          active: !businessHour.active,
          closingTime: businessHour.closingTime,
          dayOfWeek: businessHour.dayOfWeek,
          openingTime: businessHour.openingTime,
        },
      })
      setSuccessMessage(
        businessHour.active
          ? 'Horario desativado com sucesso.'
          : 'Horario ativado com sucesso.',
      )
    } catch (error) {
      setActionError(getSafeErrorMessage(error))
    } finally {
      setPendingBusinessHourId(null)
    }
  }

  async function handleDeleteBusinessHour(businessHour: BusinessHour) {
    setActionError(null)
    setSuccessMessage(null)
    setPendingBusinessHourId(businessHour.id)

    try {
      await deleteBusinessHourMutation.mutateAsync(businessHour.id)

      if (editingBusinessHour?.id === businessHour.id) {
        resetForm()
      }

      setSuccessMessage('Horario removido com sucesso.')
    } catch (error) {
      setActionError(getSafeErrorMessage(error))
    } finally {
      setPendingBusinessHourId(null)
    }
  }

  function handleEditBusinessHour(businessHour: BusinessHour) {
    setEditingBusinessHour(businessHour)
    setFormError(null)
    setFormFieldErrors({})
    setActionError(null)
    setSuccessMessage(null)
    setFormResetSignal((currentValue) => currentValue + 1)
  }

  const businessHours = sortBusinessHours(businessHoursQuery.data ?? [])
  const blockedDayOfWeeks = businessHours.map(
    (businessHour) => businessHour.dayOfWeek,
  )
  const isSubmitting =
    createBusinessHourMutation.isPending || updateBusinessHourMutation.isPending

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Horarios de funcionamento
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Defina os dias e horarios em que clientes poderao encontrar
          disponibilidade no link publico de agendamento.
        </p>
      </div>

      {successMessage ? (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <BusinessHourForm
        key={`new-${formResetSignal}`}
        apiFieldErrors={formFieldErrors}
        blockedDayOfWeeks={blockedDayOfWeeks}
        error={formError}
        initialBusinessHour={null}
        isSubmitting={isSubmitting}
        onCancelEdit={resetForm}
        onSubmit={handleSubmitBusinessHour}
      />

      <Dialog
        open={editingBusinessHour !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar horário</DialogTitle>
            <DialogDescription>
              Atualize o horário de funcionamento selecionado.
            </DialogDescription>
          </DialogHeader>

          {editingBusinessHour ? (
            <BusinessHourForm
              key={`${editingBusinessHour.id}-${formResetSignal}`}
              apiFieldErrors={formFieldErrors}
              blockedDayOfWeeks={blockedDayOfWeeks}
              error={formError}
              hideHeader
              idPrefix="edit-business-hour"
              initialBusinessHour={editingBusinessHour}
              isSubmitting={isSubmitting}
              onCancelEdit={resetForm}
              onSubmit={handleSubmitBusinessHour}
              presentation="plain"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <BusinessHoursList
        actionError={actionError}
        businessHours={businessHours}
        isError={businessHoursQuery.isError}
        isLoading={businessHoursQuery.isPending}
        onDelete={(businessHour) => void handleDeleteBusinessHour(businessHour)}
        onEdit={handleEditBusinessHour}
        onToggleStatus={(businessHour) =>
          void handleToggleBusinessHour(businessHour)
        }
        pendingBusinessHourId={pendingBusinessHourId}
      />
    </section>
  )
}

import { useState } from 'react'
import {
  ApiContractError,
  ApiError,
  getApiFieldErrors,
} from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { ServiceForm } from '@/features/services/components/ServiceForm'
import { ServicesList } from '@/features/services/components/ServicesList'
import type { ServiceStatusFilterValue } from '@/features/services/components/ServiceStatusFilter'
import type { ServiceFormValues } from '@/features/services/components/serviceFormUtils'
import type { ServiceFormFieldErrors } from '@/features/services/components/serviceFormUtils'
import {
  useCreateServiceMutation,
  useDisableServiceMutation,
  useEnableServiceMutation,
  useServicesQuery,
  useUpdateServiceMutation,
} from '@/features/services/hooks/useServices'
import type { Service } from '@/features/services/types/service.type'

function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Revise os dados informados e tente novamente.'
    }

    if (error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.'
    }

    if (error.status === 403) {
      return 'Você não tem permissão para executar esta ação.'
    }

    if (error.status === 404) {
      return 'Serviço não encontrado ou indisponível.'
    }

    if (error.status === 409) {
      return 'Não foi possível concluir a ação por conflito com os dados atuais.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.'
    }
  }

  if (error instanceof ApiContractError) {
    return 'A API retornou uma resposta inesperada. Atualize a página e tente novamente.'
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.'
}

function filterServices(
  services: Service[],
  filter: ServiceStatusFilterValue,
) {
  if (filter === 'active') {
    return services.filter((service) => service.active)
  }

  if (filter === 'inactive') {
    return services.filter((service) => !service.active)
  }

  return services
}

export function ServicesPage() {
  const servicesQuery = useServicesQuery()
  const createServiceMutation = useCreateServiceMutation()
  const updateServiceMutation = useUpdateServiceMutation()
  const disableServiceMutation = useDisableServiceMutation()
  const enableServiceMutation = useEnableServiceMutation()
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [statusFilter, setStatusFilter] =
    useState<ServiceStatusFilterValue>('active')
  const [formResetSignal, setFormResetSignal] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [formFieldErrors, setFormFieldErrors] = useState<ServiceFormFieldErrors>(
    {},
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null)

  function resetForm() {
    setEditingService(null)
    setFormError(null)
    setFormFieldErrors({})
    setFormResetSignal((currentValue) => currentValue + 1)
  }

  async function handleSubmitService(values: ServiceFormValues) {
    setFormError(null)
    setFormFieldErrors({})
    setSuccessMessage(null)

    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          payload: {
            ...values,
            active: editingService.active,
          },
        })
        setSuccessMessage('Serviço atualizado com sucesso.')
      } else {
        await createServiceMutation.mutateAsync(values)
        setSuccessMessage('Serviço criado com sucesso.')
      }

      resetForm()
    } catch (error) {
      setFormFieldErrors(
        getApiFieldErrors(error, [
          'description',
          'durationMinutes',
          'name',
          'price',
        ] as const),
      )
      setFormError(getSafeErrorMessage(error))
    }
  }

  async function handleToggleService(service: Service) {
    setActionError(null)
    setSuccessMessage(null)
    setPendingServiceId(service.id)

    try {
      if (service.active) {
        await disableServiceMutation.mutateAsync(service.id)
        setSuccessMessage('Serviço desativado com sucesso.')
      } else {
        await enableServiceMutation.mutateAsync(service.id)
        setSuccessMessage('Serviço ativado com sucesso.')
      }
    } catch (error) {
      setActionError(getSafeErrorMessage(error))
    } finally {
      setPendingServiceId(null)
    }
  }

  function handleEditService(service: Service) {
    setEditingService(service)
    setFormError(null)
    setFormFieldErrors({})
    setActionError(null)
    setSuccessMessage(null)
    setFormResetSignal((currentValue) => currentValue + 1)
  }

  const services = servicesQuery.data ?? []
  const filteredServices = filterServices(services, statusFilter)
  const isSubmitting =
    createServiceMutation.isPending || updateServiceMutation.isPending

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Serviços</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Configure os serviços disponíveis para agendamento e mantenha a lista
          pública sempre atualizada.
        </p>
      </div>

      {successMessage ? (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <ServiceForm
        key={`${editingService?.id ?? 'new'}-${formResetSignal}`}
        apiFieldErrors={formFieldErrors}
        error={formError}
        initialService={editingService}
        isSubmitting={isSubmitting}
        onCancelEdit={resetForm}
        onSubmit={handleSubmitService}
      />

      <ServicesList
        actionError={actionError}
        filter={statusFilter}
        hasLoadedServices={services.length > 0}
        isError={servicesQuery.isError}
        isLoading={servicesQuery.isPending}
        onEdit={handleEditService}
        onFilterChange={setStatusFilter}
        onToggleStatus={(service) => void handleToggleService(service)}
        pendingServiceId={pendingServiceId}
        services={filteredServices}
      />
    </section>
  )
}

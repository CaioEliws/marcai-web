import { lazy, Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ApiContractError,
  ApiError,
  getApiFieldErrors,
} from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { CreateAppointmentDialog } from '@/features/appointments/components/CreateAppointmentDialog'
import type { AppointmentFieldErrors } from '@/features/appointments/components/CreateAppointmentDialog'
import {
  useAppointmentsByDateQuery,
  useAppointmentsQuery,
  useCreateAppointmentMutation,
} from '@/features/appointments/hooks/useAppointments'
import type {
  Appointment,
  ManualAppointmentPayload,
} from '@/features/appointments/types/appointment.type'
import type { BusinessHour } from '@/features/availability/types/businessHour.type'
import { useBusinessHoursQuery } from '@/features/availability/hooks/useBusinessHours'
import { useSessionQuery } from '@/features/auth/hooks/useAuth'
import { useCurrentBusinessQuery } from '@/features/business/hooks/useBusiness'
import { CustomersBreakdownCard } from '@/features/dashboard/components/CustomersBreakdownCard'
import { DashboardBusinessCard } from '@/features/dashboard/components/DashboardBusinessCard'
import { DashboardKpiGrid } from '@/features/dashboard/components/DashboardKpiGrid'
import { DashboardPeriodFilter } from '@/features/dashboard/components/DashboardPeriodFilter'
import { DashboardQuickActions } from '@/features/dashboard/components/DashboardQuickActions'
import { DashboardSetupAlerts } from '@/features/dashboard/components/DashboardSetupAlerts'
import { EmptyDashboardState } from '@/features/dashboard/components/EmptyDashboardState'
import { AppointmentsStatusOverview } from '@/features/dashboard/components/AppointmentsStatusOverview'
import { TodayAppointmentsPanel } from '@/features/dashboard/components/TodayAppointmentsPanel'
import { TopServicesCard } from '@/features/dashboard/components/TopServicesCard'
import { buildDashboardAnalysis } from '@/features/dashboard/utils/dashboardMetrics'
import {
  formatLocalDateForApi,
  getDashboardDateRange,
  parseDashboardPeriod,
  type DashboardPeriodKey,
} from '@/features/dashboard/utils/dashboardDateRanges'
import { useServicesQuery } from '@/features/services/hooks/useServices'
import type { Service } from '@/features/services/types/service.type'

const emptyAppointments: Appointment[] = []
const emptyBusinessHours: BusinessHour[] = []
const emptyServices: Service[] = []

const RevenueOverTimeChart = lazy(() =>
  import('@/features/dashboard/components/RevenueOverTimeChart').then(
    (module) => ({ default: module.RevenueOverTimeChart }),
  ),
)

const RevenueByServiceChart = lazy(() =>
  import('@/features/dashboard/components/RevenueByServiceChart').then(
    (module) => ({ default: module.RevenueByServiceChart }),
  ),
)

const OccupancyByWeekdayChart = lazy(() =>
  import('@/features/dashboard/components/OccupancyByWeekdayChart').then(
    (module) => ({ default: module.OccupancyByWeekdayChart }),
  ),
)

function ChartsLoadingState() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Carregando análise...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid h-72 min-h-72 w-full place-items-center">
          <p className="text-sm text-muted-foreground">
            Preparando gráficos do período.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

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

    if (error.status === 409) {
      return 'Este horário não está mais disponível.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
    }
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const period = parseDashboardPeriod(searchParams.get('period'))
  const today = formatLocalDateForApi(new Date())
  const dateRange = useMemo(() => getDashboardDateRange(period), [period])
  const businessQuery = useCurrentBusinessQuery()
  const servicesQuery = useServicesQuery()
  const businessHoursQuery = useBusinessHoursQuery()
  const sessionQuery = useSessionQuery()
  const appointmentsQuery = useAppointmentsQuery()
  const todayAppointmentsQuery = useAppointmentsByDateQuery(today)
  const createMutation = useCreateAppointmentMutation()
  const [createError, setCreateError] = useState<string | null>(null)
  const [createFieldErrors, setCreateFieldErrors] =
    useState<AppointmentFieldErrors>({})

  const services = servicesQuery.data ?? emptyServices
  const currentRole = sessionQuery.data?.role ?? 'PROFESSIONAL'
  const canViewOwnerAnalysis = currentRole === 'ADMIN' || currentRole === 'OWNER'
  const businessHours = businessHoursQuery.data ?? emptyBusinessHours
  const allAppointments = appointmentsQuery.data ?? emptyAppointments
  const todayAppointments = [...(todayAppointmentsQuery.data ?? [])].sort(
    (firstAppointment, secondAppointment) =>
      firstAppointment.startTime.localeCompare(secondAppointment.startTime),
  )
  const analysis = useMemo(
    () =>
      buildDashboardAnalysis({
        allAppointments,
        businessHours,
        range: dateRange,
        services,
      }),
    [allAppointments, businessHours, dateRange, services],
  )
  const hasError =
    businessQuery.isError ||
    servicesQuery.isError ||
    businessHoursQuery.isError ||
    appointmentsQuery.isError ||
    todayAppointmentsQuery.isError
  const isAnalysisLoading =
    appointmentsQuery.isLoading ||
    servicesQuery.isLoading ||
    businessHoursQuery.isLoading
  const hasNoActiveServices =
    services.length > 0 && services.every((service) => !service.active)
  const hasNoActiveBusinessHours =
    businessHours.length > 0 && businessHours.every((hour) => !hour.active)

  function handlePeriodChange(nextPeriod: DashboardPeriodKey) {
    setSearchParams(nextPeriod === 'today' ? {} : { period: nextPeriod })
  }

  async function handleCreateAppointment(payload: ManualAppointmentPayload) {
    setCreateError(null)
    setCreateFieldErrors({})

    try {
      await createMutation.mutateAsync(payload)
    } catch (error) {
      setCreateFieldErrors(
        getApiFieldErrors(error, [
          'appointmentDate',
          'clientName',
          'clientPhone',
          'notes',
          'serviceId',
          'startTime',
        ] as const),
      )
      setCreateError(getSafeErrorMessage(error))
      throw error
    }
  }

  function resetCreateMessages() {
    setCreateError(null)
    setCreateFieldErrors({})
  }

  const createAppointmentAction = (
    <CreateAppointmentDialog
      error={createError}
      fieldErrors={createFieldErrors}
      isSubmitting={createMutation.isPending}
      onCreate={handleCreateAppointment}
      onFieldErrors={setCreateFieldErrors}
      onResetMessages={resetCreateMessages}
    />
  )

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Marcaí
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Gestão de agenda, receita, ocupação e serviços para decisões reais
            do negócio.
          </p>
        </div>
        <DashboardPeriodFilter period={period} onChange={handlePeriodChange} />
      </div>

      {hasError ? (
        <Alert>
          <AlertDescription>
            Alguns dados não puderam ser carregados agora. As seções disponíveis
            continuam visíveis.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-6" aria-labelledby="today-operation-title">
        <div>
          <h2 id="today-operation-title" className="text-xl font-semibold">
            Operação de hoje
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta área fica sempre focada no dia atual, independente do filtro de
            análise.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <TodayAppointmentsPanel
            appointments={todayAppointments}
            isLoading={todayAppointmentsQuery.isLoading}
            todayDate={today}
          />
          <div className="grid gap-6">
            <DashboardBusinessCard
              business={businessQuery.data}
              isLoading={businessQuery.isLoading}
            />
            <DashboardQuickActions
              createAppointmentAction={createAppointmentAction}
              role={currentRole}
            />
          </div>
        </div>
      </section>

      {canViewOwnerAnalysis ? (
      <section className="grid gap-6" aria-labelledby="period-analysis-title">
        <div>
          <h2 id="period-analysis-title" className="text-xl font-semibold">
            Análise do período
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {dateRange.label}: {dateRange.start} até {dateRange.end}.
          </p>
        </div>

        <DashboardSetupAlerts
          business={businessQuery.data}
          businessHours={businessHours}
          services={services}
        />

        {hasNoActiveServices ? (
          <EmptyDashboardState
            title="Nenhum serviço ativo encontrado."
            description="Ative pelo menos um serviço para receber agendamentos."
            actionLabel="Gerenciar serviços"
            actionTo="/dashboard/services"
          />
        ) : null}

        {hasNoActiveBusinessHours ? (
          <EmptyDashboardState
            title="Nenhum horário ativo configurado."
            description="Configure horários para abrir disponibilidade pública."
            actionLabel="Configurar horários"
            actionTo="/dashboard/availability"
          />
        ) : null}

        {analysis.hasNoPricedServices ? (
          <EmptyDashboardState
            title="Cadastre preços nos serviços para acompanhar receitas."
            description="Sem preços, o dashboard consegue contar agendamentos, mas não calcula receita com qualidade."
            actionLabel="Gerenciar serviços"
            actionTo="/dashboard/services"
          />
        ) : null}

        {analysis.currentAppointments.length === 0 && !isAnalysisLoading ? (
          <EmptyDashboardState
            title="Ainda não há agendamentos neste período."
            description="Crie um agendamento manual ou compartilhe seu link público para começar a medir o período."
            actionLabel="Link público"
            actionTo="/dashboard/public-link"
          />
        ) : null}

        <DashboardKpiGrid
          isLoading={isAnalysisLoading}
          metrics={analysis.kpis}
        />

        <Suspense
          fallback={
            <div className="grid min-w-0 gap-6 xl:grid-cols-2">
              <ChartsLoadingState />
              <ChartsLoadingState />
            </div>
          }
        >
          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <RevenueOverTimeChart
              data={analysis.revenueOverTime}
              periodLabel={dateRange.label}
            />
            <RevenueByServiceChart data={analysis.revenueByService} />
            <OccupancyByWeekdayChart data={analysis.occupancyByWeekday} />
            <AppointmentsStatusOverview data={analysis.statusOverview} />
          </div>
        </Suspense>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <TopServicesCard
            byAppointments={analysis.topServicesByAppointments}
            byRevenue={analysis.topServicesByRevenue}
          />
          <CustomersBreakdownCard metrics={analysis.metrics} />
        </div>
      </section>
      ) : (
        <Alert>
          <AlertDescription>
            Seu acesso profissional está focado na agenda e no perfil. Métricas
            financeiras e configurações da empresa ficam disponíveis para o dono.
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}

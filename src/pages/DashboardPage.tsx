import { lazy, Suspense } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { DashboardBusinessCard } from '@/features/dashboard/components/DashboardBusinessCard'
import { DashboardQuickActions } from '@/features/dashboard/components/DashboardQuickActions'
import { DashboardRevenueCards } from '@/features/dashboard/components/DashboardRevenueCards'
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards'
import { TodayAppointments } from '@/features/dashboard/components/TodayAppointments'
import { TopServicesCard } from '@/features/dashboard/components/TopServicesCard'
import {
  buildServiceRevenueData,
  buildStatusChartData,
  calculateDashboardMetrics,
  getTopServices,
} from '@/features/dashboard/components/dashboardMetrics'
import { formatLocalDateForApi } from '@/features/dashboard/components/dashboardUtils'
import { useAppointmentsByDateQuery } from '@/features/appointments/hooks/useAppointments'
import { useBusinessHoursQuery } from '@/features/availability/hooks/useBusinessHours'
import { useCurrentBusinessQuery } from '@/features/business/hooks/useBusiness'
import { useServicesQuery } from '@/features/services/hooks/useServices'

const AppointmentsStatusChart = lazy(() =>
  import('@/features/dashboard/components/AppointmentsStatusChart').then(
    (module) => ({ default: module.AppointmentsStatusChart }),
  ),
)

const RevenueByServiceChart = lazy(() =>
  import('@/features/dashboard/components/RevenueByServiceChart').then(
    (module) => ({ default: module.RevenueByServiceChart }),
  ),
)

function ChartsLoadingState() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Gráficos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid h-64 min-h-64 w-full place-items-center">
          <p className="text-sm text-muted-foreground">
            Carregando gráficos...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const today = formatLocalDateForApi(new Date())
  const businessQuery = useCurrentBusinessQuery()
  const servicesQuery = useServicesQuery()
  const businessHoursQuery = useBusinessHoursQuery()
  const todayAppointmentsQuery = useAppointmentsByDateQuery(today)

  const services = servicesQuery.data ?? []
  const businessHours = businessHoursQuery.data ?? []
  const todayAppointments = [...(todayAppointmentsQuery.data ?? [])].sort(
    (firstAppointment, secondAppointment) =>
      firstAppointment.startTime.localeCompare(secondAppointment.startTime),
  )

  const activeServices = services.filter((service) => service.active).length
  const inactiveServices = services.filter((service) => !service.active).length
  const activeBusinessHours = businessHours.filter((hour) => hour.active).length
  const dashboardMetrics = calculateDashboardMetrics(todayAppointments)
  const statusChartData = buildStatusChartData(todayAppointments)
  const serviceRevenueData = buildServiceRevenueData(todayAppointments)
  const topServices = getTopServices(serviceRevenueData)

  const hasError =
    businessQuery.isError ||
    servicesQuery.isError ||
    businessHoursQuery.isError ||
    todayAppointmentsQuery.isError

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Visão geral da sua operação para acompanhar agenda, serviços e
          disponibilidade.
        </p>
      </div>

      {hasError ? (
        <Alert>
          <AlertDescription>
            Alguns dados não puderam ser carregados agora. Tente novamente em
            instantes.
          </AlertDescription>
        </Alert>
      ) : null}

      <DashboardBusinessCard
        business={businessQuery.data}
        isLoading={businessQuery.isLoading}
      />

      <DashboardSummaryCards
        activeBusinessHours={activeBusinessHours}
        activeServices={activeServices}
        inactiveServices={inactiveServices}
        todayAppointments={todayAppointments.length}
      />

      <DashboardRevenueCards metrics={dashboardMetrics} />

      {dashboardMetrics.hasNoPricedAppointments ? (
        <Alert>
          <AlertDescription>
            Cadastre preços nos serviços para acompanhar receitas.
          </AlertDescription>
        </Alert>
      ) : null}

      <Suspense
        fallback={
          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <ChartsLoadingState />
            <ChartsLoadingState />
          </div>
        }
      >
        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <AppointmentsStatusChart data={statusChartData} />
          <RevenueByServiceChart data={serviceRevenueData} />
        </div>
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <TodayAppointments
          appointments={todayAppointments}
          isLoading={todayAppointmentsQuery.isLoading}
          todayDate={today}
        />
        <div className="grid gap-6">
          <TopServicesCard services={topServices} />
          <DashboardQuickActions />
        </div>
      </div>
    </section>
  )
}

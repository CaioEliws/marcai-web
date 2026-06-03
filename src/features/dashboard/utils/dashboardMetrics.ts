import type {
  Appointment,
  AppointmentStatus,
} from '@/features/appointments/types/appointment.type'
import type { BusinessHour } from '@/features/availability/types/businessHour.type'
import type { Service } from '@/features/services/types/service.type'
import {
  getDatesInRange,
  isDateInRange,
  type DashboardDateRange,
  type DashboardPeriodKey,
} from './dashboardDateRanges'
import {
  formatCurrency,
  formatInteger,
  formatPercent,
  getAppointmentStatusLabel,
  normalizePhoneForAnalytics,
} from './dashboardFormatters'

const activeAppointmentStatuses = new Set<AppointmentStatus>([
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
])

const predictedRevenueStatuses = new Set<AppointmentStatus>([
  'SCHEDULED',
  'CONFIRMED',
])

const lostRevenueStatuses = new Set<AppointmentStatus>(['CANCELED', 'NO_SHOW'])

const statusOrder: AppointmentStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELED',
  'NO_SHOW',
]

const weekdayLabels = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
]

export type KpiTone = 'good' | 'neutral' | 'bad'

export type KpiComparison = {
  helper: string
  tone: KpiTone
  value: number | null
}

export type PeriodMetrics = {
  appointmentsTotal: number
  averageTicket: number | null
  bookedMinutes: number
  customersNew: number
  customersRecurring: number
  lostRevenue: number
  occupancyRate: number | null
  predictedRevenue: number
  realizedRevenue: number
}

export type DashboardKpi = {
  comparison: KpiComparison
  helper: string
  label: string
  rawValue: number | null
  value: string
}

export type RevenueOverTimeItem = {
  label: string
  revenue: number
}

export type RevenueByServiceItem = {
  appointments: number
  name: string
  revenue: number
}

export type StatusOverviewItem = {
  label: string
  status: AppointmentStatus
  value: number
}

export type OccupancyByWeekdayItem = {
  availableMinutes: number
  bookedMinutes: number
  label: string
  occupancyRate: number
}

export type TopServiceItem = {
  appointments: number
  name: string
  revenue: number
}

export type DashboardAnalysis = {
  currentAppointments: Appointment[]
  hasNoPricedServices: boolean
  kpis: DashboardKpi[]
  metrics: PeriodMetrics
  occupancyByWeekday: OccupancyByWeekdayItem[]
  previousMetrics: PeriodMetrics
  revenueByService: RevenueByServiceItem[]
  revenueOverTime: RevenueOverTimeItem[]
  statusOverview: StatusOverviewItem[]
  topServicesByAppointments: TopServiceItem[]
  topServicesByRevenue: TopServiceItem[]
}

function getLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)

  if (
    hours === undefined ||
    minutes === undefined ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return 0
  }

  return hours * 60 + minutes
}

function getAppointmentPrice(appointment: Appointment) {
  return Math.max(0, appointment.servicePrice ?? 0)
}

function getBusinessHourDuration(hour: BusinessHour) {
  if (!hour.active) {
    return 0
  }

  return Math.max(0, timeToMinutes(hour.closingTime) - timeToMinutes(hour.openingTime))
}

function getClientKey(appointment: Appointment) {
  return appointment.clientId || normalizePhoneForAnalytics(appointment.clientPhone)
}

function filterAppointmentsByRange(
  appointments: Appointment[],
  start: string,
  end: string,
) {
  return appointments.filter((appointment) =>
    isDateInRange(appointment.appointmentDate, start, end),
  )
}

function calculateAvailableMinutes(
  dates: string[],
  businessHours: BusinessHour[],
) {
  let total = 0

  for (const date of dates) {
    const dayOfWeek = getLocalDate(date).getDay()

    for (const hour of businessHours) {
      if (hour.dayOfWeek === dayOfWeek) {
        total += getBusinessHourDuration(hour)
      }
    }
  }

  return total
}

function calculateCustomerMetrics(
  allAppointments: Appointment[],
  periodAppointments: Appointment[],
  rangeStart: string,
) {
  const firstKnownAppointmentByClient = new Map<string, string>()
  const periodClients = new Set<string>()

  for (const appointment of allAppointments) {
    const clientKey = getClientKey(appointment)
    const currentFirstDate = firstKnownAppointmentByClient.get(clientKey)

    if (!currentFirstDate || appointment.appointmentDate < currentFirstDate) {
      firstKnownAppointmentByClient.set(clientKey, appointment.appointmentDate)
    }
  }

  for (const appointment of periodAppointments) {
    periodClients.add(getClientKey(appointment))
  }

  let customersNew = 0
  let customersRecurring = 0

  for (const clientKey of periodClients) {
    const firstKnownDate = firstKnownAppointmentByClient.get(clientKey)

    if (!firstKnownDate || firstKnownDate >= rangeStart) {
      customersNew += 1
    } else {
      customersRecurring += 1
    }
  }

  return { customersNew, customersRecurring }
}

export function calculatePeriodMetrics({
  allAppointments,
  appointments,
  businessHours,
  end,
  start,
}: {
  allAppointments: Appointment[]
  appointments: Appointment[]
  businessHours: BusinessHour[]
  end: string
  start: string
}): PeriodMetrics {
  let bookedMinutes = 0
  let completedAppointments = 0
  let lostRevenue = 0
  let predictedRevenue = 0
  let realizedRevenue = 0

  for (const appointment of appointments) {
    const price = getAppointmentPrice(appointment)

    if (predictedRevenueStatuses.has(appointment.status)) {
      predictedRevenue += price
    }

    if (appointment.status === 'COMPLETED') {
      completedAppointments += 1
      realizedRevenue += price
    }

    if (lostRevenueStatuses.has(appointment.status)) {
      lostRevenue += price
    }

    if (activeAppointmentStatuses.has(appointment.status)) {
      bookedMinutes += Math.max(0, appointment.serviceDurationMinutes)
    }
  }

  const availableMinutes = calculateAvailableMinutes(
    getDatesInRange(start, end),
    businessHours,
  )
  const customers = calculateCustomerMetrics(allAppointments, appointments, start)

  return {
    appointmentsTotal: appointments.length,
    averageTicket:
      completedAppointments > 0 ? realizedRevenue / completedAppointments : null,
    bookedMinutes,
    customersNew: customers.customersNew,
    customersRecurring: customers.customersRecurring,
    lostRevenue,
    occupancyRate:
      availableMinutes > 0 ? (bookedMinutes / availableMinutes) * 100 : null,
    predictedRevenue,
    realizedRevenue,
  }
}

function getComparison(
  currentValue: number | null,
  previousValue: number | null,
  positiveDirection: 'up' | 'down' = 'up',
): KpiComparison {
  if (currentValue === null || previousValue === null || previousValue <= 0) {
    return {
      helper: 'Sem dados anteriores para comparação.',
      tone: 'neutral',
      value: null,
    }
  }

  const value = ((currentValue - previousValue) / previousValue) * 100
  const isPositive =
    value === 0
      ? false
      : positiveDirection === 'up'
        ? value > 0
        : value < 0

  return {
    helper: 'Comparado ao período anterior.',
    tone: value === 0 ? 'neutral' : isPositive ? 'good' : 'bad',
    value,
  }
}

export function buildDashboardKpis(
  metrics: PeriodMetrics,
  previousMetrics: PeriodMetrics,
): DashboardKpi[] {
  return [
    {
      comparison: getComparison(
        metrics.realizedRevenue,
        previousMetrics.realizedRevenue,
      ),
      helper: 'Atendimentos concluídos no período.',
      label: 'Receita realizada',
      rawValue: metrics.realizedRevenue,
      value: formatCurrency(metrics.realizedRevenue),
    },
    {
      comparison: getComparison(
        metrics.predictedRevenue,
        previousMetrics.predictedRevenue,
      ),
      helper: 'Agendados e confirmados ainda não concluídos.',
      label: 'Receita prevista',
      rawValue: metrics.predictedRevenue,
      value: formatCurrency(metrics.predictedRevenue),
    },
    {
      comparison: getComparison(
        metrics.appointmentsTotal,
        previousMetrics.appointmentsTotal,
      ),
      helper: 'Total de agendamentos no período.',
      label: 'Agendamentos do período',
      rawValue: metrics.appointmentsTotal,
      value: formatInteger(metrics.appointmentsTotal),
    },
    {
      comparison: getComparison(
        metrics.occupancyRate,
        previousMetrics.occupancyRate,
      ),
      helper:
        metrics.occupancyRate === null
          ? 'Configure horários para calcular ocupação.'
          : 'Baseada nos horários ativos e minutos agendados.',
      label: 'Taxa de ocupação estimada',
      rawValue: metrics.occupancyRate,
      value: metrics.occupancyRate === null ? '—' : formatPercent(metrics.occupancyRate),
    },
    {
      comparison: getComparison(metrics.averageTicket, previousMetrics.averageTicket),
      helper:
        metrics.averageTicket === null
          ? 'Sem atendimentos concluídos no período.'
          : 'Receita realizada dividida por concluídos.',
      label: 'Ticket médio realizado',
      rawValue: metrics.averageTicket,
      value: metrics.averageTicket === null ? '—' : formatCurrency(metrics.averageTicket),
    },
    {
      comparison: getComparison(
        metrics.lostRevenue,
        previousMetrics.lostRevenue,
        'down',
      ),
      helper: 'Cancelamentos e faltas no período.',
      label: 'Receita perdida',
      rawValue: metrics.lostRevenue,
      value: formatCurrency(metrics.lostRevenue),
    },
    {
      comparison: getComparison(metrics.customersNew, previousMetrics.customersNew),
      helper: 'Primeiro agendamento conhecido no período.',
      label: 'Clientes novos',
      rawValue: metrics.customersNew,
      value: formatInteger(metrics.customersNew),
    },
    {
      comparison: getComparison(
        metrics.customersRecurring,
        previousMetrics.customersRecurring,
      ),
      helper: 'Clientes com agendamento anterior conhecido.',
      label: 'Clientes recorrentes',
      rawValue: metrics.customersRecurring,
      value: formatInteger(metrics.customersRecurring),
    },
  ]
}

function getRevenueBucketLabel(period: DashboardPeriodKey, appointment: Appointment) {
  if (period === 'today') {
    return `${appointment.startTime.slice(0, 2)}h`
  }

  const [, month, day] = appointment.appointmentDate.split('-')

  return `${day}/${month}`
}

export function buildRevenueOverTimeData(
  appointments: Appointment[],
  period: DashboardPeriodKey,
): RevenueOverTimeItem[] {
  const revenueByLabel = new Map<string, number>()

  for (const appointment of appointments) {
    if (appointment.status !== 'COMPLETED') {
      continue
    }

    const label = getRevenueBucketLabel(period, appointment)
    revenueByLabel.set(label, (revenueByLabel.get(label) ?? 0) + getAppointmentPrice(appointment))
  }

  return [...revenueByLabel.entries()].map(([label, revenue]) => ({
    label,
    revenue,
  }))
}

export function buildRevenueByServiceData(
  appointments: Appointment[],
): RevenueByServiceItem[] {
  const revenueByService = new Map<string, RevenueByServiceItem>()

  for (const appointment of appointments) {
    const key = appointment.serviceId
    const current = revenueByService.get(key) ?? {
      appointments: 0,
      name: appointment.serviceName,
      revenue: 0,
    }

    if (appointment.status === 'COMPLETED') {
      current.revenue += getAppointmentPrice(appointment)
    }

    current.appointments += 1
    revenueByService.set(key, current)
  }

  return [...revenueByService.values()].sort(
    (first, second) => second.revenue - first.revenue,
  )
}

export function buildStatusOverviewData(
  appointments: Appointment[],
): StatusOverviewItem[] {
  return statusOrder.map((status) => ({
    label: getAppointmentStatusLabel(status),
    status,
    value: appointments.filter((appointment) => appointment.status === status)
      .length,
  }))
}

export function buildOccupancyByWeekdayData(
  appointments: Appointment[],
  businessHours: BusinessHour[],
  range: DashboardDateRange,
): OccupancyByWeekdayItem[] {
  return weekdayLabels.map((label, dayOfWeek) => {
    const dates = getDatesInRange(range.start, range.end).filter(
      (date) => getLocalDate(date).getDay() === dayOfWeek,
    )
    const availableMinutes = calculateAvailableMinutes(dates, businessHours)
    const bookedMinutes = appointments
      .filter((appointment) => {
        return (
          getLocalDate(appointment.appointmentDate).getDay() === dayOfWeek &&
          activeAppointmentStatuses.has(appointment.status)
        )
      })
      .reduce(
        (total, appointment) =>
          total + Math.max(0, appointment.serviceDurationMinutes),
        0,
      )

    return {
      availableMinutes,
      bookedMinutes,
      label,
      occupancyRate:
        availableMinutes > 0 ? (bookedMinutes / availableMinutes) * 100 : 0,
    }
  })
}

export function buildTopServicesData(
  appointments: Appointment[],
): TopServiceItem[] {
  const services = new Map<string, TopServiceItem>()

  for (const appointment of appointments) {
    const key = appointment.serviceId
    const current = services.get(key) ?? {
      appointments: 0,
      name: appointment.serviceName,
      revenue: 0,
    }

    current.appointments += 1

    if (appointment.status === 'COMPLETED') {
      current.revenue += getAppointmentPrice(appointment)
    }

    services.set(key, current)
  }

  return [...services.values()]
}

export function buildDashboardAnalysis({
  allAppointments,
  businessHours,
  range,
  services,
}: {
  allAppointments: Appointment[]
  businessHours: BusinessHour[]
  range: DashboardDateRange
  services: Service[]
}): DashboardAnalysis {
  const currentAppointments = filterAppointmentsByRange(
    allAppointments,
    range.start,
    range.end,
  )
  const previousAppointments = filterAppointmentsByRange(
    allAppointments,
    range.previousStart,
    range.previousEnd,
  )
  const metrics = calculatePeriodMetrics({
    allAppointments,
    appointments: currentAppointments,
    businessHours,
    end: range.end,
    start: range.start,
  })
  const previousMetrics = calculatePeriodMetrics({
    allAppointments,
    appointments: previousAppointments,
    businessHours,
    end: range.previousEnd,
    start: range.previousStart,
  })
  const topServices = buildTopServicesData(currentAppointments)

  return {
    currentAppointments,
    hasNoPricedServices:
      services.length > 0 && services.every((service) => service.price === null),
    kpis: buildDashboardKpis(metrics, previousMetrics),
    metrics,
    occupancyByWeekday: buildOccupancyByWeekdayData(
      currentAppointments,
      businessHours,
      range,
    ),
    previousMetrics,
    revenueByService: buildRevenueByServiceData(currentAppointments),
    revenueOverTime: buildRevenueOverTimeData(currentAppointments, range.key),
    statusOverview: buildStatusOverviewData(currentAppointments),
    topServicesByAppointments: [...topServices].sort(
      (first, second) => second.appointments - first.appointments,
    ),
    topServicesByRevenue: [...topServices].sort(
      (first, second) => second.revenue - first.revenue,
    ),
  }
}

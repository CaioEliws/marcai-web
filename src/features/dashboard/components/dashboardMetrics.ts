import type {
  Appointment,
  AppointmentStatus,
} from '@/features/appointments/types/appointment.type'
import { getAppointmentStatusLabel } from './dashboardUtils'

const activeRevenueStatuses = new Set<AppointmentStatus>([
  'CONFIRMED',
  'SCHEDULED',
])

const lostRevenueStatuses = new Set<AppointmentStatus>(['CANCELED', 'NO_SHOW'])

const statusOrder: AppointmentStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELED',
  'NO_SHOW',
]

export type DashboardMetrics = {
  averageTicket: number
  completedAppointments: number
  hasNoPricedAppointments: boolean
  lostRevenue: number
  predictedRevenue: number
  realizedRevenue: number
}

export type StatusChartItem = {
  label: string
  status: AppointmentStatus
  value: number
}

export type ServiceRevenueItem = {
  appointments: number
  name: string
  revenue: number
}

function getAppointmentPrice(appointment: Appointment) {
  return appointment.servicePrice ?? 0
}

function shouldCountServiceRevenue(status: AppointmentStatus) {
  return activeRevenueStatuses.has(status) || status === 'COMPLETED'
}

export function calculateDashboardMetrics(
  appointments: Appointment[],
): DashboardMetrics {
  let completedAppointments = 0
  let lostRevenue = 0
  let predictedRevenue = 0
  let realizedRevenue = 0

  for (const appointment of appointments) {
    const price = getAppointmentPrice(appointment)

    if (activeRevenueStatuses.has(appointment.status)) {
      predictedRevenue += price
    }

    if (appointment.status === 'COMPLETED') {
      completedAppointments += 1
      realizedRevenue += price
    }

    if (lostRevenueStatuses.has(appointment.status)) {
      lostRevenue += price
    }
  }

  return {
    averageTicket:
      completedAppointments > 0 ? realizedRevenue / completedAppointments : 0,
    completedAppointments,
    hasNoPricedAppointments:
      appointments.length > 0 &&
      appointments.every((appointment) => appointment.servicePrice === null),
    lostRevenue,
    predictedRevenue,
    realizedRevenue,
  }
}

export function buildStatusChartData(
  appointments: Appointment[],
): StatusChartItem[] {
  return statusOrder.map((status) => ({
    label: getAppointmentStatusLabel(status),
    status,
    value: appointments.filter((appointment) => appointment.status === status)
      .length,
  }))
}

export function buildServiceRevenueData(
  appointments: Appointment[],
): ServiceRevenueItem[] {
  const services = new Map<string, ServiceRevenueItem>()

  for (const appointment of appointments) {
    const currentService = services.get(appointment.serviceName) ?? {
      appointments: 0,
      name: appointment.serviceName,
      revenue: 0,
    }

    currentService.appointments += 1

    if (shouldCountServiceRevenue(appointment.status)) {
      currentService.revenue += getAppointmentPrice(appointment)
    }

    services.set(appointment.serviceName, currentService)
  }

  return [...services.values()].sort((firstService, secondService) => {
    if (secondService.revenue !== firstService.revenue) {
      return secondService.revenue - firstService.revenue
    }

    return secondService.appointments - firstService.appointments
  })
}

export function getTopServices(
  services: ServiceRevenueItem[],
  limit = 5,
) {
  return [...services]
    .sort((firstService, secondService) => {
      if (secondService.appointments !== firstService.appointments) {
        return secondService.appointments - firstService.appointments
      }

      return secondService.revenue - firstService.revenue
    })
    .slice(0, limit)
}

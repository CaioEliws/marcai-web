import type {
  Appointment,
  AppointmentStatus,
} from '../types/appointment.type'

export type AppointmentAction = 'cancel' | 'complete' | 'no-show'

const statusLabels: Record<AppointmentStatus, string> = {
  CANCELED: 'Cancelado',
  COMPLETED: 'Concluído',
  CONFIRMED: 'Confirmado',
  NO_SHOW: 'Não compareceu',
  SCHEDULED: 'Agendado',
}

export function canManageAppointment(status: AppointmentStatus) {
  return status === 'SCHEDULED' || status === 'CONFIRMED'
}

export function formatAppointmentDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)

  if (!year || !month || !day) {
    return date
  }

  return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
}

export function formatAppointmentTime(time: string) {
  return time.slice(0, 5)
}

export function formatServicePrice(price: Appointment['servicePrice']) {
  if (price === null) {
    return 'Preço não informado'
  }

  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(price)
}

export function getAppointmentStatusLabel(status: AppointmentStatus) {
  return statusLabels[status]
}

export function getAppointmentStatusVariant(status: AppointmentStatus) {
  if (status === 'SCHEDULED' || status === 'CONFIRMED') {
    return 'default'
  }

  if (status === 'COMPLETED') {
    return 'secondary'
  }

  return 'outline'
}

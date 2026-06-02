import type { AppointmentStatus } from '@/features/appointments/types/appointment.type'

const statusLabels: Record<AppointmentStatus, string> = {
  CANCELED: 'Cancelado',
  COMPLETED: 'Concluído',
  CONFIRMED: 'Confirmado',
  NO_SHOW: 'Não compareceu',
  SCHEDULED: 'Agendado',
}

export function formatLocalDateForApi(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatShortTime(time: string) {
  return time.slice(0, 5)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value)
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

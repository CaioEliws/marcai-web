import type { AppointmentStatus } from '@/features/appointments/types/appointment.type'

const statusLabels: Record<AppointmentStatus, string> = {
  CANCELED: 'Cancelado',
  COMPLETED: 'Concluído',
  CONFIRMED: 'Confirmado',
  NO_SHOW: 'Não compareceu',
  SCHEDULED: 'Agendado',
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value)
}

export function formatInteger(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value)}%`
}

export function formatComparisonPercent(value: number) {
  const formatted = formatPercent(Math.abs(value))

  if (value > 0) {
    return `+${formatted}`
  }

  if (value < 0) {
    return `-${formatted}`
  }

  return '0%'
}

export function formatShortTime(time: string) {
  return time.slice(0, 5)
}

export function formatDatePtBr(date: string) {
  const [year, month, day] = date.split('-').map(Number)

  if (!year || !month || !day) {
    return date
  }

  return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
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

export function normalizePhoneForAnalytics(phone: string) {
  return phone.replace(/\D/g, '')
}

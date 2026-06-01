import type { PublicService } from '../types/publicBooking.type'

export type PublicAppointmentFieldErrors = Partial<
  Record<'clientName' | 'clientPhone' | 'serviceId' | 'appointmentDate' | 'startTime', string>
>

export function formatCurrency(value: number | null) {
  if (value === null) {
    return 'Preco sob consulta'
  }

  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value)
}

export function formatTime(time: string) {
  return time.slice(0, 5)
}

export function getTodayDateInputValue() {
  const now = new Date()
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)

  return offsetDate.toISOString().slice(0, 10)
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

export function getSelectedService(
  services: PublicService[],
  selectedServiceId: string,
) {
  return services.find((service) => service.id === selectedServiceId) ?? null
}

export function getPublicAppointmentValidationMessage(
  field: keyof PublicAppointmentFieldErrors,
) {
  if (field === 'clientName') {
    return 'Informe seu nome com pelo menos 2 caracteres.'
  }

  if (field === 'clientPhone') {
    return 'Informe um telefone valido com DDD.'
  }

  if (field === 'serviceId') {
    return 'Escolha um servico.'
  }

  if (field === 'appointmentDate') {
    return 'Escolha uma data.'
  }

  return 'Escolha um horario disponivel.'
}

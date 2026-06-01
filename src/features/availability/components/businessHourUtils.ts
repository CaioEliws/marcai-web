import type { CreateBusinessHourPayload } from '../types/businessHour.type'

export type BusinessHourFormValues = CreateBusinessHourPayload

export type BusinessHourFormFieldErrors = Partial<
  Record<'dayOfWeek' | 'openingTime' | 'closingTime', string>
>

export const weekDays = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda-feira', value: 1 },
  { label: 'Terca-feira', value: 2 },
  { label: 'Quarta-feira', value: 3 },
  { label: 'Quinta-feira', value: 4 },
  { label: 'Sexta-feira', value: 5 },
  { label: 'Sabado', value: 6 },
] as const

export function formatTimeForInput(time: string) {
  return time.slice(0, 5)
}

export function formatTimeForApi(time: string) {
  if (!time) {
    return ''
  }

  return time.length === 5 ? `${time}:00` : time
}

export function getBusinessHourValidationMessage(
  field: keyof BusinessHourFormFieldErrors,
  message: string | undefined,
) {
  if (!message) {
    return undefined
  }

  if (field === 'dayOfWeek') {
    return 'Selecione um dia da semana.'
  }

  if (field === 'openingTime') {
    return 'Informe um horario de abertura valido.'
  }

  if (field === 'closingTime') {
    return 'Informe um horario de fechamento maior que a abertura.'
  }

  return message
}

export function getRequiredBusinessHourValidationMessage(
  field: keyof BusinessHourFormFieldErrors,
) {
  return getBusinessHourValidationMessage(field, 'invalid') ?? 'Campo invalido.'
}

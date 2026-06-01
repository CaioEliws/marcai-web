import type { CreateServicePayload } from '../types/service.type'

export type ServiceFormValues = CreateServicePayload

export type ServiceFormFieldErrors = Partial<
  Record<'name' | 'description' | 'price' | 'durationMinutes', string>
>

export function formatPriceInput(price: number | null) {
  if (price === null) {
    return ''
  }

  return String(price).replace('.', ',')
}

export function parseOptionalPrice(value: string) {
  const compactValue = value.trim().replace(/\s/g, '')

  if (!compactValue) {
    return null
  }

  const normalizedValue = compactValue.includes(',')
    ? compactValue.replace(/\./g, '').replace(',', '.')
    : compactValue

  if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
    return Number.NaN
  }

  const parsedValue = Number(normalizedValue)
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
}

export function parseDuration(value: string) {
  const normalizedValue = value.trim()

  if (!/^\d+$/.test(normalizedValue)) {
    return Number.NaN
  }

  const parsedValue = Number(normalizedValue)
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
}

export function getValidationMessage(
  field: keyof ServiceFormFieldErrors,
  message: string | undefined,
) {
  if (!message) {
    return undefined
  }

  if (field === 'name') {
    return 'Informe um nome entre 2 e 120 caracteres.'
  }

  if (field === 'description') {
    return 'A descrição deve ter no máximo 500 caracteres.'
  }

  if (field === 'price') {
    return 'Informe um preço válido, como 120,00, ou deixe em branco.'
  }

  if (field === 'durationMinutes') {
    return 'Informe uma duração em minutos entre 1 e 720.'
  }

  return message
}

export function getRequiredValidationMessage(
  field: keyof ServiceFormFieldErrors,
) {
  return getValidationMessage(field, 'invalid') ?? 'Campo inválido.'
}

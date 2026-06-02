import type { Business } from '../types/business.type'

export function getSlugValidationMessage() {
  return 'Use 3 a 80 caracteres: letras minúsculas, números e hífen, sem espaços, acentos ou hífen no início/fim.'
}

export function toUpdateBusinessSlugPayload(business: Business, slug: string) {
  return {
    address: business.address,
    city: business.city,
    description: business.description,
    name: business.name,
    phone: business.phone,
    slug,
    state: business.state,
  }
}

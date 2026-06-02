import type { AccountProfile } from '../types/account.type'

export const maxAvatarFileSize = 2 * 1024 * 1024

const acceptedAvatarTypes = new Set(['image/jpeg', 'image/png'])

export function getAvatarValidationMessage(file: File | null) {
  if (!file) {
    return 'Selecione uma imagem para enviar.'
  }

  if (!acceptedAvatarTypes.has(file.type) || file.size > maxAvatarFileSize) {
    return 'Envie uma imagem JPG ou PNG de até 2MB.'
  }

  return null
}

export function getAccountInitials(profile: AccountProfile) {
  return profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

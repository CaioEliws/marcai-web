import { httpClient } from '@/shared/api/httpClient'
import {
  accountProfileSchema,
  emptyAccountResponseSchema,
  updateAccountProfileSchema,
  updatePasswordSchema,
} from '../schemas/account.schema'
import type {
  UpdateAccountProfilePayload,
  UpdatePasswordPayload,
} from '../types/account.type'

const accountProfileBasePath = '/api/v1/dashboard/profile'

export const accountApi = {
  deleteAvatar: () =>
    httpClient.delete(
      `${accountProfileBasePath}/avatar`,
      emptyAccountResponseSchema,
    ),

  getProfile: () =>
    httpClient.get(accountProfileBasePath, accountProfileSchema),

  updatePassword: (payload: UpdatePasswordPayload) =>
    httpClient.put(
      `${accountProfileBasePath}/password`,
      emptyAccountResponseSchema,
      updatePasswordSchema.parse(payload),
    ),

  updateProfile: (payload: UpdateAccountProfilePayload) =>
    httpClient.put(
      accountProfileBasePath,
      accountProfileSchema,
      updateAccountProfileSchema.parse(payload),
    ),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return httpClient.put(
      `${accountProfileBasePath}/avatar`,
      emptyAccountResponseSchema,
      formData,
    )
  },
}

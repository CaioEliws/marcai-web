import type { z } from 'zod'
import type {
  accountProfileSchema,
  updateAccountProfileSchema,
  updatePasswordSchema,
} from '../schemas/account.schema'

export type AccountProfile = z.infer<typeof accountProfileSchema>
export type UpdateAccountProfilePayload = z.infer<
  typeof updateAccountProfileSchema
>
export type UpdatePasswordPayload = z.infer<typeof updatePasswordSchema>

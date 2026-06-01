import type { z } from 'zod'
import type {
  loginPayloadSchema,
  registerPayloadSchema,
  sessionSchema,
} from '../schemas/auth.schema'

export type LoginPayload = z.infer<typeof loginPayloadSchema>
export type RegisterPayload = z.infer<typeof registerPayloadSchema>
export type Session = z.infer<typeof sessionSchema>

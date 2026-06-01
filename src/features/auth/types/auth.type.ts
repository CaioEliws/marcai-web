import type { z } from 'zod'
import type {
  loginPayloadSchema,
  loginResponseSchema,
  meResponseSchema,
  registerPayloadSchema,
  registerResponseSchema,
} from '../schemas/auth.schema'

export type LoginPayload = z.infer<typeof loginPayloadSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type RegisterPayload = z.infer<typeof registerPayloadSchema>
export type RegisterResponse = z.infer<typeof registerResponseSchema>
export type Session = z.infer<typeof meResponseSchema>

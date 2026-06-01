import type { z } from 'zod'
import type {
  businessHourSchema,
  createBusinessHourSchema,
  updateBusinessHourSchema,
} from '../schemas/businessHour.schema'

export type BusinessHour = z.infer<typeof businessHourSchema>
export type CreateBusinessHourPayload = z.infer<typeof createBusinessHourSchema>
export type UpdateBusinessHourPayload = z.infer<typeof updateBusinessHourSchema>

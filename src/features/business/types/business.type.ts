import type { z } from 'zod'
import type {
  businessSchema,
  updateBusinessSchema,
} from '../schemas/business.schema'

export type Business = z.infer<typeof businessSchema>
export type UpdateBusinessPayload = z.infer<typeof updateBusinessSchema>

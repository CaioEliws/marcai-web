import type { z } from 'zod'
import type {
  createServiceSchema,
  serviceSchema,
  updateServiceSchema,
} from '../schemas/service.schema'

export type Service = z.infer<typeof serviceSchema>
export type CreateServicePayload = z.infer<typeof createServiceSchema>
export type UpdateServicePayload = z.infer<typeof updateServiceSchema>

import type { z } from 'zod'
import type { businessSchema } from '../schemas/business.schema'

export type Business = z.infer<typeof businessSchema>

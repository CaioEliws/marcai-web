import { z } from 'zod'

export const businessSchema = z.object({
  active: z.boolean(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  createdAt: z.string(),
  description: z.string().nullable(),
  id: z.uuid(),
  name: z.string(),
  phone: z.string().nullable(),
  slug: z.string(),
  state: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

import { z } from 'zod'

export const serviceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  durationMinutes: z.number().int(),
  active: z.boolean(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})

export const serviceListSchema = z.array(serviceSchema)

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  durationMinutes: z.number().int().min(1).max(720),
})

export const updateServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  durationMinutes: z.number().int().min(1).max(720),
  active: z.boolean(),
})

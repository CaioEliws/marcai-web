import { z } from 'zod'

export const businessSlugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

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

export const updateBusinessSchema = z.object({
  address: z.string().max(255).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().max(30).nullable().optional(),
  slug: businessSlugSchema,
  state: z.string().max(50).nullable().optional(),
})

import { z } from 'zod'

export const authRoleSchema = z.enum(['ADMIN', 'OWNER', 'PROFESSIONAL'])

export const loginPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const registerPayloadSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8),
  businessName: z.string().trim().min(1),
  phone: z.string().trim().min(8),
})

export const authBusinessSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  active: z.boolean().optional(),
})

export const authUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
})

export const sessionSchema = z.object({
  user: authUserSchema,
  business: authBusinessSchema.nullable().optional(),
  role: authRoleSchema.optional(),
})

export const authMutationResponseSchema = z.union([
  sessionSchema,
  z.object({}).passthrough(),
  z.null(),
])

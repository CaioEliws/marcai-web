import { z } from 'zod'

export const authRoleSchema = z.enum(['ADMIN', 'OWNER', 'PROFESSIONAL'])

export const loginPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const registerPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(160),
  password: z.string().min(8).max(80),
  businessName: z.string().trim().min(2).max(120),
  businessPhone: z.string().trim().max(30).optional(),
})

export const loginResponseSchema = z.object({
  userId: z.uuid(),
  businessId: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: authRoleSchema,
})

export const registerResponseSchema = z.object({
  userId: z.uuid(),
  businessId: z.uuid(),
  name: z.string(),
  email: z.email(),
  businessName: z.string(),
  slug: z.string(),
  message: z.string(),
})

export const meResponseSchema = z.object({
  userId: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: authRoleSchema,
})

export const logoutResponseSchema = z.null()

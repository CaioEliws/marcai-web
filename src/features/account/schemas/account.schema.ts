import { z } from 'zod'

export const accountRoleSchema = z.enum(['ADMIN', 'OWNER', 'PROFESSIONAL'])

export const accountProfileSchema = z.object({
  avatarUrl: z.string().nullable(),
  email: z.email(),
  id: z.uuid(),
  name: z.string(),
  role: accountRoleSchema,
})

export const updateAccountProfileSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(2).max(120),
})

export const updatePasswordSchema = z
  .object({
    confirmPassword: z.string().min(1),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(80),
  })
  .refine((payload) => payload.newPassword === payload.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export const emptyAccountResponseSchema = z.null()

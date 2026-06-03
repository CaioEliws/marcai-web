import { z } from 'zod'
import { authRoleSchema } from '@/features/auth/schemas/auth.schema'

export const inviteProfessionalPayloadSchema = z.object({
  email: z.email().max(160),
  name: z.string().trim().min(2).max(120),
})

export const teamInvitationStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'EXPIRED',
  'CANCELED',
  'EMAIL_FAILED',
])

export const teamInvitationSchema = z.object({
  createdAt: z.string().optional(),
  email: z.email(),
  emailSent: z.boolean(),
  expiresAt: z.string(),
  id: z.uuid(),
  inviteUrl: z.string().nullish(),
  message: z.string().nullish(),
  name: z.string(),
  role: authRoleSchema,
  status: teamInvitationStatusSchema,
})

export const createInvitationResponseSchema = teamInvitationSchema

export const archiveInvitationResponseSchema = z.union([
  teamInvitationSchema,
  z.null(),
])

export const pendingInvitationSchema = teamInvitationSchema.extend({
  createdAt: z.string(),
})

export const pendingInvitationListSchema = z.array(pendingInvitationSchema)

export const teamMemberSchema = z.object({
  active: z.boolean(),
  createdAt: z.string(),
  email: z.email(),
  id: z.uuid(),
  name: z.string(),
  role: authRoleSchema,
  userId: z.uuid(),
})

export const teamMemberListSchema = z.array(teamMemberSchema)

export const inviteDetailsSchema = z.object({
  businessName: z.string(),
  email: z.email(),
  expiresAt: z.string(),
  name: z.string(),
  role: authRoleSchema,
})

export const acceptInvitePayloadSchema = z
  .object({
    confirmPassword: z.string().min(8).max(80),
    name: z.string().trim().min(2).max(120),
    password: z.string().min(8).max(80),
  })
  .refine((payload) => payload.password === payload.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export const acceptInviteResponseSchema = z.object({
  businessName: z.string(),
  email: z.email(),
  message: z.string(),
  role: authRoleSchema,
})

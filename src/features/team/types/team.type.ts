import type { z } from 'zod'
import type {
  acceptInvitePayloadSchema,
  acceptInviteResponseSchema,
  archiveInvitationResponseSchema,
  createInvitationResponseSchema,
  inviteDetailsSchema,
  inviteProfessionalPayloadSchema,
  pendingInvitationSchema,
  teamInvitationSchema,
  teamMemberSchema,
} from '../schemas/team.schema'

export type AcceptInvitePayload = z.infer<typeof acceptInvitePayloadSchema>
export type AcceptInviteResponse = z.infer<typeof acceptInviteResponseSchema>
export type ArchiveInvitationResponse = z.infer<
  typeof archiveInvitationResponseSchema
>
export type CreateInvitationResponse = z.infer<
  typeof createInvitationResponseSchema
>
export type InviteDetails = z.infer<typeof inviteDetailsSchema>
export type InviteProfessionalPayload = z.infer<
  typeof inviteProfessionalPayloadSchema
>
export type PendingInvitation = z.infer<typeof pendingInvitationSchema>
export type TeamInvitation = z.infer<typeof teamInvitationSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>

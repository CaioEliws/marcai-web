import { httpClient } from '@/shared/api/httpClient'
import {
  acceptInvitePayloadSchema,
  acceptInviteResponseSchema,
  archiveInvitationResponseSchema,
  createInvitationResponseSchema,
  inviteDetailsSchema,
  inviteProfessionalPayloadSchema,
  pendingInvitationListSchema,
  teamInvitationSchema,
  teamMemberListSchema,
  teamMemberSchema,
} from '../schemas/team.schema'
import type {
  AcceptInvitePayload,
  InviteProfessionalPayload,
} from '../types/team.type'

const teamBasePath = '/api/v1/dashboard/team'

export const teamApi = {
  acceptInvite: (token: string, payload: AcceptInvitePayload) =>
    httpClient.post(
      `/api/v1/auth/invitations/${encodeURIComponent(token)}/accept`,
      acceptInviteResponseSchema,
      acceptInvitePayloadSchema.parse(payload),
    ),

  createInvitation: (payload: InviteProfessionalPayload) =>
    httpClient.post(
      `${teamBasePath}/invitations`,
      createInvitationResponseSchema,
      inviteProfessionalPayloadSchema.parse(payload),
    ),

  archiveInvitation: (invitationId: string) =>
    httpClient.patch(
      `${teamBasePath}/invitations/${encodeURIComponent(invitationId)}/archive`,
      archiveInvitationResponseSchema,
    ),

  cancelInvitation: (invitationId: string) =>
    httpClient.patch(
      `${teamBasePath}/invitations/${encodeURIComponent(invitationId)}/cancel`,
      teamInvitationSchema,
    ),

  disableMember: (memberId: string) =>
    httpClient.patch(
      `${teamBasePath}/${encodeURIComponent(memberId)}/disable`,
      teamMemberSchema,
    ),

  enableMember: (memberId: string) =>
    httpClient.patch(
      `${teamBasePath}/${encodeURIComponent(memberId)}/enable`,
      teamMemberSchema,
    ),

  getInviteDetails: (token: string) =>
    httpClient.get(
      `/api/v1/auth/invitations/${encodeURIComponent(token)}`,
      inviteDetailsSchema,
    ),

  getInvitations: () =>
    httpClient.get(`${teamBasePath}/invitations`, pendingInvitationListSchema),

  getMembers: () => httpClient.get(teamBasePath, teamMemberListSchema),

  resendInvitation: (invitationId: string) =>
    httpClient.post(
      `${teamBasePath}/invitations/${encodeURIComponent(invitationId)}/resend`,
      teamInvitationSchema,
    ),
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamApi } from '../api/teamApi'
import type {
  AcceptInvitePayload,
  InviteProfessionalPayload,
} from '../types/team.type'
import { teamQueryKeys } from './teamQueryKeys'

function useInvalidateTeam() {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({ queryKey: teamQueryKeys.all })
  }
}

export function useTeamMembersQuery() {
  return useQuery({
    queryKey: teamQueryKeys.members(),
    queryFn: teamApi.getMembers,
  })
}

export function useTeamInvitationsQuery() {
  return useQuery({
    queryKey: teamQueryKeys.invitations(),
    queryFn: teamApi.getInvitations,
  })
}

export function useInviteDetailsQuery(token: string) {
  return useQuery({
    queryKey: teamQueryKeys.inviteDetails(token),
    queryFn: () => teamApi.getInviteDetails(token),
    enabled: Boolean(token),
  })
}

export function useCreateInvitationMutation() {
  const invalidateTeam = useInvalidateTeam()

  return useMutation({
    mutationFn: (payload: InviteProfessionalPayload) =>
      teamApi.createInvitation(payload),
    onSuccess: invalidateTeam,
  })
}

export function useArchiveInvitationMutation() {
  const invalidateTeam = useInvalidateTeam()

  return useMutation({
    mutationFn: (invitationId: string) => teamApi.archiveInvitation(invitationId),
    onSuccess: invalidateTeam,
  })
}

export function useCancelInvitationMutation() {
  const invalidateTeam = useInvalidateTeam()

  return useMutation({
    mutationFn: (invitationId: string) => teamApi.cancelInvitation(invitationId),
    onSuccess: invalidateTeam,
  })
}

export function useResendInvitationMutation() {
  const invalidateTeam = useInvalidateTeam()

  return useMutation({
    mutationFn: (invitationId: string) => teamApi.resendInvitation(invitationId),
    onSuccess: invalidateTeam,
  })
}

export function useEnableTeamMemberMutation() {
  const invalidateTeam = useInvalidateTeam()

  return useMutation({
    mutationFn: (memberId: string) => teamApi.enableMember(memberId),
    onSuccess: invalidateTeam,
  })
}

export function useDisableTeamMemberMutation() {
  const invalidateTeam = useInvalidateTeam()

  return useMutation({
    mutationFn: (memberId: string) => teamApi.disableMember(memberId),
    onSuccess: invalidateTeam,
  })
}

export function useAcceptInviteMutation() {
  return useMutation({
    mutationFn: ({
      payload,
      token,
    }: {
      payload: AcceptInvitePayload
      token: string
    }) => teamApi.acceptInvite(token, payload),
  })
}

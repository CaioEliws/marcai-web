export const teamQueryKeys = {
  all: ['team'] as const,
  inviteDetails: (token: string) => ['team', 'invite-details', token] as const,
  invitations: () => [...teamQueryKeys.all, 'invitations'] as const,
  members: () => [...teamQueryKeys.all, 'members'] as const,
}

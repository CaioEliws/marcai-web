import { useState } from 'react'
import { ApiContractError, ApiError } from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { InviteProfessionalForm } from '@/features/team/components/InviteProfessionalForm'
import { PendingInvitationsList } from '@/features/team/components/PendingInvitationsList'
import { TeamMembersList } from '@/features/team/components/TeamMembersList'
import { normalizeInviteUrl } from '@/features/team/components/inviteUrlUtils'
import {
  useCreateInvitationMutation,
  useArchiveInvitationMutation,
  useCancelInvitationMutation,
  useDisableTeamMemberMutation,
  useEnableTeamMemberMutation,
  useResendInvitationMutation,
  useTeamInvitationsQuery,
  useTeamMembersQuery,
} from '@/features/team/hooks/useTeam'
import type {
  InviteProfessionalPayload,
  PendingInvitation,
  TeamInvitation,
  TeamMember,
} from '@/features/team/types/team.type'

const defaultApiErrorMessage = 'Erro ao comunicar com a API.'

function isGenericUnauthorizedMessage(message: string) {
  const normalizedMessage = message.trim().toLowerCase()

  return (
    !normalizedMessage ||
    normalizedMessage === defaultApiErrorMessage.toLowerCase() ||
    normalizedMessage === 'unauthorized' ||
    normalizedMessage === 'não autenticado' ||
    normalizedMessage === 'nao autenticado'
  )
}

function looksLikeEmailDeliveryFailure(message: string) {
  const normalizedMessage = message.toLowerCase()

  return (
    normalizedMessage.includes('email') ||
    normalizedMessage.includes('e-mail') ||
    normalizedMessage.includes('resend') ||
    normalizedMessage.includes('convite')
  )
}

function getTeamErrorMessage(
  error: unknown,
  options: { isArchiveAction?: boolean; isEmailDeliveryAction?: boolean } = {},
) {
  if (error instanceof ApiContractError) {
    return 'A API retornou uma resposta inesperada.'
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      if (options.isArchiveAction) {
        return 'Cancele o convite antes de removê-lo do histórico.'
      }

      return 'Confira os dados informados e tente novamente.'
    }

    if (error.status === 401) {
      if (
        options.isEmailDeliveryAction &&
        !isGenericUnauthorizedMessage(error.message)
      ) {
        return 'Falha temporária no serviço de e-mail. Tente reenviar o convite em instantes.'
      }

      return 'Sua sessão expirou. Faça login novamente.'
    }

    if (error.status === 403) {
      if (options.isArchiveAction) {
        return 'Você não tem permissão para gerenciar convites.'
      }

      return 'Você não tem permissão para gerenciar equipe.'
    }

    if (error.status === 409) {
      return 'Esse e-mail já pertence à equipe ou já possui convite pendente. Verifique as listas abaixo.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
    }

    const isEmailDeliveryFailure =
      options.isEmailDeliveryAction &&
      (looksLikeEmailDeliveryFailure(error.message) ||
        error.status === 502 ||
        error.status === 503 ||
        error.status === 504)

    if (isEmailDeliveryFailure) {
      return 'Falha temporária no serviço de e-mail. Tente reenviar o convite em instantes.'
    }
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

function buildInviteLink(invitation: TeamInvitation) {
  return normalizeInviteUrl(invitation.inviteUrl)
}

export function TeamPage() {
  const membersQuery = useTeamMembersQuery()
  const invitationsQuery = useTeamInvitationsQuery()
  const createInvitationMutation = useCreateInvitationMutation()
  const archiveInvitationMutation = useArchiveInvitationMutation()
  const cancelInvitationMutation = useCancelInvitationMutation()
  const enableMemberMutation = useEnableTeamMemberMutation()
  const disableMemberMutation = useDisableTeamMemberMutation()
  const resendInvitationMutation = useResendInvitationMutation()
  const [formError, setFormError] = useState<string | null>(null)
  const [memberActionError, setMemberActionError] = useState<string | null>(
    null,
  )
  const [invitationActionError, setInvitationActionError] = useState<
    string | null
  >(null)
  const [createdInvitation, setCreatedInvitation] =
    useState<TeamInvitation | null>(null)
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null)
  const [pendingInvitationActionId, setPendingInvitationActionId] = useState<
    string | null
  >(null)
  const inviteLink = createdInvitation ? buildInviteLink(createdInvitation) : null

  async function handleInvite(payload: InviteProfessionalPayload) {
    setFormError(null)
    setCreatedInvitation(null)

    try {
      const invitation = await createInvitationMutation.mutateAsync(payload)
      setCreatedInvitation(invitation)
      return invitation
    } catch (error) {
      setFormError(getTeamErrorMessage(error, { isEmailDeliveryAction: true }))
      throw error
    }
  }

  async function handleToggleMember(member: TeamMember) {
    setMemberActionError(null)
    setPendingMemberId(member.id)

    try {
      if (member.active) {
        await disableMemberMutation.mutateAsync(member.id)
      } else {
        await enableMemberMutation.mutateAsync(member.id)
      }
    } catch (error) {
      setMemberActionError(getTeamErrorMessage(error))
    } finally {
      setPendingMemberId(null)
    }
  }

  async function handleCancelInvitation(invitation: PendingInvitation) {
    setInvitationActionError(null)
    setPendingInvitationActionId(invitation.id)

    try {
      await cancelInvitationMutation.mutateAsync(invitation.id)
    } catch (error) {
      setInvitationActionError(
        getTeamErrorMessage(error, { isEmailDeliveryAction: true }),
      )
    } finally {
      setPendingInvitationActionId(null)
    }
  }

  async function handleArchiveInvitation(invitation: PendingInvitation) {
    setInvitationActionError(null)
    setPendingInvitationActionId(invitation.id)

    try {
      await archiveInvitationMutation.mutateAsync(invitation.id)
    } catch (error) {
      setInvitationActionError(
        getTeamErrorMessage(error, { isArchiveAction: true }),
      )
    } finally {
      setPendingInvitationActionId(null)
    }
  }

  async function handleResendInvitation(invitation: PendingInvitation) {
    setInvitationActionError(null)
    setPendingInvitationActionId(invitation.id)

    try {
      await resendInvitationMutation.mutateAsync(invitation.id)
    } catch (error) {
      setInvitationActionError(
        getTeamErrorMessage(error, { isEmailDeliveryAction: true }),
      )
    } finally {
      setPendingInvitationActionId(null)
    }
  }

  async function copyInviteLink() {
    if (inviteLink && navigator.clipboard) {
      await navigator.clipboard.writeText(inviteLink)
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Equipe</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Convide e gerencie profissionais da sua barbearia.
        </p>
      </div>

      <InviteProfessionalForm
        error={formError}
        isSubmitting={createInvitationMutation.isPending}
        onInvite={handleInvite}
      />

      {createdInvitation ? (
        <Alert
          className={
            createdInvitation.emailSent
              ? undefined
              : 'border-primary/40 bg-primary/5'
          }
        >
          <AlertDescription className="grid gap-3">
            <div>
              {createdInvitation.emailSent ? (
                <>
                  <p className="font-medium">
                    Convite enviado para {createdInvitation.email}.
                  </p>
                  <p className="text-muted-foreground">
                    O profissional receberá um e-mail para criar a senha.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">
                    Convite criado, mas o e-mail não foi enviado.
                  </p>
                  <p className="text-muted-foreground">
                    Verifique a configuração de e-mail ou tente reenviar.
                  </p>
                </>
              )}
            </div>

            {inviteLink ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium">Link de desenvolvimento</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    readOnly
                    value={inviteLink}
                    aria-label="Link de desenvolvimento"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void copyInviteLink()}
                  >
                    Copiar convite
                  </Button>
                </div>
              </div>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <TeamMembersList
        actionError={memberActionError}
        isError={membersQuery.isError}
        isLoading={membersQuery.isLoading}
        members={membersQuery.data ?? []}
        onToggle={(member) => void handleToggleMember(member)}
        pendingMemberId={pendingMemberId}
      />

      <PendingInvitationsList
        actionError={invitationActionError}
        invitations={invitationsQuery.data ?? []}
        isError={invitationsQuery.isError}
        isLoading={invitationsQuery.isLoading}
        onArchive={(invitation) => void handleArchiveInvitation(invitation)}
        onCancel={(invitation) => void handleCancelInvitation(invitation)}
        onResend={(invitation) => void handleResendInvitation(invitation)}
        pendingActionId={pendingInvitationActionId}
      />
    </section>
  )
}

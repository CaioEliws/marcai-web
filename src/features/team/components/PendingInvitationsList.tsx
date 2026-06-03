import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { buttonVariants } from '@/shared/components/ui/button.variants'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { PendingInvitation } from '../types/team.type'
import { normalizeInviteUrl } from './inviteUrlUtils'

type PendingInvitationsListProps = {
  actionError: string | null
  invitations: PendingInvitation[]
  isError: boolean
  isLoading: boolean
  onArchive: (invitation: PendingInvitation) => void
  onCancel: (invitation: PendingInvitation) => void
  onResend: (invitation: PendingInvitation) => void
  pendingActionId: string | null
}

const statusLabels = {
  ACCEPTED: 'Aceito',
  CANCELED: 'Cancelado',
  EMAIL_FAILED: 'Falha no envio',
  EXPIRED: 'Expirado',
  PENDING: 'Pendente',
} as const

const roleLabels = {
  ADMIN: 'Admin',
  OWNER: 'Dono',
  PROFESSIONAL: 'Profissional',
} as const

function canManageInvitation(invitation: PendingInvitation) {
  return invitation.status === 'PENDING' || invitation.status === 'EMAIL_FAILED'
}

function canArchiveInvitation(invitation: PendingInvitation) {
  return (
    invitation.status === 'EMAIL_FAILED' ||
    invitation.status === 'CANCELED' ||
    invitation.status === 'EXPIRED'
  )
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('pt-BR')
}

function getInvitationDates(invitation: PendingInvitation) {
  const createdAt = invitation.createdAt
    ? `Criado em ${formatDateTime(invitation.createdAt)} · `
    : ''

  return `${createdAt}Expira em ${formatDateTime(invitation.expiresAt)}`
}

export function PendingInvitationsList({
  actionError,
  invitations,
  isError,
  isLoading,
  onArchive,
  onCancel,
  onResend,
  pendingActionId,
}: PendingInvitationsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function copyInvite(invitation: PendingInvitation) {
    const inviteUrl = normalizeInviteUrl(invitation.inviteUrl)

    if (!inviteUrl || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(inviteUrl)
    setCopiedId(invitation.id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convites</CardTitle>
        <CardDescription>
          Acompanhe convites pendentes, aceitos, cancelados ou com falha de envio.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actionError ? (
          <Alert className="border-destructive/50 text-destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando convites...</p>
        ) : null}

        {isError ? (
          <Alert className="border-destructive/50 text-destructive">
            <AlertDescription>
              Não foi possível carregar os convites.
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !isError && invitations.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">Nenhum convite pendente.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Convites enviados aparecerão aqui.
            </p>
          </div>
        ) : null}

        {invitations.map((invitation) => {
          const inviteUrl = normalizeInviteUrl(invitation.inviteUrl)
          const isPending = pendingActionId === invitation.id
          const isManageable = canManageInvitation(invitation)
          const isArchivable = canArchiveInvitation(invitation)

          return (
            <article
              key={invitation.id}
              className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{invitation.name}</p>
                  <Badge variant="outline">{roleLabels[invitation.role]}</Badge>
                  <Badge
                    variant={
                      invitation.status === 'EMAIL_FAILED'
                        ? 'outline'
                        : invitation.status === 'PENDING'
                          ? 'secondary'
                          : 'outline'
                    }
                    className={
                      invitation.status === 'EMAIL_FAILED'
                        ? 'border-destructive/40 text-destructive'
                        : undefined
                    }
                  >
                    {statusLabels[invitation.status]}
                  </Badge>
                  {invitation.emailSent === false ? (
                    <Badge
                      variant="outline"
                      className="border-destructive/40 text-destructive"
                    >
                      E-mail não enviado
                    </Badge>
                  ) : invitation.emailSent === true ? (
                    <Badge variant="outline">E-mail enviado</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {invitation.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getInvitationDates(invitation)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {inviteUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void copyInvite(invitation)}
                  >
                    {copiedId === invitation.id ? 'Copiado' : 'Copiar link'}
                  </Button>
                ) : null}

                {isManageable ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isPending}
                    onClick={() => onResend(invitation)}
                  >
                    {isPending ? 'Enviando...' : 'Reenviar'}
                  </Button>
                ) : null}

                {isManageable ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                      >
                        Cancelar convite
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O convite para {invitation.email} deixará de poder ser
                          aceito.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                          Voltar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className={buttonVariants({
                            variant: 'destructive',
                          })}
                          disabled={isPending}
                          onClick={() => onCancel(invitation)}
                        >
                          Cancelar convite
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}

                {isArchivable ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                      >
                        Remover do histórico
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remover convite do histórico?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esse convite será ocultado da lista, mas o registro
                          poderá permanecer para auditoria.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className={buttonVariants({
                            variant: 'destructive',
                          })}
                          disabled={isPending}
                          onClick={() => onArchive(invitation)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            </article>
          )
        })}
      </CardContent>
    </Card>
  )
}

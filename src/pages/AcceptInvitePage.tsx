import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiContractError, ApiError } from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { AcceptInviteForm } from '@/features/team/components/AcceptInviteForm'
import {
  useAcceptInviteMutation,
  useInviteDetailsQuery,
} from '@/features/team/hooks/useTeam'
import type {
  AcceptInvitePayload,
  AcceptInviteResponse,
} from '@/features/team/types/team.type'

function getInviteErrorMessage(error: unknown) {
  if (error instanceof ApiContractError) {
    return 'A API retornou uma resposta inesperada.'
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Confira os dados informados e tente novamente.'
    }

    if (error.status === 404 || error.status === 410) {
      return 'Este convite é inválido ou expirou.'
    }

    if (error.status === 409) {
      return 'Este e-mail já está cadastrado ou vinculado.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
    }
  }

  return 'Não foi possível aceitar o convite. Tente novamente.'
}

export function AcceptInvitePage() {
  const { token = '' } = useParams()
  const inviteDetailsQuery = useInviteDetailsQuery(token)
  const acceptInviteMutation = useAcceptInviteMutation()
  const [formError, setFormError] = useState<string | null>(null)
  const [acceptedInvite, setAcceptedInvite] =
    useState<AcceptInviteResponse | null>(null)

  async function handleAccept(payload: AcceptInvitePayload) {
    setFormError(null)

    try {
      const response = await acceptInviteMutation.mutateAsync({ payload, token })
      setAcceptedInvite(response)
    } catch (error) {
      setFormError(getInviteErrorMessage(error))
      throw error
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Marcaí
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Aceitar convite
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie sua senha para acessar a equipe da barbearia.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {inviteDetailsQuery.data?.businessName ?? 'Convite'}
            </CardTitle>
            <CardDescription>
              {inviteDetailsQuery.data
                ? `Convite para ${inviteDetailsQuery.data.email}`
                : 'Validando convite...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inviteDetailsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando convite...</p>
            ) : null}

            {inviteDetailsQuery.isError ? (
              <Alert className="border-destructive/50 text-destructive">
                <AlertDescription>
                  {getInviteErrorMessage(inviteDetailsQuery.error)}
                </AlertDescription>
              </Alert>
            ) : null}

            {acceptedInvite ? (
              <div className="grid gap-4">
                <Alert>
                  <AlertDescription>{acceptedInvite.message}</AlertDescription>
                </Alert>
                <Button asChild>
                  <Link to="/login">Ir para login</Link>
                </Button>
              </div>
            ) : null}

            {inviteDetailsQuery.data && !acceptedInvite ? (
              <AcceptInviteForm
                error={formError}
                initialName={inviteDetailsQuery.data.name}
                isSubmitting={acceptInviteMutation.isPending}
                onAccept={handleAccept}
              />
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

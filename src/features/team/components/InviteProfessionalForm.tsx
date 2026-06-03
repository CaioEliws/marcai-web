import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { getApiFieldErrors } from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { inviteProfessionalPayloadSchema } from '../schemas/team.schema'
import type {
  InviteProfessionalPayload,
  TeamInvitation,
} from '../types/team.type'

type InviteFieldErrors = Partial<Record<'email' | 'name', string>>

type InviteProfessionalFormProps = {
  error: string | null
  isSubmitting: boolean
  onInvite: (payload: InviteProfessionalPayload) => Promise<TeamInvitation>
}

function getZodFieldErrors(error: z.ZodError) {
  const fieldErrors: InviteFieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (field === 'email' || field === 'name') {
      fieldErrors[field] = issue.message
    }
  }

  return fieldErrors
}

export function InviteProfessionalForm({
  error,
  isSubmitting,
  onInvite,
}: InviteProfessionalFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<InviteFieldErrors>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    const parsedPayload = inviteProfessionalPayloadSchema.safeParse({
      email,
      name,
    })

    if (!parsedPayload.success) {
      setFieldErrors(getZodFieldErrors(parsedPayload.error))
      return
    }

    try {
      await onInvite(parsedPayload.data)
      setEmail('')
      setName('')
    } catch (submitError) {
      setFieldErrors(getApiFieldErrors(submitError, ['email', 'name'] as const))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convidar profissional</CardTitle>
        <CardDescription>
          Envie um convite para um funcionário acessar a agenda da barbearia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {error ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team-invite-name">Nome</Label>
              <Input
                id="team-invite-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSubmitting}
                autoComplete="name"
              />
              {fieldErrors.name ? (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-invite-email">E-mail</Label>
              <Input
                id="team-invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
              />
              {fieldErrors.email ? (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>
          </div>

          <Button type="submit" className="sm:w-fit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar convite'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { getApiFieldErrors } from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { acceptInvitePayloadSchema } from '../schemas/team.schema'
import type { AcceptInvitePayload } from '../types/team.type'

type AcceptInviteFieldErrors = Partial<
  Record<'confirmPassword' | 'name' | 'password', string>
>

type AcceptInviteFormProps = {
  error: string | null
  initialName: string
  isSubmitting: boolean
  onAccept: (payload: AcceptInvitePayload) => Promise<void>
}

function getZodFieldErrors(error: z.ZodError) {
  const fieldErrors: AcceptInviteFieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field === 'confirmPassword' ||
      field === 'name' ||
      field === 'password'
    ) {
      fieldErrors[field] = issue.message
    }
  }

  return fieldErrors
}

export function AcceptInviteForm({
  error,
  initialName,
  isSubmitting,
  onAccept,
}: AcceptInviteFormProps) {
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState(initialName)
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<AcceptInviteFieldErrors>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    const parsedPayload = acceptInvitePayloadSchema.safeParse({
      confirmPassword,
      name,
      password,
    })

    if (!parsedPayload.success) {
      setFieldErrors(getZodFieldErrors(parsedPayload.error))
      return
    }

    try {
      await onAccept(parsedPayload.data)
    } catch (submitError) {
      setFieldErrors(
        getApiFieldErrors(submitError, [
          'confirmPassword',
          'name',
          'password',
        ] as const),
      )
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      {error ? (
        <Alert className="border-destructive/50 text-destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="invite-name">Nome</Label>
        <Input
          id="invite-name"
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
        <Label htmlFor="invite-password">Senha</Label>
        <Input
          id="invite-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {fieldErrors.password ? (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-confirm-password">Confirmar senha</Label>
        <Input
          id="invite-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isSubmitting}
          autoComplete="new-password"
        />
        {fieldErrors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Aceitando...' : 'Aceitar convite'}
      </Button>
    </form>
  )
}

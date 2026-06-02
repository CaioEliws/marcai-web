import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
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
import { updateAccountProfileSchema } from '../schemas/account.schema'
import type {
  AccountProfile,
  UpdateAccountProfilePayload,
} from '../types/account.type'

export type ProfileFormFieldErrors = Partial<Record<'email' | 'name', string>>

type ProfileFormProps = {
  apiFieldErrors: ProfileFormFieldErrors
  error: string | null
  isSubmitting: boolean
  onSubmit: (payload: UpdateAccountProfilePayload) => Promise<void>
  profile: AccountProfile
}

export function ProfileForm({
  apiFieldErrors,
  error,
  isSubmitting,
  onSubmit,
  profile,
}: ProfileFormProps) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [fieldErrors, setFieldErrors] = useState<ProfileFormFieldErrors>({})
  const visibleFieldErrors = { ...apiFieldErrors, ...fieldErrors }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    const parsedPayload = updateAccountProfileSchema.safeParse({
      email,
      name,
    })

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors
      setFieldErrors({
        email: errors.email?.[0],
        name: errors.name?.[0],
      })
      return
    }

    await onSubmit(parsedPayload.data)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Dados do perfil</CardTitle>
            <CardDescription>
              Atualize nome e e-mail usados na sua conta.
            </CardDescription>
          </div>
          <Badge variant="secondary">{profile.role}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {error ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    name: undefined,
                  }))
                }}
                autoComplete="name"
                aria-invalid={Boolean(visibleFieldErrors.name)}
                aria-describedby={
                  visibleFieldErrors.name ? 'profile-name-error' : undefined
                }
                disabled={isSubmitting}
                maxLength={120}
              />
              {visibleFieldErrors.name ? (
                <p id="profile-name-error" className="text-sm text-destructive">
                  {visibleFieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    email: undefined,
                  }))
                }}
                autoComplete="email"
                aria-invalid={Boolean(visibleFieldErrors.email)}
                aria-describedby={
                  visibleFieldErrors.email ? 'profile-email-error' : undefined
                }
                disabled={isSubmitting}
              />
              {visibleFieldErrors.email ? (
                <p id="profile-email-error" className="text-sm text-destructive">
                  {visibleFieldErrors.email}
                </p>
              ) : null}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
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
import { updatePasswordSchema } from '../schemas/account.schema'
import type { UpdatePasswordPayload } from '../types/account.type'

export type PasswordFormFieldErrors = Partial<
  Record<'confirmPassword' | 'currentPassword' | 'newPassword', string>
>

type PasswordFormProps = {
  apiFieldErrors: PasswordFormFieldErrors
  error: string | null
  isSubmitting: boolean
  onSubmit: (payload: UpdatePasswordPayload) => Promise<void>
  successMessage: string | null
}

export function PasswordForm({
  apiFieldErrors,
  error,
  isSubmitting,
  onSubmit,
  successMessage,
}: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<PasswordFormFieldErrors>({})
  const visibleFieldErrors = { ...apiFieldErrors, ...fieldErrors }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    const parsedPayload = updatePasswordSchema.safeParse({
      confirmPassword,
      currentPassword,
      newPassword,
    })

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors
      setFieldErrors({
        confirmPassword: errors.confirmPassword?.[0],
        currentPassword: errors.currentPassword?.[0],
        newPassword: errors.newPassword?.[0],
      })
      return
    }

    await onSubmit(parsedPayload.data)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar senha</CardTitle>
        <CardDescription>
          Use uma senha nova com pelo menos 8 caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {error ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {successMessage ? (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value)
                setFieldErrors((currentErrors) => ({
                  ...currentErrors,
                  currentPassword: undefined,
                }))
              }}
              autoComplete="current-password"
              aria-invalid={Boolean(visibleFieldErrors.currentPassword)}
              aria-describedby={
                visibleFieldErrors.currentPassword
                  ? 'current-password-error'
                  : undefined
              }
              disabled={isSubmitting}
            />
            {visibleFieldErrors.currentPassword ? (
              <p
                id="current-password-error"
                className="text-sm text-destructive"
              >
                {visibleFieldErrors.currentPassword}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    newPassword: undefined,
                  }))
                }}
                autoComplete="new-password"
                aria-invalid={Boolean(visibleFieldErrors.newPassword)}
                aria-describedby={
                  visibleFieldErrors.newPassword
                    ? 'new-password-error'
                    : undefined
                }
                disabled={isSubmitting}
              />
              {visibleFieldErrors.newPassword ? (
                <p id="new-password-error" className="text-sm text-destructive">
                  {visibleFieldErrors.newPassword}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    confirmPassword: undefined,
                  }))
                }}
                autoComplete="new-password"
                aria-invalid={Boolean(visibleFieldErrors.confirmPassword)}
                aria-describedby={
                  visibleFieldErrors.confirmPassword
                    ? 'confirm-password-error'
                    : undefined
                }
                disabled={isSubmitting}
              />
              {visibleFieldErrors.confirmPassword ? (
                <p
                  id="confirm-password-error"
                  className="text-sm text-destructive"
                >
                  {visibleFieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

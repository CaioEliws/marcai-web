import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '@/shared/api/httpClient'
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
import { useLoginMutation, useSessionQuery } from '@/features/auth/hooks/useAuth'
import { loginPayloadSchema } from '@/features/auth/schemas/auth.schema'

type FieldErrors = Partial<Record<'email' | 'password', string>>

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'E-mail ou senha inválidos.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Tente novamente mais tarde.'
    }
  }

  return 'Não foi possível entrar. Tente novamente em instantes.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const sessionQuery = useSessionQuery()
  const loginMutation = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const parsedPayload = loginPayloadSchema.safeParse({ email, password })

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors

      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      })
      return
    }

    try {
      await loginMutation.mutateAsync(parsedPayload.data)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(getLoginErrorMessage(error))
    }
  }

  const isSubmitting = loginMutation.isPending

  if (sessionQuery.isSuccess) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Marcaí
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Entrar na sua conta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse sua agenda, serviços e disponibilidade.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Use o e-mail cadastrado para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {formError ? (
                <Alert className="border-destructive/50 text-destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'email-error' : undefined
                  }
                  disabled={isSubmitting}
                />
                {fieldErrors.email ? (
                  <p id="email-error" className="text-sm text-destructive">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'password-error' : undefined
                  }
                  disabled={isSubmitting}
                />
                {fieldErrors.password ? (
                  <p id="password-error" className="text-sm text-destructive">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError, getApiFieldErrors } from '@/shared/api/httpClient'
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
import {
  useRegisterMutation,
  useSessionQuery,
} from '@/features/auth/hooks/useAuth'
import { registerPayloadSchema } from '@/features/auth/schemas/auth.schema'
import type { RegisterResponse } from '@/features/auth/types/auth.type'

type FieldErrors = Partial<
  Record<'businessName' | 'businessPhone' | 'email' | 'name' | 'password', string>
>

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function getRegisterErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Confira os dados informados e tente novamente.'
    }

    if (error.status === 409) {
      return 'Já existe uma conta ou empresa com esses dados.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Tente novamente mais tarde.'
    }
  }

  return 'Não foi possível criar a conta. Tente novamente em instantes.'
}

export function RegisterPage() {
  const sessionQuery = useSessionQuery()
  const registerMutation = useRegisterMutation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [createdAccount, setCreatedAccount] = useState<RegisterResponse | null>(
    null,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setCreatedAccount(null)

    const parsedPayload = registerPayloadSchema.safeParse({
      businessName,
      businessPhone: digitsOnly(businessPhone),
      email,
      name,
      password,
    })

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors

      setFieldErrors({
        businessName: errors.businessName?.[0],
        businessPhone: errors.businessPhone?.[0],
        email: errors.email?.[0],
        name: errors.name?.[0],
        password: errors.password?.[0],
      })
      return
    }

    try {
      const response = await registerMutation.mutateAsync(parsedPayload.data)
      setCreatedAccount(response)
      setName('')
      setEmail('')
      setPassword('')
      setBusinessName('')
      setBusinessPhone('')
    } catch (error) {
      const apiFieldErrors = getApiFieldErrors(error, [
        'businessName',
        'businessPhone',
        'email',
        'name',
        'password',
      ] as const)

      setFieldErrors(apiFieldErrors)
      setFormError(getRegisterErrorMessage(error))
    }
  }

  const isSubmitting = registerMutation.isPending

  if (sessionQuery.isSuccess) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Marcaí
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Criar conta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre sua barbearia para receber agendamentos online.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Informe seus dados e os dados básicos da empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {createdAccount ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    {createdAccount.message} Seu link público será{' '}
                    <strong>/{createdAccount.slug}</strong>.
                  </AlertDescription>
                </Alert>

                <Button asChild className="w-full">
                  <Link to="/login">Ir para login</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {formError ? (
                  <Alert className="border-destructive/50 text-destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={
                      fieldErrors.name ? 'name-error' : undefined
                    }
                    disabled={isSubmitting}
                  />
                  {fieldErrors.name ? (
                    <p id="name-error" className="text-sm text-destructive">
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>

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
                    autoComplete="new-password"
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

                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome da barbearia</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    autoComplete="organization"
                    aria-invalid={Boolean(fieldErrors.businessName)}
                    aria-describedby={
                      fieldErrors.businessName
                        ? 'business-name-error'
                        : undefined
                    }
                    disabled={isSubmitting}
                  />
                  {fieldErrors.businessName ? (
                    <p
                      id="business-name-error"
                      className="text-sm text-destructive"
                    >
                      {fieldErrors.businessName}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Telefone da barbearia</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={businessPhone}
                    onChange={(event) => setBusinessPhone(event.target.value)}
                    autoComplete="tel"
                    aria-invalid={Boolean(fieldErrors.businessPhone)}
                    aria-describedby={
                      fieldErrors.businessPhone
                        ? 'business-phone-error'
                        : undefined
                    }
                    disabled={isSubmitting}
                  />
                  {fieldErrors.businessPhone ? (
                    <p
                      id="business-phone-error"
                      className="text-sm text-destructive"
                    >
                      {fieldErrors.businessPhone}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link className="font-medium text-primary hover:underline" to="/login">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  )
}

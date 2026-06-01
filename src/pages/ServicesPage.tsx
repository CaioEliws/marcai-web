import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiContractError, ApiError } from '@/shared/api/httpClient'
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
import { Textarea } from '@/shared/components/ui/textarea'
import {
  useCreateServiceMutation,
  useDisableServiceMutation,
  useEnableServiceMutation,
  useServicesQuery,
} from '@/features/services/hooks/useServices'
import { createServiceSchema } from '@/features/services/schemas/service.schema'
import type { Service } from '@/features/services/types/service.type'

type FieldErrors = Partial<
  Record<'name' | 'description' | 'price' | 'durationMinutes', string>
>

function formatPrice(price: number | null) {
  if (price === null) {
    return 'Sem preço'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Revise os dados informados e tente novamente.'
    }

    if (error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.'
    }

    if (error.status === 403) {
      return 'Você não tem permissão para executar esta ação.'
    }

    if (error.status === 404) {
      return 'Serviço não encontrado ou indisponível.'
    }

    if (error.status === 409) {
      return 'Não foi possível concluir a ação por conflito com os dados atuais.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.'
    }
  }

  if (error instanceof ApiContractError) {
    return 'A API retornou uma resposta inesperada. Atualize a página e tente novamente.'
  }

  return 'Não foi possível concluir a ação. Tente novamente em instantes.'
}

function parseOptionalPrice(value: string) {
  const compactValue = value.trim().replace(/\s/g, '')

  if (!compactValue) {
    return null
  }

  const normalizedValue = compactValue.includes(',')
    ? compactValue.replace(/\./g, '').replace(',', '.')
    : compactValue

  if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
    return Number.NaN
  }

  const parsedValue = Number(normalizedValue)
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
}

function parseDuration(value: string) {
  const normalizedValue = value.trim()

  if (!/^\d+$/.test(normalizedValue)) {
    return Number.NaN
  }

  const parsedValue = Number(normalizedValue)
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
}

function getValidationMessage(
  field: keyof FieldErrors,
  message: string | undefined,
) {
  if (!message) {
    return undefined
  }

  if (field === 'name') {
    return 'Informe um nome entre 2 e 120 caracteres.'
  }

  if (field === 'description') {
    return 'A descrição deve ter no máximo 500 caracteres.'
  }

  if (field === 'price') {
    return 'Informe um preço válido, como 120,00, ou deixe em branco.'
  }

  if (field === 'durationMinutes') {
    return 'Informe uma duração em minutos entre 1 e 720.'
  }

  return message
}

function getRequiredValidationMessage(field: keyof FieldErrors) {
  return getValidationMessage(field, 'invalid') ?? 'Campo inválido.'
}

export function ServicesPage() {
  const servicesQuery = useServicesQuery()
  const createServiceMutation = useCreateServiceMutation()
  const disableServiceMutation = useDisableServiceMutation()
  const enableServiceMutation = useEnableServiceMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null)

  async function handleCreateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)

    const parsedPrice = parseOptionalPrice(price)
    const parsedDuration = parseDuration(durationMinutes)
    const localErrors: FieldErrors = {}

    if (Number.isNaN(parsedPrice)) {
      localErrors.price = getRequiredValidationMessage('price')
    }

    if (Number.isNaN(parsedDuration)) {
      localErrors.durationMinutes =
        getRequiredValidationMessage('durationMinutes')
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors)
      return
    }

    const payload = {
      name,
      description: description.trim() ? description : null,
      price: parsedPrice,
      durationMinutes: parsedDuration,
    }

    const parsedPayload = createServiceSchema.safeParse(payload)

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors

      setFieldErrors({
        name: getValidationMessage('name', errors.name?.[0]),
        description: getValidationMessage(
          'description',
          errors.description?.[0],
        ),
        price: getValidationMessage('price', errors.price?.[0]),
        durationMinutes: getValidationMessage(
          'durationMinutes',
          errors.durationMinutes?.[0],
        ),
      })
      return
    }

    try {
      await createServiceMutation.mutateAsync(parsedPayload.data)
      setName('')
      setDescription('')
      setPrice('')
      setDurationMinutes('')
    } catch (error) {
      setFormError(getSafeErrorMessage(error))
    }
  }

  async function handleToggleService(service: Service) {
    setActionError(null)
    setPendingServiceId(service.id)

    try {
      if (service.active) {
        await disableServiceMutation.mutateAsync(service.id)
      } else {
        await enableServiceMutation.mutateAsync(service.id)
      }
    } catch (error) {
      setActionError(getSafeErrorMessage(error))
    } finally {
      setPendingServiceId(null)
    }
  }

  const isCreating = createServiceMutation.isPending
  const services = servicesQuery.data ?? []
  const hasServices = services.length > 0

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Serviços</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Configure os serviços disponíveis para agendamento e mantenha a lista
          pública sempre atualizada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo serviço</CardTitle>
          <CardDescription>
            Cadastre um serviço com duração e preço opcional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleCreateService} noValidate>
            {formError ? (
              <Alert className="border-destructive/50 text-destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="service-name">Nome</Label>
                <Input
                  id="service-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? 'service-name-error' : undefined
                  }
                  disabled={isCreating}
                />
                {fieldErrors.name ? (
                  <p id="service-name-error" className="text-sm text-destructive">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-duration">Duração em minutos</Label>
                <Input
                  id="service-duration"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={720}
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.durationMinutes)}
                  aria-describedby={
                    fieldErrors.durationMinutes
                      ? 'service-duration-error'
                      : undefined
                  }
                  disabled={isCreating}
                />
                {fieldErrors.durationMinutes ? (
                  <p
                    id="service-duration-error"
                    className="text-sm text-destructive"
                  >
                    {fieldErrors.durationMinutes}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <div className="space-y-2">
                <Label htmlFor="service-description">Descrição</Label>
                <Textarea
                  id="service-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={
                    fieldErrors.description
                      ? 'service-description-error'
                      : undefined
                  }
                  disabled={isCreating}
                />
                {fieldErrors.description ? (
                  <p
                    id="service-description-error"
                    className="text-sm text-destructive"
                  >
                    {fieldErrors.description}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-price">Preço opcional</Label>
                <Input
                  id="service-price"
                  type="text"
                  inputMode="decimal"
                  placeholder="120,00"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.price)}
                  aria-describedby={
                    fieldErrors.price ? 'service-price-error' : undefined
                  }
                  disabled={isCreating}
                />
                {fieldErrors.price ? (
                  <p id="service-price-error" className="text-sm text-destructive">
                    {fieldErrors.price}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Salvando...' : 'Criar serviço'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços cadastrados</CardTitle>
          <CardDescription>
            Ative ou desative serviços sem removê-los do histórico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actionError ? (
            <Alert className="mb-4 border-destructive/50 text-destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          ) : null}

          {servicesQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Carregando serviços...</p>
          ) : null}

          {servicesQuery.isError && !hasServices ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>
                Não foi possível carregar os serviços. Tente novamente em
                instantes.
              </AlertDescription>
            </Alert>
          ) : null}

          {servicesQuery.isSuccess && !hasServices ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="font-medium">Nenhum serviço cadastrado.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crie o primeiro serviço para começar a configurar sua agenda.
              </p>
            </div>
          ) : null}

          {hasServices ? (
            <div className="grid gap-3">
              {services.map((service) => {
                const isPending = pendingServiceId === service.id

                return (
                  <article
                    key={service.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium">{service.name}</h2>
                        <Badge variant={service.active ? 'default' : 'secondary'}>
                          {service.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {service.description || 'Sem descrição'}
                      </p>
                      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Preço</dt>
                          <dd className="font-medium">
                            {formatPrice(service.price)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Duração</dt>
                          <dd className="font-medium">
                            {service.durationMinutes} min
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <Button
                      type="button"
                      variant={service.active ? 'outline' : 'secondary'}
                      onClick={() => void handleToggleService(service)}
                      disabled={isPending}
                    >
                      {isPending
                        ? 'Atualizando...'
                        : service.active
                          ? 'Desativar'
                          : 'Ativar'}
                    </Button>
                  </article>
                )
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}

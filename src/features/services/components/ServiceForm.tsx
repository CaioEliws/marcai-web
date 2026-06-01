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
import { Textarea } from '@/shared/components/ui/textarea'
import { createServiceSchema } from '../schemas/service.schema'
import type { Service } from '../types/service.type'
import {
  formatPriceInput,
  getRequiredValidationMessage,
  getValidationMessage,
  parseDuration,
  parseOptionalPrice,
} from './serviceFormUtils'
import type { ServiceFormFieldErrors, ServiceFormValues } from './serviceFormUtils'

type ServiceFormProps = {
  error: string | null
  initialService: Service | null
  isSubmitting: boolean
  onCancelEdit: () => void
  onSubmit: (values: ServiceFormValues) => Promise<void>
}

function getInitialValues(service: Service | null) {
  return {
    description: service?.description ?? '',
    durationMinutes: service ? String(service.durationMinutes) : '',
    name: service?.name ?? '',
    price: service ? formatPriceInput(service.price) : '',
  }
}

export function ServiceForm({
  error,
  initialService,
  isSubmitting,
  onCancelEdit,
  onSubmit,
}: ServiceFormProps) {
  const initialValues = getInitialValues(initialService)
  const [name, setName] = useState(initialValues.name)
  const [description, setDescription] = useState(initialValues.description)
  const [price, setPrice] = useState(initialValues.price)
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues.durationMinutes,
  )
  const [fieldErrors, setFieldErrors] = useState<ServiceFormFieldErrors>({})
  const isEditing = initialService !== null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})

    const parsedPrice = parseOptionalPrice(price)
    const parsedDuration = parseDuration(durationMinutes)
    const localErrors: ServiceFormFieldErrors = {}

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
      description: description.trim() ? description : null,
      durationMinutes: parsedDuration,
      name,
      price: parsedPrice,
    }

    const parsedPayload = createServiceSchema.safeParse(payload)

    if (!parsedPayload.success) {
      const errors = parsedPayload.error.flatten().fieldErrors

      setFieldErrors({
        description: getValidationMessage(
          'description',
          errors.description?.[0],
        ),
        durationMinutes: getValidationMessage(
          'durationMinutes',
          errors.durationMinutes?.[0],
        ),
        name: getValidationMessage('name', errors.name?.[0]),
        price: getValidationMessage('price', errors.price?.[0]),
      })
      return
    }

    await onSubmit(parsedPayload.data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar serviço' : 'Novo serviço'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Atualize os dados do serviço selecionado.'
            : 'Cadastre um serviço com duração e preço opcional.'}
        </CardDescription>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {fieldErrors.price ? (
                <p id="service-price-error" className="text-sm text-destructive">
                  {fieldErrors.price}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSubmitting}
              >
                Cancelar edição
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Criar serviço'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

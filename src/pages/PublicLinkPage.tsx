import { useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
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
import {
  useCurrentBusinessQuery,
  useUpdateBusinessMutation,
} from '@/features/business/hooks/useBusiness'
import { businessSlugSchema } from '@/features/business/schemas/business.schema'
import type { Business } from '@/features/business/types/business.type'

function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.'
    }

    if (error.status === 403) {
      return 'Você não tem permissão para acessar os dados da empresa.'
    }

    if (error.status === 404) {
      return 'Empresa não encontrada para esta conta.'
    }

    if (error.status === 400) {
      return 'Revise o slug informado e tente novamente.'
    }

    if (error.status === 409) {
      return 'Este slug já está em uso. Escolha outro.'
    }
  }

  if (error instanceof ApiContractError) {
    return 'A API retornou dados da empresa em um formato inesperado.'
  }

  return 'Não foi possível carregar o link público. Tente novamente em instantes.'
}

function getSlugValidationMessage() {
  return 'Use 3 a 80 caracteres: letras minúsculas, números e hífen, sem espaços, acentos ou hífen no início/fim.'
}

function toUpdatePayload(business: Business, slug: string) {
  return {
    address: business.address,
    city: business.city,
    description: business.description,
    name: business.name,
    phone: business.phone,
    slug,
    state: business.state,
  }
}

export function PublicLinkPage() {
  const businessQuery = useCurrentBusinessQuery()
  const updateBusinessMutation = useUpdateBusinessMutation()
  const inputRef = useRef<HTMLInputElement>(null)
  const slugInputRef = useRef<HTMLInputElement>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [isEditingSlug, setIsEditingSlug] = useState(false)
  const [slugDraft, setSlugDraft] = useState('')
  const [slugError, setSlugError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const business = businessQuery.data
  const previewSlug = business
    ? isEditingSlug
      ? slugDraft
      : business.slug
    : ''
  const publicLink = previewSlug ? `${window.location.origin}/${previewSlug}` : ''

  function handleStartEditingSlug() {
    if (!business) {
      return
    }

    setSlugDraft(business.slug)
    setSlugError(null)
    setSaveMessage(null)
    setCopyMessage(null)
    setIsEditingSlug(true)
  }

  function handleCancelEditingSlug() {
    setSlugDraft('')
    setSlugError(null)
    setIsEditingSlug(false)
  }

  async function handleSaveSlug() {
    if (!business) {
      return
    }

    setSlugError(null)
    setSaveMessage(null)

    const parsedSlug = businessSlugSchema.safeParse(slugDraft)

    if (!parsedSlug.success) {
      setSlugError(getSlugValidationMessage())
      return
    }

    try {
      await updateBusinessMutation.mutateAsync(
        toUpdatePayload(business, parsedSlug.data),
      )
      setSlugDraft('')
      setIsEditingSlug(false)
      setSaveMessage('Slug atualizado com sucesso.')
    } catch (error) {
      setSlugError(getSafeErrorMessage(error))
    }
  }

  async function handleCopyLink() {
    setCopyMessage(null)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicLink)
        setCopyMessage('Link copiado.')
        return
      }

      inputRef.current?.select()
      const copied = document.execCommand('copy')
      setCopyMessage(
        copied
          ? 'Link copiado.'
          : 'Não foi possível copiar automaticamente. Selecione e copie o link.',
      )
    } catch {
      inputRef.current?.select()
      setCopyMessage(
        'Não foi possível copiar automaticamente. Selecione e copie o link.',
      )
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Link público
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Compartilhe este link para seus clientes agendarem online.
        </p>
      </div>

      {businessQuery.isPending ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Carregando link público...
            </p>
          </CardContent>
        </Card>
      ) : null}

      {businessQuery.isError ? (
        <Alert className="border-destructive/50 text-destructive">
          <AlertDescription>
            {getSafeErrorMessage(businessQuery.error)}
          </AlertDescription>
        </Alert>
      ) : null}

      {businessQuery.isSuccess && !business ? (
        <Alert>
          <AlertDescription>
            Nenhuma empresa foi encontrada para esta conta.
          </AlertDescription>
        </Alert>
      ) : null}

      {business ? (
        <>
          {saveMessage ? (
            <Alert>
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          ) : null}

          {!business.active ? (
            <Alert className="border-destructive/50 text-destructive">
              <AlertDescription>
                Esta empresa está inativa. O link pode não estar disponível
                publicamente.
              </AlertDescription>
            </Alert>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{business.name}</CardTitle>
                <Badge variant={business.active ? 'default' : 'secondary'}>
                  {business.active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <CardDescription>
                Clientes não precisam fazer login para acessar este link.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="business-slug">Slug</Label>
                <Input
                  ref={slugInputRef}
                  id="business-slug"
                  value={previewSlug}
                  onChange={(event) => {
                    setSlugDraft(event.target.value)
                    setSlugError(null)
                    setSaveMessage(null)
                  }}
                  readOnly={!isEditingSlug}
                  aria-invalid={Boolean(slugError)}
                  aria-describedby={
                    slugError ? 'business-slug-error' : 'business-slug-help'
                  }
                  className="font-mono text-sm"
                  maxLength={80}
                />
                <p id="business-slug-help" className="text-sm text-muted-foreground">
                  Alterar o slug muda o link público e pode quebrar links antigos
                  já compartilhados.
                </p>
                {slugError ? (
                  <p id="business-slug-error" className="text-sm text-destructive">
                    {slugError}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row">
                  {isEditingSlug ? (
                    <>
                      <Button
                        type="button"
                        onClick={() => void handleSaveSlug()}
                        disabled={updateBusinessMutation.isPending}
                      >
                        {updateBusinessMutation.isPending
                          ? 'Salvando...'
                          : 'Salvar'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEditingSlug}
                        disabled={updateBusinessMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={handleStartEditingSlug}>
                      Editar slug
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="public-link">Link público completo</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    ref={inputRef}
                    id="public-link"
                    value={publicLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button type="button" onClick={() => void handleCopyLink()}>
                    Copiar link
                  </Button>
                </div>
                {copyMessage ? (
                  <p className="text-sm text-muted-foreground">{copyMessage}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline">
                  <a href={publicLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Abrir página pública
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </section>
  )
}

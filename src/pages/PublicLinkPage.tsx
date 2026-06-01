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
import { useCurrentBusinessQuery } from '@/features/business/hooks/useBusiness'

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
  }

  if (error instanceof ApiContractError) {
    return 'A API retornou dados da empresa em um formato inesperado.'
  }

  return 'Não foi possível carregar o link público. Tente novamente em instantes.'
}

export function PublicLinkPage() {
  const businessQuery = useCurrentBusinessQuery()
  const inputRef = useRef<HTMLInputElement>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const business = businessQuery.data
  const publicLink = business ? `${window.location.origin}/${business.slug}` : ''

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
                <Label>Slug</Label>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  {business.slug}
                </p>
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

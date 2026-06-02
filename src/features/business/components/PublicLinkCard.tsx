import { useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
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
import type { Business } from '../types/business.type'

type PublicLinkCardProps = {
  business: Business
  isEditingSlug: boolean
  isSavingSlug: boolean
  onCancelEditingSlug: () => void
  onSaveSlug: () => void
  onSlugChange: (slug: string) => void
  onStartEditingSlug: () => void
  previewSlug: string
  publicLink: string
  slugError: string | null
}

export function PublicLinkCard({
  business,
  isEditingSlug,
  isSavingSlug,
  onCancelEditingSlug,
  onSaveSlug,
  onSlugChange,
  onStartEditingSlug,
  previewSlug,
  publicLink,
  slugError,
}: PublicLinkCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

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
            <Label htmlFor="business-slug">Slug</Label>
            <Input
              id="business-slug"
              value={previewSlug}
              onChange={(event) => onSlugChange(event.target.value)}
              readOnly={!isEditingSlug}
              aria-invalid={Boolean(slugError)}
              aria-describedby={
                slugError ? 'business-slug-error' : 'business-slug-help'
              }
              className="font-mono text-sm"
              maxLength={80}
            />
            <p id="business-slug-help" className="text-sm text-muted-foreground">
              Alterar o slug muda o link público e pode quebrar links antigos já
              compartilhados.
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
                    onClick={onSaveSlug}
                    disabled={isSavingSlug}
                  >
                    {isSavingSlug ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancelEditingSlug}
                    disabled={isSavingSlug}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={onStartEditingSlug}>
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
  )
}

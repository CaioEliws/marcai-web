import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { buttonVariants } from '@/shared/components/ui/button.variants'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { AccountProfile } from '../types/account.type'
import {
  getAccountInitials,
  getAvatarValidationMessage,
} from './accountAvatarUtils'

type AvatarUploaderProps = {
  error: string | null
  isDeleting: boolean
  isUploading: boolean
  onDelete: () => Promise<void>
  onUpload: (file: File) => Promise<void>
  profile: AccountProfile
  successMessage: string | null
}

export function AvatarUploader({
  error,
  isDeleting,
  isUploading,
  onDelete,
  onUpload,
  profile,
  successMessage,
}: AvatarUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFileChange(file: File | null) {
    const validationMessage = getAvatarValidationMessage(file)

    setSelectedFile(file)
    setFileError(validationMessage)
    setPreviewUrl(file && !validationMessage ? URL.createObjectURL(file) : null)
  }

  async function handleUpload() {
    const validationMessage = getAvatarValidationMessage(selectedFile)

    if (validationMessage || !selectedFile) {
      setFileError(validationMessage)
      return
    }

    await onUpload(selectedFile)
    setSelectedFile(null)
    setFileError(null)
  }

  const imageUrl = previewUrl ?? profile.avatarUrl
  const isBusy = isUploading || isDeleting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagem de perfil</CardTitle>
        <CardDescription>
          Use uma imagem JPG ou PNG de até 2MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted text-xl font-semibold text-muted-foreground">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Imagem de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{getAccountInitials(profile)}</span>
            )}
          </div>

          <div className="grid flex-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="avatar-file">Selecionar imagem</Label>
              <Input
                id="avatar-file"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
                disabled={isBusy}
              />
              {fileError ? (
                <p className="text-sm text-destructive">{fileError}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={() => void handleUpload()}
                disabled={isBusy || !selectedFile || Boolean(fileError)}
              >
                {isUploading ? 'Enviando...' : 'Enviar imagem'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy || !profile.avatarUrl}
                  >
                    {isDeleting ? 'Removendo...' : 'Remover imagem'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover imagem de perfil?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sua imagem atual será removida e o painel voltará a exibir
                      suas iniciais.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Voltar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className={buttonVariants({ variant: 'destructive' })}
                      disabled={isDeleting}
                      onClick={() => void onDelete()}
                    >
                      Remover imagem
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import {
  ApiContractError,
  ApiError,
  getApiFieldErrors,
} from '@/shared/api/httpClient'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { AvatarUploader } from '@/features/account/components/AvatarUploader'
import { PasswordForm } from '@/features/account/components/PasswordForm'
import type { PasswordFormFieldErrors } from '@/features/account/components/PasswordForm'
import { ProfileForm } from '@/features/account/components/ProfileForm'
import type { ProfileFormFieldErrors } from '@/features/account/components/ProfileForm'
import {
  useAccountProfileQuery,
  useDeleteAvatarMutation,
  useUpdateAccountProfileMutation,
  useUpdatePasswordMutation,
  useUploadAvatarMutation,
} from '@/features/account/hooks/useAccount'
import type {
  UpdateAccountProfilePayload,
  UpdatePasswordPayload,
} from '@/features/account/types/account.type'

function getProfileErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'Revise os dados informados e tente novamente.'
    }

    if (error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.'
    }

    if (error.status === 403) {
      return 'Você não tem permissão para alterar este perfil.'
    }

    if (error.status === 409) {
      return 'Este e-mail já está em uso.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Tente novamente mais tarde.'
    }
  }

  if (error instanceof ApiContractError) {
    return 'A API retornou uma resposta inesperada.'
  }

  return 'Não foi possível salvar o perfil. Tente novamente em instantes.'
}

function getPasswordErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 403) {
      return 'Confira a senha atual e tente novamente.'
    }

    if (error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Tente novamente mais tarde.'
    }
  }

  return 'Não foi possível alterar a senha. Tente novamente em instantes.'
}

function getAvatarErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 415) {
      return 'Envie uma imagem JPG ou PNG de até 2MB.'
    }

    if (error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.'
    }

    if (error.status === 403) {
      return 'Você não tem permissão para alterar esta imagem.'
    }

    if (error.status === 413) {
      return 'Envie uma imagem JPG ou PNG de até 2MB.'
    }

    if (error.status === 429) {
      return 'Muitas tentativas. Tente novamente mais tarde.'
    }
  }

  return 'Não foi possível alterar a imagem. Tente novamente em instantes.'
}

export function ProfilePage() {
  const profileQuery = useAccountProfileQuery()
  const updateProfileMutation = useUpdateAccountProfileMutation()
  const updatePasswordMutation = useUpdatePasswordMutation()
  const uploadAvatarMutation = useUploadAvatarMutation()
  const deleteAvatarMutation = useDeleteAvatarMutation()
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileFieldErrors, setProfileFieldErrors] =
    useState<ProfileFormFieldErrors>({})
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] =
    useState<PasswordFormFieldErrors>({})
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null)

  async function handleUpdateProfile(payload: UpdateAccountProfilePayload) {
    setProfileError(null)
    setProfileSuccess(null)
    setProfileFieldErrors({})

    try {
      await updateProfileMutation.mutateAsync(payload)
      setProfileSuccess('Perfil atualizado com sucesso.')
    } catch (error) {
      setProfileFieldErrors(getApiFieldErrors(error, ['email', 'name'] as const))
      setProfileError(getProfileErrorMessage(error))
    }
  }

  async function handleUpdatePassword(payload: UpdatePasswordPayload) {
    setPasswordError(null)
    setPasswordSuccess(null)
    setPasswordFieldErrors({})

    try {
      await updatePasswordMutation.mutateAsync(payload)
      setPasswordSuccess('Senha alterada com sucesso.')
    } catch (error) {
      setPasswordFieldErrors(
        getApiFieldErrors(error, [
          'confirmPassword',
          'currentPassword',
          'newPassword',
        ] as const),
      )
      setPasswordError(getPasswordErrorMessage(error))
    }
  }

  async function handleUploadAvatar(file: File) {
    setAvatarError(null)
    setAvatarSuccess(null)

    try {
      await uploadAvatarMutation.mutateAsync(file)
      setAvatarSuccess('Imagem enviada com sucesso.')
    } catch (error) {
      setAvatarError(getAvatarErrorMessage(error))
    }
  }

  async function handleDeleteAvatar() {
    setAvatarError(null)
    setAvatarSuccess(null)

    try {
      await deleteAvatarMutation.mutateAsync()
      setAvatarSuccess('Imagem removida com sucesso.')
    } catch (error) {
      setAvatarError(getAvatarErrorMessage(error))
    }
  }

  const profile = profileQuery.data

  return (
    <section className="mx-auto grid w-full max-w-4xl gap-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Perfil e segurança
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Atualize seus dados de acesso, senha e imagem de perfil.
        </p>
      </div>

      {profileQuery.isPending ? (
        <Alert>
          <AlertDescription>Carregando perfil...</AlertDescription>
        </Alert>
      ) : null}

      {profileQuery.isError ? (
        <Alert className="border-destructive/50 text-destructive">
          <AlertDescription>
            {getProfileErrorMessage(profileQuery.error)}
          </AlertDescription>
        </Alert>
      ) : null}

      {profile ? (
        <>
          <AvatarUploader
            error={avatarError}
            isDeleting={deleteAvatarMutation.isPending}
            isUploading={uploadAvatarMutation.isPending}
            onDelete={handleDeleteAvatar}
            onUpload={handleUploadAvatar}
            profile={profile}
            successMessage={avatarSuccess}
          />

          {profileSuccess ? (
            <Alert>
              <AlertDescription>{profileSuccess}</AlertDescription>
            </Alert>
          ) : null}

          <ProfileForm
            key={profile.id}
            apiFieldErrors={profileFieldErrors}
            error={profileError}
            isSubmitting={updateProfileMutation.isPending}
            onSubmit={handleUpdateProfile}
            profile={profile}
          />

          <PasswordForm
            apiFieldErrors={passwordFieldErrors}
            error={passwordError}
            isSubmitting={updatePasswordMutation.isPending}
            onSubmit={handleUpdatePassword}
            successMessage={passwordSuccess}
          />
        </>
      ) : null}
    </section>
  )
}

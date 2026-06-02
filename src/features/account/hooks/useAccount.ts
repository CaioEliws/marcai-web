import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authQueryKeys } from '@/features/auth/hooks/authQueryKeys'
import { accountApi } from '../api/accountApi'
import type {
  UpdateAccountProfilePayload,
  UpdatePasswordPayload,
} from '../types/account.type'
import { accountQueryKeys } from './accountQueryKeys'

export function useAccountProfileQuery() {
  return useQuery({
    queryKey: accountQueryKeys.profile(),
    queryFn: accountApi.getProfile,
  })
}

export function useUpdateAccountProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateAccountProfilePayload) =>
      accountApi.updateProfile(payload),
    onSuccess: async (profile) => {
      queryClient.setQueryData(accountQueryKeys.profile(), profile)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.session() }),
      ])
    },
  })
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) =>
      accountApi.updatePassword(payload),
  })
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => accountApi.uploadAvatar(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountQueryKeys.all })
    },
  })
}

export function useDeleteAvatarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: accountApi.deleteAvatar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountQueryKeys.all })
    },
  })
}

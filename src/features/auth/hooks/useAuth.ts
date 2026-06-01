import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/httpClient'
import { authApi } from '../api/authApi'
import type { LoginPayload, RegisterPayload } from '../types/auth.type'
import { authQueryKeys } from './authQueryKeys'

function isAuthStatus(error: Error, status: number) {
  return error instanceof ApiError && error.status === status
}

export function useSessionQuery() {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: authApi.getSession,
    retry: (failureCount, error) => {
      if (isAuthStatus(error, 401) || isAuthStatus(error, 403)) {
        return false
      }

      return failureCount < 1
    },
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.all })
    },
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
    },
  })
}

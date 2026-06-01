import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { businessApi } from '../api/businessApi'
import type { UpdateBusinessPayload } from '../types/business.type'
import { businessQueryKeys } from './businessQueryKeys'

export function useCurrentBusinessQuery() {
  return useQuery({
    queryKey: businessQueryKeys.current(),
    queryFn: businessApi.getCurrent,
  })
}

export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateBusinessPayload) => businessApi.update(payload),
    onSuccess: async (business) => {
      queryClient.setQueryData(businessQueryKeys.current(), business)
      await queryClient.invalidateQueries({ queryKey: businessQueryKeys.all })
    },
  })
}

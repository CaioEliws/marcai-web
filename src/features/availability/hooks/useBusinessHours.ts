import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { businessHoursApi } from '../api/businessHoursApi'
import type {
  CreateBusinessHourPayload,
  UpdateBusinessHourPayload,
} from '../types/businessHour.type'
import { businessHourQueryKeys } from './businessHourQueryKeys'

function useInvalidateBusinessHours() {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({ queryKey: businessHourQueryKeys.all })
  }
}

export function useBusinessHoursQuery() {
  return useQuery({
    queryKey: businessHourQueryKeys.lists(),
    queryFn: businessHoursApi.getAll,
  })
}

export function useActiveBusinessHoursQuery() {
  return useQuery({
    queryKey: businessHourQueryKeys.active(),
    queryFn: businessHoursApi.getActive,
  })
}

export function useBusinessHourQuery(id: string) {
  return useQuery({
    queryKey: businessHourQueryKeys.detail(id),
    queryFn: () => businessHoursApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateBusinessHourMutation() {
  const invalidateBusinessHours = useInvalidateBusinessHours()

  return useMutation({
    mutationFn: (payload: CreateBusinessHourPayload) =>
      businessHoursApi.create(payload),
    onSuccess: invalidateBusinessHours,
  })
}

export function useUpdateBusinessHourMutation() {
  const invalidateBusinessHours = useInvalidateBusinessHours()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateBusinessHourPayload
    }) => businessHoursApi.update(id, payload),
    onSuccess: invalidateBusinessHours,
  })
}

export function useDeleteBusinessHourMutation() {
  const invalidateBusinessHours = useInvalidateBusinessHours()

  return useMutation({
    mutationFn: (id: string) => businessHoursApi.delete(id),
    onSuccess: invalidateBusinessHours,
  })
}

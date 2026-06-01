import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceApi } from '../api/serviceApi'
import type {
  CreateServicePayload,
  UpdateServicePayload,
} from '../types/service.type'
import { serviceQueryKeys } from './serviceQueryKeys'

function useInvalidateServices() {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all })
  }
}

export function useServicesQuery() {
  return useQuery({
    queryKey: serviceQueryKeys.lists(),
    queryFn: serviceApi.getAll,
  })
}

export function useActiveServicesQuery() {
  return useQuery({
    queryKey: serviceQueryKeys.active(),
    queryFn: serviceApi.getActive,
  })
}

export function useServiceQuery(id: string) {
  return useQuery({
    queryKey: serviceQueryKeys.detail(id),
    queryFn: () => serviceApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useCreateServiceMutation() {
  const invalidateServices = useInvalidateServices()

  return useMutation({
    mutationFn: (payload: CreateServicePayload) => serviceApi.create(payload),
    onSuccess: invalidateServices,
  })
}

export function useUpdateServiceMutation() {
  const invalidateServices = useInvalidateServices()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateServicePayload
    }) => serviceApi.update(id, payload),
    onSuccess: invalidateServices,
  })
}

export function useDisableServiceMutation() {
  const invalidateServices = useInvalidateServices()

  return useMutation({
    mutationFn: (id: string) => serviceApi.disable(id),
    onSuccess: invalidateServices,
  })
}

export function useEnableServiceMutation() {
  const invalidateServices = useInvalidateServices()

  return useMutation({
    mutationFn: (id: string) => serviceApi.enable(id),
    onSuccess: invalidateServices,
  })
}

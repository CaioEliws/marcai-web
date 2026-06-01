import { useMutation, useQuery } from '@tanstack/react-query'
import { publicBookingApi } from '../api/publicBookingApi'
import type { CreatePublicAppointmentPayload } from '../types/publicBooking.type'
import { publicBookingQueryKeys } from './publicBookingQueryKeys'

type AvailableTimesQueryParams = {
  date: string
  serviceId: string
  slug: string
}

type CreatePublicAppointmentMutationParams = {
  payload: CreatePublicAppointmentPayload
  slug: string
}

export function usePublicBusinessQuery(slug: string) {
  return useQuery({
    queryKey: publicBookingQueryKeys.business(slug),
    queryFn: () => publicBookingApi.getBusiness(slug),
    enabled: Boolean(slug),
  })
}

export function usePublicServicesQuery(slug: string) {
  return useQuery({
    queryKey: publicBookingQueryKeys.services(slug),
    queryFn: () => publicBookingApi.getServices(slug),
    enabled: Boolean(slug),
  })
}

export function useAvailableTimesQuery({
  date,
  serviceId,
  slug,
}: AvailableTimesQueryParams) {
  return useQuery({
    queryKey: publicBookingQueryKeys.availableTimes(slug, serviceId, date),
    queryFn: () =>
      publicBookingApi.getAvailableTimes({
        date,
        serviceId,
        slug,
      }),
    enabled: Boolean(slug && serviceId && date),
  })
}

export function useCreatePublicAppointmentMutation() {
  return useMutation({
    mutationFn: ({ payload, slug }: CreatePublicAppointmentMutationParams) =>
      publicBookingApi.createAppointment(slug, payload),
  })
}

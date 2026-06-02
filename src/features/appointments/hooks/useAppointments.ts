import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi } from '../api/appointmentsApi'
import type { ManualAppointmentPayload } from '../types/appointment.type'
import { appointmentQueryKeys } from './appointmentQueryKeys'

function useInvalidateAppointments() {
  const queryClient = useQueryClient()

  return async () => {
    await queryClient.invalidateQueries({ queryKey: appointmentQueryKeys.all })
  }
}

export function useAppointmentsQuery() {
  return useQuery({
    queryKey: appointmentQueryKeys.lists(),
    queryFn: appointmentsApi.getAll,
  })
}

export function useAppointmentsByDateQuery(date: string) {
  return useQuery({
    queryKey: appointmentQueryKeys.byDate(date),
    queryFn: () => appointmentsApi.getByDate(date),
    enabled: Boolean(date),
  })
}

export function useAppointmentQuery(id: string) {
  return useQuery({
    queryKey: appointmentQueryKeys.detail(id),
    queryFn: () => appointmentsApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useDashboardAvailableTimesQuery(
  serviceId: string,
  date: string,
) {
  return useQuery({
    queryKey: appointmentQueryKeys.availableTimes(serviceId, date),
    queryFn: () => appointmentsApi.getAvailableTimes(serviceId, date),
    enabled: Boolean(serviceId && date),
  })
}

export function useCreateAppointmentMutation() {
  const invalidateAppointments = useInvalidateAppointments()

  return useMutation({
    mutationFn: (payload: ManualAppointmentPayload) =>
      appointmentsApi.create(payload),
    onSuccess: invalidateAppointments,
  })
}

export function useCancelAppointmentMutation() {
  const invalidateAppointments = useInvalidateAppointments()

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: invalidateAppointments,
  })
}

export function useCompleteAppointmentMutation() {
  const invalidateAppointments = useInvalidateAppointments()

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.complete(id),
    onSuccess: invalidateAppointments,
  })
}

export function useNoShowAppointmentMutation() {
  const invalidateAppointments = useInvalidateAppointments()

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.noShow(id),
    onSuccess: invalidateAppointments,
  })
}

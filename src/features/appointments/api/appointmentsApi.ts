import { httpClient } from '@/shared/api/httpClient'
import {
  appointmentListSchema,
  appointmentSchema,
  dashboardAvailableTimesSchema,
  manualAppointmentPayloadSchema,
} from '../schemas/appointment.schema'
import type { ManualAppointmentPayload } from '../types/appointment.type'

const appointmentsBasePath = '/api/v1/dashboard/appointments'

function buildAppointmentsByDatePath(date: string) {
  const searchParams = new URLSearchParams({ date })

  return `${appointmentsBasePath}/by-date?${searchParams.toString()}`
}

function buildAvailableTimesPath(serviceId: string, date: string) {
  const searchParams = new URLSearchParams({ date, serviceId })

  return `${appointmentsBasePath}/available-times?${searchParams.toString()}`
}

export const appointmentsApi = {
  cancel: (id: string) =>
    httpClient.patch(`${appointmentsBasePath}/${id}/cancel`, appointmentSchema),

  complete: (id: string) =>
    httpClient.patch(`${appointmentsBasePath}/${id}/complete`, appointmentSchema),

  create: (payload: ManualAppointmentPayload) =>
    httpClient.post(
      appointmentsBasePath,
      appointmentSchema,
      manualAppointmentPayloadSchema.parse(payload),
    ),

  getAll: () => httpClient.get(appointmentsBasePath, appointmentListSchema),

  getAvailableTimes: (serviceId: string, date: string) =>
    httpClient.get(
      buildAvailableTimesPath(serviceId, date),
      dashboardAvailableTimesSchema,
    ),

  getByDate: (date: string) =>
    httpClient.get(buildAppointmentsByDatePath(date), appointmentListSchema),

  getById: (id: string) =>
    httpClient.get(`${appointmentsBasePath}/${id}`, appointmentSchema),

  noShow: (id: string) =>
    httpClient.patch(`${appointmentsBasePath}/${id}/no-show`, appointmentSchema),
}

import { httpClient } from '@/shared/api/httpClient'
import {
  appointmentListSchema,
  appointmentSchema,
} from '../schemas/appointment.schema'

const appointmentsBasePath = '/api/v1/dashboard/appointments'

function buildAppointmentsByDatePath(date: string) {
  const searchParams = new URLSearchParams({ date })

  return `${appointmentsBasePath}/by-date?${searchParams.toString()}`
}

export const appointmentsApi = {
  cancel: (id: string) =>
    httpClient.patch(`${appointmentsBasePath}/${id}/cancel`, appointmentSchema),

  complete: (id: string) =>
    httpClient.patch(`${appointmentsBasePath}/${id}/complete`, appointmentSchema),

  getAll: () => httpClient.get(appointmentsBasePath, appointmentListSchema),

  getByDate: (date: string) =>
    httpClient.get(buildAppointmentsByDatePath(date), appointmentListSchema),

  getById: (id: string) =>
    httpClient.get(`${appointmentsBasePath}/${id}`, appointmentSchema),

  noShow: (id: string) =>
    httpClient.patch(`${appointmentsBasePath}/${id}/no-show`, appointmentSchema),
}

import { httpClient } from '@/shared/api/httpClient'
import {
  availableTimesSchema,
  createPublicAppointmentSchema,
  publicAppointmentSchema,
  publicBusinessSchema,
  publicServiceListSchema,
} from '../schemas/publicBooking.schema'
import type { CreatePublicAppointmentPayload } from '../types/publicBooking.type'

const publicBusinessesBasePath = '/api/v1/public/businesses'

type AvailableTimesParams = {
  date: string
  serviceId: string
  slug: string
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value)
}

function buildAvailableTimesPath({ date, serviceId, slug }: AvailableTimesParams) {
  const searchParams = new URLSearchParams({
    date,
    serviceId,
  })

  return `${publicBusinessesBasePath}/${encodePathSegment(
    slug,
  )}/available-times?${searchParams.toString()}`
}

export const publicBookingApi = {
  createAppointment: (slug: string, payload: CreatePublicAppointmentPayload) =>
    httpClient.post(
      `${publicBusinessesBasePath}/${encodePathSegment(slug)}/appointments`,
      publicAppointmentSchema,
      createPublicAppointmentSchema.parse(payload),
    ),

  getAvailableTimes: (params: AvailableTimesParams) =>
    httpClient.get(buildAvailableTimesPath(params), availableTimesSchema),

  getBusiness: (slug: string) =>
    httpClient.get(
      `${publicBusinessesBasePath}/${encodePathSegment(slug)}`,
      publicBusinessSchema,
    ),

  getServices: (slug: string) =>
    httpClient.get(
      `${publicBusinessesBasePath}/${encodePathSegment(slug)}/services`,
      publicServiceListSchema,
    ),
}

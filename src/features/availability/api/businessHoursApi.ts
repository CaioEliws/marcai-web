import { httpClient } from '@/shared/api/httpClient'
import {
  businessHourListSchema,
  businessHourSchema,
  createBusinessHourSchema,
  deleteBusinessHourResponseSchema,
  updateBusinessHourSchema,
} from '../schemas/businessHour.schema'
import type {
  CreateBusinessHourPayload,
  UpdateBusinessHourPayload,
} from '../types/businessHour.type'

const businessHoursBasePath = '/api/v1/dashboard/business-hours'

export const businessHoursApi = {
  create: (payload: CreateBusinessHourPayload) =>
    httpClient.post(
      businessHoursBasePath,
      businessHourSchema,
      createBusinessHourSchema.parse(payload),
    ),

  delete: (id: string) =>
    httpClient.delete(
      `${businessHoursBasePath}/${id}`,
      deleteBusinessHourResponseSchema,
    ),

  getActive: () =>
    httpClient.get(`${businessHoursBasePath}/active`, businessHourListSchema),

  getAll: () => httpClient.get(businessHoursBasePath, businessHourListSchema),

  getById: (id: string) =>
    httpClient.get(`${businessHoursBasePath}/${id}`, businessHourSchema),

  update: (id: string, payload: UpdateBusinessHourPayload) =>
    httpClient.put(
      `${businessHoursBasePath}/${id}`,
      businessHourSchema,
      updateBusinessHourSchema.parse(payload),
    ),
}

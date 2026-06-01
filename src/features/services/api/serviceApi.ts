import { httpClient } from '@/shared/api/httpClient'
import {
  createServiceSchema,
  serviceListSchema,
  serviceSchema,
  updateServiceSchema,
} from '../schemas/service.schema'
import type {
  CreateServicePayload,
  UpdateServicePayload,
} from '../types/service.type'

const serviceBasePath = '/api/v1/dashboard/services'

export const serviceApi = {
  create: (payload: CreateServicePayload) =>
    httpClient.post(
      serviceBasePath,
      serviceSchema,
      createServiceSchema.parse(payload),
    ),

  disable: (id: string) =>
    httpClient.patch(`${serviceBasePath}/${id}/disable`, serviceSchema),

  enable: (id: string) =>
    httpClient.patch(`${serviceBasePath}/${id}/enable`, serviceSchema),

  getActive: () => httpClient.get(`${serviceBasePath}/active`, serviceListSchema),

  getAll: () => httpClient.get(serviceBasePath, serviceListSchema),

  getById: (id: string) => httpClient.get(`${serviceBasePath}/${id}`, serviceSchema),

  update: (id: string, payload: UpdateServicePayload) =>
    httpClient.put(
      `${serviceBasePath}/${id}`,
      serviceSchema,
      updateServiceSchema.parse(payload),
    ),
}

import { httpClient } from '@/shared/api/httpClient'
import { businessSchema, updateBusinessSchema } from '../schemas/business.schema'
import type { UpdateBusinessPayload } from '../types/business.type'

const businessBasePath = '/api/v1/dashboard/business'

export const businessApi = {
  getCurrent: () => httpClient.get(businessBasePath, businessSchema),

  update: (payload: UpdateBusinessPayload) =>
    httpClient.put(
      businessBasePath,
      businessSchema,
      updateBusinessSchema.parse(payload),
    ),
}

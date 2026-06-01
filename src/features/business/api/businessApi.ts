import { httpClient } from '@/shared/api/httpClient'
import { businessSchema } from '../schemas/business.schema'

const businessBasePath = '/api/v1/dashboard/business'

export const businessApi = {
  getCurrent: () => httpClient.get(businessBasePath, businessSchema),
}

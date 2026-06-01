import { httpClient } from '@/shared/api/httpClient'
import {
  authMutationResponseSchema,
  loginPayloadSchema,
  registerPayloadSchema,
  sessionSchema,
} from '../schemas/auth.schema'
import type { LoginPayload, RegisterPayload } from '../types/auth.type'

export const authApi = {
  getSession: () => httpClient.get('/api/v1/auth/me', sessionSchema),

  login: (payload: LoginPayload) =>
    httpClient.post(
      '/api/v1/auth/login',
      authMutationResponseSchema,
      loginPayloadSchema.parse(payload),
    ),

  register: (payload: RegisterPayload) =>
    httpClient.post(
      '/api/v1/auth/register',
      authMutationResponseSchema,
      registerPayloadSchema.parse(payload),
    ),
}

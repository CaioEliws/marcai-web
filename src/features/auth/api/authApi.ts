import { httpClient } from '@/shared/api/httpClient'
import {
  loginResponseSchema,
  loginPayloadSchema,
  logoutResponseSchema,
  meResponseSchema,
  registerPayloadSchema,
  registerResponseSchema,
} from '../schemas/auth.schema'
import type { LoginPayload, RegisterPayload } from '../types/auth.type'

export const authApi = {
  getSession: () => httpClient.get('/api/v1/auth/me', meResponseSchema),

  login: (payload: LoginPayload) =>
    httpClient.post(
      '/api/v1/auth/login',
      loginResponseSchema,
      loginPayloadSchema.parse(payload),
    ),

  logout: () => httpClient.post('/api/v1/auth/logout', logoutResponseSchema),

  register: (payload: RegisterPayload) =>
    httpClient.post(
      '/api/v1/auth/register',
      registerResponseSchema,
      registerPayloadSchema.parse(payload),
    ),
}

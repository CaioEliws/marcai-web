import { z } from 'zod'
import { env } from '../config/env'

const apiErrorSchema = z.object({
  message: z.string().optional(),
})

export class ApiError extends Error {
  readonly payload: unknown
  readonly status: number

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.payload = payload
    this.status = status
  }
}

export class ApiContractError extends Error {
  readonly issues: z.ZodIssue[]
  readonly payload: unknown

  constructor(issues: z.ZodIssue[], payload: unknown) {
    super('Resposta da API fora do contrato esperado.')
    this.name = 'ApiContractError'
    this.issues = issues
    this.payload = payload
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: unknown
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError('Resposta inválida da API.', response.status, text)
  }
}

async function request<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options: RequestOptions = {},
): Promise<z.infer<TSchema>> {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(new URL(path, env.VITE_API_BASE_URL), {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: 'include',
    headers,
  })

  const payload = await parseJson(response)

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload)

    throw new ApiError(
      parsedError.data?.message ?? 'Erro ao comunicar com a API.',
      response.status,
      payload,
    )
  }

  const parsedPayload = schema.safeParse(payload)

  if (!parsedPayload.success) {
    throw new ApiContractError(parsedPayload.error.issues, payload)
  }

  return parsedPayload.data
}

export const httpClient = {
  get: <TSchema extends z.ZodType>(path: string, schema: TSchema) =>
    request(path, schema),

  post: <TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    body?: unknown,
  ) => request(path, schema, { method: 'POST', body }),

  put: <TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    body?: unknown,
  ) => request(path, schema, { method: 'PUT', body }),

  patch: <TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    body?: unknown,
  ) => request(path, schema, { method: 'PATCH', body }),

  delete: <TSchema extends z.ZodType>(path: string, schema: TSchema) =>
    request(path, schema, { method: 'DELETE' }),
}
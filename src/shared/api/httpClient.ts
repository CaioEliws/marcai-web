import { z } from 'zod'
import { env } from '../config/env'
import { getCookieValue } from '../lib/cookies'

const privateDashboardPathPrefix = '/api/v1/dashboard/'
const xsrfCookieName = 'XSRF-TOKEN'
const xsrfHeaderName = 'X-XSRF-TOKEN'
const mutableMethods = new Set(['DELETE', 'PATCH', 'POST', 'PUT'])

const apiErrorSchema = z.object({
  fieldErrors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
  message: z.string().optional(),
})

export type ApiFieldError = z.infer<typeof apiErrorSchema>['fieldErrors'] extends
  | Array<infer TFieldError>
  | undefined
  ? TFieldError
  : never

export class ApiError extends Error {
  readonly fieldErrors: ApiFieldError[]
  readonly payload: unknown
  readonly status: number

  constructor(
    message: string,
    status: number,
    payload: unknown,
    fieldErrors: ApiFieldError[] = [],
  ) {
    super(message)
    this.name = 'ApiError'
    this.fieldErrors = fieldErrors
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

export function getApiFieldError(error: unknown, field: string) {
  if (!(error instanceof ApiError)) {
    return undefined
  }

  return error.fieldErrors.find((fieldError) => fieldError.field === field)
    ?.message
}

export function getApiFieldErrors<TField extends string>(
  error: unknown,
  fields: readonly TField[],
) {
  const fieldErrors: Partial<Record<TField, string>> = {}

  for (const field of fields) {
    const message = getApiFieldError(error, field)

    if (message) {
      fieldErrors[field] = message
    }
  }

  return fieldErrors
}

type RequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: unknown
}

function getRequestMethod(options: RequestOptions) {
  return (options.method ?? 'GET').toUpperCase()
}

function shouldSendXsrfToken(path: string, method: string) {
  return mutableMethods.has(method) && path.startsWith(privateDashboardPathPrefix)
}

function buildApiUrl(path: string): URL {
  const baseUrl = env.VITE_API_BASE_URL

  if (baseUrl.startsWith('/')) {
    return new URL(path, window.location.origin + baseUrl)
  }

  return new URL(path, baseUrl)
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
  const method = getRequestMethod(options)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (shouldSendXsrfToken(path, method) && !headers.has(xsrfHeaderName)) {
    const xsrfToken = getCookieValue(xsrfCookieName)

    if (xsrfToken) {
      headers.set(xsrfHeaderName, xsrfToken)
    }
  }

  const response = await fetch(buildApiUrl(path), {
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
      parsedError.data?.fieldErrors ?? [],
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

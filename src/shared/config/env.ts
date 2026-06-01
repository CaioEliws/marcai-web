import { z } from 'zod'

const apiBaseUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith('/') || z.string().url().safeParse(value).success,
    'VITE_API_BASE_URL deve ser uma URL absoluta ou um caminho relativo iniciado por /.',
  )

const envSchema = z.object({
  VITE_API_BASE_URL: apiBaseUrlSchema,
})

export const env = envSchema.parse(import.meta.env)

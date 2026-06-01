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

const parsedEnv = envSchema.safeParse(import.meta.env)

if (!parsedEnv.success) {
  throw new Error(
    'Configuração de ambiente inválida. Defina VITE_API_BASE_URL em .env local. Para desenvolvimento com proxy, use VITE_API_BASE_URL=/.',
    { cause: parsedEnv.error },
  )
}

export const env = parsedEnv.data

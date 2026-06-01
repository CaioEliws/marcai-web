import { z } from 'zod'

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, 'Horário inválido.')

const businessHourPayloadBaseSchema = z
  .object({
    closingTime: timeSchema,
    dayOfWeek: z.number().int().min(0).max(6),
    openingTime: timeSchema,
  })
  .refine((payload) => payload.openingTime < payload.closingTime, {
    message: 'O horário de abertura deve ser antes do fechamento.',
    path: ['closingTime'],
  })

export const businessHourSchema = z.object({
  active: z.boolean(),
  closingTime: timeSchema,
  dayName: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  id: z.uuid(),
  openingTime: timeSchema,
})

export const businessHourListSchema = z.array(businessHourSchema)

export const createBusinessHourSchema = businessHourPayloadBaseSchema

export const updateBusinessHourSchema = businessHourPayloadBaseSchema.extend({
  active: z.boolean(),
})

export const deleteBusinessHourResponseSchema = z.null()

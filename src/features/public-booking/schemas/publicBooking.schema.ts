import { z } from 'zod'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)

export const publicBusinessSchema = z.object({
  address: z.string().nullable(),
  city: z.string().nullable(),
  description: z.string().nullable(),
  id: z.uuid(),
  name: z.string(),
  phone: z.string().nullable(),
  slug: z.string(),
  state: z.string().nullable(),
})

export const publicServiceSchema = z.object({
  description: z.string().nullable(),
  durationMinutes: z.number().int().positive(),
  id: z.uuid(),
  name: z.string(),
  price: z.number().nullable(),
})

export const publicServiceListSchema = z.array(publicServiceSchema)

export const availableTimesSchema = z.object({
  availableTimes: z.array(timeSchema),
  date: dateSchema,
  serviceId: z.uuid(),
})

export const createPublicAppointmentSchema = z.object({
  appointmentDate: dateSchema,
  clientName: z.string().trim().min(2).max(120),
  clientPhone: z.string().trim().min(8).max(20),
  serviceId: z.uuid(),
  startTime: timeSchema,
})

export const publicAppointmentSchema = z.object({
  appointmentDate: dateSchema,
  appointmentId: z.uuid(),
  businessName: z.string(),
  clientName: z.string(),
  endTime: timeSchema,
  message: z.string(),
  serviceName: z.string(),
  startTime: timeSchema,
})

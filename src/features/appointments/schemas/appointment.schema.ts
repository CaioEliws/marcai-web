import { z } from 'zod'

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)

export const appointmentStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELED',
  'NO_SHOW',
])

export const appointmentSchema = z.object({
  appointmentDate: dateSchema,
  clientId: z.uuid(),
  clientName: z.string(),
  clientPhone: z.string(),
  createdAt: z.string(),
  endTime: timeSchema,
  id: z.uuid(),
  notes: z.string().nullable(),
  serviceDurationMinutes: z.number().int().positive(),
  serviceId: z.uuid(),
  serviceName: z.string(),
  servicePrice: z.number().nullable(),
  startTime: timeSchema,
  status: appointmentStatusSchema,
  updatedAt: z.string().nullable(),
})

export const appointmentListSchema = z.array(appointmentSchema)

export const dashboardAvailableTimesSchema = z.object({
  availableTimes: z.array(timeSchema),
  date: dateSchema,
  serviceId: z.uuid(),
})

export const manualAppointmentPayloadSchema = z.object({
  appointmentDate: dateSchema,
  clientName: z.string().trim().min(2).max(120),
  clientPhone: z.string().trim().min(10).max(30),
  notes: z.string().trim().max(500).optional(),
  serviceId: z.uuid(),
  startTime: timeSchema,
})

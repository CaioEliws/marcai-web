import type { z } from 'zod'
import type {
  availableTimesSchema,
  createPublicAppointmentSchema,
  publicAppointmentSchema,
  publicBusinessSchema,
  publicServiceSchema,
} from '../schemas/publicBooking.schema'

export type PublicBusiness = z.infer<typeof publicBusinessSchema>
export type PublicService = z.infer<typeof publicServiceSchema>
export type AvailableTimes = z.infer<typeof availableTimesSchema>
export type CreatePublicAppointmentPayload = z.infer<
  typeof createPublicAppointmentSchema
>
export type PublicAppointment = z.infer<typeof publicAppointmentSchema>

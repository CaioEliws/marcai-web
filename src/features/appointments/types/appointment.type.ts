import type { z } from 'zod'
import type {
  appointmentSchema,
  appointmentStatusSchema,
} from '../schemas/appointment.schema'

export type Appointment = z.infer<typeof appointmentSchema>
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>

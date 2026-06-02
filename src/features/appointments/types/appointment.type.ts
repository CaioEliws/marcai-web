import type { z } from 'zod'
import type {
  dashboardAvailableTimesSchema,
  appointmentSchema,
  appointmentStatusSchema,
  manualAppointmentPayloadSchema,
} from '../schemas/appointment.schema'

export type Appointment = z.infer<typeof appointmentSchema>
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>
export type DashboardAvailableTimes = z.infer<
  typeof dashboardAvailableTimesSchema
>
export type ManualAppointmentPayload = z.infer<
  typeof manualAppointmentPayloadSchema
>

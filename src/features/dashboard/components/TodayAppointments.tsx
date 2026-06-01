import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { Appointment } from '@/features/appointments/types/appointment.type'
import {
  formatShortTime,
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from './dashboardUtils'

type TodayAppointmentsProps = {
  appointments: Appointment[]
  isLoading: boolean
  todayDate: string
}

export function TodayAppointments({
  appointments,
  isLoading,
  todayDate,
}: TodayAppointmentsProps) {
  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Agendamentos de hoje</CardTitle>
          <CardDescription>
            Próximos horários do dia, ordenados por início.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/dashboard/appointments?date=${todayDate}`}>
            Ver agendamentos de hoje
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Alert>
            <AlertDescription>Carregando agendamentos...</AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && appointments.length === 0 ? (
          <Alert>
            <AlertDescription>
              Nenhum agendamento encontrado para hoje.
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && appointments.length > 0 ? (
          <div className="grid gap-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{appointment.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.serviceName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatShortTime(appointment.startTime)}
                  </span>
                  <Badge variant={getAppointmentStatusVariant(appointment.status)}>
                    {getAppointmentStatusLabel(appointment.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

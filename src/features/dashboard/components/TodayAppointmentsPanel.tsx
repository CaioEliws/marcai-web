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
  formatCurrency,
  formatShortTime,
  getAppointmentStatusLabel,
  getAppointmentStatusVariant,
} from '../utils/dashboardFormatters'

type TodayAppointmentsPanelProps = {
  appointments: Appointment[]
  isLoading: boolean
  todayDate: string
}

export function TodayAppointmentsPanel({
  appointments,
  isLoading,
  todayDate,
}: TodayAppointmentsPanelProps) {
  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Operação de hoje</CardTitle>
          <CardDescription>
            Próximos horários, clientes e status da agenda do dia.
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
            <AlertDescription>Carregando agendamentos de hoje...</AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && appointments.length === 0 ? (
          <Alert>
            <AlertDescription>
              Ainda não há agendamentos para hoje. Crie um agendamento manual ou
              compartilhe seu link público.
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && appointments.length > 0 ? (
          <div className="grid gap-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{appointment.clientName}</p>
                    <Badge variant={getAppointmentStatusVariant(appointment.status)}>
                      {getAppointmentStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {appointment.clientPhone}
                  </p>
                </div>
                <div className="grid gap-1 text-sm lg:text-right">
                  <p className="font-medium">
                    {formatShortTime(appointment.startTime)} às{' '}
                    {formatShortTime(appointment.endTime)}
                  </p>
                  <p className="text-muted-foreground">
                    {appointment.serviceName} ·{' '}
                    {appointment.servicePrice === null
                      ? 'Preço não informado'
                      : formatCurrency(appointment.servicePrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

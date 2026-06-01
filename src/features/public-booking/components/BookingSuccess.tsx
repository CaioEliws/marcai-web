import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { PublicAppointment } from '../types/publicBooking.type'
import { formatTime } from './publicBookingUtils'

type BookingSuccessProps = {
  appointment: PublicAppointment
}

export function BookingSuccess({ appointment }: BookingSuccessProps) {
  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit">Agendamento confirmado</Badge>
        <CardTitle>{appointment.businessName}</CardTitle>
        <CardDescription>{appointment.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Cliente</dt>
            <dd className="font-medium">{appointment.clientName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Servico</dt>
            <dd className="font-medium">{appointment.serviceName}</dd>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Data</dt>
              <dd className="font-medium">{appointment.appointmentDate}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Inicio</dt>
              <dd className="font-medium">{formatTime(appointment.startTime)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Fim</dt>
              <dd className="font-medium">{formatTime(appointment.endTime)}</dd>
            </div>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

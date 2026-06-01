import { Card, CardContent } from '@/shared/components/ui/card'
import type { PublicBusiness } from '../types/publicBooking.type'

type PublicBusinessHeaderProps = {
  business: PublicBusiness
}

export function PublicBusinessHeader({ business }: PublicBusinessHeaderProps) {
  const location = [business.city, business.state].filter(Boolean).join(' - ')

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Agendamento online
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {business.name}
        </h1>
        {business.description ? (
          <p className="mt-3 text-muted-foreground">{business.description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {location ? <span>{location}</span> : null}
          {business.address ? <span>{business.address}</span> : null}
          {business.phone ? <span>{business.phone}</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}

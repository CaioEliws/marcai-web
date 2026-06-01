import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { PublicService } from '../types/publicBooking.type'
import { formatCurrency } from './publicBookingUtils'

type PublicServiceSelectorProps = {
  isLoading: boolean
  onChange: (serviceId: string) => void
  selectedServiceId: string
  services: PublicService[]
}

export function PublicServiceSelector({
  isLoading,
  onChange,
  selectedServiceId,
  services,
}: PublicServiceSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Escolha o servico</CardTitle>
        <CardDescription>
          Selecione o atendimento que deseja agendar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando servicos...</p>
        ) : null}

        {!isLoading && services.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">Nenhum servico disponivel.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta empresa ainda nao liberou servicos para agendamento online.
            </p>
          </div>
        ) : null}

        {services.length > 0 ? (
          <div className="grid gap-3">
            {services.map((service) => {
              const isSelected = selectedServiceId === service.id

              return (
                <Button
                  key={service.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  className="h-auto justify-start p-4 text-left"
                  onClick={() => onChange(service.id)}
                >
                  <span className="grid w-full gap-2">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{service.name}</span>
                      <Badge variant={isSelected ? 'secondary' : 'outline'}>
                        {service.durationMinutes} min
                      </Badge>
                    </span>
                    {service.description ? (
                      <span className="text-sm opacity-80">
                        {service.description}
                      </span>
                    ) : null}
                    <span className="text-sm font-medium">
                      {formatCurrency(service.price)}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import type { Business } from '@/features/business/types/business.type'
import type { BusinessHour } from '@/features/availability/types/businessHour.type'
import type { Service } from '@/features/services/types/service.type'

type DashboardSetupAlertsProps = {
  business: Business | undefined
  businessHours: BusinessHour[]
  services: Service[]
}

export function DashboardSetupAlerts({
  business,
  businessHours,
  services,
}: DashboardSetupAlertsProps) {
  const activeServices = services.filter((service) => service.active)
  const inactiveServices = services.filter((service) => !service.active)
  const activeBusinessHours = businessHours.filter((hour) => hour.active)
  const servicesWithoutPrice = services.filter((service) => service.price === null)
  const alerts = [
    {
      action: 'Gerenciar serviços',
      message: 'Nenhum serviço ativo encontrado.',
      show: services.length > 0 && activeServices.length === 0,
      to: '/dashboard/services',
    },
    {
      action: 'Configurar horários',
      message: 'Nenhum horário ativo configurado.',
      show: businessHours.length > 0 && activeBusinessHours.length === 0,
      to: '/dashboard/availability',
    },
    {
      action: 'Link público',
      message: 'Empresa inativa. O link público pode não estar disponível.',
      show: business ? !business.active : false,
      to: '/dashboard/public-link',
    },
    {
      action: 'Link público',
      message: 'Perfil da empresa incompleto.',
      show: business ? !business.city || !business.state || !business.phone : false,
      to: '/dashboard/public-link',
    },
    {
      action: 'Gerenciar serviços',
      message: 'Há serviços sem preço, o que limita a análise de receita.',
      show: servicesWithoutPrice.length > 0,
      to: '/dashboard/services',
    },
    {
      action: 'Gerenciar serviços',
      message: `${inactiveServices.length} serviço(s) inativo(s).`,
      show: inactiveServices.length > 0,
      to: '/dashboard/services',
    },
  ].filter((alert) => alert.show)

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="grid gap-3">
      {alerts.map((alert) => (
        <Alert key={alert.message}>
          <AlertDescription className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{alert.message}</span>
            <Button asChild variant="outline" size="sm">
              <Link to={alert.to}>{alert.action}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

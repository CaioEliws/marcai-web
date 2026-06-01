import { Calendar, Clock, ExternalLink, Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

const quickActions = [
  {
    description: 'Crie, edite e ative serviços disponíveis para agendamento.',
    icon: Scissors,
    label: 'Gerenciar serviços',
    to: '/dashboard/services',
  },
  {
    description: 'Defina os dias e horários que aparecem no link público.',
    icon: Clock,
    label: 'Configurar horários',
    to: '/dashboard/availability',
  },
  {
    description: 'Acompanhe os horários marcados pelos clientes.',
    icon: Calendar,
    label: 'Ver agendamentos',
    to: '/dashboard/appointments',
  },
  {
    description: 'Copie ou abra o link público da sua empresa.',
    icon: ExternalLink,
    label: 'Link público',
    to: '/dashboard/public-link',
  },
]

export function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas ações</CardTitle>
        <CardDescription>
          Atalhos para manter sua operação pronta para receber clientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => (
          <Button
            key={action.to}
            asChild
            variant="outline"
            className="h-auto justify-start whitespace-normal p-4 text-left"
          >
            <Link to={action.to}>
              <action.icon className="h-4 w-4" aria-hidden="true" />
              <span>
                <span className="block font-medium">{action.label}</span>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

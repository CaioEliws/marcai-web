import {
  Calendar,
  Clock,
  ExternalLink,
  Scissors,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { AuthRole } from '@/features/auth/types/auth.type'

const quickActions = [
  {
    description: 'Crie, edite e ative serviços disponíveis para agendamento.',
    icon: Scissors,
    label: 'Gerenciar serviços',
    roles: ['ADMIN', 'OWNER'],
    to: '/dashboard/services',
  },
  {
    description: 'Defina os dias e horários que aparecem no link público.',
    icon: Clock,
    label: 'Configurar horários',
    roles: ['ADMIN', 'OWNER'],
    to: '/dashboard/availability',
  },
  {
    description: 'Acompanhe e atualize os horários dos clientes.',
    icon: Calendar,
    label: 'Ver agendamentos',
    to: '/dashboard/appointments',
  },
  {
    description: 'Copie ou abra o link público da sua empresa.',
    icon: ExternalLink,
    label: 'Link público',
    roles: ['ADMIN', 'OWNER'],
    to: '/dashboard/public-link',
  },
  {
    description: 'Atualize dados de acesso, senha e imagem de perfil.',
    icon: ShieldCheck,
    label: 'Perfil e segurança',
    to: '/dashboard/profile',
  },
]

type DashboardQuickActionsProps = {
  createAppointmentAction?: ReactNode
  role: AuthRole
}

export function DashboardQuickActions({
  createAppointmentAction,
  role,
}: DashboardQuickActionsProps) {
  const visibleActions = quickActions.filter((action) => {
    if (!action.roles) {
      return true
    }

    return action.roles.includes(role)
  })
  const canCreateAppointment = role === 'ADMIN' || role === 'OWNER'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas ações</CardTitle>
        <CardDescription>
          Atalhos práticos para manter a operação rodando.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {createAppointmentAction && canCreateAppointment ? (
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Criar agendamento manual</p>
                <p className="text-xs text-muted-foreground">
                  Marque um horário para clientes que chamam direto.
                </p>
              </div>
            </div>
            {createAppointmentAction}
          </div>
        ) : null}

        {visibleActions.map((action) => (
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

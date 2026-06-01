import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { Business } from '@/features/business/types/business.type'

type DashboardBusinessCardProps = {
  business: Business | undefined
  isLoading: boolean
}

function formatLocation(business: Business) {
  const location = [business.city, business.state].filter(Boolean).join(' / ')

  return location || 'Localização não informada'
}

export function DashboardBusinessCard({
  business,
  isLoading,
}: DashboardBusinessCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Empresa</CardTitle>
          <CardDescription>Carregando dados da empresa...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!business) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Empresa</CardTitle>
          <CardDescription>
            Não foi possível carregar os dados da empresa.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{business.name}</CardTitle>
          <CardDescription>{formatLocation(business)}</CardDescription>
        </div>
        <Badge variant={business.active ? 'default' : 'outline'}>
          {business.active ? 'Ativa' : 'Inativa'}
        </Badge>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to="/dashboard/public-link">Gerenciar link público</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { Service } from '../types/service.type'
import { ServiceStatusFilter } from './ServiceStatusFilter'
import type { ServiceStatusFilterValue } from './ServiceStatusFilter'

type ServicesListProps = {
  actionError: string | null
  filter: ServiceStatusFilterValue
  hasLoadedServices: boolean
  isError: boolean
  isLoading: boolean
  onEdit: (service: Service) => void
  onFilterChange: (value: ServiceStatusFilterValue) => void
  onToggleStatus: (service: Service) => void
  pendingServiceId: string | null
  services: Service[]
}

function formatPrice(price: number | null) {
  if (price === null) {
    return 'Sem preço'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

function getEmptyStateMessage(filter: ServiceStatusFilterValue) {
  if (filter === 'active') {
    return {
      description:
        'Crie um serviço ou reative serviços inativos para aparecerem aqui.',
      title: 'Nenhum serviço ativo.',
    }
  }

  if (filter === 'inactive') {
    return {
      description: 'Serviços desativados ficam disponíveis neste filtro.',
      title: 'Nenhum serviço inativo.',
    }
  }

  return {
    description: 'Crie o primeiro serviço para começar a configurar sua agenda.',
    title: 'Nenhum serviço cadastrado.',
  }
}

export function ServicesList({
  actionError,
  filter,
  hasLoadedServices,
  isError,
  isLoading,
  onEdit,
  onFilterChange,
  onToggleStatus,
  pendingServiceId,
  services,
}: ServicesListProps) {
  const hasServices = services.length > 0
  const emptyState = getEmptyStateMessage(filter)

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Serviços cadastrados</CardTitle>
          <CardDescription>
            Ative, desative ou edite serviços sem removê-los do histórico.
          </CardDescription>
        </div>
        <ServiceStatusFilter value={filter} onChange={onFilterChange} />
      </CardHeader>
      <CardContent>
        {actionError ? (
          <Alert className="mb-4 border-destructive/50 text-destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando serviços...</p>
        ) : null}

        {isError && !hasLoadedServices ? (
          <Alert className="border-destructive/50 text-destructive">
            <AlertDescription>
              Não foi possível carregar os serviços. Tente novamente em
              instantes.
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && (hasLoadedServices || !isError) && !hasServices ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">{emptyState.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyState.description}
            </p>
          </div>
        ) : null}

        {hasServices ? (
          <div className="grid gap-3">
            {services.map((service) => {
              const isPending = pendingServiceId === service.id

              return (
                <article
                  key={service.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{service.name}</h2>
                      <Badge variant={service.active ? 'default' : 'secondary'}>
                        {service.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.description || 'Sem descrição'}
                    </p>
                    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Preço</dt>
                        <dd className="font-medium">
                          {formatPrice(service.price)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Duração</dt>
                        <dd className="font-medium">
                          {service.durationMinutes} min
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row md:shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onEdit(service)}
                      disabled={isPending}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant={service.active ? 'outline' : 'secondary'}
                      onClick={() => onToggleStatus(service)}
                      disabled={isPending}
                    >
                      {isPending
                        ? 'Atualizando...'
                        : service.active
                          ? 'Desativar'
                          : 'Ativar'}
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

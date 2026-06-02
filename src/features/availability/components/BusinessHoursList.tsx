import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { buttonVariants } from '@/shared/components/ui/button.variants'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import type { BusinessHour } from '../types/businessHour.type'
import { formatTimeForInput } from './businessHourUtils'

type BusinessHoursListProps = {
  actionError: string | null
  businessHours: BusinessHour[]
  isError: boolean
  isLoading: boolean
  onDelete: (businessHour: BusinessHour) => void
  onEdit: (businessHour: BusinessHour) => void
  onToggleStatus: (businessHour: BusinessHour) => void
  pendingBusinessHourId: string | null
}

export function BusinessHoursList({
  actionError,
  businessHours,
  isError,
  isLoading,
  onDelete,
  onEdit,
  onToggleStatus,
  pendingBusinessHourId,
}: BusinessHoursListProps) {
  const hasBusinessHours = businessHours.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios cadastrados</CardTitle>
        <CardDescription>
          Gerencie os dias em que sua empresa atende pelo link publico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {actionError ? (
          <Alert className="mb-4 border-destructive/50 text-destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando horarios...</p>
        ) : null}

        {isError && !hasBusinessHours ? (
          <Alert className="border-destructive/50 text-destructive">
            <AlertDescription>
              Nao foi possivel carregar os horarios. Tente novamente em
              instantes.
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !isError && !hasBusinessHours ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">Nenhum horario cadastrado.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione os dias de atendimento para liberar agendamentos
              publicos.
            </p>
          </div>
        ) : null}

        {hasBusinessHours ? (
          <div className="grid gap-3">
            {businessHours.map((businessHour) => {
              const isPending = pendingBusinessHourId === businessHour.id

              return (
                <article
                  key={businessHour.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{businessHour.dayName}</h2>
                      <Badge
                        variant={businessHour.active ? 'default' : 'secondary'}
                      >
                        {businessHour.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Abertura</dt>
                        <dd className="font-medium">
                          {formatTimeForInput(businessHour.openingTime)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Fechamento</dt>
                        <dd className="font-medium">
                          {formatTimeForInput(businessHour.closingTime)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row md:shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onEdit(businessHour)}
                      disabled={isPending}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant={businessHour.active ? 'outline' : 'secondary'}
                      onClick={() => onToggleStatus(businessHour)}
                      disabled={isPending}
                    >
                      {isPending
                        ? 'Atualizando...'
                        : businessHour.active
                          ? 'Desativar'
                          : 'Ativar'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={isPending}
                        >
                          {isPending ? 'Removendo...' : 'Remover'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remover horário de funcionamento?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            A configuração de {businessHour.dayName} será
                            removida e deixará de controlar a disponibilidade
                            pública deste dia.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isPending}>
                            Voltar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className={buttonVariants({
                              variant: 'destructive',
                            })}
                            disabled={isPending}
                            onClick={() => onDelete(businessHour)}
                          >
                            Remover horário
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

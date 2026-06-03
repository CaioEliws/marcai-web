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
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
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
import type { TeamMember } from '../types/team.type'

type TeamMembersListProps = {
  actionError: string | null
  isError: boolean
  isLoading: boolean
  members: TeamMember[]
  onToggle: (member: TeamMember) => void
  pendingMemberId: string | null
}

const roleLabels = {
  ADMIN: 'Admin',
  OWNER: 'Dono',
  PROFESSIONAL: 'Profissional',
} as const

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function TeamMembersList({
  actionError,
  isError,
  isLoading,
  members,
  onToggle,
  pendingMemberId,
}: TeamMembersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profissionais da equipe</CardTitle>
        <CardDescription>
          Funcionários vinculados à empresa autenticada.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actionError ? (
          <Alert className="border-destructive/50 text-destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Carregando profissionais...
          </p>
        ) : null}

        {isError ? (
          <Alert className="border-destructive/50 text-destructive">
            <AlertDescription>
              Não foi possível carregar a equipe.
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !isError && members.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">Nenhum profissional cadastrado ainda.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie um convite para começar a montar sua equipe.
            </p>
          </div>
        ) : null}

        {members.map((member) => {
          const isPending = pendingMemberId === member.id
          const nextAction = member.active ? 'desativar' : 'reativar'

          return (
            <article
              key={member.id}
              className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">{member.name}</h2>
                  <Badge variant="outline">{roleLabels[member.role]}</Badge>
                  <Badge variant={member.active ? 'default' : 'secondary'}>
                    {member.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Entrada em {formatDate(member.createdAt)}
                </p>
              </div>

              {member.role === 'OWNER' ? null : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant={member.active ? 'outline' : 'secondary'}
                      disabled={isPending}
                    >
                      {isPending
                        ? 'Atualizando...'
                        : member.active
                          ? 'Desativar'
                          : 'Reativar'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {member.active ? 'Desativar profissional?' : 'Reativar profissional?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Você está prestes a {nextAction} o acesso de {member.name}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isPending}>
                        Voltar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({
                          variant: member.active ? 'destructive' : 'default',
                        })}
                        disabled={isPending}
                        onClick={() => onToggle(member)}
                      >
                        {member.active ? 'Desativar' : 'Reativar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </article>
          )
        })}
      </CardContent>
    </Card>
  )
}

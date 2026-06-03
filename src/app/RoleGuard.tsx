import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useSessionQuery } from '@/features/auth/hooks/useAuth'
import type { AuthRole } from '@/features/auth/types/auth.type'

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: AuthRole[]
}>

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const sessionQuery = useSessionQuery()
  const role = sessionQuery.data?.role

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(role)) {
    return (
      <section className="mx-auto grid w-full max-w-3xl gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Acesso restrito
        </h1>
        <Alert className="border-destructive/50 text-destructive">
          <AlertDescription>
            Você não tem permissão para acessar esta área.
          </AlertDescription>
        </Alert>
      </section>
    )
  }

  return children
}

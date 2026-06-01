import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ApiError } from '@/shared/api/httpClient'
import { useSessionQuery } from '@/features/auth/hooks/useAuth'

function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401
}

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation()
  const sessionQuery = useSessionQuery()

  if (sessionQuery.isPending) {
    return (
      <main className="grid min-h-svh place-items-center px-6 py-10">
        <p className="text-sm text-muted-foreground">Carregando sessão...</p>
      </main>
    )
  }

  if (isUnauthorized(sessionQuery.error)) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (sessionQuery.isError) {
    return (
      <main className="grid min-h-svh place-items-center px-6 py-10">
        <p className="text-sm text-muted-foreground">
          Não foi possível validar sua sessão. Tente novamente em instantes.
        </p>
      </main>
    )
  }

  return children
}

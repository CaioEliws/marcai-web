import { Navigate } from 'react-router-dom'
import { ApiError } from '@/shared/api/httpClient'
import { useSessionQuery } from '@/features/auth/hooks/useAuth'

function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401
}

export function RootRedirect() {
  const sessionQuery = useSessionQuery()

  if (sessionQuery.isPending) {
    return (
      <main className="grid min-h-svh place-items-center px-6 py-10">
        <p className="text-sm text-muted-foreground">Carregando sessão...</p>
      </main>
    )
  }

  if (sessionQuery.isSuccess) {
    return <Navigate to="/dashboard" replace />
  }

  if (isUnauthorized(sessionQuery.error)) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to="/login" replace />
}

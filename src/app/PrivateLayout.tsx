import {
  Calendar,
  Clock,
  Home,
  Link as LinkIcon,
  LogOut,
  Menu,
  Scissors,
  User,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAccountProfileQuery } from '@/features/account/hooks/useAccount'
import { useLogoutMutation, useSessionQuery } from '@/features/auth/hooks/useAuth'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home, end: true },
  { to: '/dashboard/services', label: 'Serviços', icon: Scissors },
  { to: '/dashboard/appointments', label: 'Agendamentos', icon: Calendar },
  { to: '/dashboard/availability', label: 'Horários', icon: Clock },
  { to: '/dashboard/public-link', label: 'Link público', icon: LinkIcon },
  { to: '/dashboard/profile', label: 'Perfil', icon: User },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function buildAvatarSrc(avatarUrl: string | null | undefined, version: number) {
  if (!avatarUrl) {
    return undefined
  }

  const separator = avatarUrl.includes('?') ? '&' : '?'

  return `${avatarUrl}${separator}v=${encodeURIComponent(String(version))}`
}

type UserSummaryProps = {
  avatarSrc: string | undefined
  className?: string
  label: string
  name: string
  role: string
}

function UserSummary({
  avatarSrc,
  className,
  label,
  name,
  role,
}: UserSummaryProps) {
  return (
    <Link
      to="/dashboard/profile"
      aria-label={label}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
    >
      <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{role}</p>
      </div>
    </Link>
  )
}

export function PrivateLayout() {
  const navigate = useNavigate()
  const sessionQuery = useSessionQuery()
  const accountProfileQuery = useAccountProfileQuery()
  const logoutMutation = useLogoutMutation()
  const session = sessionQuery.data
  const profile = accountProfileQuery.data
  const userName = profile?.name ?? session?.name ?? 'Usuário'
  const userRole = profile?.role ?? session?.role ?? 'Conta'
  const avatarSrc = buildAvatarSrc(
    profile?.avatarUrl,
    accountProfileQuery.dataUpdatedAt,
  )

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
        <div className="border-b px-6 py-5">
          <p className="text-lg font-semibold tracking-tight">Marcaí</p>
          <p className="text-sm text-muted-foreground">Painel privado</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Principal">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-4">
          <UserSummary
            avatarSrc={avatarSrc}
            className="mb-3"
            label={`Abrir perfil de ${userName} na barra lateral`}
            name={userName}
            role={userRole}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir navegação"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
              <div>
                <p className="text-sm font-semibold">Marcaí</p>
                <p className="text-xs text-muted-foreground lg:hidden">
                  Painel privado
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserSummary
                avatarSrc={avatarSrc}
                className="hidden p-1.5 sm:flex"
                label={`Abrir perfil de ${userName} no topo`}
                name={userName}
                role={userRole}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
                </span>
              </Button>
            </div>
          </div>

          <nav
            className="flex gap-2 overflow-x-auto border-t px-4 py-2 lg:hidden"
            aria-label="Principal"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

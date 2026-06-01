import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateLayout } from './PrivateLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RootRedirect } from './RootRedirect'
import { AvailabilityPage } from '../pages/AvailabilityPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { PrivatePlaceholderPage } from '../pages/PrivatePlaceholderPage'
import { PublicBookingPage } from '../pages/PublicBookingPage'
import { PublicLinkPage } from '../pages/PublicLinkPage'
import { ServicesPage } from '../pages/ServicesPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PrivateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route
          path="appointments"
          element={
            <PrivatePlaceholderPage
              title="Agendamentos"
              description="A agenda privada será conectada aos dados reais quando o módulo for implementado."
            />
          }
        />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="public-link" element={<PublicLinkPage />} />
      </Route>
      <Route path="/:slug" element={<PublicBookingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

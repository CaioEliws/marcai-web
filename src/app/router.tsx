import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateLayout } from './PrivateLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { RootRedirect } from './RootRedirect'
import { AcceptInvitePage } from '../pages/AcceptInvitePage'
import { AppointmentsPage } from '../pages/AppointmentsPage'
import { AvailabilityPage } from '../pages/AvailabilityPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PublicBookingPage } from '../pages/PublicBookingPage'
import { PublicLinkPage } from '../pages/PublicLinkPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ServicesPage } from '../pages/ServicesPage'
import { TeamPage } from '../pages/TeamPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PrivateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="services"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'OWNER']}>
              <ServicesPage />
            </RoleGuard>
          }
        />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route
          path="availability"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'OWNER']}>
              <AvailabilityPage />
            </RoleGuard>
          }
        />
        <Route
          path="public-link"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'OWNER']}>
              <PublicLinkPage />
            </RoleGuard>
          }
        />
        <Route
          path="team"
          element={
            <RoleGuard allowedRoles={['ADMIN', 'OWNER']}>
              <TeamPage />
            </RoleGuard>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="/:slug" element={<PublicBookingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

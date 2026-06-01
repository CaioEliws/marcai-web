import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateLayout } from './PrivateLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RootRedirect } from './RootRedirect'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { PrivatePlaceholderPage } from '../pages/PrivatePlaceholderPage'

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
        <Route
          path="services"
          element={
            <PrivatePlaceholderPage
              title="Serviços"
              description="Cadastro e gestão de serviços serão implementados nas próximas etapas."
            />
          }
        />
        <Route
          path="appointments"
          element={
            <PrivatePlaceholderPage
              title="Agendamentos"
              description="A agenda privada será conectada aos dados reais quando o módulo for implementado."
            />
          }
        />
        <Route
          path="availability"
          element={
            <PrivatePlaceholderPage
              title="Horários"
              description="Configuração de disponibilidade e horários de funcionamento ficará aqui."
            />
          }
        />
        <Route
          path="public-link"
          element={
            <PrivatePlaceholderPage
              title="Link público"
              description="O link público de agendamento será exibido aqui quando a configuração da empresa estiver disponível."
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { expect, test, type Page } from '@playwright/test'

const today = new Date()
const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
  2,
  '0',
)}-${String(today.getDate()).padStart(2, '0')}`

const serviceId = '22222222-2222-4222-8222-222222222222'

function appointmentResponse(overrides: Record<string, unknown> = {}) {
  return {
    appointmentDate: todayDate,
    clientId: '33333333-3333-4333-8333-333333333333',
    clientName: 'João Silva',
    clientPhone: '11999999999',
    createdAt: `${todayDate}T10:00:00`,
    endTime: '09:30:00',
    id: '44444444-4444-4444-8444-444444444444',
    notes: null,
    serviceDurationMinutes: 30,
    serviceId,
    serviceName: 'Corte masculino',
    servicePrice: 40,
    startTime: '09:00:00',
    status: 'COMPLETED',
    updatedAt: null,
    ...overrides,
  }
}

async function mockAuthenticatedShell(page: Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        email: 'caio@email.com',
        name: 'Caio Elias',
        role: 'OWNER',
        userId: '11111111-1111-4111-8111-111111111111',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/profile', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        avatarUrl: null,
        email: 'caio@email.com',
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Caio Elias',
        role: 'OWNER',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })
}

async function mockDashboardData(
  page: Page,
  options: { appointments?: unknown[]; services?: unknown[] } = {},
) {
  const appointments = options.appointments ?? [appointmentResponse()]
  const services =
    options.services ??
    [
      {
        active: true,
        createdAt: '2026-01-01T10:00:00',
        description: 'Corte tradicional',
        durationMinutes: 30,
        id: serviceId,
        name: 'Corte masculino',
        price: 40,
        updatedAt: null,
      },
    ]

  await page.route('**/api/v1/dashboard/appointments/by-date?*', async (route) => {
    await route.fulfill({
      body: JSON.stringify(appointments),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/appointments', async (route) => {
    await route.fulfill({
      body: JSON.stringify(appointments),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/business', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        active: true,
        address: 'Rua Exemplo, 123',
        city: 'Indaiatuba',
        createdAt: '2026-01-01T10:00:00',
        description: 'Cortes masculinos',
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Barbearia do Caio',
        phone: '11999999999',
        slug: 'barbearia-do-caio',
        state: 'SP',
        updatedAt: null,
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/services', async (route) => {
    await route.fulfill({
      body: JSON.stringify(services),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/services/active', async (route) => {
    await route.fulfill({
      body: JSON.stringify(services),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/business-hours', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          active: true,
          closingTime: '18:00:00',
          dayName: 'Segunda-feira',
          dayOfWeek: 1,
          id: '66666666-6666-4666-8666-666666666666',
          openingTime: '09:00:00',
        },
      ]),
      contentType: 'application/json',
      status: 200,
    })
  })
}

async function gotoDashboard(page: Page, path = '/dashboard') {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
}

test('/dashboard autenticado renderiza filtro de período', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockDashboardData(page)

  await gotoDashboard(page)

  await expect(page.getByLabel('Filtro de período')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Hoje' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Últimos 7 dias' }))
    .toBeVisible()
})

test('trocar filtro atualiza query param', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockDashboardData(page)

  await gotoDashboard(page)
  await page.getByRole('button', { name: 'Últimos 7 dias' }).click()

  await expect(page).toHaveURL(/\/dashboard\?period=7d$/)
})

test('KPIs principais aparecem', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockDashboardData(page)

  await gotoDashboard(page)

  await expect(page.getByText('Receita realizada')).toBeVisible()
  await expect(page.getByText('Receita prevista')).toBeVisible()
  await expect(page.getByText('Agendamentos do período')).toBeVisible()
  await expect(page.getByText('Taxa de ocupação estimada')).toBeVisible()
  await expect(page.getByText('Ticket médio realizado')).toBeVisible()
})

test('empty state aparece quando não há agendamentos', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockDashboardData(page, { appointments: [] })

  await gotoDashboard(page)

  await expect(
    page.getByText('Ainda não há agendamentos neste período.'),
  ).toBeVisible()
})

test('Ver agendamentos de hoje navega com date local', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockDashboardData(page)

  await gotoDashboard(page)
  await page.getByRole('link', { name: 'Ver agendamentos de hoje' }).click()

  await expect(page).toHaveURL(
    new RegExp(`/dashboard/appointments\\?date=${todayDate}$`),
  )
})

test('Dashboard não mostra lucro', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockDashboardData(page)

  await gotoDashboard(page)

  await expect(page.getByText(/lucro/i)).toHaveCount(0)
})

test('Dashboard não quebra com arrays vazios', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockDashboardData(page, { appointments: [], services: [] })

  await gotoDashboard(page)

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Receita realizada', { exact: true }))
    .toBeVisible()
})

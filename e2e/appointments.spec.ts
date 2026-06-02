import { expect, test, type Page } from '@playwright/test'

const userId = '11111111-1111-4111-8111-111111111111'
const serviceId = '22222222-2222-4222-8222-222222222222'
const appointmentId = '33333333-3333-4333-8333-333333333333'
const businessHourId = '44444444-4444-4444-8444-444444444444'

const appointmentResponse = {
  appointmentDate: '2026-06-10',
  clientId: '55555555-5555-4555-8555-555555555555',
  clientName: 'João Silva',
  clientPhone: '11999999999',
  createdAt: '2026-06-01T10:00:00',
  endTime: '09:30:00',
  id: appointmentId,
  notes: null,
  serviceDurationMinutes: 30,
  serviceId,
  serviceName: 'Corte masculino',
  servicePrice: 40,
  startTime: '09:00:00',
  status: 'SCHEDULED',
  updatedAt: null,
}

async function mockAuthenticatedShell(page: Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        email: 'caio@email.com',
        name: 'Caio Elias',
        role: 'OWNER',
        userId,
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
        id: userId,
        name: 'Caio Elias',
        role: 'OWNER',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })
}

async function mockAppointments(page: Page, appointments = [appointmentResponse]) {
  await page.route('**/api/v1/dashboard/appointments', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        body: JSON.stringify(appointments),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fallback()
  })
}

async function mockServices(page: Page) {
  await page.route('**/api/v1/dashboard/services/active', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
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
      ]),
      contentType: 'application/json',
      status: 200,
    })
  })
}

async function gotoAppointments(page: Page) {
  await page.goto('/dashboard/appointments', { waitUntil: 'domcontentloaded' })
}

test('/dashboard/appointments autenticado renderiza botão Novo agendamento', async ({
  page,
}) => {
  await mockAuthenticatedShell(page)
  await mockAppointments(page, [])

  await gotoAppointments(page)

  await expect(
    page.getByRole('heading', { name: 'Agendamentos' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Novo agendamento' }),
  ).toBeVisible()
})

test('clicar em Novo agendamento abre Dialog', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockAppointments(page, [])
  await mockServices(page)

  await gotoAppointments(page)
  await page.getByRole('button', { name: 'Novo agendamento' }).click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Novo agendamento' }),
  ).toBeVisible()
})

test('criar agendamento chama POST sem businessId', async ({ page }) => {
  await mockAuthenticatedShell(page)
  await mockAppointments(page, [])
  await mockServices(page)
  let availableTimesCalled = false
  let postPayload: unknown

  await page.route(
    '**/api/v1/dashboard/appointments/available-times?*',
    async (route) => {
      availableTimesCalled = true
      await route.fulfill({
        body: JSON.stringify({
          availableTimes: ['09:00:00'],
          date: '2026-06-10',
          serviceId,
        }),
        contentType: 'application/json',
        status: 200,
      })
    },
  )

  await page.route('**/api/v1/dashboard/appointments', async (route) => {
    if (route.request().method() === 'POST') {
      postPayload = route.request().postDataJSON()
      await route.fulfill({
        body: JSON.stringify({
          ...appointmentResponse,
          clientName: 'João Silva',
          notes: 'Cliente pediu corte degradê',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    if (route.request().method() === 'GET') {
      await route.fulfill({
        body: JSON.stringify([]),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fallback()
  })

  await gotoAppointments(page)
  await page.getByRole('button', { name: 'Novo agendamento' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Cliente').fill('João Silva')
  await dialog.getByLabel('Telefone').fill('11999999999')
  await dialog.getByLabel('Serviço').selectOption(serviceId)
  await dialog.getByLabel('Data').fill('2026-06-10')
  await expect.poll(() => availableTimesCalled).toBe(true)
  await dialog.getByLabel('Horário disponível').selectOption('09:00:00')
  await dialog.getByLabel('Observações').fill('Cliente pediu corte degradê')
  await dialog.getByRole('button', { name: 'Criar agendamento' }).click()

  await expect(page.getByText('Agendamento criado com sucesso.')).toBeVisible()
  expect(postPayload).toEqual({
    appointmentDate: '2026-06-10',
    clientName: 'João Silva',
    clientPhone: '11999999999',
    notes: 'Cliente pediu corte degradê',
    serviceId,
    startTime: '09:00:00',
  })
  expect(JSON.stringify(postPayload)).not.toContain('businessId')
  expect(JSON.stringify(postPayload)).not.toContain('userId')
})

test('cancelar agendamento abre AlertDialog sem confirm nativo', async ({
  page,
}) => {
  let nativeDialogOpened = false
  page.on('dialog', () => {
    nativeDialogOpened = true
  })
  await mockAuthenticatedShell(page)
  await mockAppointments(page)

  await gotoAppointments(page)
  await page.getByRole('button', { name: 'Cancelar' }).click()

  await expect(
    page.getByRole('heading', { name: 'Cancelar agendamento?' }),
  ).toBeVisible()
  expect(nativeDialogOpened).toBe(false)
})

test('remover horário em availability usa AlertDialog', async ({ page }) => {
  let nativeDialogOpened = false
  page.on('dialog', () => {
    nativeDialogOpened = true
  })
  await mockAuthenticatedShell(page)

  await page.route('**/api/v1/dashboard/business-hours', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          active: true,
          closingTime: '18:00:00',
          dayName: 'Segunda-feira',
          dayOfWeek: 1,
          id: businessHourId,
          openingTime: '09:00:00',
        },
      ]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/availability', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Remover' }).click()

  await expect(
    page.getByRole('heading', { name: 'Remover horário de funcionamento?' }),
  ).toBeVisible()
  expect(nativeDialogOpened).toBe(false)
})

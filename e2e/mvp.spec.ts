import { expect, test, type Page } from '@playwright/test'

async function mockAnonymousSession(page: Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 401,
      body: JSON.stringify({ message: 'Sessão ausente.' }),
    })
  })
}

async function mockPublicBusiness(page: Page) {
  await page.route(
    '**/api/v1/public/businesses/barbearia-do-caio/services',
    async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        status: 200,
        body: JSON.stringify([
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'Corte masculino',
            description: 'Corte tradicional',
            price: 50,
            durationMinutes: 30,
          },
        ]),
      })
    },
  )

  await page.route(
    '**/api/v1/public/businesses/barbearia-do-caio',
    async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        status: 200,
        body: JSON.stringify({
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Barbearia do Caio',
          slug: 'barbearia-do-caio',
          description: 'Cortes masculinos, barba e acabamento.',
          phone: '11999999999',
          address: 'Rua Exemplo, 123',
          city: 'Indaiatuba',
          state: 'SP',
        }),
      })
    },
  )
}

async function gotoApp(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
}

test('login renderiza corretamente', async ({ page }) => {
  await mockAnonymousSession(page)

  await gotoApp(page, '/login')

  await expect(
    page.getByRole('heading', { name: 'Entrar na sua conta' }),
  ).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible()
})

test('register renderiza corretamente', async ({ page }) => {
  await mockAnonymousSession(page)

  await gotoApp(page, '/register')

  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()
  await expect(page.getByLabel('Nome', { exact: true })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
  await expect(page.getByLabel('Nome da barbearia')).toBeVisible()
  await expect(page.getByLabel('Telefone da barbearia')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible()
})

test('dashboard sem sessão redireciona para login', async ({ page }) => {
  await mockAnonymousSession(page)

  await gotoApp(page, '/dashboard')

  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole('heading', { name: 'Entrar na sua conta' }),
  ).toBeVisible()
})

test('slug público renderiza sem exigir login', async ({ page }) => {
  await mockPublicBusiness(page)

  await gotoApp(page, '/barbearia-do-caio')

  await expect(
    page.getByRole('heading', { name: 'Barbearia do Caio' }),
  ).toBeVisible()
  await expect(page.getByText('Corte masculino')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar agendamento' }))
    .toBeVisible()
})

test('navegação básica entre rotas públicas não quebra', async ({ page }) => {
  await mockAnonymousSession(page)

  await gotoApp(page, '/login')
  await page.getByRole('link', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL(/\/register$/)
  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()

  await page.getByRole('link', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole('heading', { name: 'Entrar na sua conta' }),
  ).toBeVisible()
})

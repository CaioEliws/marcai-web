import { expect, test, type Page } from '@playwright/test'

const profileResponse = {
  avatarUrl: null,
  email: 'caio@email.com',
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Caio Elias',
  role: 'OWNER',
}

async function mockAnonymousSession(page: Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 401,
      body: JSON.stringify({ message: 'Sessão ausente.' }),
    })
  })
}

async function mockAuthenticatedSession(page: Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify({
        email: profileResponse.email,
        name: profileResponse.name,
        role: profileResponse.role,
        userId: profileResponse.id,
      }),
    })
  })
}

async function mockProfile(
  page: Page,
  options: { avatarUrl?: string | null } = {},
) {
  await page.route('**/api/v1/dashboard/profile', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        status: 200,
        body: JSON.stringify({
          ...profileResponse,
          avatarUrl: options.avatarUrl ?? profileResponse.avatarUrl,
        }),
      })
      return
    }

    await route.fallback()
  })
}

async function mockServices(page: Page) {
  await page.route('**/api/v1/dashboard/services', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      status: 200,
      body: JSON.stringify([]),
    })
  })
}

async function mockAvatarImage(page: Page) {
  await page.route('**/api/v1/dashboard/profile/avatar?v=*', async (route) => {
    await route.fulfill({
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
        'base64',
      ),
      contentType: 'image/png',
      status: 200,
    })
  })
}

async function gotoProfile(page: Page) {
  await page.goto('/dashboard/profile', { waitUntil: 'domcontentloaded' })
}

async function gotoServices(page: Page) {
  await page.goto('/dashboard/services', { waitUntil: 'domcontentloaded' })
}

test('/dashboard/profile sem sessão redireciona para login', async ({
  page,
}) => {
  await mockAnonymousSession(page)

  await gotoProfile(page)

  await expect(page).toHaveURL(/\/login$/)
})

test('/dashboard/profile autenticado renderiza dados e fallback', async ({
  page,
}) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page)

  await gotoProfile(page)

  await expect(
    page.getByRole('heading', { name: 'Perfil e segurança' }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(
    'Caio Elias',
  )
  await expect(page.getByLabel('E-mail')).toHaveValue('caio@email.com')
  await expect(page.getByText('OWNER').first()).toBeVisible()
  await expect(
    page.getByRole('main').getByText('CE', { exact: true }),
  ).toBeVisible()
})

test('PrivateLayout exibe avatar quando avatarUrl existe', async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page, { avatarUrl: '/api/v1/dashboard/profile/avatar' })
  await mockServices(page)
  await mockAvatarImage(page)

  await gotoServices(page)

  await expect(
    page.locator('aside img[src*="/api/v1/dashboard/profile/avatar?v="]'),
  ).toBeVisible()
})

test('PrivateLayout exibe iniciais quando avatarUrl é null', async ({
  page,
}) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page, { avatarUrl: null })
  await mockServices(page)

  await gotoServices(page)

  await expect(
    page.locator('aside').getByText('CE', { exact: true }),
  ).toBeVisible()
})

test('clique no usuário da sidebar navega para perfil', async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page)
  await mockServices(page)

  await gotoServices(page)
  await page.getByLabel('Abrir perfil de Caio Elias na barra lateral').click()

  await expect(page).toHaveURL(/\/dashboard\/profile$/)
})

test('clique no usuário do topo navega para perfil', async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page)
  await mockServices(page)

  await gotoServices(page)
  await page.getByLabel('Abrir perfil de Caio Elias no topo').click()

  await expect(page).toHaveURL(/\/dashboard\/profile$/)
})

test('edição de perfil envia apenas nome e email', async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page)
  let profilePayload: unknown

  await page.route('**/api/v1/dashboard/profile', async (route) => {
    if (route.request().method() === 'PUT') {
      profilePayload = route.request().postDataJSON()
      await route.fulfill({
        contentType: 'application/json',
        status: 200,
        body: JSON.stringify({
          ...profileResponse,
          email: 'novo@email.com',
          name: 'Caio Novo',
        }),
      })
      return
    }

    await route.fallback()
  })

  await gotoProfile(page)
  await page.getByLabel('Nome').fill('Caio Novo')
  await page.getByLabel('E-mail').fill('novo@email.com')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible()
  expect(profilePayload).toEqual({
    email: 'novo@email.com',
    name: 'Caio Novo',
  })
  expect(JSON.stringify(profilePayload)).not.toContain('businessId')
  expect(JSON.stringify(profilePayload)).not.toContain('role')
  expect(JSON.stringify(profilePayload)).not.toContain('userId')
})

test('troca de senha valida confirmação divergente sem chamar API', async ({
  page,
}) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page)
  let passwordCalled = false

  await page.route('**/api/v1/dashboard/profile/password', async (route) => {
    passwordCalled = true
    await route.fulfill({ status: 204 })
  })

  await gotoProfile(page)
  await page.getByLabel('Senha atual').fill('senhaAtual123')
  await page.getByLabel('Nova senha', { exact: true }).fill('novaSenha123')
  await page.getByLabel('Confirmar nova senha').fill('outraSenha123')
  await page.getByRole('button', { name: 'Alterar senha' }).click()

  await expect(page.getByText('As senhas não conferem.')).toBeVisible()
  expect(passwordCalled).toBe(false)
})

test('upload rejeita SVG no frontend', async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page)
  let uploadCalled = false

  await page.route('**/api/v1/dashboard/profile/avatar', async (route) => {
    if (route.request().method() === 'PUT') {
      uploadCalled = true
    }

    await route.fulfill({ status: 204 })
  })

  await gotoProfile(page)
  await page.getByLabel('Selecionar imagem').setInputFiles({
    buffer: Buffer.from('<svg></svg>'),
    mimeType: 'image/svg+xml',
    name: 'avatar.svg',
  })

  await expect(
    page.getByText('Envie uma imagem JPG ou PNG de até 2MB.'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enviar imagem' }))
    .toBeDisabled()
  expect(uploadCalled).toBe(false)
})

test('upload de JPG válido envia FormData sem base64', async ({ page }) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page)
  let contentType = ''
  let body = ''

  await page.route('**/api/v1/dashboard/profile/avatar', async (route) => {
    if (route.request().method() === 'PUT') {
      contentType = route.request().headers()['content-type'] ?? ''
      body = route.request().postData() ?? ''
      await route.fulfill({ status: 204 })
      return
    }

    await route.fulfill({ status: 204 })
  })

  await gotoProfile(page)
  await page.getByLabel('Selecionar imagem').setInputFiles({
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    mimeType: 'image/jpeg',
    name: 'avatar.jpg',
  })
  await page.getByRole('button', { name: 'Enviar imagem' }).click()

  await expect(page.getByText('Imagem enviada com sucesso.')).toBeVisible()
  expect(contentType).toContain('multipart/form-data')
  expect(body).toContain('name="file"')
  expect(body).not.toContain('data:image')
})

test('remover avatar chama DELETE /dashboard/profile/avatar', async ({
  page,
}) => {
  await mockAuthenticatedSession(page)
  await mockProfile(page, { avatarUrl: '/api/v1/dashboard/profile/avatar' })
  let deleteCalled = false

  await page.route('**/api/v1/dashboard/profile/avatar', async (route) => {
    if (route.request().method() === 'DELETE') {
      deleteCalled = true
      await route.fulfill({ status: 204 })
      return
    }

    await route.fulfill({ status: 204 })
  })

  await gotoProfile(page)
  await page.getByRole('button', { name: 'Remover imagem' }).click()
  await expect(
    page.getByRole('heading', { name: 'Remover imagem de perfil?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Remover imagem' }).last().click()

  await expect(page.getByText('Imagem removida com sucesso.')).toBeVisible()
  expect(deleteCalled).toBe(true)
})

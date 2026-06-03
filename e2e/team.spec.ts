import { expect, test, type Page } from '@playwright/test'

const ownerUserId = '11111111-1111-4111-8111-111111111111'
const memberId = '22222222-2222-4222-8222-222222222222'
const pendingInvitationId = '44444444-4444-4444-8444-444444444444'
const failedInvitationId = '66666666-6666-4666-8666-666666666666'
const canceledInvitationId = '77777777-7777-4777-8777-777777777777'

async function mockSession(page: Page, role: 'OWNER' | 'PROFESSIONAL') {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        email: role === 'OWNER' ? 'owner@email.com' : 'pro@email.com',
        name: role === 'OWNER' ? 'Caio Elias' : 'João Silva',
        role,
        userId: ownerUserId,
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/profile', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        avatarUrl: null,
        email: role === 'OWNER' ? 'owner@email.com' : 'pro@email.com',
        id: ownerUserId,
        name: role === 'OWNER' ? 'Caio Elias' : 'João Silva',
        role,
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/auth/csrf', async (route) => {
    await route.fulfill({
      headers: {
        'Set-Cookie': 'XSRF-TOKEN=team-csrf-token; Path=/; SameSite=Lax',
      },
      status: 204,
    })
  })
}

async function mockDashboardBasics(page: Page) {
  await page.route('**/api/v1/dashboard/appointments/by-date?*', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/appointments', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/business', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        active: true,
        address: null,
        city: 'Indaiatuba',
        createdAt: '2026-01-01T10:00:00',
        description: null,
        id: '33333333-3333-4333-8333-333333333333',
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
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/services/active', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/business-hours', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
}

async function mockTeam(page: Page) {
  await page.route(
    `**/api/v1/dashboard/team/invitations/${pendingInvitationId}/cancel`,
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          createdAt: '2026-06-01T10:00:00',
          email: 'pendente@email.com',
          emailSent: true,
          expiresAt: '2026-06-10T10:00:00',
          id: pendingInvitationId,
          name: 'Maria Pendente',
          role: 'PROFESSIONAL',
          status: 'CANCELED',
        }),
        contentType: 'application/json',
        status: 200,
      })
    },
  )

  await page.route(
    `**/api/v1/dashboard/team/invitations/${failedInvitationId}/resend`,
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          createdAt: '2026-06-01T11:00:00',
          email: 'falha@email.com',
          emailSent: true,
          expiresAt: '2026-06-10T11:00:00',
          id: failedInvitationId,
          name: 'Pedro Falha',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        }),
        contentType: 'application/json',
        status: 200,
      })
    },
  )

  await page.route(
    `**/api/v1/dashboard/team/invitations/${failedInvitationId}/archive`,
    async (route) => {
      await route.fulfill({
        body: '',
        status: 204,
      })
    },
  )

  await page.route(
    `**/api/v1/dashboard/team/invitations/${canceledInvitationId}/archive`,
    async (route) => {
      await route.fulfill({
        body: '',
        status: 204,
      })
    },
  )

  await page.route(`**/api/v1/dashboard/team/${memberId}/disable`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        active: false,
        createdAt: '2026-06-01T10:00:00',
        email: 'funcionario@email.com',
        id: memberId,
        name: 'João Silva',
        role: 'PROFESSIONAL',
        userId: '55555555-5555-4555-8555-555555555555',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          email: 'funcionario@email.com',
          emailSent: false,
          expiresAt: '2026-06-10T10:00:00',
          id: pendingInvitationId,
          inviteUrl: null,
          message:
            'Convite criado, mas o e-mail não foi enviado. Verifique a configuração de e-mail.',
          name: 'João Silva',
          role: 'PROFESSIONAL',
          status: 'EMAIL_FAILED',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fulfill({
      body: JSON.stringify([
        {
          createdAt: '2026-06-01T10:00:00',
          email: 'pendente@email.com',
          emailSent: true,
          expiresAt: '2026-06-10T10:00:00',
          id: pendingInvitationId,
          inviteUrl: '/invite/token-pendente',
          message: null,
          name: 'Maria Pendente',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        },
        {
          createdAt: '2026-06-01T11:00:00',
          email: 'falha@email.com',
          emailSent: false,
          expiresAt: '2026-06-10T11:00:00',
          id: failedInvitationId,
          inviteUrl: null,
          message: null,
          name: 'Pedro Falha',
          role: 'PROFESSIONAL',
          status: 'EMAIL_FAILED',
        },
        {
          createdAt: '2026-06-01T12:00:00',
          email: 'cancelado@email.com',
          emailSent: false,
          expiresAt: '2026-06-10T12:00:00',
          id: canceledInvitationId,
          inviteUrl: null,
          message: null,
          name: 'Carlos Cancelado',
          role: 'PROFESSIONAL',
          status: 'CANCELED',
        },
      ]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([
        {
          active: true,
          createdAt: '2026-06-01T10:00:00',
          email: 'funcionario@email.com',
          id: memberId,
          name: 'João Silva',
          role: 'PROFESSIONAL',
          userId: '55555555-5555-4555-8555-555555555555',
        },
      ]),
      contentType: 'application/json',
      status: 200,
    })
  })
}

test('OWNER vê item Equipe no menu', async ({ page }) => {
  await mockSession(page, 'OWNER')
  await mockDashboardBasics(page)

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('link', { name: 'Equipe' })).toBeVisible()
})

test('PROFESSIONAL não vê menus de gestão', async ({ page }) => {
  await mockSession(page, 'PROFESSIONAL')
  await mockDashboardBasics(page)

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  const desktopMenu = page.locator('aside').getByRole('navigation', {
    name: 'Principal',
  })

  await expect(desktopMenu.getByRole('link', { name: 'Serviços' }))
    .toHaveCount(0)
  await expect(desktopMenu.getByRole('link', { name: 'Horários' }))
    .toHaveCount(0)
  await expect(desktopMenu.getByRole('link', { name: 'Link público' }))
    .toHaveCount(0)
  await expect(desktopMenu.getByRole('link', { name: 'Equipe' })).toHaveCount(0)
  await expect(desktopMenu.getByRole('link', { name: 'Agendamentos' }))
    .toBeVisible()
})

test('/dashboard/team como OWNER renderiza formulário de convite', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Equipe' })).toBeVisible()
  await expect(page.getByText('Convidar profissional'))
    .toBeVisible()
  await expect(page.getByText('João Silva')).toBeVisible()
  await expect(page.getByText('Maria Pendente')).toBeVisible()
  await expect(page.getByText('Pedro Falha')).toBeVisible()
  await expect(page.getByText('Falha no envio')).toBeVisible()
  await expect(
    page
      .locator('article')
      .filter({ hasText: 'Pedro Falha' })
      .getByRole('button', { name: 'Copiar link' }),
  ).toHaveCount(0)
})

test('erro 409 ao criar convite orienta e mantém listas visíveis', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)

  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          message: 'Este e-mail já está cadastrado ou vinculado.',
        }),
        contentType: 'application/json',
        status: 409,
      })
      return
    }

    await route.fallback()
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(
    page.getByText(
      'Esse e-mail já pertence à equipe ou já possui convite pendente. Verifique as listas abaixo.',
    ),
  ).toBeVisible()
  await expect(page.getByText('João Silva')).toBeVisible()
  await expect(page.getByText('Maria Pendente')).toBeVisible()
})

test('falha de e-mail no convite não aparece como sessão expirada', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)

  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          message: 'Falha ao enviar e-mail pelo Resend.',
        }),
        contentType: 'application/json',
        status: 401,
      })
      return
    }

    await route.fallback()
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(
    page.getByText(
      'Falha temporária no serviço de e-mail. Tente reenviar o convite em instantes.',
    ),
  ).toBeVisible()
  await expect(page.getByText('Sua sessão expirou. Faça login novamente.'))
    .toHaveCount(0)
})

test('erro em GET invitations não esconde profissionais da equipe', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)

  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        body: JSON.stringify({
          message: 'Falha ao listar convites.',
        }),
        contentType: 'application/json',
        status: 500,
      })
      return
    }

    await route.fallback()
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })

  await expect(page.getByText('João Silva')).toBeVisible()
  await expect(page.getByText('funcionario@email.com')).toBeVisible()
  await expect(page.getByText('Não foi possível carregar os convites.'))
    .toBeVisible()
})

test('401 genérico no convite continua sendo sessão expirada', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)

  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          message: 'Unauthorized',
        }),
        contentType: 'application/json',
        status: 401,
      })
      return
    }

    await route.fallback()
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(page.getByText('Sua sessão expirou. Faça login novamente.'))
    .toBeVisible()
})

test('cancelar convite abre AlertDialog e chama endpoint correto', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)
  let cancelCalled = false

  await page.route(
    `**/api/v1/dashboard/team/invitations/${pendingInvitationId}/cancel`,
    async (route) => {
      cancelCalled = true
      await route.fulfill({
        body: JSON.stringify({
          createdAt: '2026-06-01T10:00:00',
          email: 'pendente@email.com',
          emailSent: true,
          expiresAt: '2026-06-10T10:00:00',
          id: pendingInvitationId,
          name: 'Maria Pendente',
          role: 'PROFESSIONAL',
          status: 'CANCELED',
        }),
        contentType: 'application/json',
        status: 200,
      })
    },
  )

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page
    .locator('article')
    .filter({ hasText: 'Maria Pendente' })
    .getByRole('button', { name: 'Cancelar convite' })
    .click()

  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Cancelar convite' })
    .click()

  await expect.poll(() => cancelCalled).toBe(true)
})

test('reenviar convite chama endpoint correto', async ({ page }) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)
  let resendCalled = false

  await page.route(
    `**/api/v1/dashboard/team/invitations/${failedInvitationId}/resend`,
    async (route) => {
      resendCalled = true
      await route.fulfill({
        body: JSON.stringify({
          createdAt: '2026-06-01T11:00:00',
          email: 'falha@email.com',
          emailSent: true,
          expiresAt: '2026-06-10T11:00:00',
          id: failedInvitationId,
          name: 'Pedro Falha',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        }),
        contentType: 'application/json',
        status: 200,
      })
    },
  )

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page
    .locator('article')
    .filter({ hasText: 'Pedro Falha' })
    .getByRole('button', { name: 'Reenviar' })
    .click()

  await expect.poll(() => resendCalled).toBe(true)
})

test('convites arquiváveis mostram Remover do histórico e pendente não mostra', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })

  await expect(
    page
      .locator('article')
      .filter({ hasText: 'Pedro Falha' })
      .getByRole('button', { name: 'Remover do histórico' }),
  ).toBeVisible()
  await expect(
    page
      .locator('article')
      .filter({ hasText: 'Carlos Cancelado' })
      .getByRole('button', { name: 'Remover do histórico' }),
  ).toBeVisible()
  await expect(
    page
      .locator('article')
      .filter({ hasText: 'Maria Pendente' })
      .getByRole('button', { name: 'Remover do histórico' }),
  ).toHaveCount(0)
})

test('remover convite do histórico abre AlertDialog e chama PATCH archive sem payload', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)
  let archiveCalled = false
  let archivePayload: string | null = 'not-called'

  await page.route(
    `**/api/v1/dashboard/team/invitations/${failedInvitationId}/archive`,
    async (route) => {
      archiveCalled = true
      archivePayload = route.request().postData()
      await route.fulfill({
        body: '',
        status: 204,
      })
    },
  )

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page
    .locator('article')
    .filter({ hasText: 'Pedro Falha' })
    .getByRole('button', { name: 'Remover do histórico' })
    .click()

  await expect(page.getByRole('alertdialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Remover convite do histórico?' }),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Esse convite será ocultado da lista, mas o registro poderá permanecer para auditoria.',
    ),
  ).toBeVisible()

  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Remover' })
    .click()

  await expect.poll(() => archiveCalled).toBe(true)
  expect(archivePayload).toBeNull()
})

test('após arquivar convite ele some da lista após refetch', async ({ page }) => {
  await mockSession(page, 'OWNER')
  let archived = false

  await page.route(
    `**/api/v1/dashboard/team/invitations/${failedInvitationId}/archive`,
    async (route) => {
      archived = true
      await route.fulfill({
        body: '',
        status: 204,
      })
    },
  )

  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    await route.fulfill({
      body: JSON.stringify(
        archived
          ? []
          : [
              {
                createdAt: '2026-06-01T11:00:00',
                email: 'falha@email.com',
                emailSent: false,
                expiresAt: '2026-06-10T11:00:00',
                id: failedInvitationId,
                inviteUrl: null,
                message: null,
                name: 'Pedro Falha',
                role: 'PROFESSIONAL',
                status: 'EMAIL_FAILED',
              },
            ],
      ),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Pedro Falha')).toBeVisible()

  await page
    .locator('article')
    .filter({ hasText: 'Pedro Falha' })
    .getByRole('button', { name: 'Remover do histórico' })
    .click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Remover' })
    .click()

  await expect(page.getByText('Pedro Falha')).toHaveCount(0)
})

test('erro 400 ao arquivar convite pendente mostra orientação segura', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)

  await page.route(
    `**/api/v1/dashboard/team/invitations/${failedInvitationId}/archive`,
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          message: 'Convites pendentes não podem ser arquivados.',
        }),
        contentType: 'application/json',
        status: 400,
      })
    },
  )

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page
    .locator('article')
    .filter({ hasText: 'Pedro Falha' })
    .getByRole('button', { name: 'Remover do histórico' })
    .click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Remover' })
    .click()

  await expect(
    page.getByText('Cancele o convite antes de removê-lo do histórico.'),
  ).toBeVisible()
})

test('desativar profissional abre AlertDialog e chama endpoint correto', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await mockTeam(page)
  let disableCalled = false

  await page.route(`**/api/v1/dashboard/team/${memberId}/disable`, async (route) => {
    disableCalled = true
    await route.fulfill({
      body: JSON.stringify({
        active: false,
        createdAt: '2026-06-01T10:00:00',
        email: 'funcionario@email.com',
        id: memberId,
        name: 'João Silva',
        role: 'PROFESSIONAL',
        userId: '55555555-5555-4555-8555-555555555555',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page
    .locator('article')
    .filter({ hasText: 'João Silva' })
    .getByRole('button', { name: 'Desativar' })
    .click()

  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Desativar' })
    .click()

  await expect.poll(() => disableCalled).toBe(true)
})

test('criar convite chama POST sem businessId, role ou userId', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  let payload: unknown

  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      payload = route.request().postDataJSON()
      await route.fulfill({
        body: JSON.stringify({
          email: 'funcionario@email.com',
          emailSent: true,
          expiresAt: '2026-06-10T10:00:00',
          id: '44444444-4444-4444-8444-444444444444',
          message: 'Convite enviado com sucesso.',
          name: 'João Silva',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(
    page.getByText('Convite enviado para funcionario@email.com.'),
  ).toBeVisible()
  expect(payload).toEqual({
    email: 'funcionario@email.com',
    name: 'João Silva',
  })
  expect(JSON.stringify(payload)).not.toContain('businessId')
  expect(JSON.stringify(payload)).not.toContain('userId')
  expect(JSON.stringify(payload)).not.toContain('role')
})

test('criar convite com emailSent=true não exige copiar link', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          email: 'funcionario@email.com',
          emailSent: true,
          expiresAt: '2026-06-10T10:00:00',
          id: '44444444-4444-4444-8444-444444444444',
          inviteUrl: null,
          message: 'Convite enviado com sucesso.',
          name: 'João Silva',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(
    page.getByText('Convite enviado para funcionario@email.com.'),
  ).toBeVisible()
  await expect(page.getByLabel('Link de desenvolvimento')).toHaveCount(0)
})

test('criar convite com emailSent=false e inviteUrl null mostra aviso sem copiar', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          email: 'funcionario@email.com',
          emailSent: false,
          expiresAt: '2026-06-10T10:00:00',
          id: '44444444-4444-4444-8444-444444444444',
          inviteUrl: null,
          message:
            'Convite criado, mas o e-mail não foi enviado. Verifique a configuração de e-mail.',
          name: 'João Silva',
          role: 'PROFESSIONAL',
          status: 'EMAIL_FAILED',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(
    page.getByText('Convite criado, mas o e-mail não foi enviado.'),
  ).toBeVisible()
  await expect(
    page.getByText('Verifique a configuração de e-mail ou tente reenviar.'),
  ).toBeVisible()
  await expect(page.getByLabel('Link de desenvolvimento')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Copiar convite' }))
    .toHaveCount(0)
})

test('emailSent=false com inviteUrl absoluto mostra link sem duplicar origem', async ({
  page,
}) => {
  await mockSession(page, 'OWNER')
  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          email: 'funcionario@email.com',
          emailSent: false,
          expiresAt: '2026-06-10T10:00:00',
          id: '44444444-4444-4444-8444-444444444444',
          inviteUrl: 'http://localhost:5173/invite/token-dev',
          message: 'Convite criado. Envio de e-mail desabilitado neste ambiente.',
          name: 'João Silva',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(
    page.getByText('Convite criado, mas o e-mail não foi enviado.'),
  ).toBeVisible()
  await expect(page.getByLabel('Link de desenvolvimento')).toHaveValue(
    'http://localhost:5173/invite/token-dev',
  )
  await expect(page.getByLabel('Link de desenvolvimento')).not.toHaveValue(
    /http:\/\/localhost:5173http/,
  )
})

test('inviteUrl relativo vira URL completa segura', async ({ page }) => {
  await mockSession(page, 'OWNER')
  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          email: 'funcionario@email.com',
          emailSent: false,
          expiresAt: '2026-06-10T10:00:00',
          id: '44444444-4444-4444-8444-444444444444',
          inviteUrl: '/invite/token-relativo',
          message: 'Convite criado. Envio de e-mail desabilitado neste ambiente.',
          name: 'João Silva',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(page.getByLabel('Link de desenvolvimento')).toHaveValue(
    `${new URL('/invite/token-relativo', 'http://127.0.0.1:4173').toString()}`,
  )
})

test('inviteUrl inválido não é exibido', async ({ page }) => {
  await mockSession(page, 'OWNER')
  await page.route('**/api/v1/dashboard/team/invitations', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        body: JSON.stringify({
          email: 'funcionario@email.com',
          emailSent: false,
          expiresAt: '2026-06-10T10:00:00',
          id: '44444444-4444-4444-8444-444444444444',
          inviteUrl: 'http;',
          message: 'Convite criado. Envio de e-mail desabilitado neste ambiente.',
          name: 'João Silva',
          role: 'PROFESSIONAL',
          status: 'PENDING',
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })
  await page.route('**/api/v1/dashboard/team', async (route) => {
    await route.fulfill({
      body: JSON.stringify([]),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('E-mail').fill('funcionario@email.com')
  await page.getByRole('button', { name: 'Enviar convite' }).click()

  await expect(
    page.getByText('Convite criado, mas o e-mail não foi enviado.'),
  ).toBeVisible()
  await expect(page.getByLabel('Link de desenvolvimento')).toHaveCount(0)
})

test('/invite/:token renderiza dados do convite', async ({ page }) => {
  await page.route('**/api/v1/auth/invitations/token-profissional', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        businessName: 'Barbearia do Caio',
        email: 'funcionario@email.com',
        expiresAt: '2026-06-10T10:00:00',
        name: 'João Silva',
        role: 'PROFESSIONAL',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/invite/token-profissional', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Aceitar convite' }))
    .toBeVisible()
  await expect(page.getByText('Barbearia do Caio')).toBeVisible()
  await expect(page.getByText('funcionario@email.com')).toBeVisible()
})

test('aceitar convite chama POST público', async ({ page }) => {
  let payload: unknown

  await page.route(
    '**/api/v1/auth/invitations/token-profissional/accept',
    async (route) => {
      payload = route.request().postDataJSON()
      await route.fulfill({
        body: JSON.stringify({
          businessName: 'Barbearia do Caio',
          email: 'funcionario@email.com',
          message: 'Convite aceito com sucesso.',
          role: 'PROFESSIONAL',
        }),
        contentType: 'application/json',
        status: 200,
      })
    },
  )

  await page.route('**/api/v1/auth/invitations/token-profissional', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        businessName: 'Barbearia do Caio',
        email: 'funcionario@email.com',
        expiresAt: '2026-06-10T10:00:00',
        name: 'João Silva',
        role: 'PROFESSIONAL',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/invite/token-profissional', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('Senha', { exact: true }).fill('senhaSegura123')
  await page.getByLabel('Confirmar senha').fill('senhaSegura123')
  await page.getByRole('button', { name: 'Aceitar convite' }).click()

  await expect(page.getByText('Convite aceito com sucesso.')).toBeVisible()
  expect(payload).toEqual({
    confirmPassword: 'senhaSegura123',
    name: 'João Silva',
    password: 'senhaSegura123',
  })
})

test('senha divergente não chama API de aceite', async ({ page }) => {
  let postCalled = false

  await page.route('**/api/v1/auth/invitations/token-profissional', async (route) => {
    if (route.request().method() === 'POST') {
      postCalled = true
    }

    await route.fulfill({
      body: JSON.stringify({
        businessName: 'Barbearia do Caio',
        email: 'funcionario@email.com',
        expiresAt: '2026-06-10T10:00:00',
        name: 'João Silva',
        role: 'PROFESSIONAL',
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/invite/token-profissional', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Nome').fill('João Silva')
  await page.getByLabel('Senha', { exact: true }).fill('senhaSegura123')
  await page.getByLabel('Confirmar senha').fill('outraSenha123')
  await page.getByRole('button', { name: 'Aceitar convite' }).click()

  await expect(page.getByText('As senhas não conferem.')).toBeVisible()
  expect(postCalled).toBe(false)
})

test('rota restrita para PROFESSIONAL mostra 403', async ({ page }) => {
  await mockSession(page, 'PROFESSIONAL')

  await page.goto('/dashboard/team', { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Acesso restrito' }))
    .toBeVisible()
})

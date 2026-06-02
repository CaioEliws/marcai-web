# E2E — Marcaí Web

Os testes E2E usam Playwright e sobem o Vite automaticamente.

Comandos:

```bash
npm run test:e2e
npm run test:e2e:ui
```

Para os testes básicos, as respostas HTTP principais são interceptadas no próprio teste. Fluxos completos com backend real exigem a Marcaí API rodando, cookies HttpOnly configurados e dados de teste controlados. Não use credenciais reais nos testes.

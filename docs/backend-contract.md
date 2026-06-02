# Backend Contract — Marcaí API

## Base

Backend: Java/Spring Boot
API prefix provável:

```txt
/api/v1
```

No frontend, preferir chamadas relativas:

```txt
/api/v1/...
```

Quando necessário em desenvolvimento, configurar proxy no Vite para encaminhar `/api` ao backend local.

---

## Stack e arquitetura do backend

O backend Marcaí API usa:

* Java 17+
* Spring Boot
* Spring Security
* JWT
* BCrypt
* JPA/Hibernate
* PostgreSQL
* Flyway Migrations
* Bean Validation
* Controllers
* Services
* Repositories
* DTOs
* Mappers
* Exceptions

Arquitetura esperada:

```txt
Controller -> Service -> Repository -> Database
```

O frontend não deve depender de detalhes internos de entity, repository ou tabela. Consumir apenas DTOs expostos pela API.

---

## Segurança e autenticação

O backend atual trabalha com rotas públicas e privadas.

Rotas públicas esperadas:

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/public/**
POST /api/v1/public/**
GET  /actuator/health
```

Rotas privadas esperadas:

```txt
/api/v1/dashboard/**
/api/v1/auth/me
POST /api/v1/auth/logout
```

Rotas privadas exigem autenticação válida.

O frontend deve:

* tratar `401` como não autenticado
* tratar `403` como sem permissão
* não armazenar JWT em localStorage/sessionStorage
* usar `credentials: 'include'` quando aplicável
* usar sessão baseada em cookie HttpOnly quando autenticado
* não expor token em logs, console ou UI

O login envia cookie HttpOnly pelo header `Set-Cookie`. O frontend não deve ler, salvar ou reenviar token manualmente.

### CSRF

O backend usa CSRF stateless via double-submit token para mutações privadas.

Cookies envolvidos:

```txt
marcai_access_token = cookie HttpOnly de autenticação
XSRF-TOKEN = cookie legível usado apenas como token CSRF
```

Para métodos mutáveis em rotas privadas de dashboard, o frontend deve ler o cookie `XSRF-TOKEN` no momento da request e enviar:

```txt
X-XSRF-TOKEN: <valor do cookie XSRF-TOKEN>
```

Aplicar CSRF apenas para:

```txt
POST   /api/v1/dashboard/**
PUT    /api/v1/dashboard/**
PATCH  /api/v1/dashboard/**
DELETE /api/v1/dashboard/**
```

Não enviar header CSRF para:

```txt
GET
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
/api/v1/public/**
```

O frontend não deve armazenar o token CSRF em localStorage/sessionStorage nem expor o valor em logs. Se o cookie `XSRF-TOKEN` estiver ausente, a request deve seguir sem header e o backend deve responder `403`.

---

## Regra crítica: multi-tenancy

O backend é multi-tenant.

Toda entidade privada vinculada a uma empresa deve ser acessada pelo `business_id` do usuário autenticado.

Regra para o frontend:

```txt
Nunca enviar businessId como fonte de autorização em endpoints privados.
```

O frontend pode receber dados da empresa para exibição, mas não deve construir fluxos que dependam do usuário escolher ou alterar `businessId` para acessar dados privados.

Entidades sensíveis ao isolamento:

* Business
* BusinessMember
* ServiceItem
* BusinessHour
* Client
* Appointment
* BusinessBookingSettings
* PublicBookingAttempt em contexto privado

---

## Roles

Roles principais:

```txt
ADMIN
OWNER
PROFESSIONAL
```

Authorities no backend:

```txt
ROLE_ADMIN
ROLE_OWNER
ROLE_PROFESSIONAL
```

No frontend:

* role pode ser usada para UX condicional
* role não substitui autorização do backend
* não criar novas roles sem confirmação
* não assumir acesso apenas porque o botão está visível ou oculto

---

## Formato esperado de erro

Formato provável de erro da API:

```json
{
  "timestamp": "2026-01-01T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Mensagem do erro",
  "path": "/api/v1/...",
  "fieldErrors": [
    {
      "field": "email",
      "message": "E-mail inválido"
    }
  ]
}
```

O frontend deve estar preparado para:

* `400` erro de validação
* `401` não autenticado
* `403` sem permissão
* `404` recurso inexistente ou inacessível
* `409` conflito de regra de negócio
* `429` rate limit, se implementado
* `500` erro interno genérico

Nunca exibir stack trace, SQL, token, segredo ou detalhe interno para o usuário.

---

## Auth

Rotas esperadas:

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

### Login

Payload:

```json
{
  "email": "usuario@email.com",
  "password": "senha"
}
```

Resposta:

```json
{
  "userId": "uuid",
  "businessId": "uuid",
  "name": "Caio Elias",
  "email": "caio@email.com",
  "role": "OWNER"
}
```

Regras frontend:

* validar e-mail e senha com Zod antes de enviar
* não informar se e-mail existe ou não
* tratar erro com mensagem genérica
* não salvar token em localStorage/sessionStorage
* não usar `Authorization: Bearer` manualmente
* manter `credentials: 'include'`
* após sucesso, invalidar/refazer `/auth/me`

Mensagem segura para falha:

```txt
Credenciais inválidas.
```

### Me

Rota:

```txt
GET /api/v1/auth/me
```

Autenticação:

```txt
Cookie HttpOnly enviado automaticamente pelo navegador
```

Resposta:

```json
{
  "userId": "uuid",
  "name": "Caio Elias",
  "email": "caio@email.com",
  "role": "OWNER"
}
```

Regras frontend:

* tratar `401` como sessão ausente ou expirada
* tratar `403` como sem permissão
* não persistir dados sensíveis fora do cache controlado da aplicação

### Logout

Rota:

```txt
POST /api/v1/auth/logout
```

Comportamento esperado:

* backend limpa o cookie de autenticação
* frontend limpa/invalida cache de autenticação
* não há token para remover no frontend

### Register

O cadastro deve criar no backend, em uma única transação:

* User
* Business
* BusinessMember
* BusinessBookingSettings

Payload provável:

```json
{
  "name": "Caio",
  "email": "caio@email.com",
  "password": "senha",
  "businessName": "Barbearia Exemplo",
  "businessPhone": "11999999999"
}
```

Resposta:

```json
{
  "userId": "uuid",
  "businessId": "uuid",
  "name": "Caio",
  "email": "caio@email.com",
  "businessName": "Barbearia Exemplo",
  "slug": "barbearia-exemplo",
  "message": "Conta criada com sucesso."
}
```

Regras frontend:

* validar campos obrigatórios
* validar e-mail
* validar tamanho mínimo de senha
* normalizar telefone quando aplicável
* não enviar role manualmente
* não enviar businessId
* tratar conflito de e-mail/slug com `409` quando aplicável

---

## Business

Representa a empresa do usuário autenticado.

Endpoint privado:

```txt
GET /api/v1/dashboard/business
PUT /api/v1/dashboard/business
```

Update payload:

```json
{
  "name": "Barbearia do Caio",
  "slug": "barbearia-do-caio",
  "description": "Cortes masculinos, barba e acabamento.",
  "phone": "11999999999",
  "address": "Rua Exemplo, 123",
  "city": "Indaiatuba",
  "state": "SP"
}
```

Response:

```json
{
  "id": "uuid",
  "name": "Barbearia do Caio",
  "slug": "barbearia-do-caio",
  "description": "Cortes masculinos, barba e acabamento.",
  "phone": "11999999999",
  "address": "Rua Exemplo, 123",
  "city": "Indaiatuba",
  "state": "SP",
  "active": true,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-01T10:30:00"
}
```

Regras frontend:

* não permitir alteração de `id` pela UI
* não usar `businessId` como parâmetro de autorização privada
* exibir `slug` como link público quando disponível
* montar link público com origem atual do frontend e `slug`
* validar slug antes de enviar: 3 a 80 caracteres, letras minúsculas, números e hífen
* ao editar apenas o slug, preservar os demais campos atuais no payload do `PUT`
* tratar `409` como slug já utilizado
* não expor dados internos desnecessários

---

## BusinessMember

Relaciona usuário e empresa.

Campos esperados:

```txt
id
user
business
role
active
```

Regras frontend:

* não exibir dados sensíveis do usuário
* role pode controlar UX, mas não autorização real
* alterações de membros devem ser tratadas como operação sensível

---

## ServiceItem

Representa serviço oferecido pela empresa.

Endpoints privados:

```txt
POST  /api/v1/dashboard/services
GET   /api/v1/dashboard/services
GET   /api/v1/dashboard/services/active
GET   /api/v1/dashboard/services/{id}
PUT   /api/v1/dashboard/services/{id}
PATCH /api/v1/dashboard/services/{id}/disable
PATCH /api/v1/dashboard/services/{id}/enable
```

Não existe `DELETE`; remoção lógica deve usar `disable`.

Create payload:

```json
{
  "name": "Corte masculino",
  "description": "Corte tradicional",
  "price": 50.00,
  "durationMinutes": 30
}
```

Update payload:

```json
{
  "name": "Barba",
  "description": "Barba completa",
  "price": 40.00,
  "durationMinutes": 25,
  "active": true
}
```

Response:

```json
{
  "id": "uuid",
  "name": "Corte masculino",
  "description": "Corte tradicional",
  "price": 50.00,
  "durationMinutes": 30,
  "active": true,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": null
}
```

Regras de negócio:

* `name` obrigatório, entre 2 e 120 caracteres
* `description` opcional, máximo 500 caracteres
* `price` pode ser `null`, mas não pode ser negativo quando enviado
* `durationMinutes` obrigatório, maior que zero e menor ou igual a 720
* `active` obrigatório apenas no update
* `updatedAt` pode ser `null` em serviços recém-criados
* serviço pertence à empresa autenticada em rotas privadas
* serviço inativo não aparece em rotas públicas
* serviço inativo não deve ser usado em novos agendamentos públicos

Regras frontend:

* validar `name`
* validar `description`
* validar `price >= 0` quando informado
* validar `durationMinutes > 0 && durationMinutes <= 720`
* não enviar `businessId`
* tratar `409` para duplicidade ou conflito quando aplicável
* invalidar cache de serviços após criação/edição/remoção
* não criar operação de delete

---

## BusinessHour

Representa horário de funcionamento.

Endpoints privados:

```txt
POST   /api/v1/dashboard/business-hours
GET    /api/v1/dashboard/business-hours
GET    /api/v1/dashboard/business-hours/active
GET    /api/v1/dashboard/business-hours/{id}
PUT    /api/v1/dashboard/business-hours/{id}
DELETE /api/v1/dashboard/business-hours/{id}
```

Create payload:

```json
{
  "dayOfWeek": 1,
  "openingTime": "09:00:00",
  "closingTime": "18:00:00"
}
```

Update payload:

```json
{
  "dayOfWeek": 1,
  "openingTime": "09:00:00",
  "closingTime": "18:00:00",
  "active": true
}
```

Response:

```json
{
  "id": "uuid",
  "dayOfWeek": 1,
  "dayName": "Segunda-feira",
  "openingTime": "09:00:00",
  "closingTime": "18:00:00",
  "active": true
}
```

Padrão de `dayOfWeek`:

```txt
0 = Domingo
1 = Segunda-feira
2 = Terça-feira
3 = Quarta-feira
4 = Quinta-feira
5 = Sexta-feira
6 = Sábado
```

Regras de negócio:

* `dayOfWeek` obrigatório, inteiro entre 0 e 6
* `openingTime` obrigatório no formato `HH:mm:ss`
* `closingTime` obrigatório no formato `HH:mm:ss`
* abertura antes do fechamento
* no máximo 1 BusinessHour por `dayOfWeek` por empresa, independentemente de `active`
* `active` obrigatório apenas no update
* `DELETE` existe e remove a configuração do dia
* alterações privadas devem respeitar `business_id` do usuário autenticado

Regras frontend:

* validar `dayOfWeek`
* validar formato de horário
* validar `openingTime < closingTime`
* não enviar `businessId`
* bloquear duplicidade visualmente quando possível
* invalidar cache de horários após criação/edição/remoção
* backend continua sendo fonte de verdade

---

## Client

Representa cliente final que agenda pelo link público.

Campos esperados:

```txt
id
business
name
phone
active
```

Regras:

* telefone deve ser normalizado para evitar duplicidade por empresa
* dados de cliente são sensíveis
* não exibir mais informações do que o necessário
* não vazar clientes entre empresas

---

## Appointment

Representa agendamento.

Endpoints privados:

```txt
GET   /api/v1/dashboard/appointments
GET   /api/v1/dashboard/appointments/by-date?date=YYYY-MM-DD
GET   /api/v1/dashboard/appointments/{id}
PATCH /api/v1/dashboard/appointments/{id}/cancel
PATCH /api/v1/dashboard/appointments/{id}/complete
PATCH /api/v1/dashboard/appointments/{id}/no-show
```

PATCH actions não recebem body.

Response:

```json
{
  "id": "uuid",
  "clientId": "uuid",
  "clientName": "João Silva",
  "clientPhone": "11999999999",
  "serviceId": "uuid",
  "serviceName": "Corte masculino",
  "servicePrice": 40.00,
  "serviceDurationMinutes": 30,
  "appointmentDate": "2026-06-10",
  "startTime": "09:00:00",
  "endTime": "09:30:00",
  "status": "SCHEDULED",
  "notes": null,
  "createdAt": "2026-06-01T10:00:00",
  "updatedAt": "2026-06-01T10:30:00"
}
```

Status possíveis:

```txt
SCHEDULED
CONFIRMED
COMPLETED
CANCELED
NO_SHOW
```

`CONFIRMED` existe no enum do backend, mas não há endpoint privado para confirmar. O frontend deve tratar como status possível de exibição, sem ação específica.

Status que bloqueia conflito:

```txt
SCHEDULED
```

Status que não bloqueiam novo agendamento:

```txt
CANCELED
NO_SHOW
COMPLETED
```

Regras frontend:

* exibir status de forma clara
* permitir ações conforme role e estado
* evitar múltiplos submits
* invalidar cache após alteração
* tratar conflito de horário com `409`
* não enviar `businessId`
* não criar endpoint inexistente de confirmar
* não criar criação/edição privada de agendamento sem contrato específico

---

## BusinessBookingSettings

Representa regras de agendamento da empresa.

Campos esperados:

```txt
id
business
slotIntervalMinutes
minAdvanceMinutes
maxDaysInAdvance
maxActiveAppointmentsPerPhone
allowedOverlapMinutes
```

Regras frontend:

* validar números positivos ou zero conforme contrato
* explicar efeitos das configurações na UI
* não permitir valores absurdos sem validação
* backend continua sendo fonte de verdade

---

## PublicBookingAttempt

Representa tentativa de agendamento público.

Campos esperados:

```txt
id
business
phone
ip
success
reason
createdAt
```

Uso esperado:

* auditoria
* futura proteção contra abuso
* base para rate limit

Frontend não deve depender diretamente dessa entidade em fluxo público comum.

---

## Public Booking

Fluxo público por slug.

Endpoints públicos:

```txt
GET  /api/v1/public/businesses/{slug}
GET  /api/v1/public/businesses/{slug}/services
GET  /api/v1/public/businesses/{slug}/available-times?serviceId={uuid}&date=YYYY-MM-DD
POST /api/v1/public/businesses/{slug}/appointments
```

Business response:

```json
{
  "id": "uuid",
  "name": "Barbearia do Caio",
  "slug": "barbearia-do-caio",
  "description": "...",
  "phone": "11999999999",
  "address": "...",
  "city": "Indaiatuba",
  "state": "SP"
}
```

Services response:

```json
[
  {
    "id": "uuid",
    "name": "Corte masculino",
    "description": "Corte tradicional",
    "price": 50.00,
    "durationMinutes": 30
  }
]
```

Available times response:

```json
{
  "serviceId": "uuid",
  "date": "2026-06-10",
  "availableTimes": ["09:00:00", "09:30:00"]
}
```

Create appointment payload:

```json
{
  "clientName": "João Silva",
  "clientPhone": "11999999999",
  "serviceId": "uuid",
  "appointmentDate": "2026-06-10",
  "startTime": "09:00:00"
}
```

Create appointment response:

```json
{
  "appointmentId": "uuid",
  "message": "Agendamento realizado com sucesso.",
  "businessName": "Barbearia do Caio",
  "serviceName": "Corte masculino",
  "clientName": "João Silva",
  "appointmentDate": "2026-06-10",
  "startTime": "09:00:00",
  "endTime": "09:30:00"
}
```

Pipeline de validação do backend:

* empresa existe
* empresa está ativa
* serviço existe
* serviço está ativo
* serviço pertence à empresa do slug informado
* data não está no passado
* horário respeita `minAdvanceMinutes`
* data respeita `maxDaysInAdvance`
* horário está dentro do BusinessHour do dia
* horário final é calculado pela duração do serviço
* não existe conflito com agendamentos ativos
* agendamentos cancelados não bloqueiam novo horário
* telefone é normalizado
* respeita `maxActiveAppointmentsPerPhone`
* considera `allowedOverlapMinutes`, quando existir

Regras frontend:

* validar nome
* validar telefone
* validar serviço selecionado
* validar data e horário
* evitar duplo clique/múltiplos submits
* tratar `409` como conflito de horário/regra
* tratar `429` como excesso de tentativas quando existir
* nunca expor dados internos da empresa

---

## Dashboard

Rotas privadas prováveis:

```txt
GET /api/v1/dashboard/**
```

Dados possíveis:

* métricas do negócio
* próximos agendamentos
* serviços ativos
* horários configurados
* clientes recentes
* indicadores financeiros, se existirem

Regras frontend:

* tratar dados como sensíveis
* não manter dados de outra sessão após logout
* limpar/invalidate cache ao sair da conta
* evitar logs com payload completo
* usar React Query para cache e invalidação

---

## Padrão de contratos no frontend

Para cada endpoint:

```txt
features/<feature>/
  schemas/
    <feature>.schema.ts
  api/
    <feature>Api.ts
  hooks/
    use<Feature>.ts
```

Exemplo:

```ts
import { z } from 'zod'

export const serviceItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  durationMinutes: z.number(),
  active: z.boolean(),
})

export type ServiceItem = z.infer<typeof serviceItemSchema>
```

Respostas da API devem ser validadas antes de entrar na UI.

Payloads críticos devem ser validados antes de envio.

---

## Cache e invalidação

Regras recomendadas:

* `auth/me`: invalidar após login/logout
* `services`: invalidar após criar/editar/remover serviço
* `appointments`: invalidar após criar/cancelar/concluir/no-show
* `availability`: invalidar após editar horários
* `dashboard`: invalidar após mudanças que afetem métricas

Query keys devem ser estáveis e previsíveis.

Exemplo:

```ts
export const serviceQueryKeys = {
  all: ['services'] as const,
  detail: (id: number) => ['services', id] as const,
}
```

---

## Observações importantes

O backend é a fonte de verdade para regras críticas.

O frontend deve:

* melhorar UX
* reduzir erros óbvios
* validar contratos
* proteger contra exposição acidental
* não criar atalhos inseguros

O frontend não deve:

* decidir autorização final
* confiar em role como segurança real
* confiar em businessId enviado pelo usuário
* armazenar token de forma insegura
* renderizar dados sensíveis sem necessidade

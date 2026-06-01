# Product Scope — Marcaí Web

## O que é a Marcaí

A Marcaí é um SaaS multi-tenant de agendamento online para pequenos negócios e profissionais de serviços. O sistema permite que uma empresa configure serviços, horários disponíveis e receba agendamentos por um link público.

O frontend Marcaí Web é a interface usada por donos, administradores e profissionais para operar o negócio, além de oferecer uma experiência pública simples para clientes finais agendarem horários.

## Público-alvo

Público principal:

* barbearias
* salões de beleza
* profissionais autônomos
* clínicas pequenas
* prestadores de serviço com agenda por horário

Perfil esperado:

* baixa tolerância a complexidade operacional
* necessidade de cadastro rápido
* uso frequente em celular
* foco em agenda, serviços e disponibilidade
* pouca necessidade inicial de customização avançada

## Objetivo do MVP

O MVP deve permitir que uma empresa:

* crie uma conta
* acesse um dashboard privado
* cadastre serviços
* configure horários de funcionamento
* receba agendamentos por link público
* visualize e gerencie agendamentos

O foco do MVP é validar o fluxo principal de agendamento com segurança, simplicidade e dados isolados por empresa.

## Áreas principais do sistema

Áreas privadas:

* autenticação
* dashboard
* serviços
* horários e disponibilidade
* agendamentos
* dados básicos da empresa

Área pública:

* página pública por slug
* seleção de serviço
* seleção de data e horário
* identificação do cliente
* confirmação de agendamento

## Fluxo de autenticação

Fluxos esperados:

* cadastro de usuário e empresa
* login
* consulta da sessão atual
* logout

Regras:

* não armazenar JWT em localStorage ou sessionStorage
* preparar integração para cookies HttpOnly/BFF
* usar `credentials: 'include'` nas chamadas de API
* tratar `401` como usuário não autenticado
* tratar `403` como usuário sem permissão
* limpar/invalidate cache de dados privados ao encerrar sessão

No MVP, autenticação deve ser simples. Recuperação de senha, MFA e convites avançados ficam fora do escopo inicial.

## Fluxo do dashboard

O dashboard deve apresentar uma visão operacional inicial da empresa autenticada.

Conteúdos esperados:

* próximos agendamentos
* resumo de serviços ativos
* indicadores simples de agenda
* atalhos para cadastrar serviço e configurar horários

Regras:

* exibir apenas dados da empresa autenticada
* não depender de `businessId` enviado pelo frontend para autorização
* evitar métricas complexas no MVP
* priorizar clareza operacional sobre dashboards analíticos avançados

## Fluxo de serviços

O usuário deve conseguir gerenciar serviços oferecidos pela empresa.

Operações esperadas:

* listar serviços
* criar serviço
* editar serviço
* ativar/desativar serviço

Campos principais:

* nome
* preço
* duração em minutos
* status ativo/inativo

Regras:

* validar payloads com Zod antes de enviar
* validar respostas da API com Zod antes de usar na UI
* não enviar `businessId` em operações privadas
* invalidar cache após mutations
* serviço inativo não deve aparecer no fluxo público

## Fluxo de horários/disponibilidade

O usuário deve configurar os horários de funcionamento da empresa.

Operações esperadas:

* listar horários configurados
* criar ou editar horário por dia da semana
* ativar/desativar dia de atendimento

Campos principais:

* dia da semana
* horário de abertura
* horário de fechamento
* status ativo/inativo

Regras:

* validar que abertura é anterior ao fechamento
* evitar duplicidade visual por dia da semana
* não enviar `businessId`
* backend continua sendo fonte de verdade para disponibilidade final

Disponibilidade pública deve considerar:

* horários configurados
* serviços ativos
* duração do serviço
* antecedência mínima
* limite de dias futuros
* conflitos com agendamentos existentes

## Fluxo de agendamentos

Área privada para visualizar e gerenciar agendamentos.

Operações esperadas:

* listar agendamentos
* visualizar detalhes principais
* cancelar agendamento
* marcar como concluído
* marcar como não compareceu, se suportado pelo backend

Campos principais:

* cliente
* serviço
* data
* horário inicial
* horário final
* status

Regras:

* tratar dados de cliente como sensíveis
* evitar logs com payload completo
* invalidar cache após alteração
* tratar conflitos e erros de regra de negócio de forma segura
* não permitir que o frontend decida autorização final

## Fluxo público por slug

O cliente final acessa um link público da empresa.

Rota esperada:

```txt
/:slug
```

Fluxo esperado:

* carregar dados públicos da empresa
* listar serviços ativos
* selecionar serviço
* selecionar data e horário disponível
* informar nome e telefone
* confirmar agendamento
* exibir confirmação segura

Regras:

* não expor dados privados da empresa
* validar nome, telefone, serviço, data e horário
* evitar múltiplos submits
* tratar `409` como conflito de horário ou regra de negócio
* tratar `429` como excesso de tentativas quando existir
* não depender de dados internos como IDs sensíveis além do necessário para o contrato público

## Fora do MVP por enquanto

Ficam fora do escopo inicial:

* pagamentos online
* planos e billing
* marketplace de profissionais
* múltiplas unidades por empresa
* convites avançados de equipe
* permissões granulares além das roles iniciais
* recuperação de senha completa
* MFA
* notificações por WhatsApp/SMS/e-mail
* filas de espera
* recorrência de agendamentos
* cupons e promoções
* relatórios financeiros avançados
* personalização visual avançada da página pública
* app mobile nativo

Esses itens podem ser revisitados após validação do fluxo principal.

## Prioridade máxima

A prioridade máxima do frontend Marcaí Web é:

```txt
Segurança multi-tenant e simplicidade operacional.
```

Toda implementação deve preservar:

* isolamento de dados entre empresas
* dependência do backend para autorização real
* ausência de JWT em armazenamento inseguro
* contratos de API validados com Zod
* uso de React Query para dados assíncronos
* código modular por domínio
* UI simples, clara e fácil de operar

O MVP deve resolver bem o fluxo essencial antes de adicionar complexidade.

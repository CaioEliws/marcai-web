# Design System — Marcaí Web

## Objetivo

Este documento define a base visual inicial do frontend Marcaí Web para orientar futuras implementações com Tailwind CSS, shadcn/ui e lucide-react.

Nenhum componente deve ser implementado a partir deste documento sem antes instalar e configurar Tailwind CSS e shadcn/ui no projeto.

## Identidade visual

A Marcaí deve transmitir:

* confiança
* organização
* rapidez
* simplicidade
* profissionalismo

O produto atende pequenos negócios de serviços. A interface deve ser clara o suficiente para uso diário em celular e robusta o suficiente para dashboard administrativo.

Direção visual:

* SaaS moderno e limpo
* baixo ruído visual
* hierarquia clara
* ações principais evidentes
* feedback rápido para operações
* foco em agenda, serviços e disponibilidade

## Princípios de UI

Princípios obrigatórios:

* mobile-first
* acessível por teclado
* responsivo por padrão
* consistente entre área privada e pública
* simples antes de sofisticado
* dados sensíveis exibidos apenas quando necessários
* estados de loading, erro, vazio e sucesso sempre previstos

Evitar telas densas demais no MVP. O usuário deve entender rapidamente o próximo passo.

## Stack visual

Stack desejada:

* Tailwind CSS para estilos
* shadcn/ui para componentes base
* lucide-react para ícones
* CSS variables no padrão shadcn para tokens
* componentes acessíveis e reutilizáveis

Não instalar dependências ou gerar componentes sem necessidade explícita.

## Uso de Tailwind CSS

Preferir utilities Tailwind para:

* layout
* espaçamento
* tipografia
* cores
* bordas
* responsividade
* estados hover/focus/disabled

Evitar:

* CSS manual grande
* estilos inline
* classes globais excessivas
* duplicação de padrões visuais
* valores mágicos sem relação com tokens

Classes utilitárias devem permanecer legíveis. Quando um padrão se repetir muito, criar componente reutilizável.

## Uso de shadcn/ui

Preferir componentes shadcn/ui quando forem necessários:

* Button
* Input
* Card
* Dialog
* Dropdown
* Table
* Badge
* Alert
* Form

Regras:

* não criar componentes equivalentes do zero sem motivo
* manter acessibilidade nativa dos componentes
* customizar via variants e tokens, não por overrides grandes
* adaptar componentes ao domínio Marcaí sem quebrar o padrão visual
* não instalar/gerar todos os componentes de uma vez

Instalar apenas os componentes necessários para a feature em andamento.

## Ícones

Usar lucide-react para ícones.

Regras:

* ícones devem apoiar a leitura, não decorar excessivamente
* ícones sozinhos precisam de label acessível ou tooltip
* manter tamanho consistente, normalmente `h-4 w-4` ou `h-5 w-5`
* não misturar bibliotecas de ícones sem motivo

## Tokens de cor

Usar tokens baseados em CSS variables no padrão shadcn:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}
```

Direção de cores:

* `primary`: azul profissional para ações principais
* `secondary`: cinza claro para ações secundárias
* `muted`: superfícies discretas e textos auxiliares
* `destructive`: erros, cancelamentos e ações destrutivas
* `success`: confirmações e agendamentos concluídos, quando token existir
* `warning`: conflitos, atenção e estados pendentes, quando token existir

Evitar paletas muito saturadas, fundos escuros por padrão ou excesso de cores concorrentes.

## Tipografia

Direção:

* fonte sans-serif moderna do sistema ou configurada no Tailwind
* títulos claros e objetivos
* textos de apoio curtos
* labels explícitos em formulários
* números e horários fáceis de escanear

Escala sugerida:

* `text-xs`: metadados, badges, timestamps auxiliares
* `text-sm`: labels, descrição curta, células de tabela
* `text-base`: conteúdo principal
* `text-lg`: títulos de seção
* `text-2xl` a `text-3xl`: títulos de página

Evitar textos longos dentro de cards operacionais.

## Espaçamento

Usar escala Tailwind padrão.

Padrões sugeridos:

* `gap-2`: agrupamentos compactos
* `gap-4`: campos e ações relacionadas
* `gap-6`: blocos de seção
* `p-4`: cards em mobile
* `p-6`: cards em desktop
* `px-4`: padding horizontal mobile
* `px-6` ou `px-8`: padding horizontal desktop

Layouts administrativos devem ser densos o suficiente para operação, sem parecer apertados.

## Radius

Usar radius consistente via token shadcn:

```css
--radius: 0.5rem;
```

Direção:

* botões e inputs com radius padrão
* cards com radius moderado
* evitar elementos excessivamente arredondados
* manter consistência entre dashboard e fluxo público

## Sombras

Usar sombras com moderação.

Preferir:

* bordas sutis
* separação por espaçamento
* fundo levemente diferente

Usar sombra apenas quando ajudar a destacar:

* dropdowns
* dialogs
* popovers
* cards importantes em página pública

Evitar dashboards cheios de cards flutuantes.

## Layout base

Área privada:

* shell com navegação clara
* conteúdo central com largura confortável
* header com contexto da página
* ações principais visíveis
* navegação lateral ou superior conforme breakpoint

Área pública:

* foco no agendamento
* pouca navegação
* etapas claras
* empresa, serviço, data e horário sempre compreensíveis

Mobile:

* layout em coluna
* ações principais próximas do conteúdo
* tabelas convertidas em listas quando necessário
* evitar sidebars fixas complexas

## Botões

Usar shadcn/ui Button.

Variants esperadas:

* `default`: ação principal
* `secondary`: ação secundária
* `outline`: ação neutra
* `ghost`: navegação ou ação discreta
* `destructive`: cancelar/remover

Regras:

* um botão principal por seção quando possível
* botões destrutivos devem ser explícitos
* loading deve bloquear duplo submit
* disabled deve ter motivo visual ou textual quando necessário

## Inputs

Usar shadcn/ui Input e Form.

Regras:

* label sempre visível
* mensagem de erro próxima ao campo
* placeholders não substituem labels
* mascarar telefone quando aplicável
* validar com Zod antes de enviar
* manter foco visível

Campos comuns:

* nome
* e-mail
* senha
* telefone
* preço
* duração
* data
* horário

## Cards

Usar shadcn/ui Card.

Casos adequados:

* resumo de métrica
* agrupamento de formulário
* item de lista em mobile
* confirmação pública
* estado vazio

Regras:

* evitar cards aninhados
* não transformar todas as seções em cards
* manter header, conteúdo e ações bem separados
* não esconder ação principal dentro de menus sem necessidade

## Tabelas e listas

Usar shadcn/ui Table quando houver dados tabulares reais.

Usar listas responsivas quando:

* mobile exigir leitura mais natural
* houver poucos campos por item
* ações forem mais importantes que comparação entre colunas

Regras:

* mostrar colunas essenciais
* evitar IDs internos sem necessidade
* usar badges para status
* ações destrutivas devem ter confirmação quando houver risco
* loading e empty state devem ocupar a área da tabela/lista

## Formulários

Usar shadcn/ui Form quando disponível.

Regras:

* Zod como fonte do contrato de validação
* mensagens curtas e acionáveis
* evitar múltiplas colunas em mobile
* agrupar campos por intenção
* botão principal no final do fluxo
* prevenir múltiplos submits
* exibir erro geral quando a API rejeitar regra de negócio

## Dashboard

O dashboard deve ser operacional.

Prioridades:

* próximos agendamentos
* status da agenda
* serviços ativos
* alertas de configuração incompleta
* atalhos claros para ações frequentes

Direção visual:

* layout limpo
* cards de resumo simples
* listas escaneáveis
* badges de status
* pouca ornamentação

Evitar:

* gráficos complexos no MVP
* métricas sem ação clara
* excesso de filtros antes de haver volume real

## Página pública de agendamento

A página pública deve ser simples e confiável.

Prioridades:

* nome da empresa claro
* serviço selecionável
* data e horário disponíveis
* formulário curto de cliente
* confirmação evidente

Direção visual:

* mobile-first
* etapas curtas
* botões grandes o suficiente para toque
* mensagens de disponibilidade claras
* evitar distrações de dashboard privado

O cliente final não deve ver dados internos da empresa.

## Estados

Toda tela com dados assíncronos deve prever:

* loading
* erro
* vazio
* sucesso

Loading:

* usar Skeleton quando fizer sentido
* evitar layout shift
* bloquear submit durante mutation

Erro:

* mensagem segura e compreensível
* não exibir stack trace ou payload interno
* permitir tentar novamente quando adequado

Vazio:

* explicar o estado
* oferecer próxima ação clara
* não culpar o usuário

Sucesso:

* feedback curto
* estado atualizado via React Query
* evitar mensagens invasivas em ações simples

## Responsividade

Mobile-first é obrigatório.

Breakpoints:

* mobile: fluxo principal em uma coluna
* tablet: conteúdo com melhor respiro
* desktop: navegação e tabelas mais completas

Regras:

* testar layouts estreitos antes do desktop
* evitar overflow horizontal
* botões tocáveis
* tabelas devem adaptar ou virar listas
* dialogs precisam funcionar bem em telas pequenas

## Acessibilidade

Regras obrigatórias:

* contraste adequado
* foco visível
* navegação por teclado
* labels associados a inputs
* mensagens de erro compreensíveis
* ícones decorativos com `aria-hidden`
* ícones funcionais com nome acessível
* dialogs com título e descrição quando aplicável
* não depender apenas de cor para status

Preferir componentes shadcn/ui para preservar boas bases de acessibilidade.

## O que evitar

Evitar:

* implementar componentes visuais antes de configurar Tailwind/shadcn
* instalar biblioteca sem necessidade real
* CSS manual grande
* estilos inline
* paletas inconsistentes
* cards aninhados
* dashboard excessivamente decorativo
* página pública com aparência de painel administrativo
* tabelas ruins no mobile
* botões sem estado de loading
* formulários sem labels
* mensagens de erro técnicas demais
* uso de role visual como segurança real
* exposição de dados sensíveis por conveniência visual

## Regra final

Antes de implementar qualquer tela ou componente visual, consultar este documento e preservar:

```txt
Simplicidade, consistência, acessibilidade e segurança multi-tenant.
```

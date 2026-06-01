export const serviceQueryKeys = {
  active: () => [...serviceQueryKeys.all, 'active'] as const,
  all: ['services'] as const,
  detail: (id: string) => [...serviceQueryKeys.details(), id] as const,
  details: () => [...serviceQueryKeys.all, 'detail'] as const,
  lists: () => [...serviceQueryKeys.all, 'list'] as const,
}

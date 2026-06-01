export const businessHourQueryKeys = {
  active: () => [...businessHourQueryKeys.all, 'active'] as const,
  all: ['business-hours'] as const,
  detail: (id: string) => [...businessHourQueryKeys.details(), id] as const,
  details: () => [...businessHourQueryKeys.all, 'detail'] as const,
  lists: () => [...businessHourQueryKeys.all, 'list'] as const,
}

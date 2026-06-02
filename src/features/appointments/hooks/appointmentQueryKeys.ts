export const appointmentQueryKeys = {
  all: ['appointments'] as const,
  availableTimes: (serviceId: string, date: string) =>
    [...appointmentQueryKeys.all, 'available-times', serviceId, date] as const,
  byDate: (date: string) =>
    [...appointmentQueryKeys.lists(), 'by-date', date] as const,
  detail: (id: string) => [...appointmentQueryKeys.details(), id] as const,
  details: () => [...appointmentQueryKeys.all, 'detail'] as const,
  lists: () => [...appointmentQueryKeys.all, 'list'] as const,
}

export const publicBookingQueryKeys = {
  all: ['public-booking'] as const,
  availableTimes: (slug: string, serviceId: string, date: string) =>
    [
      ...publicBookingQueryKeys.business(slug),
      'available-times',
      serviceId,
      date,
    ] as const,
  business: (slug: string) =>
    [...publicBookingQueryKeys.businesses(), slug] as const,
  businesses: () => [...publicBookingQueryKeys.all, 'business'] as const,
  services: (slug: string) =>
    [...publicBookingQueryKeys.business(slug), 'services'] as const,
}

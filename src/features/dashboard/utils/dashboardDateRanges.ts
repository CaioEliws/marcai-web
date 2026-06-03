export const dashboardPeriodKeys = [
  'today',
  '7d',
  '30d',
  'this-month',
  'last-month',
] as const

export type DashboardPeriodKey = (typeof dashboardPeriodKeys)[number]

export type DashboardDateRange = {
  end: string
  key: DashboardPeriodKey
  label: string
  previousEnd: string
  previousStart: string
  start: string
}

export const dashboardPeriodOptions: Array<{
  key: DashboardPeriodKey
  label: string
}> = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: 'Últimos 7 dias' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: 'this-month', label: 'Este mês' },
  { key: 'last-month', label: 'Mês passado' },
]

export function formatLocalDateForApi(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseDashboardPeriod(value: string | null): DashboardPeriodKey {
  if (dashboardPeriodKeys.includes(value as DashboardPeriodKey)) {
    return value as DashboardPeriodKey
  }

  return 'today'
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

export function getDashboardDateRange(
  period: DashboardPeriodKey,
  referenceDate = new Date(),
): DashboardDateRange {
  if (period === '7d') {
    const end = referenceDate
    const start = addDays(end, -6)
    const previousEnd = addDays(start, -1)
    const previousStart = addDays(previousEnd, -6)

    return {
      end: formatLocalDateForApi(end),
      key: period,
      label: 'Últimos 7 dias',
      previousEnd: formatLocalDateForApi(previousEnd),
      previousStart: formatLocalDateForApi(previousStart),
      start: formatLocalDateForApi(start),
    }
  }

  if (period === '30d') {
    const end = referenceDate
    const start = addDays(end, -29)
    const previousEnd = addDays(start, -1)
    const previousStart = addDays(previousEnd, -29)

    return {
      end: formatLocalDateForApi(end),
      key: period,
      label: 'Últimos 30 dias',
      previousEnd: formatLocalDateForApi(previousEnd),
      previousStart: formatLocalDateForApi(previousStart),
      start: formatLocalDateForApi(start),
    }
  }

  if (period === 'this-month') {
    const start = startOfMonth(referenceDate)
    const end = referenceDate
    const previousMonth = addMonths(referenceDate, -1)

    return {
      end: formatLocalDateForApi(end),
      key: period,
      label: 'Este mês',
      previousEnd: formatLocalDateForApi(endOfMonth(previousMonth)),
      previousStart: formatLocalDateForApi(startOfMonth(previousMonth)),
      start: formatLocalDateForApi(start),
    }
  }

  if (period === 'last-month') {
    const lastMonth = addMonths(referenceDate, -1)
    const previousMonth = addMonths(referenceDate, -2)

    return {
      end: formatLocalDateForApi(endOfMonth(lastMonth)),
      key: period,
      label: 'Mês passado',
      previousEnd: formatLocalDateForApi(endOfMonth(previousMonth)),
      previousStart: formatLocalDateForApi(startOfMonth(previousMonth)),
      start: formatLocalDateForApi(startOfMonth(lastMonth)),
    }
  }

  const today = formatLocalDateForApi(referenceDate)
  const yesterday = formatLocalDateForApi(addDays(referenceDate, -1))

  return {
    end: today,
    key: 'today',
    label: 'Hoje',
    previousEnd: yesterday,
    previousStart: yesterday,
    start: today,
  }
}

export function isDateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end
}

export function getDatesInRange(start: string, end: string) {
  const dates: string[] = []
  const [startYear, startMonth, startDay] = start.split('-').map(Number)
  const [endYear, endMonth, endDay] = end.split('-').map(Number)
  const currentDate = new Date(startYear, startMonth - 1, startDay)
  const finalDate = new Date(endYear, endMonth - 1, endDay)

  while (currentDate <= finalDate) {
    dates.push(formatLocalDateForApi(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

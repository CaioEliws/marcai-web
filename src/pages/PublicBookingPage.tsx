import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { getApiFieldErrors } from '@/shared/api/httpClient'
import { AvailableTimesSelector } from '@/features/public-booking/components/AvailableTimesSelector'
import { BookingSuccess } from '@/features/public-booking/components/BookingSuccess'
import { PublicAppointmentForm } from '@/features/public-booking/components/PublicAppointmentForm'
import { PublicBusinessHeader } from '@/features/public-booking/components/PublicBusinessHeader'
import { PublicServiceSelector } from '@/features/public-booking/components/PublicServiceSelector'
import { getPublicBookingErrorMessage } from '@/features/public-booking/api/publicBookingErrors'
import {
  useAvailableTimesQuery,
  useCreatePublicAppointmentMutation,
  usePublicBusinessQuery,
  usePublicServicesQuery,
} from '@/features/public-booking/hooks/usePublicBooking'
import type { PublicAppointment } from '@/features/public-booking/types/publicBooking.type'
import type { PublicAppointmentFieldErrors } from '@/features/public-booking/components/publicBookingUtils'

export function PublicBookingPage() {
  const { slug = '' } = useParams()
  const businessQuery = usePublicBusinessQuery(slug)
  const servicesQuery = usePublicServicesQuery(slug)
  const createAppointmentMutation = useCreatePublicAppointmentMutation()
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formFieldErrors, setFormFieldErrors] =
    useState<PublicAppointmentFieldErrors>({})
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<PublicAppointment | null>(null)
  const availableTimesQuery = useAvailableTimesQuery({
    date: appointmentDate,
    serviceId: selectedServiceId,
    slug,
  })

  function handleServiceChange(serviceId: string) {
    setSelectedServiceId(serviceId)
    setSelectedTime('')
    setFormError(null)
    setFormFieldErrors({})
  }

  function handleDateChange(date: string) {
    setAppointmentDate(date)
    setSelectedTime('')
    setFormError(null)
    setFormFieldErrors({})
  }

  async function handleCreateAppointment(values: {
    clientName: string
    clientPhone: string
  }) {
    setFormError(null)
    setFormFieldErrors({})

    try {
      const response = await createAppointmentMutation.mutateAsync({
        payload: {
          appointmentDate,
          clientName: values.clientName,
          clientPhone: values.clientPhone,
          serviceId: selectedServiceId,
          startTime: selectedTime,
        },
        slug,
      })

      setConfirmedAppointment(response)
    } catch (error) {
      setFormFieldErrors(
        getApiFieldErrors(error, [
          'appointmentDate',
          'clientName',
          'clientPhone',
          'serviceId',
          'startTime',
        ] as const),
      )
      setFormError(getPublicBookingErrorMessage(error))
    }
  }

  const business = businessQuery.data
  const services = servicesQuery.data ?? []
  const availableTimes = availableTimesQuery.data?.availableTimes ?? []
  const businessError = businessQuery.isError
    ? getPublicBookingErrorMessage(businessQuery.error)
    : null
  const servicesError = servicesQuery.isError
    ? getPublicBookingErrorMessage(servicesQuery.error)
    : null
  const availableTimesError = availableTimesQuery.isError
    ? getPublicBookingErrorMessage(availableTimesQuery.error)
    : null

  if (!slug || businessError) {
    return (
      <main className="grid min-h-svh place-items-center bg-muted/30 px-4 py-10">
        <Alert className="w-full max-w-2xl border-destructive/50 text-destructive">
          <AlertDescription>
            {businessError ?? 'Esta pagina de agendamento nao foi encontrada.'}
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-muted/30 px-4 py-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-3xl gap-5">
        {businessQuery.isPending ? (
          <section className="rounded-lg border bg-background p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Carregando empresa...
            </p>
          </section>
        ) : null}

        {business ? <PublicBusinessHeader business={business} /> : null}

        {confirmedAppointment ? (
          <BookingSuccess appointment={confirmedAppointment} />
        ) : (
          <>
            {servicesError ? (
              <Alert className="border-destructive/50 text-destructive">
                <AlertDescription>{servicesError}</AlertDescription>
              </Alert>
            ) : null}

            <PublicServiceSelector
              isLoading={servicesQuery.isPending}
              onChange={handleServiceChange}
              selectedServiceId={selectedServiceId}
              services={services}
            />

            {availableTimesError ? (
              <Alert className="border-destructive/50 text-destructive">
                <AlertDescription>{availableTimesError}</AlertDescription>
              </Alert>
            ) : null}

            <AvailableTimesSelector
              availableTimes={availableTimes}
              date={appointmentDate}
              isLoading={availableTimesQuery.isFetching}
              onDateChange={handleDateChange}
              onTimeChange={setSelectedTime}
              selectedServiceId={selectedServiceId}
              selectedTime={selectedTime}
            />

            <PublicAppointmentForm
              appointmentDate={appointmentDate}
              apiFieldErrors={formFieldErrors}
              error={formError}
              isSubmitting={createAppointmentMutation.isPending}
              onSubmit={handleCreateAppointment}
              selectedServiceId={selectedServiceId}
              selectedTime={selectedTime}
            />
          </>
        )}
      </div>
    </main>
  )
}

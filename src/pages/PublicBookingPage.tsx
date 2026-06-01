import { useParams } from 'react-router-dom'

export function PublicBookingPage() {
  const { slug } = useParams()

  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Agendamento online
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Página pública da empresa
        </h1>
        <p className="mt-3 text-muted-foreground">
          O fluxo público de agendamento para{' '}
          <span className="font-medium text-foreground">{slug}</span> será
          implementado nas próximas etapas.
        </p>
      </section>
    </main>
  )
}

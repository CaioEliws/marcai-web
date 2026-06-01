export function HomePage() {
  return (
    <main className="grid min-h-svh place-items-center px-6 py-12">
      <section className="w-full max-w-3xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
          Marcaí
        </p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Frontend pronto para começar.
        </h1>
        <p className="text-lg text-muted-foreground">
          Estrutura inicial com roteamento, providers globais e cliente HTTP
          centralizado.
        </p>
      </section>
    </main>
  )
}

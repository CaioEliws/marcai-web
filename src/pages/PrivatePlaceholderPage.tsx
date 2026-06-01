type PrivatePlaceholderPageProps = {
  description: string
  eyebrow?: string
  title: string
}

export function PrivatePlaceholderPage({
  description,
  eyebrow = 'Marcaí',
  title,
}: PrivatePlaceholderPageProps) {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <p className="text-sm font-bold uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
    </section>
  )
}

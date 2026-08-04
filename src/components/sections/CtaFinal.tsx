import type { FC } from 'hono/jsx'
import { Container } from '../ui/Container'
import { Button, type ButtonVariant } from '../ui/Button'

type CtaFinalProps = {
  title: string
  subtitle?: string
  ctas: { label: string; href: string; variant?: ButtonVariant; external?: boolean }[]
  id?: string
}

/** Cierre de página: bloque oscuro centrado con resplandor y CTAs. */
export const CtaFinal: FC<CtaFinalProps> = ({ title, subtitle, ctas, id }) => (
  <section id={id} class="relative overflow-hidden bg-ink py-24 text-center">
    <div class="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(35,123,124,0.3)_0%,transparent_70%)]" />
    <Container class="relative z-10">
      <h2 class="text-3xl md:text-[44px] font-bold tracking-[-0.8px] leading-[1.12] text-on-dark mb-[18px] max-w-[680px] mx-auto">
        {title}
      </h2>
      {subtitle && <p class="text-[17px] text-on-dark/65 mb-10 max-w-[500px] mx-auto">{subtitle}</p>}
      <div class="flex flex-wrap gap-3.5 justify-center">
        {ctas.map((cta) => (
          <Button href={cta.href} variant={cta.variant ?? 'primary'} external={cta.external}>
            {cta.label}
          </Button>
        ))}
      </div>
    </Container>
  </section>
)

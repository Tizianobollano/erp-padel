import type { FC } from 'hono/jsx'
import { Container } from '../ui/Container'
import { Icon } from '../ui/Icon'

type NewsletterProps = {
  title: string
  subtitle?: string
  /** endpoint POST del formulario. */
  action?: string
  placeholder?: string
  buttonLabel?: string
  id?: string
}

/** Captura de email sobre superficie oscura. Form nativo (POST) que degrada sin JS. */
export const Newsletter: FC<NewsletterProps> = ({
  title,
  subtitle,
  action = '#',
  placeholder = 'tu@email.com',
  buttonLabel = 'Suscribirme',
  id,
}) => (
  <section id={id} class="bg-surface-dark py-16">
    <Container class="text-center max-w-[640px]">
      <h2 class="text-2xl md:text-3xl font-bold text-on-dark mb-3">{title}</h2>
      {subtitle && <p class="text-on-dark/75 mb-7">{subtitle}</p>}
      <form action={action} method="post" class="flex flex-col sm:flex-row gap-3 max-w-[460px] mx-auto">
        <label class="sr-only" for="newsletter-email">Email</label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder={placeholder}
          class="flex-1 rounded-sm px-4 py-3 text-sm text-ink bg-surface-2 placeholder:text-ink-muted/50 outline-none focus:ring-2 focus:ring-on-dark/60"
        />
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-sm bg-surface-2 text-accent font-medium px-6 py-3 hover:bg-white transition-colors"
        >
          {buttonLabel}
          <Icon name="arrow-right" />
        </button>
      </form>
    </Container>
  </section>
)

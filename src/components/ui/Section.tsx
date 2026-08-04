import type { FC, PropsWithChildren } from 'hono/jsx'
import { Container } from './Container'

type Tone = 'surface-1' | 'surface-2' | 'surface-dark-2' | 'surface-dark' | 'surface-ink'

const toneBg: Record<Tone, string> = {
  'surface-1': 'bg-surface-1',
  'surface-2': 'bg-surface-2',
  'surface-dark-2': 'bg-surface-dark-2', // oscuro
  'surface-dark': 'bg-surface-dark', // oscuro
  'surface-ink': 'bg-surface-ink', // oscuro
}

type SectionProps = PropsWithChildren<{
  /** Fondo de la sección. Los roles `surface-dark*`/`surface-ink` invierten el header. */
  tone?: Tone
  id?: string
  /** envuelve el contenido en <Container>. true por defecto. */
  contained?: boolean
  /** activa reveal-on-scroll (data-reveal). Degrada visible sin JS. */
  reveal?: boolean
  class?: string
}>

/** Bloque de sección a ancho completo con padding vertical estándar. */
export const Section: FC<SectionProps> = ({ tone = 'surface-1', id, contained = true, reveal = false, class: cls = '', children }) => (
  <section id={id} {...(reveal ? { 'data-reveal': '' } : {})} class={`relative overflow-hidden py-20 md:py-[88px] ${toneBg[tone]} ${cls}`}>
    {contained ? <Container>{children}</Container> : children}
  </section>
)

export const isDarkTone = (tone?: Tone) => tone === 'surface-dark-2' || tone === 'surface-dark' || tone === 'surface-ink'
export type { Tone }

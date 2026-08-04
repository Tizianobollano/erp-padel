import type { FC } from 'hono/jsx'
import { Section } from '../ui/Section'
import { SectionHeader } from '../ui/SectionHeader'
import { Icon } from '../ui/Icon'

export type FaqItem = { q: string; a: string }

type FaqProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  items: FaqItem[]
  id?: string
}

/**
 * Preguntas frecuentes con <details> nativo (acordeón sin JS).
 * Útil además para SEO/GEO: emparejar con JSON-LD FAQPage en el <head>.
 */
export const Faq: FC<FaqProps> = ({ eyebrow, title, subtitle, items, id }) => (
  <Section tone="surface-1" id={id}>
    <div class="max-w-[760px] mx-auto">
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} center />
      <div class="flex flex-col gap-3">
        {items.map((item) => (
          <details class="group border border-accent/15 rounded-md bg-white open:shadow-card">
            <summary class="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-base font-semibold text-ink">
              {item.q}
              <Icon name="chevron-down" class="text-accent text-lg transition-transform group-open:rotate-180" />
            </summary>
            <p class="px-6 pb-5 -mt-1 text-sm text-ink-muted/80 leading-[1.65]">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  </Section>
)

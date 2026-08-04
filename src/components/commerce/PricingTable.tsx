import type { FC } from 'hono/jsx'
import { Section } from '../ui/Section'
import { SectionHeader } from '../ui/SectionHeader'
import { Icon } from '../ui/Icon'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export type PricingTier = {
  name: string
  price: string
  period?: string
  desc?: string
  features: string[]
  cta: { label: string; href: string }
  /** resalta el plan recomendado. */
  featured?: boolean
  badge?: string
}

type PricingTableProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  tiers: PricingTier[]
  id?: string
}

/** Tabla de planes/precios con plan destacado. */
export const PricingTable: FC<PricingTableProps> = ({ eyebrow, title, subtitle, tiers, id }) => (
  <Section tone="surface-2" id={id}>
    <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} center />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto items-start">
      {tiers.map((t) => (
        <div
          class={`relative rounded-lg p-8 ${
            t.featured ? 'bg-surface-dark text-on-dark shadow-hover md:-translate-y-2' : 'bg-white border border-accent/15'
          }`}
        >
          {t.badge && <Badge tone={t.featured ? 'on-dark' : 'accent'} class="absolute top-5 right-5">{t.badge}</Badge>}
          <div class={`text-sm font-semibold uppercase tracking-wide mb-3 ${t.featured ? 'text-on-dark/70' : 'text-accent'}`}>{t.name}</div>
          <div class="flex items-baseline gap-1.5 mb-1">
            <span class={`text-4xl font-bold tracking-tight ${t.featured ? 'text-on-dark' : 'text-ink'}`}>{t.price}</span>
            {t.period && <span class={`text-sm ${t.featured ? 'text-on-dark/60' : 'text-ink-muted/60'}`}>/{t.period}</span>}
          </div>
          {t.desc && <p class={`text-sm mb-6 ${t.featured ? 'text-on-dark/70' : 'text-ink-muted/70'}`}>{t.desc}</p>}
          <ul class="list-none flex flex-col gap-2.5 mb-8">
            {t.features.map((f) => (
              <li class={`flex items-start gap-2.5 text-sm ${t.featured ? 'text-on-dark/85' : 'text-ink-muted'}`}>
                <Icon name="check" class={`text-base shrink-0 mt-px ${t.featured ? 'text-success' : 'text-accent'}`} />
                {f}
              </li>
            ))}
          </ul>
          <Button href={t.cta.href} variant={t.featured ? 'primary' : 'outline-accent'} class="w-full">
            {t.cta.label}
          </Button>
        </div>
      ))}
    </div>
  </Section>
)

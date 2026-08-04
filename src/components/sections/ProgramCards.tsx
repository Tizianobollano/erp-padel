import type { FC } from 'hono/jsx'
import { Section } from '../ui/Section'
import { SectionHeader } from '../ui/SectionHeader'
import { Icon } from '../ui/Icon'
import { Button, type ButtonVariant } from '../ui/Button'

export type Program = {
  /** logo o título visual de la marca. Si hay logo se usa en vez del eyebrow. */
  logo?: string
  logoAlt?: string
  title: string
  institution?: string
  items: string[]
  highlight?: { title: string; desc: string }
  cta: { label: string; href: string }
  /** variante de fondo: featured = surface-dark, secondary = surface-dark-2. */
  variant?: 'featured' | 'secondary'
}

type ProgramCardsProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  programs: Program[]
  id?: string
}

const cardBg = { featured: 'bg-surface-dark border-accent', secondary: 'bg-surface-dark-2 border-accent-hover' }
const ctaVariant: Record<NonNullable<Program['variant']>, ButtonVariant> = { featured: 'primary', secondary: 'accent' }

/** Tarjetas de oferta/programa (estilo plan) con lista de checks y highlight. */
export const ProgramCards: FC<ProgramCardsProps> = ({ eyebrow, title, subtitle, programs, id }) => (
  <Section tone="surface-1" id={id}>
    <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
      {programs.map((p) => {
        const variant = p.variant ?? 'featured'
        return (
          <div class={`relative overflow-hidden rounded-lg border-[1.5px] p-9 md:p-10 transition-shadow hover:shadow-hover ${cardBg[variant]}`}>
            {p.logo ? (
              <img src={p.logo} alt={p.logoAlt ?? ''} class="h-11 w-auto mb-7" />
            ) : null}
            <h3 class="text-[26px] font-bold leading-[1.15] tracking-[-0.3px] text-on-dark mb-2.5">{p.title}</h3>
            {p.institution && (
              <p class="text-[13px] font-semibold uppercase tracking-[0.8px] text-on-dark/65 mb-5">{p.institution}</p>
            )}
            <ul class="list-none flex flex-col gap-3 mb-8">
              {p.items.map((li) => (
                <li class="flex items-start gap-2.5 text-sm leading-[1.45] text-on-dark/85">
                  <Icon name="check" class="text-base text-success shrink-0 mt-px" />
                  {li}
                </li>
              ))}
            </ul>
            {p.highlight && (
              <div class="bg-on-dark/15 border border-on-dark/25 rounded-sm px-4 py-3.5 mb-7 text-[13px] text-on-dark">
                <strong class="block font-semibold mb-1">{p.highlight.title}</strong>
                {p.highlight.desc}
              </div>
            )}
            <Button href={p.cta.href} variant={ctaVariant[variant]}>
              {p.cta.label}
            </Button>
          </div>
        )
      })}
    </div>
  </Section>
)

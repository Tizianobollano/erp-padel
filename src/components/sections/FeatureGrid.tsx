import type { FC } from 'hono/jsx'
import { Section, type Tone, isDarkTone } from '../ui/Section'
import { SectionHeader } from '../ui/SectionHeader'
import { Icon } from '../ui/Icon'

export type Feature = { icon: string; title: string; desc: string }

type FeatureGridProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  items: Feature[]
  /** columnas en desktop. */
  cols?: 2 | 3 | 4
  tone?: Tone
  /** activa reveal-on-scroll en la sección. */
  reveal?: boolean
  id?: string
}

const colClass = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }

/** Grilla de tarjetas icono+título+descripción. Sirve para "qué hacemos" o beneficios. */
export const FeatureGrid: FC<FeatureGridProps> = ({ eyebrow, title, subtitle, items, cols = 4, tone = 'surface-2', reveal = false, id }) => {
  const dark = isDarkTone(tone)
  return (
    <Section tone={tone} id={id} reveal={reveal}>
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} dark={dark} />
      <div class={`grid grid-cols-1 ${colClass[cols]} gap-5`}>
        {items.map((f) => (
          <div class="bg-white border border-accent/12 rounded-md p-7 transition-[box-shadow,transform] duration-200 hover:shadow-hover hover:-translate-y-0.5">
            <div class="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center text-accent text-[22px] mb-[18px]">
              <Icon name={f.icon} />
            </div>
            <div class="text-base font-semibold text-ink mb-2 leading-tight">{f.title}</div>
            <p class="text-sm text-ink-muted/80 leading-[1.55]">{f.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

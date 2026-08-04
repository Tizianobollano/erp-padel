import type { FC } from 'hono/jsx'
import { Section } from '../ui/Section'
import { SectionHeader } from '../ui/SectionHeader'
import { Icon } from '../ui/Icon'
import { Badge } from '../ui/Badge'

/** Tarjeta corta de alianza (icono + nombre + descripción). */
export type Partner = { icon: string; name: string; desc: string }

/** Tarjeta ancha de convenio (logo[s] + badge + nombre + descripción). */
export type Agreement = { logos: string[]; badge?: string; name: string; desc: string }

type PartnersProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  partners?: Partner[]
  agreements?: Agreement[]
  id?: string
}

/** Sección de alianzas/convenios: grilla de tarjetas + convenios destacados. */
export const Partners: FC<PartnersProps> = ({ eyebrow, title, subtitle, partners = [], agreements = [], id }) => (
  <Section tone="surface-1" id={id}>
    <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

    {partners.length > 0 && (
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {partners.map((p) => (
          <div class="border border-accent/15 rounded-md p-8 transition-[box-shadow,border-color] duration-200 hover:shadow-card hover:border-accent/30">
            <div class="w-14 h-14 bg-accent/10 rounded-sm flex items-center justify-center text-accent text-[26px] mb-5">
              <Icon name={p.icon} />
            </div>
            <div class="text-[17px] font-bold text-accent mb-2">{p.name}</div>
            <p class="text-sm text-ink-muted/80 leading-[1.55]">{p.desc}</p>
          </div>
        ))}
      </div>
    )}

    {agreements.length > 0 && (
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {agreements.map((a) => (
          <div class="border-[1.5px] border-accent/20 rounded-md p-7 flex items-start gap-5 transition-[box-shadow,border-color] duration-200 hover:shadow-card hover:border-accent">
            <div class="flex flex-col gap-2 shrink-0 w-[88px]">
              {a.logos.map((logo) => (
                <div class="w-full h-16 bg-accent/[0.09] rounded-sm flex items-center justify-center overflow-hidden">
                  <img src={logo} alt={a.name} class="w-full h-full object-contain bg-white" />
                </div>
              ))}
            </div>
            <div class="flex-1">
              {a.badge && <Badge class="mb-1.5">{a.badge}</Badge>}
              <div class="text-base font-bold text-ink mb-2 leading-tight">{a.name}</div>
              <p class="text-sm text-ink-muted/80 leading-[1.55]">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </Section>
)

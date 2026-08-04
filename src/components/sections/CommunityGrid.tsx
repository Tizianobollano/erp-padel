import type { FC } from 'hono/jsx'
import { Section } from '../ui/Section'
import { SectionHeader } from '../ui/SectionHeader'
import { Icon } from '../ui/Icon'

export type CommunityRole = { icon: string; role: string; desc: string; link?: { label: string; href: string } }

type CommunityGridProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  roles: CommunityRole[]
  id?: string
}

/** Grilla de roles/segmentos de la comunidad con enlace "saber más". */
export const CommunityGrid: FC<CommunityGridProps> = ({ eyebrow, title, subtitle, roles, id }) => (
  <Section tone="surface-2" id={id}>
    <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {roles.map((r) => (
        <div class="bg-white border border-accent/15 rounded-md p-7 transition-[box-shadow,transform] duration-200 hover:shadow-hover hover:-translate-y-0.5">
          <div class="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center text-accent text-[22px] mb-[18px]">
            <Icon name={r.icon} />
          </div>
          <div class="text-[15px] font-bold text-accent mb-2">{r.role}</div>
          <p class="text-[13px] text-ink-muted/80 leading-[1.55] mb-5">{r.desc}</p>
          {r.link && (
            <a href={r.link.href} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[13px] font-semibold text-accent">
              {r.link.label}
              <Icon name="arrow-right" class="text-[13px]" />
            </a>
          )}
        </div>
      ))}
    </div>
  </Section>
)

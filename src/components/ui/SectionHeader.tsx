import type { FC } from 'hono/jsx'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  /** sobre fondo oscuro invierte colores. */
  dark?: boolean
  /** centra el header. */
  center?: boolean
  class?: string
}

/** Encabezado estándar de sección: eyebrow + título + subtítulo. */
export const SectionHeader: FC<SectionHeaderProps> = ({ eyebrow, title, subtitle, dark = false, center = false, class: cls = '' }) => (
  <div class={`mb-14 ${center ? 'text-center mx-auto' : ''} ${cls}`}>
    {eyebrow && (
      <p class={`text-xs font-semibold tracking-[1.2px] uppercase mb-3 ${dark ? 'text-accent-tint' : 'text-accent'}`}>
        {eyebrow}
      </p>
    )}
    <h2
      class={`text-3xl md:text-[38px] font-bold tracking-[-0.5px] leading-[1.12] mb-4 ${dark ? 'text-on-dark' : 'text-ink'}`}
      dangerouslySetInnerHTML={{ __html: title }}
    />
    {subtitle && (
      <p class={`text-[17px] leading-[1.55] max-w-[560px] ${center ? 'mx-auto' : ''} ${dark ? 'text-on-dark/75' : 'text-ink-subtle'}`}>
        {subtitle}
      </p>
    )}
  </div>
)

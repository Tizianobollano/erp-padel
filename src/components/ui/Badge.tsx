import type { FC, PropsWithChildren } from 'hono/jsx'

type BadgeTone = 'accent' | 'on-dark' | 'solid' | 'success'

const tones: Record<BadgeTone, string> = {
  accent: 'text-accent bg-accent/10 border border-accent/20',
  'on-dark': 'text-on-dark bg-on-dark/[0.18] border border-on-dark/30',
  solid: 'text-white bg-accent',
  success: 'text-ink bg-success/20 border border-success/40',
}

/** Etiqueta corta (eyebrow inline, "Promoción", "Convenio", descuento…). */
export const Badge: FC<PropsWithChildren<{ tone?: BadgeTone; class?: string }>> = ({ tone = 'accent', class: cls = '', children }) => (
  <span class={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.8px] rounded px-2.5 py-1 ${tones[tone]} ${cls}`}>
    {children}
  </span>
)

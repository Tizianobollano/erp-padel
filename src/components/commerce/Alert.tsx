import type { FC, PropsWithChildren } from 'hono/jsx'
import { Icon } from '../ui/Icon'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const tones: Record<AlertTone, { box: string; icon: string }> = {
  info: { box: 'bg-accent/8 border-accent/25 text-ink-subtle', icon: 'lightbulb' },
  success: { box: 'bg-success/15 border-success/40 text-ink-muted', icon: 'check' },
  warning: { box: 'bg-surface-2 border-accent-hover/30 text-ink-muted', icon: 'shield-check' },
  // Extension del proyecto erp-padel (design.md seccion 6): error real (409 de turno tomado,
  // error generico de red). `warning` ya esta tomado por "sin horarios disponibles", que no es
  // un error -- reusar ese tone aca seria enganoso.
  danger: { box: 'bg-danger/12 border-danger/30 text-ink', icon: 'alert-triangle' },
}

/** Aviso/banner inline (stock, envío gratis, política…). */
export const Alert: FC<PropsWithChildren<{ tone?: AlertTone; class?: string }>> = ({ tone = 'info', class: cls = '', children }) => {
  const t = tones[tone]
  return (
    <div class={`flex items-start gap-3 border rounded-md px-4 py-3 text-sm leading-relaxed ${t.box} ${cls}`}>
      <Icon name={t.icon} class="text-base shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  )
}

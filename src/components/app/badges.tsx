import type { FC, PropsWithChildren } from 'hono/jsx'
import { Icon } from '../ui/Icon'

/** Badges de estado para consola. Color por rol semantico; contenido por datos. */

type StatusKind = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

const statusClass: Record<StatusKind, string> = {
  success: 'text-success bg-success/12',
  danger: 'text-danger bg-danger/12',
  warning: 'text-warning bg-warning/15',
  info: 'text-info bg-info/12',
  neutral: 'text-ink-muted bg-hairline',
}

const dot: Record<StatusKind, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
  neutral: 'bg-ink-muted/50',
}

export const StatusBadge: FC<PropsWithChildren<{ kind?: StatusKind; class?: string }>> = ({ kind = 'neutral', class: cls = '', children }) => (
  <span class={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${statusClass[kind]} ${cls}`}>
    <span class={`w-1.5 h-1.5 rounded-full ${dot[kind]}`} />
    {children}
  </span>
)

export type Temperature = 'hot' | 'warm' | 'cold'
const tempMap: Record<Temperature, { kind: StatusKind; label: string }> = {
  hot: { kind: 'danger', label: 'Caliente' },
  warm: { kind: 'warning', label: 'Templado' },
  cold: { kind: 'info', label: 'Frío' },
}

/** Temperatura de un lead. */
export const TemperatureBadge: FC<{ value: Temperature; class?: string }> = ({ value, class: cls = '' }) => (
  <StatusBadge kind={tempMap[value].kind} class={cls}>{tempMap[value].label}</StatusBadge>
)

/** Estado del bot en una conversacion (activo = automatizado / pausado = humano). */
export const BotStatusBadge: FC<{ active: boolean; class?: string }> = ({ active, class: cls = '' }) => (
  <span
    class={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${active ? 'text-info bg-info/12' : 'text-ink-muted bg-hairline'} ${cls}`}
  >
    <Icon name="bot" class="text-sm" />
    {active ? 'Bot activo' : 'Bot en pausa'}
  </span>
)

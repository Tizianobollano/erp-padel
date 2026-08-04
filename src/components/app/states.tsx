import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'

/** Estados de bloque para consola: vacio, cargando, error. Todos SSR. */

type StateProps = {
  icon?: string
  title: string
  desc?: string
  /** accion opcional (se renderiza como children del contenedor). */
  action?: unknown
  class?: string
}

const shell = 'flex flex-col items-center justify-center text-center gap-2 py-14 px-6'

export const EmptyState: FC<StateProps> = ({ icon = 'inbox', title, desc, action, class: cls = '' }) => (
  <div class={`${shell} ${cls}`}>
    <span class="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-ink-muted/60 text-xl">
      <Icon name={icon} />
    </span>
    <p class="text-sm font-semibold text-ink">{title}</p>
    {desc && <p class="text-sm text-ink-muted/70 max-w-[340px]">{desc}</p>}
    {action as any}
  </div>
)

/** Estado de carga (spinner CSS, gate motion-safe). */
export const LoadingState: FC<{ title?: string; class?: string }> = ({ title = 'Cargando…', class: cls = '' }) => (
  <div class={`${shell} ${cls}`} role="status" aria-live="polite">
    <span class="text-2xl text-accent motion-safe:animate-spin">
      <Icon name="loader" />
    </span>
    <p class="text-sm text-ink-muted/70">{title}</p>
  </div>
)

export const ErrorState: FC<StateProps> = ({ icon = 'alert-triangle', title, desc, action, class: cls = '' }) => (
  <div class={`${shell} ${cls}`} role="alert">
    <span class="w-12 h-12 rounded-full bg-danger/12 flex items-center justify-center text-danger text-xl">
      <Icon name={icon} />
    </span>
    <p class="text-sm font-semibold text-ink">{title}</p>
    {desc && <p class="text-sm text-ink-muted/70 max-w-[340px]">{desc}</p>}
    {action as any}
  </div>
)

import type { FC, PropsWithChildren } from 'hono/jsx'
import { Icon } from '../ui/Icon'

/**
 * Overlays de consola. Comparten la convencion data-open (misma que popup/cart):
 * el contenedor togglea [data-open]; la transicion vive en CSS (motion-safe).
 * Abrir/cerrar se cablea desde el JS de la app con data-* propios del proyecto.
 */

/** Panel lateral genérico. `side` derecha por defecto. */
export const Drawer: FC<PropsWithChildren<{ id: string; title?: string; side?: 'right' | 'left'; class?: string }>> = ({
  id,
  title,
  side = 'right',
  class: cls = '',
  children,
}) => (
  <div data-overlay={id} class="fixed inset-0 z-[450] invisible opacity-0 transition-opacity duration-200 data-[open]:visible data-[open]:opacity-100">
    <div data-overlay-close class="absolute inset-0 bg-ink/50" />
    <aside
      class={`absolute top-0 ${side === 'right' ? 'right-0' : 'left-0'} h-full w-full max-w-[420px] bg-surface-1 shadow-2xl flex flex-col transition-transform duration-300 ${
        side === 'right' ? 'translate-x-full data-[open]:translate-x-0' : '-translate-x-full data-[open]:translate-x-0'
      } ${cls}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header class="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <h2 class="text-sm font-bold text-ink">{title}</h2>
        <button data-overlay-close aria-label="Cerrar" class="text-ink-muted hover:text-accent transition-colors">
          <Icon name="x" class="text-lg" />
        </button>
      </header>
      <div class="flex-1 overflow-y-auto p-5">{children}</div>
    </aside>
  </div>
)

/** Modal centrado con fade+scale del panel (gate motion-safe). */
export const Modal: FC<PropsWithChildren<{ id: string; title?: string; class?: string }>> = ({ id, title, class: cls = '', children }) => (
  <div
    data-overlay={id}
    class="group fixed inset-0 z-[500] flex items-center justify-center p-5 bg-ink/50 opacity-0 pointer-events-none transition-opacity duration-200 data-[open]:opacity-100 data-[open]:pointer-events-auto"
  >
    <div data-overlay-close class="absolute inset-0" />
    <div
      class={`relative w-full max-w-[480px] bg-surface-1 rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-[transform,opacity] duration-300 motion-safe:scale-95 motion-safe:opacity-0 group-data-[open]:scale-100 group-data-[open]:opacity-100 ${cls}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header class="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <h2 class="text-base font-bold text-ink">{title}</h2>
        <button data-overlay-close aria-label="Cerrar" class="text-ink-muted hover:text-accent transition-colors">
          <Icon name="x" class="text-lg" />
        </button>
      </header>
      <div class="p-5">{children}</div>
    </div>
  </div>
)

type ToastKind = 'success' | 'danger' | 'warning' | 'info'
const toastClass: Record<ToastKind, string> = {
  success: 'border-success/30 text-ink',
  danger: 'border-danger/30 text-ink',
  warning: 'border-warning/30 text-ink',
  info: 'border-info/30 text-ink',
}
const toastIcon: Record<ToastKind, { name: string; color: string }> = {
  success: { name: 'check', color: 'text-success' },
  danger: { name: 'alert-triangle', color: 'text-danger' },
  warning: { name: 'alert-triangle', color: 'text-warning' },
  info: { name: 'bell', color: 'text-info' },
}

/** Notificación transitoria. Aparece con fade-up (motion-safe). */
export const Toast: FC<PropsWithChildren<{ kind?: ToastKind; class?: string }>> = ({ kind = 'info', class: cls = '', children }) => {
  const ic = toastIcon[kind]
  return (
    <div
      role="status"
      class={`flex items-center gap-2.5 bg-surface-1 border rounded-md shadow-hover px-4 py-3 text-sm motion-safe:animate-fade-up ${toastClass[kind]} ${cls}`}
    >
      <span class={ic.color}><Icon name={ic.name} /></span>
      <div class="flex-1">{children}</div>
    </div>
  )
}

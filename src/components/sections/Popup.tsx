import type { FC } from 'hono/jsx'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

type PopupProps = {
  badge?: string
  title: string
  body: string
  cta: { label: string; href: string }
  /** días que se recuerda el descarte en localStorage. */
  dismissDays?: number
  /** ms antes de mostrarlo. */
  delayMs?: number
}

/**
 * Popup promocional. Oculto por defecto; <ClientScript /> lo muestra tras `delayMs`
 * y recuerda el descarte `dismissDays` días. Degrada a oculto sin JS.
 */
export const Popup: FC<PopupProps> = ({ badge = 'Promoción', title, body, cta, dismissDays = 7, delayMs = 1800 }) => (
  <div
    data-popup
    data-popup-days={dismissDays}
    data-popup-delay={delayMs}
    role="dialog"
    aria-modal="true"
    aria-labelledby="popup-title"
    class="group fixed inset-0 z-[400] flex items-center justify-center p-5 bg-ink/50 opacity-0 pointer-events-none transition-opacity duration-250 data-[open]:opacity-100 data-[open]:pointer-events-auto"
  >
    <div class="relative w-full max-w-[440px] bg-white rounded-lg px-9 pt-10 pb-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-[transform,opacity] duration-300 motion-safe:scale-95 motion-safe:opacity-0 group-data-[open]:scale-100 group-data-[open]:opacity-100">
      <div class="absolute top-0 inset-x-0 h-[5px] bg-accent rounded-t-lg" />
      <button
        data-popup-close
        aria-label="Cerrar"
        class="absolute top-3.5 right-3.5 w-[30px] h-[30px] bg-black/[0.07] rounded-full flex items-center justify-center text-ink-muted hover:bg-black/15 transition-colors"
      >
        <Icon name="x" class="text-sm" />
      </button>
      <span class="inline-block text-[11px] font-bold uppercase tracking-[1px] text-white bg-accent rounded px-2.5 py-1 mb-3.5">{badge}</span>
      <h2 id="popup-title" class="text-[22px] font-bold text-ink leading-[1.25] mb-2.5 tracking-[-0.3px]">{title}</h2>
      <p class="text-[15px] text-ink-muted leading-[1.6] mb-5.5">{body}</p>
      <Button href={cta.href} variant="accent" external class="w-full">{cta.label}</Button>
    </div>
  </div>
)

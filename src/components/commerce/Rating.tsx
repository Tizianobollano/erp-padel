import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'

/** Estrellas de valoración (0–5, admite medios via redondeo visual simple). */
export const Rating: FC<{ value: number; count?: number; class?: string }> = ({ value, count, class: cls = '' }) => {
  const full = Math.round(value)
  return (
    <div class={`inline-flex items-center gap-1 ${cls}`}>
      <span class="inline-flex text-[15px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon name="star" class={i <= full ? 'text-accent fill-accent' : 'text-accent/25'} />
        ))}
      </span>
      {typeof count === 'number' && <span class="text-xs text-ink-muted/60">({count})</span>}
    </div>
  )
}

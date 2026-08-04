import type { FC } from 'hono/jsx'

export type Testimonial = { quote: string; name: string; role?: string; avatar?: string }

/** Grilla de testimonios con comilla decorativa y autor. */
export const Testimonials: FC<{ title?: string; items: Testimonial[]; cols?: 2 | 3 }> = ({ title, items, cols = 2 }) => (
  <div>
    {title && <p class="text-xl font-semibold text-on-dark/85 mb-7">{title}</p>}
    <div class={`grid grid-cols-1 ${cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
      {items.map((t) => (
        <div class="bg-white rounded-md p-7 shadow-card">
          <div class="relative mb-5">
            <span class="absolute -top-1 -left-1 text-5xl leading-none text-accent-tint/40 select-none">&ldquo;</span>
            <p class="relative pl-5 text-sm leading-[1.65] text-ink-muted">{t.quote}</p>
          </div>
          <div class="flex items-center gap-3">
            {t.avatar ? (
              <img src={t.avatar} alt={t.name} class="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div class="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-[13px] font-semibold text-accent shrink-0">
                {t.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div class="text-sm font-semibold text-ink">{t.name}</div>
              {t.role && <div class="text-xs text-ink-subtle mt-0.5">{t.role}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

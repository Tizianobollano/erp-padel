import type { FC } from 'hono/jsx'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

export type Slide = {
  image?: string
  eyebrow?: string
  title: string
  desc?: string
  cta?: { label: string; href: string }
}

type SliderProps = {
  slides: Slide[]
  /** ms entre slides; 0 = sin autoplay. */
  autoplayMs?: number
  class?: string
}

/**
 * Slider/hero rotativo. Las slides se apilan y se cruzan con opacidad.
 * Flechas, puntos y autoplay los maneja <ClientScript /> vía data-slider.
 * Sin JS muestra la primera slide (degradación elegante).
 */
export const Slider: FC<SliderProps> = ({ slides, autoplayMs = 0, class: cls = '' }) => (
  <div data-slider data-slider-autoplay={autoplayMs} class={`relative overflow-hidden rounded-lg bg-surface-dark ${cls}`}>
    <div class="relative h-[320px] md:h-[420px]">
      {slides.map((s, i) => (
        <div
          data-slide
          class={`absolute inset-0 transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {s.image && <img src={s.image} alt="" class="absolute inset-0 w-full h-full object-cover" />}
          <div class="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent" />
          <div class="relative z-10 h-full flex flex-col justify-center max-w-[620px] px-8 md:px-14">
            {s.eyebrow && <span class="inline-block text-xs font-semibold tracking-[1.2px] uppercase text-accent-tint mb-3">{s.eyebrow}</span>}
            <h3 class="text-3xl md:text-[42px] font-bold leading-[1.1] tracking-[-0.5px] text-on-dark mb-3">{s.title}</h3>
            {s.desc && <p class="text-on-dark/80 leading-[1.5] mb-6 max-w-[460px]">{s.desc}</p>}
            {s.cta && (
              <div>
                <Button href={s.cta.href} variant="primary">{s.cta.label}</Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Flechas */}
    <button
      data-slider-prev
      aria-label="Anterior"
      class="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 rounded-full bg-on-dark/85 text-ink flex items-center justify-center hover:bg-surface-2 transition-colors"
    >
      <Icon name="arrow-right" class="rotate-180" />
    </button>
    <button
      data-slider-next
      aria-label="Siguiente"
      class="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 rounded-full bg-on-dark/85 text-ink flex items-center justify-center hover:bg-surface-2 transition-colors"
    >
      <Icon name="arrow-right" />
    </button>

    {/* Puntos */}
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {slides.map((_, i) => (
        <button
          data-slider-dot
          aria-label={`Ir a slide ${i + 1}`}
          aria-current={i === 0 ? 'true' : 'false'}
          class="w-2.5 h-2.5 rounded-full bg-on-dark/40 transition-colors aria-[current=true]:bg-surface-2"
        />
      ))}
    </div>
  </div>
)

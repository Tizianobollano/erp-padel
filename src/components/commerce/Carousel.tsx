import type { FC, PropsWithChildren } from 'hono/jsx'
import { Icon } from '../ui/Icon'

type CarouselProps = PropsWithChildren<{
  eyebrow?: string
  title?: string
  class?: string
}>

/**
 * Carrusel horizontal genérico. La pista usa scroll-snap (scrolleable/táctil
 * sin JS); las flechas las activa <ClientScript /> vía data-carousel.
 * Pasá tarjetas con ancho fijo y `snap-start` como hijos (ver ProductCarousel).
 */
export const Carousel: FC<CarouselProps> = ({ eyebrow, title, class: cls = '', children }) => (
  <div data-carousel class={cls}>
    {(title || eyebrow) && (
      <div class="flex items-end justify-between gap-4 mb-5">
        <div>
          {eyebrow && <p class="text-xs font-semibold tracking-[1.2px] uppercase text-accent mb-1.5">{eyebrow}</p>}
          {title && <h3 class="text-2xl font-bold text-ink tracking-[-0.3px]">{title}</h3>}
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            data-carousel-prev
            aria-label="Anterior"
            class="w-10 h-10 rounded-full border border-accent/25 text-accent flex items-center justify-center hover:bg-accent/10 transition-colors"
          >
            <Icon name="arrow-right" class="rotate-180" />
          </button>
          <button
            data-carousel-next
            aria-label="Siguiente"
            class="w-10 h-10 rounded-full border border-accent/25 text-accent flex items-center justify-center hover:bg-accent/10 transition-colors"
          >
            <Icon name="arrow-right" />
          </button>
        </div>
      </div>
    )}
    <div
      data-carousel-track
      class="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-1 px-1 [scrollbar-width:thin]"
    >
      {children}
    </div>
  </div>
)

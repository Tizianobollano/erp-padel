import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'
import { Badge } from '../ui/Badge'
import { Rating } from './Rating'

export type Product = {
  id: string
  name: string
  image: string
  price: number
  /** precio anterior (tachado) si hay oferta. */
  compareAt?: number
  currency?: string
  rating?: number
  ratingCount?: number
  /** etiqueta sobre la imagen ("Nuevo", "-20%"…). */
  badge?: string
  href?: string
}

const fmt = (n: number, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

/** Tarjeta de producto: imagen, badge, valoración, precio y acción de carrito. */
export const ProductCard: FC<{ product: Product }> = ({ product: p }) => (
  <div class="group bg-white border border-accent/12 rounded-md overflow-hidden transition-[box-shadow,transform] duration-200 hover:shadow-hover hover:-translate-y-0.5">
    <a href={p.href ?? '#'} class="block relative aspect-square bg-on-dark/60 overflow-hidden">
      <img src={p.image} alt={p.name} class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      {p.badge && <Badge tone="solid" class="absolute top-3 left-3">{p.badge}</Badge>}
      <button
        aria-label="Agregar a favoritos"
        class="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-ink-muted hover:text-accent transition-colors"
      >
        <Icon name="heart" />
      </button>
    </a>
    <div class="p-4">
      {typeof p.rating === 'number' && <Rating value={p.rating} count={p.ratingCount} class="mb-1.5" />}
      <a href={p.href ?? '#'} class="block text-sm font-semibold text-ink leading-snug mb-2 line-clamp-2 hover:text-accent transition-colors">
        {p.name}
      </a>
      <div class="flex items-end justify-between gap-2">
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-bold text-accent">{fmt(p.price, p.currency)}</span>
          {p.compareAt && <span class="text-xs text-ink-muted/50 line-through">{fmt(p.compareAt, p.currency)}</span>}
        </div>
        <button
          data-add-to-cart
          data-product-id={p.id}
          aria-label="Agregar al carrito"
          class="w-10 h-10 bg-surface-dark text-on-dark rounded-sm flex items-center justify-center text-lg hover:bg-surface-dark-2 transition-colors shrink-0"
        >
          <Icon name="shopping-cart" />
        </button>
      </div>
    </div>
  </div>
)

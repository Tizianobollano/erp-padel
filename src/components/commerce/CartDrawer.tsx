import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'
import { Button } from '../ui/Button'

/**
 * Panel lateral de carrito. Se abre/cierra con <ClientScript /> vía data-cart.
 * El contenido de items es manejado por el script (data-cart-items) o por SSR.
 */
export const CartDrawer: FC<{ checkoutHref?: string }> = ({ checkoutHref = '/checkout' }) => (
  <div data-cart class="fixed inset-0 z-[450] invisible opacity-0 transition-opacity data-[open]:visible data-[open]:opacity-100">
    <div data-cart-overlay class="absolute inset-0 bg-ink/50" />
    <aside
      class="absolute top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl flex flex-col translate-x-full transition-transform duration-300 data-[open]:translate-x-0"
      data-cart-panel
      aria-label="Carrito"
    >
      <header class="flex items-center justify-between px-6 py-5 border-b border-accent/12">
        <h2 class="text-base font-bold text-ink flex items-center gap-2">
          <Icon name="shopping-cart" class="text-accent" /> Tu carrito
          <span data-cart-count class="text-xs font-medium text-on-dark bg-accent rounded-full px-2 py-0.5">0</span>
        </h2>
        <button data-cart-close aria-label="Cerrar" class="text-ink-muted hover:text-accent transition-colors">
          <Icon name="x" class="text-xl" />
        </button>
      </header>
      <div data-cart-items class="flex-1 overflow-y-auto px-6 py-4">
        <p class="text-sm text-ink-muted/60 text-center py-12">Tu carrito está vacío.</p>
      </div>
      <footer class="border-t border-accent/12 px-6 py-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-ink-muted">Total</span>
          <span data-cart-total class="text-xl font-bold text-accent">$0</span>
        </div>
        <Button href={checkoutHref} variant="accent" class="w-full">Finalizar compra</Button>
      </footer>
    </aside>
  </div>
)

/** Botón de carrito para el Navbar (muestra el contador). */
export const CartButton: FC = () => (
  <button data-cart-open aria-label="Abrir carrito" class="relative inline-flex items-center justify-center w-10 h-10 text-ink-subtle hover:text-accent transition-colors text-xl">
    <Icon name="shopping-cart" />
    <span data-cart-badge class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-accent text-on-dark text-[11px] font-semibold rounded-full flex items-center justify-center">0</span>
  </button>
)

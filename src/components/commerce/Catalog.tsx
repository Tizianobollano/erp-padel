import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'
import { ProductGrid } from './ProductGrid'
import type { Product } from './ProductCard'

export type CatalogFilter = { title: string; options: string[] }

type CatalogProps = {
  title: string
  products: Product[]
  /** grupos de filtros (presentacionales por defecto). */
  filters?: CatalogFilter[]
  /** opciones de orden del toolbar. */
  sortOptions?: string[]
  cols?: 2 | 3 | 4
}

/**
 * Catálogo completo: barra superior (resultados + orden), sidebar de filtros
 * y grilla de productos. Los filtros son presentacionales (conectalos a tu
 * backend / query params según el proyecto).
 */
export const Catalog: FC<CatalogProps> = ({
  title,
  products,
  filters = [],
  sortOptions = ['Relevancia', 'Menor precio', 'Mayor precio', 'Más nuevos'],
  cols = 3,
}) => (
  <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
    {/* Sidebar de filtros */}
    <aside class="lg:sticky lg:top-24 self-start">
      <div class="flex items-center gap-2 text-sm font-bold text-ink mb-4">
        <Icon name="tag" class="text-accent" /> Filtros
      </div>
      <div class="flex flex-col gap-5">
        {filters.map((group) => (
          <div class="border-b border-accent/10 pb-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-ink-subtle mb-3">{group.title}</p>
            <ul class="flex flex-col gap-2">
              {group.options.map((opt) => (
                <li>
                  <label class="flex items-center gap-2 text-sm text-ink-muted/80 cursor-pointer hover:text-ink">
                    <input type="checkbox" class="accent-accent w-4 h-4" />
                    {opt}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>

    {/* Contenido */}
    <div>
      <div class="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-accent/10">
        <div>
          <h2 class="text-xl font-bold text-ink">{title}</h2>
          <p class="text-[13px] text-ink-muted/60 mt-0.5">{products.length} productos</p>
        </div>
        <label class="flex items-center gap-2 text-sm text-ink-muted/80">
          <span class="hidden sm:inline">Ordenar:</span>
          <select class="border border-accent/20 rounded-sm px-3 py-2 text-sm text-ink bg-white outline-none focus:ring-2 focus:ring-accent/40">
            {sortOptions.map((o) => (
              <option>{o}</option>
            ))}
          </select>
        </label>
      </div>
      <ProductGrid products={products} section={false} cols={cols} />
    </div>
  </div>
)

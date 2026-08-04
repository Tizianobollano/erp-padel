import type { FC } from 'hono/jsx'
import { Section } from '../ui/Section'
import { SectionHeader } from '../ui/SectionHeader'
import { ProductCard, type Product } from './ProductCard'

type ProductGridProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  products: Product[]
  cols?: 2 | 3 | 4
  /** envolver en <Section>. false para usar dentro de otra página/catálogo. */
  section?: boolean
  id?: string
}

const colClass = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }

/** Catálogo / grilla de productos. */
export const ProductGrid: FC<ProductGridProps> = ({ eyebrow, title, subtitle, products, cols = 4, section = true, id }) => {
  const grid = (
    <div class={`grid grid-cols-1 ${colClass[cols]} gap-5`}>
      {products.map((p) => (
        <ProductCard product={p} />
      ))}
    </div>
  )
  if (!section) return grid
  return (
    <Section tone="surface-1" id={id}>
      {title && <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />}
      {grid}
    </Section>
  )
}

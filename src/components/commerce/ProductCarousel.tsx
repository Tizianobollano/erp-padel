import type { FC } from 'hono/jsx'
import { Section } from '../ui/Section'
import { Carousel } from './Carousel'
import { ProductCard, type Product } from './ProductCard'

type ProductCarouselProps = {
  eyebrow?: string
  title?: string
  products: Product[]
  /** envolver en <Section>. false para incrustar en otra página. */
  section?: boolean
  id?: string
}

/** Carrusel de productos: tarjetas de ancho fijo con scroll-snap + flechas. */
export const ProductCarousel: FC<ProductCarouselProps> = ({ eyebrow, title, products, section = true, id }) => {
  const carousel = (
    <Carousel eyebrow={eyebrow} title={title}>
      {products.map((p) => (
        <div class="snap-start shrink-0 w-[260px]">
          <ProductCard product={p} />
        </div>
      ))}
    </Carousel>
  )
  if (!section) return carousel
  return (
    <Section tone="surface-1" id={id}>
      {carousel}
    </Section>
  )
}

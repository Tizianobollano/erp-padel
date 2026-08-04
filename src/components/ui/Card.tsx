import type { FC, PropsWithChildren } from 'hono/jsx'

type CardProps = PropsWithChildren<{
  /** eleva con sombra y -translate en hover. */
  hover?: boolean
  class?: string
}>

/** Superficie base con borde sutil y radio medio. */
export const Card: FC<CardProps> = ({ hover = false, class: cls = '', children }) => (
  <div
    class={`bg-white border border-accent/12 rounded-md transition-[box-shadow,transform] duration-200 ${
      hover ? 'hover:shadow-hover motion-safe:hover:-translate-y-0.5' : ''
    } ${cls}`}
  >
    {children}
  </div>
)

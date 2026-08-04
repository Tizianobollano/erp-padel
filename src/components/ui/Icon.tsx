import type { FC } from 'hono/jsx'

type IconProps = {
  /** id del símbolo en el sprite, sin el prefijo `ic-`. Ej: "check", "shopping-cart". */
  name: string
  /** true para iconos `fill` (Simple Icons / redes). */
  fill?: boolean
  /** clases extra (color, tamaño con text-*). */
  class?: string
}

/** Referencia un símbolo del <IconSprite />. Tamaño = font-size del contenedor (1em). */
export const Icon: FC<IconProps> = ({ name, fill = false, class: cls = '' }) => (
  <svg class={`${fill ? 'icon-fill' : 'icon'} ${cls}`} aria-hidden="true">
    <use href={`#ic-${name}`} />
  </svg>
)

import type { FC } from 'hono/jsx'

export const inputBase =
  'w-full text-[15px] leading-tight text-ink placeholder:text-ink-muted/45 bg-surface-1 border border-hairline rounded-sm px-3.5 py-2.5 transition-colors focus:outline-none focus:border-accent disabled:bg-surface-2 disabled:text-ink-muted/60 disabled:cursor-not-allowed'

type InputProps = {
  name?: string
  type?: string
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  /** marca estado invalido (borde danger). */
  invalid?: boolean
  autocomplete?: string
  id?: string
  class?: string
  /** limites nativos de type="date"/"number" (ya se forwardeaban en runtime via rest; faltaba el tipo). */
  min?: string
  max?: string
  /** atributos data-* para enganchar interactividad via ClientScript (ej. data-filtro-fecha). */
  [dataAttr: `data-${string}`]: string | number | boolean | undefined
}

/** Campo de texto SSR. Estilo por roles; sin estado de cliente. */
export const Input: FC<InputProps> = ({ invalid = false, class: cls = '', ...rest }) => (
  <input class={`${inputBase} ${invalid ? 'border-danger focus:border-danger' : ''} ${cls}`} {...rest} />
)

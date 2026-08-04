import type { FC, PropsWithChildren } from 'hono/jsx'

export type ButtonVariant = 'primary' | 'outline-light' | 'accent' | 'outline-accent' | 'danger'

const base =
  'inline-flex items-center justify-center gap-2 font-medium text-[15px] leading-tight px-6 py-[11px] rounded-sm border-2 cursor-pointer transition-[color,background-color,border-color,transform] duration-150 motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0'

const variants: Record<ButtonVariant, string> = {
  // Sobre superficie oscura
  primary: 'bg-on-dark text-accent border-on-dark hover:bg-white hover:border-white',
  'outline-light': 'bg-transparent text-on-dark border-on-dark/55 hover:bg-on-dark/10 hover:border-on-dark',
  // Sobre superficie clara
  // Correccion de contraste (design.md seccion 2/6, revision 2026-08-04): bg-accent+text-on-dark
  // media 4.22:1, bajo el piso 4.5:1. bg-accent-tint+text-ink mide 8.62:1. border-accent se
  // mantiene para identidad de marca; hover:brightness-95 porque accent-tint no tiene -hover propio.
  accent: 'bg-accent-tint text-ink border-accent hover:brightness-95',
  'outline-accent': 'bg-transparent text-accent border-accent hover:bg-accent/[0.07]',
  // Extension del proyecto erp-padel (design.md seccion 6): accion destructiva, sobre
  // --color-danger (ya existente en @theme, sin token *-hover propio -- a diferencia de accent,
  // el contrato de roles no define un "danger-hover"). El tono mas oscuro en hover se logra con
  // el filtro brightness, no con un color nuevo.
  // Correccion de contraste (revision 2026-08-04): text-on-dark sobre bg-danger media 3.41:1,
  // bajo el piso 4.5:1. text-ink (el mas oscuro disponible) da 4.58:1 -- maximo alcanzable con
  // los tokens actuales, margen mas ajustado que el resto de esta revision.
  danger: 'bg-danger text-ink border-danger hover:brightness-90',
}

type ButtonProps = PropsWithChildren<{
  /** si está presente, se renderiza como <a>. */
  href?: string
  variant?: ButtonVariant
  /** abre en pestaña nueva con rel seguro. */
  external?: boolean
  class?: string
  /** atributos data-* para enganchar interactividad via ClientScript (ej. data-cancelar). */
  [dataAttr: `data-${string}`]: string | number | undefined
}>

export const Button: FC<ButtonProps> = ({ href, variant = 'primary', external = false, class: cls = '', children, ...rest }) => {
  const className = `${base} ${variants[variant]} ${cls}`
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return href ? (
    <a href={href} class={className} {...ext} {...rest}>
      {children}
    </a>
  ) : (
    <button type="button" class={className} {...rest}>
      {children}
    </button>
  )
}

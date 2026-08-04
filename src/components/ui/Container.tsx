import type { FC, PropsWithChildren } from 'hono/jsx'

/** Ancho máximo de contenido (1200px) centrado, con padding lateral responsivo. */
export const Container: FC<PropsWithChildren<{ class?: string }>> = ({ children, class: cls = '' }) => (
  <div class={`max-w-[1200px] mx-auto px-5 sm:px-8 ${cls}`}>{children}</div>
)

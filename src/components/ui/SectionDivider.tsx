import type { FC } from 'hono/jsx'

/** Línea divisoria sutil con degradado, entre secciones claras. */
export const SectionDivider: FC = () => (
  <div class="h-px bg-[linear-gradient(90deg,transparent,rgba(35,123,124,0.2),transparent)]" />
)

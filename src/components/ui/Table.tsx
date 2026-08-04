import type { FC, PropsWithChildren } from 'hono/jsx'

/** Tabla de datos SSR (sin sorting/paginacion). Hairlines neutros por rol.
 *  Envolver en un contenedor con overflow-x-auto para scroll horizontal. */
export const Table: FC<PropsWithChildren<{ class?: string }>> = ({ class: cls = '', children }) => (
  <div class="w-full overflow-x-auto">
    <table class={`w-full border-collapse text-sm text-ink ${cls}`}>{children}</table>
  </div>
)

export const Thead: FC<PropsWithChildren<{ class?: string }>> = ({ class: cls = '', children }) => (
  <thead class={`bg-surface-2 ${cls}`}>{children}</thead>
)

export const Tbody: FC<PropsWithChildren<{ class?: string }>> = ({ class: cls = '', children }) => (
  <tbody class={cls}>{children}</tbody>
)

export const Tr: FC<PropsWithChildren<{ class?: string }>> = ({ class: cls = '', children }) => (
  <tr class={`border-b border-hairline ${cls}`}>{children}</tr>
)

type CellProps = PropsWithChildren<{ align?: 'left' | 'center' | 'right'; class?: string }>
const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

export const Th: FC<CellProps> = ({ align = 'left', class: cls = '', children }) => (
  <th class={`px-3.5 py-2.5 font-semibold text-xs uppercase tracking-wide text-ink-muted whitespace-nowrap ${alignClass[align]} ${cls}`}>
    {children}
  </th>
)

export const Td: FC<CellProps> = ({ align = 'left', class: cls = '', children }) => (
  <td class={`px-3.5 py-2.5 align-middle ${alignClass[align]} ${cls}`}>{children}</td>
)

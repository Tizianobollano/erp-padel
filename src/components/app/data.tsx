import type { FC, PropsWithChildren } from 'hono/jsx'
import { Icon } from '../ui/Icon'
import { Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table'

/** Tarjeta de metrica (KPI). Delta opcional con color por rol. */
export const KpiTile: FC<{
  label: string
  value: string
  icon?: string
  delta?: string
  deltaKind?: 'up' | 'down' | 'flat'
  class?: string
}> = ({ label, value, icon, delta, deltaKind = 'flat', class: cls = '' }) => (
  <div class={`bg-surface-1 border border-hairline rounded-md p-4 ${cls}`}>
    <div class="flex items-center justify-between mb-1.5">
      <span class="text-xs font-medium uppercase tracking-wide text-ink-muted/60">{label}</span>
      {icon && <span class="text-ink-muted/40"><Icon name={icon} /></span>}
    </div>
    <div class="text-2xl font-bold text-ink tracking-[-0.3px]">{value}</div>
    {delta && (
      <div class={`mt-1 text-xs font-medium ${deltaKind === 'up' ? 'text-success' : deltaKind === 'down' ? 'text-danger' : 'text-ink-muted/60'}`}>
        {delta}
      </div>
    )}
  </div>
)

export type Column<T> = {
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  /** render de celda; por defecto muestra row[key] como texto. */
  cell?: (row: T) => unknown
}

/** Tabla de datos densa dirigida por columnas. Envuelve los primitivos ui/Table. */
export function DataTable<T extends Record<string, unknown>>(props: {
  columns: Column<T>[]
  rows: T[]
  /** id para href de fila; si se pasa `rowHref`, la fila entera linkea. */
  rowHref?: (row: T) => string
  class?: string
}) {
  const { columns, rows, rowHref, class: cls = '' } = props
  return (
    <Table class={cls}>
      <Thead>
        <Tr>
          {columns.map((c) => (
            <Th align={c.align}>{c.header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr class={rowHref ? 'hover:bg-surface-2/60 transition-colors' : ''}>
            {columns.map((c) => (
              <Td align={c.align}>{c.cell ? c.cell(row) : (row[c.key] as any)}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

export type TimelineItem = { time: string; title: string; desc?: string; icon?: string }

/** Linea de tiempo vertical (actividad de un lead/conversacion). */
export const Timeline: FC<{ items: TimelineItem[]; class?: string }> = ({ items, class: cls = '' }) => (
  <ol class={`relative flex flex-col gap-5 ${cls}`}>
    {items.map((it, i) => (
      <li class="relative pl-7">
        <span class="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-accent/12 text-accent flex items-center justify-center text-[10px]">
          <Icon name={it.icon ?? 'check'} />
        </span>
        {i < items.length - 1 && <span class="absolute left-[7px] top-5 bottom-[-20px] w-px bg-hairline" />}
        <div class="text-[11px] text-ink-muted/55">{it.time}</div>
        <div class="text-sm font-medium text-ink">{it.title}</div>
        {it.desc && <div class="text-sm text-ink-muted/70">{it.desc}</div>}
      </li>
    ))}
  </ol>
)

/** Contenedor de tarjeta neutra para paneles de consola. */
export const Panel: FC<PropsWithChildren<{ title?: string; class?: string }>> = ({ title, class: cls = '', children }) => (
  <section class={`bg-surface-1 border border-hairline rounded-md ${cls}`}>
    {title && <header class="px-4 py-3 border-b border-hairline text-sm font-semibold text-ink">{title}</header>}
    <div class="p-4">{children}</div>
  </section>
)

import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'
import { Select, type SelectOption } from '../ui/Select'
import { Input } from '../ui/Input'
import { Panel } from './data'

export type LeadField = { label: string; value: string }

/** Resumen de datos de un lead/contacto en el panel lateral. */
export const LeadSummaryPanel: FC<{ name: string; fields: LeadField[]; class?: string }> = ({ name, fields, class: cls = '' }) => (
  <Panel class={cls}>
    <div class="flex items-center gap-3 mb-4">
      <span class="w-10 h-10 rounded-full bg-surface-2 text-ink-muted flex items-center justify-center text-base font-semibold">
        {name.slice(0, 1).toUpperCase()}
      </span>
      <div class="min-w-0">
        <div class="text-sm font-semibold text-ink truncate">{name}</div>
        <div class="text-xs text-ink-muted/60">Contacto</div>
      </div>
    </div>
    <dl class="flex flex-col gap-2.5">
      {fields.map((f) => (
        <div class="flex items-start justify-between gap-3">
          <dt class="text-xs text-ink-muted/60">{f.label}</dt>
          <dd class="text-sm text-ink text-right">{f.value}</dd>
        </div>
      ))}
    </dl>
  </Panel>
)

export type Task = { id: string; label: string; done?: boolean; due?: string }

/** Lista de tareas (checkbox nativo; POST por item). */
export const TaskList: FC<{ items: Task[]; action?: string; class?: string }> = ({ items, action = '#', class: cls = '' }) => (
  <ul class={`flex flex-col ${cls}`}>
    {items.map((t) => (
      <li class="flex items-center gap-3 py-2 border-b border-hairline last:border-0">
        <form action={action} method="post" class="flex items-center gap-3 flex-1">
          <input type="hidden" name="id" value={t.id} />
          <input
            type="checkbox"
            name="done"
            checked={t.done}
            class="w-4 h-4 rounded-sm accent-accent cursor-pointer"
            onchange="this.form.submit()"
          />
          <span class={`flex-1 text-sm ${t.done ? 'line-through text-ink-muted/50' : 'text-ink'}`}>{t.label}</span>
          {t.due && <span class="text-[11px] text-ink-muted/55 flex items-center gap-1"><Icon name="clock" class="text-xs" />{t.due}</span>}
        </form>
      </li>
    ))}
  </ul>
)

/** Asignacion de responsable (select nativo). */
export const AssignmentSelect: FC<{ options: SelectOption[]; value?: string; name?: string; class?: string }> = ({ options, value, name = 'assignee', class: cls = '' }) => (
  <label class={`flex items-center gap-2 ${cls}`}>
    <Icon name="user" class="text-ink-muted/50" />
    <Select name={name} value={value} options={options} placeholder="Sin asignar" class="py-1.5" />
  </label>
)

export type FilterChip = { label: string; href: string; active?: boolean; count?: number }

/** Barra de filtros: buscador + chips + accion opcional. */
export const FilterBar: FC<{ chips?: FilterChip[]; searchName?: string; searchAction?: string; class?: string }> = ({
  chips = [],
  searchName = 'q',
  searchAction = '#',
  class: cls = '',
}) => (
  <div class={`flex flex-wrap items-center gap-3 ${cls}`}>
    <form action={searchAction} method="get" class="relative flex-1 min-w-[180px]">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/50 text-sm pointer-events-none"><Icon name="search" /></span>
      <Input name={searchName} placeholder="Buscar…" class="pl-9 py-2" />
    </form>
    {chips.length > 0 && (
      <div class="flex flex-wrap items-center gap-1.5">
        {chips.map((c) => (
          <a
            href={c.href}
            class={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
              c.active ? 'bg-accent text-on-dark border-accent' : 'bg-surface-1 text-ink-muted border-hairline hover:border-accent/40'
            }`}
          >
            {c.label}
            {typeof c.count === 'number' && <span class={c.active ? 'text-on-dark/80' : 'text-ink-muted/50'}>{c.count}</span>}
          </a>
        ))}
      </div>
    )}
  </div>
)

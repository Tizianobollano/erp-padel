import type { FC } from 'hono/jsx'

export type Stat = { num: string; desc: string }

/** Fila de métricas grandes en una caja segmentada. Usar dentro de sección oscura. */
export const Stats: FC<{ items: Stat[]; class?: string }> = ({ items, class: cls = '' }) => (
  <div
    class={`grid grid-cols-1 md:grid-cols-3 gap-px bg-on-dark/10 border border-on-dark/15 rounded-lg overflow-hidden ${cls}`}
  >
    {items.map((s) => (
      <div class="px-8 py-9 text-center bg-white/[0.04]">
        <div class="text-5xl font-bold text-on-dark tracking-[-1px] leading-none mb-2">{s.num}</div>
        <div class="text-sm text-on-dark/65 leading-[1.4]">{s.desc}</div>
      </div>
    ))}
  </div>
)

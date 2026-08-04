import type { FC } from 'hono/jsx'
import { EmptyState } from '../app/states'

// design.md seccion 7 (TurnosGrid). SSR puro: solo conoce que hacer con los turnos que ya tiene
// (grilla o "vacia"). Los estados "carga" y "error de red" no son representables con estas
// props (no hay turnos todavia) -- los arma ClientScript por DOM directo, reusando las mismas
// clases que este archivo. Si cambian las clases de acá, hay que revisar ClientScript.tsx.

export type Turno = { hora_inicio: string; disponible: boolean }

export type TurnosGridProps = {
  turnos: Turno[]
  /** hora_inicio seleccionada, si hay. */
  selected?: string
  /** nombre del input hidden que lee el submit del formulario. */
  name?: string
  class?: string
}

/** Boton individual de turno: min-h-11 (44px) para el touch target minimo de PRODUCT.md 7. */
export const turnoButtonBase =
  'min-h-[44px] flex items-center justify-center rounded-sm border text-[15px] font-semibold transition-colors duration-150'
export const turnoDisponible = 'bg-surface-1 text-ink border-hairline hover:border-accent focus-visible:border-accent'
// Correccion de contraste (design.md seccion 6/7, revision 2026-08-04): mismo par accent-tint +
// ink que Button variant="accent" -- bg-accent+text-on-dark media 4.22:1, bajo el piso 4.5:1.
export const turnoSeleccionado = 'bg-accent-tint text-ink border-accent'
export const turnoOcupado = 'bg-surface-2 text-ink-muted/40 border-hairline cursor-not-allowed'

export const TurnosGrid: FC<TurnosGridProps> = ({ turnos, selected, name = 'hora_inicio', class: cls = '' }) => {
  const hayDisponibles = turnos.some((t) => t.disponible)
  if (!hayDisponibles) {
    // Incluye turnos:[] (club no atiende ese dia) y el caso todos disponible:false.
    return <EmptyState icon="clock" title="Sin horarios disponibles" desc="Elegi otra fecha o cancha." class={cls} />
  }
  return (
    <div class={`grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2 ${cls}`} data-turnos-list data-turno-input-name={name}>
      {turnos.map((t) =>
        t.disponible ? (
          <button
            type="button"
            data-turno={t.hora_inicio}
            data-selected={t.hora_inicio === selected ? '' : undefined}
            class={`${turnoButtonBase} ${t.hora_inicio === selected ? turnoSeleccionado : turnoDisponible}`}
          >
            {t.hora_inicio}
          </button>
        ) : (
          <button type="button" disabled aria-label={`Ocupado, no disponible ${t.hora_inicio}`} class={`${turnoButtonBase} ${turnoOcupado}`}>
            {t.hora_inicio}
            <span class="sr-only">Ocupado</span>
          </button>
        ),
      )}
    </div>
  )
}

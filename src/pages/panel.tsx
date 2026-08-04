import type { FC } from 'hono/jsx'
import {
  AppShell,
  type NavItem,
  Input,
  Icon,
  DataTable,
  type Column,
  StatusBadge,
  Button,
  EmptyState,
  ErrorState,
  Modal,
} from '../components'

// Pagina privada del panel del club (design.md seccion 4.B y 7 "Panel de reservas").
// FilterBar (app/panels.tsx) trae un buscador de texto bundleado que este modulo no usa (la API
// solo filtra por fecha/estado) -- los chips se replican a mano en vez de arrastrar un campo de
// busqueda no funcional. Documentado en framework-backlog.md.

export type ReservaRow = {
  id: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  cancha_nombre: string
  jugador_nombre: string
  jugador_telefono: string
  estado: 'confirmada' | 'cancelada'
}

export type PanelPageProps = {
  club_nombre: string
  usuario_email: string
  reservas: ReservaRow[]
  fecha_filtro: string
  estado_filtro?: 'confirmada' | 'cancelada'
  /** listar fallo (D1 no disponible, etc). */
  error?: boolean
}

const NAV: NavItem[] = [{ label: 'Reservas', href: '/panel', icon: 'clock', active: true }]

// min-h-11 (44px): area de toque minima (design.md seccion 7, hallazgo ux-reviewer, chips 30px en
// mobile). Correccion de contraste del chip activo: bg-accent-tint+text-ink (ver Button "accent").
const chipClass = (active: boolean) =>
  `inline-flex items-center min-h-11 gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
    active ? 'bg-accent-tint text-ink border-accent' : 'bg-surface-1 text-ink-muted border-hairline hover:border-accent/40'
  }`

function chipHref(fecha: string, estado?: 'confirmada' | 'cancelada'): string {
  const usp = new URLSearchParams({ fecha })
  if (estado) usp.set('estado', estado)
  return `/panel?${usp.toString()}`
}

export const PanelPage: FC<PanelPageProps> = ({ club_nombre, usuario_email, reservas, fecha_filtro, estado_filtro, error = false }) => {
  const columns: Column<ReservaRow>[] = [
    { key: 'fecha', header: 'Fecha' },
    { key: 'hora_inicio', header: 'Hora', cell: (r) => `${r.hora_inicio}-${r.hora_fin}` },
    { key: 'cancha_nombre', header: 'Cancha' },
    { key: 'jugador_nombre', header: 'Jugador' },
    { key: 'jugador_telefono', header: 'Telefono' },
    {
      key: 'estado',
      header: 'Estado',
      cell: (r) => (
        <span data-status-cell>
          <StatusBadge kind={r.estado === 'confirmada' ? 'success' : 'neutral'}>{r.estado}</StatusBadge>
        </span>
      ),
    },
    {
      key: 'accion',
      header: '',
      cell: (r) =>
        r.estado === 'confirmada' ? (
          <Button
            variant="outline-accent"
            class="py-2 px-4 text-sm"
            data-cancelar={r.id}
            data-jugador={r.jugador_nombre}
            data-fecha={r.fecha}
            data-hora={r.hora_inicio}
            data-cancha={r.cancha_nombre}
          >
            Cancelar
          </Button>
        ) : null,
    },
  ]

  return (
    <AppShell brand={club_nombre} title="Reservas" nav={NAV} topbarRight={<span class="text-sm text-ink-muted truncate max-w-[220px]">{usuario_email}</span>}>
      <div class="flex flex-wrap items-center gap-4 mb-4">
        <form method="get" action="/panel" class="flex items-center gap-2" data-filtro-fecha-form>
          <label for="fecha-filtro" class="sr-only">
            Fecha
          </label>
          <Input id="fecha-filtro" name="fecha" type="date" value={fecha_filtro} class="py-2 w-auto" data-filtro-fecha />
          {estado_filtro && <input type="hidden" name="estado" value={estado_filtro} />}
          <button type="submit" aria-label="Aplicar filtro de fecha" class="w-9 h-9 shrink-0 rounded-sm border border-hairline text-ink-muted hover:text-accent hover:border-accent transition-colors flex items-center justify-center">
            <Icon name="search" />
          </button>
        </form>
        <div class="flex flex-wrap items-center gap-1.5">
          <a href={chipHref(fecha_filtro)} class={chipClass(!estado_filtro)}>
            Todas
          </a>
          <a href={chipHref(fecha_filtro, 'confirmada')} class={chipClass(estado_filtro === 'confirmada')}>
            Confirmadas
          </a>
          <a href={chipHref(fecha_filtro, 'cancelada')} class={chipClass(estado_filtro === 'cancelada')}>
            Canceladas
          </a>
        </div>
      </div>

      {error ? (
        <ErrorState title="No pudimos cargar las reservas" action={<Button href="/panel" variant="outline-accent" class="mt-1">Reintentar</Button>} />
      ) : reservas.length === 0 ? (
        <EmptyState title="No hay reservas" desc="No hay reservas para estos filtros." />
      ) : (
        <>
          {/* design.md seccion 7 "Panel de reservas": DataTable no tiene patron responsive propio
              (solo overflow-x-auto) -- bajo sm, vista de tarjetas en vez de scroll horizontal por fila. */}
          <DataTable columns={columns} rows={reservas} class="hidden sm:block" />
          <div class="sm:hidden flex flex-col gap-3">
            {reservas.map((r) => (
              <div class="border border-hairline rounded-md p-4 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-ink">
                    {r.hora_inicio}-{r.hora_fin}
                  </span>
                  <StatusBadge kind={r.estado === 'confirmada' ? 'success' : 'neutral'}>{r.estado}</StatusBadge>
                </div>
                <div class="flex flex-col gap-1">
                  <div class="flex justify-between gap-3">
                    <span class="text-xs text-ink-muted">Fecha</span>
                    <span class="text-sm text-ink text-right">{r.fecha}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-xs text-ink-muted">Cancha</span>
                    <span class="text-sm text-ink text-right">{r.cancha_nombre}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-xs text-ink-muted shrink-0">Jugador</span>
                    <span class="text-sm text-ink text-right break-words min-w-0">{r.jugador_nombre}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-xs text-ink-muted">Telefono</span>
                    <span class="text-sm text-ink text-right">{r.jugador_telefono}</span>
                  </div>
                </div>
                {r.estado === 'confirmada' && (
                  <Button
                    variant="outline-accent"
                    class="w-full mt-1"
                    data-cancelar={r.id}
                    data-jugador={r.jugador_nombre}
                    data-fecha={r.fecha}
                    data-hora={r.hora_inicio}
                    data-cancha={r.cancha_nombre}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <Modal id="cancelar-reserva" title="Cancelar reserva">
        <p class="text-sm text-ink-muted mb-5">
          {/* break-words: mismo defecto de higiene CSS que jugador_nombre en ReservaForm (warning 8 de
              la auditoria UX) -- encontrado aca al verificar visualmente, no estaba reportado para
              esta ubicacion especifica. Sin break-words el nombre largo se corta fuera de la
              pantalla (el Modal es position:fixed, sin scroll posible), mas severo que el bug
              original porque el contenido queda inaccesible, no solo desborda la pagina. */}
          Vas a cancelar la reserva de <strong data-cancel-jugador class="text-ink font-semibold break-words"></strong> para el{' '}
          <strong data-cancel-fecha class="text-ink font-semibold"></strong> a las <strong data-cancel-hora class="text-ink font-semibold"></strong> en{' '}
          <strong data-cancel-cancha class="text-ink font-semibold"></strong>. Esta accion no se puede deshacer.
        </p>
        <div class="flex justify-end gap-3">
          {/* outline-accent (no outline-light): design.md seccion 7, correccion de contraste
              1.19:1 -> 5.01:1. min-h-11 explicito: alto medido 43px, 1px bajo el minimo 44px. */}
          <Button variant="outline-accent" class="min-h-11" data-overlay-close>
            Volver
          </Button>
          <Button variant="danger" data-cancelar-confirm>
            Si, cancelar reserva
          </Button>
        </div>
      </Modal>

      <div data-toast-root class="fixed bottom-5 right-5 z-[600] w-[300px] flex flex-col gap-2"></div>
    </AppShell>
  )
}

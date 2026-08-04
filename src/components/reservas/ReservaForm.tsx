import type { FC } from 'hono/jsx'
import { Container } from '../ui/Container'
import { Select, type SelectOption } from '../ui/Select'
import { Input } from '../ui/Input'
import { EmptyState } from '../app/states'
import { Alert } from '../commerce/Alert'
import { Icon } from '../ui/Icon'

// design.md seccion 7 (ReservaForm). Orquesta la pagina A completa: encabezado + pasos 2-5.
// No recibe `turnos`: se piden por fetch desde ClientScript cuando cancha+fecha estan
// completos. Los 6 data-state (idle/loading/success/conflict/invalid/error) viven TODOS en el
// SSR (mismo patron group-data-[...] que ya usa Modal con data-open); ClientScript solo togglea
// el atributo data-state y completa el contenido dinamico (resumen de exito, mensaje de invalid).
// `invalid` (400 de validacion, correccion 2026-08-04 warning 6): reemplaza al `error` unico que
// antes conflacionaba validacion con servidor/red -- ver design.md seccion 7 para el detalle.

export type ReservaFormProps = {
  club_nombre: string
  canchas: { id: number; nombre: string }[]
  fecha_minima: string
}

const fieldLabel = 'block text-sm font-medium text-ink mb-1.5'

// Correccion de contraste (design.md seccion 2/6, revision 2026-08-04): mismo par accent-tint +
// ink que Button variant="accent" -- no reusa <Button> porque necesita el estado disabled + swap
// de texto de loading, ver comentario del archivo arriba.
const submitBtnClass =
  'w-full inline-flex items-center justify-center gap-2 font-medium text-[15px] leading-tight px-6 py-[11px] rounded-sm border-2 cursor-pointer transition-[color,background-color,border-color,transform] duration-150 motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 bg-accent-tint text-ink border-accent hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0'

export const ReservaForm: FC<ReservaFormProps> = ({ club_nombre, canchas, fecha_minima }) => {
  const canchaOptions: SelectOption[] = canchas.map((c) => ({ value: String(c.id), label: c.nombre }))
  return (
    <Container class="max-w-[480px] py-10">
      <header class="text-center mb-8">
        <h1 class="text-2xl font-bold text-ink">{club_nombre}</h1>
        <p class="text-ink-muted mt-1.5">Reserva tu cancha en menos de un minuto</p>
      </header>

      <div class="group" data-form-root data-state="idle">
        <form data-form="reserva" class="flex flex-col gap-5 group-data-[state=success]:hidden" novalidate>
          <div>
            <label for="cancha_id" class={fieldLabel}>
              Cancha
            </label>
            <Select id="cancha_id" name="cancha_id" options={canchaOptions} placeholder="Elegi una cancha" required data-disponibilidad-trigger />
          </div>

          <div>
            <label for="fecha" class={fieldLabel}>
              Fecha
            </label>
            <Input id="fecha" name="fecha" type="date" min={fecha_minima} required data-disponibilidad-trigger />
          </div>

          <div>
            <span class={fieldLabel}>Horario</span>
            <div data-turnos-grid>
              <EmptyState icon="clock" title="Elegi cancha y fecha" desc="Ahi vas a ver los horarios disponibles." />
            </div>
            <input type="hidden" name="hora_inicio" data-hora-inicio-input value="" />
          </div>

          <div>
            <label for="jugador_nombre" class={fieldLabel}>
              Nombre
            </label>
            <Input id="jugador_nombre" name="jugador_nombre" type="text" required autocomplete="name" />
          </div>

          <div>
            <label for="jugador_telefono" class={fieldLabel}>
              Telefono
            </label>
            <Input id="jugador_telefono" name="jugador_telefono" type="tel" required autocomplete="tel" />
          </div>

          <button type="submit" data-submit-btn data-label-idle="Confirmar reserva" data-label-loading="Reservando..." class={submitBtnClass}>
            Confirmar reserva
          </button>

          <div class="hidden group-data-[state=conflict]:block motion-safe:animate-fade-in" role="status" aria-live="polite">
            <Alert tone="danger">Justo se reservo ese horario. Elegi otro.</Alert>
          </div>

          {/* invalid (400 de validacion): texto literal de body.error, la API ya lo redacta en
              espanol simple y accionable (design.md seccion 7). Sin boton Reintentar -- el
              formulario ya vuelve a estado interactivo (data-state deja de ser "loading"), el
              jugador corrige el campo y reenvia por el submit normal. */}
          <div class="hidden group-data-[state=invalid]:block motion-safe:animate-fade-in" role="status" aria-live="polite">
            <Alert tone="danger">
              <p data-invalid-message></p>
            </Alert>
          </div>

          <div class="hidden group-data-[state=error]:block motion-safe:animate-fade-in" role="status" aria-live="polite">
            <Alert tone="danger">
              <p>No pudimos completar la reserva. Reintenta.</p>
              <button type="button" data-reintentar class="mt-1.5 text-sm font-semibold text-danger underline underline-offset-2 hover:no-underline cursor-pointer">
                Reintentar
              </button>
            </Alert>
          </div>
        </form>

        <div
          data-success-card
          class="hidden group-data-[state=success]:block bg-surface-1 border border-hairline rounded-md shadow-card p-5 motion-safe:animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <div class="flex items-center gap-2 text-success mb-4">
            <span class="text-xl">
              <Icon name="check" />
            </span>
            <span class="font-semibold text-ink">Reserva confirmada</span>
          </div>
          <dl class="flex flex-col gap-2 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-ink-muted">Cancha</dt>
              <dd data-success-cancha class="text-ink font-medium text-right"></dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-ink-muted">Fecha</dt>
              <dd data-success-fecha class="text-ink font-medium text-right"></dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-ink-muted">Horario</dt>
              <dd data-success-horario class="text-ink font-medium text-right"></dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-ink-muted">Nombre</dt>
              <dd data-success-nombre class="text-ink font-medium text-right break-words min-w-0"></dd>
            </div>
          </dl>
        </div>
      </div>
    </Container>
  )
}

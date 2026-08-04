import type { FC } from 'hono/jsx'
import { ReservaForm, type ReservaFormProps } from '../components'

// Pagina publica del formulario de reserva (design.md seccion 4.A). Sin props extra: todo el
// dato viene de ReservaForm, que orquesta encabezado + flujo completo.
export const ReservarPage: FC<ReservaFormProps> = (props) => <ReservaForm {...props} />

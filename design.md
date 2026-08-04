# design.md - Modulo 1: Reserva de cancha (erp-padel)

Nota de ubicacion: este proyecto NO usa la convencion `apps/web/` de otros proyectos IIAPIE-UI
(ej. gestoria_en_movimiento) -- es un unico Worker con `src/` en la raiz del repo (ver
`package.json`, `wrangler.jsonc`). Este `design.md` vive en la raiz, junto a `PRODUCT.md`, para
seguir la estructura real del proyecto en vez de imponer una carpeta que no existe.

## 1. Fuente

Sin brief visual de cliente: erp-padel no tiene club piloto confirmado ni marca propia todavia
(wiki/index.md, "Estado: idea con propuesta escrita. Sin cliente."). No corri hallmark en esta
pasada -- este modulo es una herramienta funcional de mostrador (un formulario y una tabla de
administracion), no una landing de marca a construir desde cero, y el pedido explicito es cubrir
el contrato literal de la API y los estados de carrera del 409, no explorar direccion visual
nueva sin tener a quien mostrarsela.

Fuente real de esta spec:
- Paleta y tokens: contrato de roles ya definido en el framework
  (`/normai/workspace/skills/framework/iiapie-ui.md` + `src/styles/app.css` del framework base),
  reusados tal cual porque el proyecto no tiene paleta propia (gap conocido, ver
  framework-backlog.md).
- Contenido y tono: `wiki/propuesta.md` (posicionamiento comercial, Modulo 1 completo) y
  `wiki/architecture/modelo-datos-reservas.md` (que datos existen realmente).
- Contrato de datos: `src/routes/public.ts` y `src/routes/panel.ts` leidos literalmente antes de
  escribir esta spec.

Nota para el humano: cuando erp-padel tenga un club piloto o nombre de marca, esta seccion y la
paleta deberian revisarse con `hallmark study`/`build` recien en ese momento -- no antes, para no
inventar identidad sin cliente que la valide.

## 2. Paleta de colores

Sin retematizar: este modulo reusa el contrato de roles del framework tal cual viene (paleta
AFOLAP default). No hay marca propia que justifique redefinir `@theme`.

| Token | Uso en este modulo |
|---|---|
| `surface-1` | Fondo de la pagina publica y del panel |
| `surface-2` | Fondo alterno (AppShell, sidebar, filas hover de tabla) |
| `surface-3` | Superficie elevada suave, uso opcional en tarjeta de turno seleccionado |
| `surface-dark` / `surface-dark-2` | Solo si el encabezado minimo de la pagina publica usa tone oscuro (decision de layout de frontend-developer, ver seccion 4) |
| `ink` / `ink-muted` / `ink-subtle` | Jerarquia de texto en ambos flujos |
| `accent` / `accent-hover` / `accent-tint` | Boton confirmar, turno seleccionado, item activo del panel |
| `hairline` / `hairline-strong` | Bordes de Input/Select/Table, separadores de la grilla de turnos |
| `success` | Confirmacion de reserva, toast de cancelacion exitosa, `StatusBadge` de reserva confirmada |
| `danger` | Turno ocupado (deshabilitado), 409 turno ya no disponible, accion cancelar, error generico |
| `warning` | Aviso "sin horarios disponibles hoy" (es informacion negativa, no un error) |
| `info` | Aclaraciones neutras (ej. "la reserva se confirma al instante, sin sena") |

Extension necesaria (no es un color nuevo, es exponer `danger` en dos componentes que hoy no lo
tienen expuesto): ver seccion 6.

**Correccion de contraste (revision 2026-08-04, hallazgo de ux-reviewer sobre la app corriendo):**
el par `bg-accent` (`#237b7c`) + `text-on-dark` (`#eeecde`) que este modulo heredaba tal cual del
framework mide **4.22:1** de contraste real (calculo exacto, no estimado) -- por debajo del piso
4.5:1 que PRODUCT.md seccion 7 fija como no negociable para texto normal. Ninguna combinacion mas
oscura de la familia `accent` (`accent-hover` = `#467b76`) llega a 4.5:1 combinada con `on-dark`
(el maximo alcanzable en esa familia es 4.06:1). La correccion, con tokens que YA existen en
`app.css`, es cambiar el relleno solido de `accent` a **`bg-accent-tint` (`#89bab4`) + `text-ink`
(`#131313`)**, contraste real **8.62:1**. El borde `border-accent` se mantiene para dar
identidad de marca al control. Ver seccion 6 para donde aplica (es sistemico, no un solo boton) y
`framework-backlog.md` para el aviso al framework compartido.

## 3. Tipografia

El framework base trae `--font-sans: "Inter"` (`app.css` linea 15) como default. La regla dura de
mi rol prohibe Inter como default de proyecto. Para este proyecto, propongo:

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

Sin fuente cargada (sin `@font-face`, costo de carga cero): erp-padel es una herramienta operativa
de mostrador sin marca propia todavia, donde la velocidad de carga en el celular del jugador o del
encargado pesa mas que una tipografia distintiva. Este es un cambio de `@theme` a aplicar cuando
frontend-developer bootstrapee el proyecto (ver seccion 6), no un cambio de componente.

Escala: usar las utilidades Tailwind ya presentes en los componentes existentes del framework
(`text-sm`, `text-base`, `text-2xl`, vistas en `KpiTile`/`DataTable`/`EmptyState`) -- no introducir
una escala nueva.

- Titulo de la pagina publica: `text-2xl font-bold`.
- Label de campo: `text-sm font-medium`.
- Numero de hora en la grilla de turnos: `text-[15px] font-semibold` -- mismo tamano que `Input`,
  para que el turno se lea como un control de formulario, no como texto decorativo.

Sin display font ni tipografia de marca: no hay identidad visual propia todavia (ver seccion 1).

## 4. Anatomia de pagina

### A. Formulario publico de reserva (landing, ruta unica, ej. `GET /reservar`)

1. **Encabezado minimo**: nombre del club (dato de config, no hardcodeado) + una linea de
   proposito ("Reserva tu cancha en menos de un minuto"). Sin Hero de marketing completo
   (`FeatureGrid`, `Testimonials`, etc.): el jugador ya decidio venir a reservar, cualquier seccion
   de venta es friccion.
2. **Cancha y fecha**: `Select` de cancha + `Input type="date"`. Van juntos porque los dos
   determinan la consulta a `GET /api/disponibilidad`; cambiar cualquiera de los dos dispara la
   consulta de nuevo.
3. **Horario**: `TurnosGrid` (componente nuevo, seccion 7) con el resultado de la consulta
   anterior. Va inmediatamente despues porque depende del paso 2 y es la decision central del
   flujo.
4. **Datos del jugador**: `Input` nombre + `Input` telefono. Deliberadamente despues del horario:
   pedir datos personales antes de saber si hay lugar es friccion evitable.
5. **Confirmar**: `Button variant="accent"`, ancho completo en mobile. Debajo, en el mismo lugar,
   el area de resultado (exito / 409 / error) -- no un modal separado, para que el jugador no
   pierda de vista lo que reservo.

Sin paso de pago (fuera de alcance) y sin resumen de precio (no hay precio en este modulo).

### B. Panel privado del club (`app/`, `AppShell`, ruta ej. `/panel`)

1. `AppShell` con `brand` = nombre del club, `nav` de un solo item ("Reservas", activo). No hay
   mas secciones en este modulo; el shell ya deja lugar para Modulo 2/3 sin rediseno futuro (la
   nav es config, no estructura).
2. `topbarRight`: email del usuario autenticado (viene del JWT de Access via `requireAccess`).
   Confirma quien esta logueado; sin logout explicito en la UI (lo maneja Access).
3. **Filtros** arriba de la tabla: `Input type="date"` (fecha) + chips de `FilterBar`
   (Todas / Confirmadas / Canceladas, mapean a `estado=confirmada|cancelada` del query de
   `GET /api/panel/reservas`). Van primero porque el encargado casi siempre busca "las de hoy"
   antes de escanear todo.
4. `DataTable` con las reservas resultantes. Columna de accion "Cancelar" visible solo si
   `estado === "confirmada"` (una reserva cancelada es historial, sin accion).
5. `Modal` de confirmacion de cancelacion (seccion 7), disparado por el boton "Cancelar" de la
   fila.

## 5. Tono visual

- `surface-1` como base en ambos flujos, sin alternar tono de seccion: no hay landing larga que
  necesite ritmo claro/oscuro, es un formulario y una tabla.
- `shadow-card` reservada para el `Modal` y la tarjeta de confirmacion de reserva exitosa (el
  unico momento donde algo "flota" sobre el flujo); el resto queda plano con `border-hairline`,
  consistente con `Panel`/`KpiTile`/`DataTable` ya existentes.
- Sin imagenes de stock ni fotos de cancha genericas: no hay assets propios del club todavia, y
  una foto generica de padel es la anti-referencia mas obvia del rubro (ver PRODUCT.md seccion 5).

## 6. Convenciones especificas del proyecto

- Radios: heredados del framework (`radius-sm` en inputs/botones, `radius-md` en cards/paneles,
  `radius-lg` solo si hace falta un contenedor grande). Sin escala nueva.
- Boton primario de accion sobre superficie clara = `variant="accent"` (confirmar reserva, aplicar
  filtro). `variant="primary"` queda para superficie oscura, y solo se usa en este modulo si el
  encabezado minimo de la pagina publica termina con `tone` oscuro (decision de layout de
  frontend-developer).
- Toda la tipografia de controles de este modulo (`text-[15px] font-medium` de botones,
  `text-xs font-medium` de chips) esta bajo el umbral de "texto grande" de WCAG (18.66px bold /
  24px regular): el piso de contraste aplicable es siempre **4.5:1**, nunca el 3:1 de texto
  grande, sin excepcion en ningun boton o chip de este modulo.

**Redefinicion de `variant="accent"` (revision 2026-08-04, ver seccion 2 "Correccion de
contraste")**: en este proyecto (`src/components/ui/Button.tsx` ya esta forkeado in-project, no es
el `Button` del framework) `variant="accent"` pasa de `bg-accent text-on-dark border-accent
hover:bg-accent-hover hover:border-accent-hover` a:

```
bg-accent-tint text-ink border-accent hover:brightness-95
```

`hover:brightness-95` en vez de un hover-token dedicado (mismo patron ya usado por `danger`, ver
abajo) porque `accent-tint` no tiene un `-hover` propio en el contrato de roles; oscurecer un poco
el fondo con `brightness-95` nunca baja el contraste (texto `ink` se mantiene igual de oscuro, el
fondo se oscurece levemente) asi que el hover queda seguro sin verificarlo caso por caso.

Este cambio es **sistemico dentro de este proyecto** (mismo patron `bg-accent text-on-dark`
duplicado en varios archivos ya forkeados in-project, no solo en `Button`) -- aplicar el mismo
reemplazo (`bg-accent-tint text-ink`, borde `border-accent` si el elemento ya tenia borde) en:

- `Button variant="accent"` (`src/components/ui/Button.tsx`) -- boton "Confirmar reserva" y
  cualquier otro uso de este variant.
- Boton "Confirmar reserva" del `ReservaForm` (`src/components/reservas/ReservaForm.tsx`): tiene
  su propia clase inline duplicada (no reusa `<Button>` porque necesita el estado `disabled` +
  swap de texto de `loading`), aplicar el mismo reemplazo ahi.
- Turno seleccionado de `TurnosGrid` (`turnoSeleccionado` en `TurnosGrid.tsx` y
  `TURNO_SELECCIONADO` en `ClientScript.tsx`, ver seccion 7 mas abajo -- MISMO par de colores que
  fallaba, aunque el hallazgo original de ux-reviewer no lo nombro puntualmente).
- Chip activo de filtro (`chipClass` en `src/pages/panel.tsx`).
- Avatar de iniciales y badge de nav del `AppShell` (`src/components/app/AppShell.tsx` lineas 24 y
  40) -- el badge de nav no se usa en este modulo (`NAV` no define `badge`), pero se corrige igual
  por consistencia de un unico patron en el archivo.

**Extension de componente requerida** (no soy quien la escribe en codigo, pero frontend-developer
la necesita para completar este modulo -- documentar tambien en framework-backlog.md por
reusable):

- **`Button`**: agregar `variant="danger"` (`bg-danger text-ink border-danger hover:brightness-90`
  -- **no** `text-on-dark`, ver correccion de contraste abajo). Uso: boton "Si, cancelar reserva"
  dentro del Modal de cancelacion. Los 4 variants existentes
  (`primary`/`outline-light`/`accent`/`outline-accent`) no cubren una accion destructiva.
- **`Alert`** (en `commerce/Alert.tsx`): agregar `tone="danger"` (`bg-danger/12 border-danger/30
  text-ink`, icono `alert-triangle` en `danger` -- mismo patron que `ErrorState`/`Toast` ya usan
  con ese token). Uso: bloque de error del 409 "turno ya no disponible" y error generico de red en
  el formulario publico. Los 3 tones existentes (`info`/`success`/`warning`) no permiten comunicar
  un error real; usar `warning` seria enganoso, porque `warning` ya se usa para "sin horarios
  disponibles hoy" (que no es un error).

Ambas extensiones usan `--color-danger`, que YA existe en `@theme` (`app.css` linea 50) y ya se
usa en `ErrorState`/`Toast`/`StatusBadge` -- no es un color nuevo, es exponerlo en dos componentes
que no lo tenian.

**Correccion de contraste del boton `danger` (revision 2026-08-04):** tal como quedo especificado
arriba en la primera pasada (`bg-danger text-on-dark border-danger`), el contraste real de "Si,
cancelar reserva" mide **3.41:1** -- falla el piso 4.5:1, y es la UNICA accion irreversible del
modulo. `--color-danger` no tiene tint ni hover propio en el contrato de roles (a diferencia de
`accent`), asi que no hay forma de oscurecerlo mas: `text-ink` (`#131313`, el texto mas oscuro
disponible) sobre `bg-danger` (`#dc4c4c`) da **4.58:1** -- pasa el piso, es el maximo alcanzable
con los tokens actuales para este par. Margen mas ajustado que el resto de las correcciones de
esta revision (4.58 vs el piso 4.5); si en algun momento el proyecto define paleta propia (ver
seccion 1), pedir explicitamente un `--color-danger-dark` o similar con mas margen en vez de
reusar este calculo al limite.

**Bootstrap pendiente**: este worktree todavia no tiene `src/styles/app.css`, `src/components/`,
`src/pages/` ni `src/renderer.tsx` -- solo existe el backend (rutas Hono, sin JSX). Antes de
construir las paginas de este modulo, frontend-developer tiene que copiar la base del framework
(`/normai/workspace/framework/src/{components,styles,renderer.tsx}`, y
`/normai/workspace/framework/src/index.tsx` como referencia de bootstrap de rutas). No es parte de
mi spec de diseno, es una nota de secuencia para no perder tiempo buscando archivos que no
existen todavia.

## 7. Especificacion por componente nuevo

### TurnosGrid (nuevo, landing)

Datos:

```ts
type Turno = { hora_inicio: string; disponible: boolean } // = GET /api/disponibilidad -> body.turnos, tal cual
type TurnosGridProps = {
  turnos: Turno[]
  selected?: string   // hora_inicio seleccionada, si hay
  name?: string        // default "hora_inicio": nombre del input hidden que lee el submit
}
```

Layout: grid responsive (mobile: 3 columnas; desktop: 5-6 columnas), un boton por turno con el
texto de la hora (ej. "18:00"). Estados del boton individual:

- **Disponible, no seleccionado**: fondo `surface-1`, borde `hairline`, texto `ink`. Hover/focus:
  borde `accent`.
- **Disponible, seleccionado** (`data-selected`): fondo `accent-tint`, texto `ink`, borde `accent`
  (correccion de contraste 2026-08-04, ver seccion 6 -- el par `accent`+`on-dark` original media
  4.22:1, bajo el piso 4.5:1; `accent-tint`+`ink` mide 8.62:1). Actualizar `turnoSeleccionado` en
  `TurnosGrid.tsx` y `TURNO_SELECCIONADO` en `ClientScript.tsx`, que hoy tienen el valor viejo.
- **No disponible**: `disabled`, fondo `surface-2`, texto `ink-muted/40`, borde `hairline`, cursor
  not-allowed. No marcar "ocupado" solo con color/opacidad: agregar `aria-label="Ocupado, no
  disponible"` y un texto `sr-only` junto a la hora, para que no dependa solo del estado visual.

Estados de la grilla completa:

- **Carga** (tras elegir cancha+fecha, mientras se pide disponibilidad): `LoadingState` con
  `title="Buscando horarios..."`.
- **Vacia** (`turnos: []`, incluye el caso "el club no atiende ese dia" que la API ya devuelve
  como `turnos: []`, o todos con `disponible: false`): `EmptyState` `icon="clock"` (icono
  existente en `IconSprite`; si se prefiere un icono de calendario, agregarlo siguiendo el
  procedimiento estandar del skill IIAPIE-UI, no es un gap de framework) `title="Sin horarios
  disponibles"` `desc="Elegi otra fecha o cancha."`.
- **Error de red** al pedir disponibilidad: `Alert tone="danger"` (seccion 6) "No pudimos cargar
  los horarios. Reintenta." + accion de reintentar.

Interaccion: sin estado de cliente en el sentido del framework (sin React/hooks) -- pero SI
requiere JS via `ClientScript`, porque depende de una eleccion posterior del usuario que no puede
resolverse en SSR puro. Cada boton disponible es `type="button"` con `data-turno="{hora_inicio}"`;
`ClientScript` escucha `click`, marca `data-selected` en el elegido (lo quita de los demas) y
escribe el valor en un `<input type="hidden" name="hora_inicio">` que lee el submit del
formulario. Cambiar cancha o fecha dispara una nueva consulta a disponibilidad y limpia la
seleccion previa (resetea `data-selected` + el hidden input).

### ReservaForm (nuevo, landing -- orquesta el flujo completo de la pagina A)

Datos:

```ts
type ReservaFormProps = {
  club_nombre: string
  canchas: { id: number; nombre: string }[]  // activas, para el Select
  fecha_minima: string                        // hoy, YYYY-MM-DD, para el min= del Input date
}
```

No recibe `turnos` como prop: se piden via `fetch` a `GET /api/disponibilidad` desde
`ClientScript` cuando cancha+fecha estan completos (no hay SSR de ese fragmento porque depende de
una eleccion posterior del usuario).

Layout: `Container` angosto (max-width ~480px, mobile-first, centrado tambien en desktop -- no es
una landing ancha). Secciones en el orden de la seccion 4.A (pasos 2 a 5).

Estados del formulario completo (`data-state` en el contenedor raiz, mismo patron `data-open` que
ya usan `Modal`/`Drawer` -- todas las variantes presentes en SSR, una sola visible segun
`data-state`: `idle` / `loading` / `success` / `conflict` / `invalid` / `error`):

- **`idle`**: formulario normal.
- **`loading`** (submit del `POST /api/reservas` en vuelo): boton "Confirmar reserva" pasa a
  `disabled` + texto "Reservando..." -- previene doble submit (relevante: un doble click podria
  disparar dos `POST /api/reservas`; el indice unico deja pasar uno solo, pero un segundo intento
  fallando con 409 contra la propia reserva del jugador es una UX confusa que hay que evitar en el
  cliente, no solo confiar en el schema).
- **`success`** (201): reemplaza el bloque de formulario (o lo agrega debajo, decision de
  frontend-developer segun altura de pantalla) por una tarjeta con `shadow-card`, icono `success`,
  "Reserva confirmada" + resumen (cancha, fecha, `hora_inicio`-`hora_fin`, nombre) -- estos datos
  vienen directo de la respuesta 201, no se vuelven a pedir.
- **`conflict`** (409 "turno ya no disponible" -- **caso critico de este modulo**): `Alert
  tone="danger"` (seccion 6) con copy explicito y propio, nunca el mensaje crudo de la API:
  "Justo se reservo ese horario. Elegi otro.". Accion obligatoria: se vuelve a pedir
  automaticamente `GET /api/disponibilidad` para la misma cancha+fecha, para que el turno recien
  perdido aparezca marcado como ocupado sin que el jugador tenga que adivinar por que fallo. La
  seleccion de horario se limpia (vuelve a `TurnosGrid` sin `selected`); el jugador elige de nuevo
  sobre la grilla actualizada. Cancha, fecha, nombre y telefono cargados NO se pierden.
- **`invalid`** (400 -- error de validacion; **correccion 2026-08-04, hallazgo warning 6 de
  ux-reviewer, reemplaza el estado `error` unico que antes conflacionaba validacion con
  servidor/red**): `POST /api/reservas` devuelve siempre `{"error": "<mensaje>"}` en 400
  (confirmado literal en `src/routes/public.ts`: `cancha_id invalido`, `fecha invalida, formato
  YYYY-MM-DD`, `hora_inicio invalida, formato HH:MM`, `jugador_nombre requerido`,
  `jugador_telefono requerido`, `el club no atiende ese dia`, `hora_inicio no coincide con la
  grilla de turnos` -- son TODOS mensajes de validacion ya redactados en espanol simple y
  accionable, ninguno es un error de servidor disfrazado de 400). `Alert tone="danger"` muestra ese
  texto **literal** de `body.error`, nunca el copy generico. **Sin boton "Reintentar"**: el jugador
  no cambio nada todavia, reenviar el mismo payload vuelve a fallar identico (es exactamente el
  loop que reporto ux-reviewer). En su lugar, el formulario vuelve a quedar interactivo (boton
  "Confirmar reserva" sale de `disabled`, vuelve a su estado normal) para que el jugador corrija el
  campo que el mensaje senala y reenvie por el flujo normal del formulario -- no se pide un
  mecanismo nuevo de reintento para este caso, el submit ya existente cumple esa funcion una vez
  corregido el dato. El `Alert` de este estado necesita el mismo `role`/`aria-live` que ya le falta
  al estado `error` (blocker 5 de la misma auditoria) -- no es un gap nuevo, es el mismo fix
  aplicado a un segundo estado.
- **`error`** (cualquier otro caso: 404, 500, o falla de red/`fetch` -- ya no incluye 400):
  comportamiento sin cambios respecto a la spec anterior: `Alert tone="danger"` con copy generico
  "No pudimos completar la reserva. Reintenta." + boton reintentar que reenvia el mismo `POST` sin
  perder los datos cargados. Sigue generico a proposito: frente a 404 ("cancha no encontrada" es
  una condicion de datos entre la carga de la pagina y el submit, no algo que el jugador tipeo mal)
  o 500/red no hay un mensaje seguro y especifico para mostrar, y "Reintentar" tiene sentido real
  ahi porque la causa puede ser transitoria. Se diferencia de `conflict` en que NO fuerza un
  refetch de disponibilidad: no hay forma de saber si el turno sigue libre o no, y asumir cualquier
  cosa aca seria inventar informacion que la API no dio.

**Criterio de deteccion para `ClientScript` (el UNICO criterio es el status code, no el texto del
mensaje):** `response.status === 400` -> `invalid`; cualquier otro status de error (404, 500, etc.)
o excepcion de `fetch` (red caida, JSON invalido) -> `error`. No hace falta parsear ni matchear el
contenido de `body.error` contra ningun patron -- el endpoint ya usa 400 exclusivamente para
validacion (confirmado arriba) y ningun otro status para eso, asi que el status code alcanza para
distinguir los dos casos sin ambiguedad.

Interaccion: submit del form via `ClientScript` (`fetch POST /api/reservas`,
`preventDefault` del submit nativo) -- no un `<form method="post">` plano, porque hace falta leer
el body JSON de la respuesta para distinguir 201/409/otro error. `data-form="reserva"` en el
`<form>`; `ClientScript` centraliza el fetch y el swap de `data-state`.

### Panel de reservas (composicion -- pagina `app/` que combina componentes ya existentes)

Columnas de `DataTable`, mapeadas 1:1 a `GET /api/panel/reservas`:

```ts
columns = [
  { key: "fecha", header: "Fecha" },
  { key: "hora_inicio", header: "Hora", cell: r => `${r.hora_inicio}-${r.hora_fin}` },
  { key: "cancha_nombre", header: "Cancha" },     // ver nota abajo: no viene tal cual de la API
  { key: "jugador_nombre", header: "Jugador" },
  { key: "jugador_telefono", header: "Telefono" },
  { key: "estado", header: "Estado", cell: r => <StatusBadge kind={r.estado === "confirmada" ? "success" : "neutral"}>{r.estado}</StatusBadge> },
  { key: "accion", header: "", cell: r => r.estado === "confirmada"
      ? <Button variant="outline-accent" data-cancelar={r.id}>Cancelar</Button>
      : null },
]
```

**Nota para frontend-developer**: `GET /api/panel/reservas` devuelve `cancha_id`, no
`cancha_nombre` -- hay que resolver el nombre de la cancha en la pagina (join en memoria contra la
lista de canchas, o pedirla aparte) antes de pasarla a `DataTable`. Esta spec no decide donde vive
ese fetch, es una decision de implementacion.

`StatusBadge` es el componente existente de `badges.tsx` (`kind="success"` para confirmada,
`kind="neutral"` para cancelada) -- no hace falta un componente nuevo para esto.

Estados de la tabla completa: **carga** = `LoadingState`. **Vacia** (sin resultados para el filtro
activo) = `EmptyState` `title="No hay reservas"` `desc="No hay reservas para estos filtros."`
(icono default `inbox`, ya es el default del componente). **Error al listar** = `ErrorState`
`title="No pudimos cargar las reservas"` + boton reintentar.

**Chips de filtro -- area de toque minima (hallazgo ux-reviewer, mobile 390px, altura real
30px):** agregar `min-h-11` (44px) a `chipClass` en `panel.tsx` -- la clase ya es `inline-flex
items-center`, asi que el contenido queda centrado dentro del alto minimo sin tocar el padding
horizontal ni el tamano de texto. Es el control que el encargado toca mas seguido desde el
mostrador (PRODUCT.md seccion 7); aplica siempre, no solo bajo un breakpoint mobile, porque el
dispositivo primario del encargado es tablet/celular (PRODUCT.md seccion 6), no mouse de
precision.

**`DataTable` en mobile -- vista de tarjetas en vez de scroll horizontal por fila (hallazgo
ux-reviewer, 390px, "Estado"/"Cancelar" fuera de la vista sin scrollear cada fila):** el `DataTable`
del framework no tiene un patron responsive propio (envuelve `Table`, que solo aporta
`overflow-x-auto` -- confirmado leyendo `ui/Table.tsx` y `app/data.tsx`, sin prioridad de columnas
ni vista alternativa). Para este modulo, con "escaneo rapido" como principio explicito
(PRODUCT.md seccion 6), la solucion es una vista de tarjetas bajo el breakpoint `sm` (<640px), no
scroll horizontal con columnas priorizadas -- el encargado necesita ver Estado y poder cancelar sin
gesto extra por fila.

- **`sm:` y mas ancho**: `DataTable` tal como esta especificado arriba, sin cambios.
- **debajo de `sm`**: reemplazar `DataTable` por una lista de tarjetas, una por reserva (`hidden
  sm:block` en la tabla, `sm:hidden` en la lista de tarjetas -- ambas reciben las mismas `rows`,
  es la misma data, solo cambia el layout). Cada tarjeta (`border border-hairline rounded-md p-4
  flex flex-col gap-2`, mismo tono plano que el resto del modulo, ver seccion 5):
  - Encabezado de tarjeta: `{hora_inicio}-{hora_fin}` en `text-sm font-semibold text-ink` junto al
    `StatusBadge` (`estado`), alineados en los extremos (`flex items-center justify-between`) --
    son los dos datos que el encargado escanea primero.
  - Cuerpo: `fecha`, `cancha_nombre`, `jugador_nombre`, `jugador_telefono` como pares label/valor
    (`text-xs text-ink-muted` label + `text-sm text-ink` valor), mismo orden que las columnas de
    `DataTable`.
  - Pie: el mismo `Button variant="outline-accent"` "Cancelar" (identico al de la columna
    `accion`, mismos `data-*`), ancho completo (`class="w-full mt-1"`) si `estado === "confirmada"`,
    nada si no.
  - No es un componente nuevo del framework (es composicion especifica de esta pagina, mismo
    criterio que el resto de esta seccion) -- si el mismo patron aparece en un futuro modulo con
    otra tabla, recien ahi vale la pena promoverlo a `workspace/wiki/framework-backlog.md` como
    variante `DataTable` con prop `mobileCard`.

### Modal de cancelacion (composicion sobre `Modal` existente -- destructivo)

Trigger: click en el boton "Cancelar" de una fila abre `Modal id="cancelar-reserva"` (patron
`data-open` ya definido por el componente).

Contenido:

- Titulo: "Cancelar reserva".
- Cuerpo: copy con los datos concretos de ESA reserva, nunca generico -- "Vas a cancelar la
  reserva de {jugador_nombre} para el {fecha} a las {hora_inicio} en {cancha_nombre}. Esta accion
  no se puede deshacer.". Repetir los datos especificos de la fila es lo que evita cancelar la
  reserva equivocada por error de click.
- Acciones: `Button variant="outline-accent"` "Volver" (`data-overlay-close`, cierra sin hacer
  nada) + `Button variant="danger"` (seccion 6) "Si, cancelar reserva" (dispara el POST).

**Correccion de contraste "Volver" (hallazgo ux-reviewer, blocker):** `variant="outline-light"` da
`text-on-dark` (`#eeecde`) sobre el `bg-surface-1` (`#ffffff`) del `Modal` -- ese variant esta
pensado para superficie OSCURA (ver comentario "Sobre superficie oscura" en `Button.tsx`), no para
el fondo claro del modal; contraste real **1.19:1**, practicamente ilegible (confirmado con
screenshot por ux-reviewer). `outline-accent` (ya usado para "Cancelar" en la tabla del panel, ver
seccion 7 "Panel de reservas") da `text-accent` (`#237b7c`) sobre `bg-surface-1`, contraste real
**5.01:1** -- pasa el piso 4.5:1 con margen, y es consistente con el otro uso de "Cancelar" en la
misma pagina.

**Area de toque minima de ambas vias de escape del Modal (hallazgo ux-reviewer, blocker, mobile):**
PRODUCT.md seccion 7 fija 44x44px como minimo. Medido en viewport 390x844:

- **"Volver"**: 43px de alto (1px bajo el minimo). El cambio de `outline-light` a `outline-accent`
  no cambia el alto por si solo -- frontend-developer tiene que confirmar que el padding vertical
  del `Button` (`py-[11px]` + `border-2` = 4px + line-height del texto 15px) llega a 44px reales;
  si no, agregar `min-h-11` explicito al boton dentro del Modal (mismo patron que los chips de
  filtro, ver seccion 7 "Panel de reservas").
- **"Cerrar" (icono X del header del Modal)**: 17x24px medido, muy por debajo del minimo. El
  `Modal` del framework (`app/overlays.tsx`) no reserva padding alrededor del icono (`<button
  data-overlay-close aria-label="Cerrar" class="text-ink-muted hover:text-accent
  transition-colors"><Icon name="x" class="text-lg" /></button>`, sin `class` propio para el boton
  de cerrar expuesto como prop). Frontend-developer tiene que ampliar el area de toque a 44x44px
  minimo -- via CSS scoped a este proyecto (ej. `[data-overlay="cancelar-reserva"] header button`
  con `min-w-11 min-h-11 flex items-center justify-center`) o forkeando `Modal` in-project (mismo
  patron ya usado con `Button`/chips de `FilterBar`), decision de implementacion de
  frontend-developer. Documentar en framework-backlog.md por reusable: cualquier proyecto que
  use `Modal`/`Drawer` en mobile pega con el mismo hueco.

**Foco atrapado dentro del Modal (hallazgo ux-reviewer, blocker -- completa el criterio ambiguo de
PRODUCT.md seccion 7 "sin trampas de foco... foco entra al abrir"):**

- Mientras el Modal esta abierto (`data-open` presente), el foco tiene que ciclar SOLO entre los
  elementos focuseables del `[data-overlay="cancelar-reserva"]`: Tab en el ULTIMO elemento
  focuseable (hoy, "Si, cancelar reserva") vuelve al PRIMERO (hoy, el icono "Cerrar" del header);
  Shift+Tab en el PRIMERO va al ULTIMO. Ningun elemento de la pagina de fondo (sidebar, tabla,
  chips) puede recibir foco por Tab/Shift+Tab mientras el modal esta abierto, aunque este tapado
  visualmente por el overlay -- verificado que hoy SI lo recibe (bug: un Tab desde "Si, cancelar
  reserva" saca el foco del dialog y aterriza en el link "Reservas" del sidebar).
- Al abrir: el foco entra al primer elemento focuseable del modal (comportamiento ya correcto, no
  tocar).
- Esc cierra y devuelve el foco al boton "Cancelar" de la fila que abrio el modal (comportamiento
  ya correcto, no tocar -- confirmado funcionando por ux-reviewer).
- Click afuera del modal (`data-overlay-close` en el overlay) cierra sin cambios de comportamiento.
- Implementacion (a cargo de frontend-developer, no de esta spec): patron estandar de focus-trap
  para `role="dialog" aria-modal="true"` -- listener de `keydown` en el contenedor del modal que
  intercepta Tab/Shift+Tab, calcula el set de elementos focuseables dentro de `[data-overlay]` en
  cada apertura (no cachear una sola vez, "Volver"/"Cerrar"/"Si, cancelar reserva" es fijo en este
  Modal pero el patron debe ser generico) y fuerza el wrap. Mismo mecanismo que ya resolvio el
  drawer mobile de `AppShell` en erp-inmobiliaria (`inert` sobre el contenido de atras + foco
  atrapado, ver framework-backlog.md 2026-07-26) -- reusar ese criterio si aplica directo.

Interaccion: `ClientScript` guarda en `data-*` del trigger los datos de la fila (`id`,
`jugador_nombre`, `fecha`, `hora_inicio`, `cancha_nombre`) al abrir el modal, y los inyecta en el
cuerpo antes de mostrarlo. Confirmar hace `fetch POST /api/panel/reservas/:id/cancelar`:

- **200**: cierra el Modal, actualiza la fila en la tabla (`estado -> cancelada`, quita el boton
  Cancelar, `StatusBadge` cambia a `neutral`), `Toast kind="success"` "Reserva cancelada".
- **404 / 409** (reserva no encontrada / ya estaba cancelada -- este 409 es del endpoint de
  cancelacion, distinto del 409 de la reserva publica): cierra el Modal igual (el estado en
  pantalla ya esta desactualizado, no tiene sentido dejarlo abierto esperando), `Toast
  kind="danger"` con el motivo ("Esta reserva ya estaba cancelada." para el caso puntual de este
  endpoint) y refresca la fila desde el estado real cuando sea posible.

## 8. Motion

Vocabulario Trigger / Rules / Feedback / Loops (`microinteractions`):

- **Seleccion de turno (`TurnosGrid`)**: Trigger = click en un boton disponible. Rules = un solo
  turno seleccionado a la vez (excluyente, como radio). Feedback = cambio de fondo/borde
  instantaneo al estado seleccionado (`accent`) -- sin animar la seleccion en si: es un toggle de
  estado, no un efecto celebratorio; `--animate-scale-in` (ya existente) queda reservado para
  aperturas de overlay, no para esto. Loop = ninguno.
- **Envio del formulario publico**: Trigger = submit. Rules = boton `disabled` mientras la request
  esta en vuelo (ver `loading` en ReservaForm). Feedback = swap de `data-state`
  `loading -> success/conflict/error`, `motion-safe:animate-fade-in` en el bloque de resultado al
  aparecer (token ya existente en `@theme`, sin valores nuevos). Loop = ninguno, flujo de una sola
  pasada.
- **409 turno tomado**: Trigger = respuesta 409 del POST. Rules = el `Alert` de conflicto aparece
  en el mismo lugar donde iba a aparecer el de exito (no un toast que se pueda perder de vista); la
  grilla de turnos refrescada tiene que quedar visible sin que el jugador tenga que scrollear.
  Feedback = `motion-safe:animate-fade-in` en el `Alert`; el turno que paso a ocupado en la grilla
  no necesita animacion propia, es un fetch+re-render normal de `TurnosGrid`. Loop = ninguno.
- **Modal de cancelacion**: usa el fade+scale ya definido en el componente `Modal` (`data-open`)
  -- sin excepcion, no hay intencion de motion nueva aca.
- **Toast de cancelacion** (exito o error): usa `animate-fade-up` ya definido en `Toast` -- sin
  excepcion.

Todo lo anterior bajo `motion-safe:` (gate `prefers-reduced-motion`), consistente con la regla
dura del framework. Sin libreria de animacion JS.

## 9. Estado

- [ ] Tokens definidos: pendiente -- solo cambia `--font-sans` (seccion 3) y se agregan
      `variant="danger"` en `Button` + `tone="danger"` en `Alert` (seccion 6). Nada mas de
      `@theme` cambia.
- [ ] Aprobado por cliente: no aplica todavia. erp-padel no tiene club piloto confirmado
      (wiki/index.md). Este `design.md` es la base para construir el modulo, no un entregable
      validado externamente.
- [x] Componentes implementados: primera pasada completa por frontend-developer (bootstrap,
      `TurnosGrid`, `ReservaForm`, extension `danger`, pagina de panel). Auditada por ux-reviewer
      el 2026-08-04 contra la app corriendo (Playwright, no lectura de codigo): 4 blockers +
      3 warnings (6, 9, 10) rutearon a esta spec (contraste de `outline-light`/`danger`/`accent`,
      focus-trap del Modal, split de estado `error`/`invalid` de `ReservaForm`, area de toque de
      chips, `DataTable` en mobile). Dos revisiones de `design.md` el mismo dia lo cierran a nivel
      de spec: la primera (blockers 1-4, warnings 9-10) y una segunda pasada puntual sobre el
      warning 6 (estado `invalid` nuevo en `ReservaForm`, seccion 7) -- **pendiente**:
      frontend-developer implementa el diff completo (colores corregidos, focus-trap, `min-h-11`,
      vista de tarjetas mobile, split `invalid`/`error` en `ClientScript`) y ux-reviewer re-audita
      antes de devops.

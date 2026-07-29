# Wiki - erp-padel
# Mantenido por el agente. Modificaciones humanas: agregar bajo ## Inbox.
# Ultima actualizacion: 2026-07-29 (creacion del proyecto + propuesta borrador 1 + repo propio)

## Que es

Producto enlatado de gestion para clubes de padel, desplegable por club: turnos, torneos y
contabilidad en una sola base. Compite contra Clubo, CanchaFija y PadelCRM, que cobran suscripcion
mensual fija sin comision por partido.

**Estado: idea con propuesta escrita. Sin cliente, sin repo, sin codigo.** No se construye nada
hasta resolver las decisiones pendientes de la propuesta (Parte 2) y tener 2 clubes comprometidos.

## Identidad del proyecto

- Cliente: ninguno todavia (producto propio, modelo enlatado como finz)
- Slug: erp-padel
- Nombre comercial: a definir (decision pendiente 2)
- Repositorio: repo propio (proyecto fuera del repo normai, como el resto de projects/). Remoto en
  GitHub: pendiente de crear
- URL produccion: no desplegado

## Documentos

| Archivo | Que contiene |
|---|---|
| [propuesta.md](./propuesta.md) | Parte 1: propuesta comercial (modulos, precios, puesta en marcha). Parte 2: anexo interno (economia del modelo sin instalacion, arquitectura, decisiones pendientes, riesgos, plan de oleadas) |

## Restriccion comercial que define el producto

No se cobra costo de instalacion: la competencia se activa el mismo dia con costo inicial cero, y
un cargo de puesta en marcha nos saca de la comparacion. La construccion se recupera con la
suscripcion, lo que obliga a dos cosas: compromiso minimo de 12 meses y volumen (con menos de 5
clubes el producto no cierra). Techo de precio del mercado: ~$45.000/mes por club.

## Stack propuesto (sin validar contra codigo, no existe todavia)

- Runtime: Cloudflare Workers ESM + Hono (router y SSR)
- Frontend: IIAPIE-UI (categoria app/ para la consola, secciones de landing para el sitio publico)
- DB: D1 por club, aislada (sin base compartida entre clubes)
- KV: cache de tarifas, rate limit del formulario publico
- R2: exportaciones y respaldos descargables por el club
- Auth: usuarios propios con roles (admin / encargado / cantina / lectura), patron de
  erp-inmobiliaria; jugadores sin cuenta (telefono + codigo)
- Pagos: Mercado Pago Checkout Pro (senas e inscripciones), webhook idempotente
- Sin Durable Objects, sin Queues, sin LangGraph

## Skills a cargar en este proyecto

- Framework: /workspace/normai/skills/framework/iiapie-ui.md
- Patrones: /workspace/normai/skills/patterns/auth.md, error-handling.md, cloudflare-bindings.md
- Cloudflare: plugin oficial

## Gates (siempre requieren confirmacion humana)

- Deploy a produccion
- Aplicar migraciones D1 en produccion
- Crear/modificar recursos de la cuenta CF

## Decisiones tomadas

Ninguna registrada. Ver ./wiki/decisions/ (vacio).

## Decisiones pendientes

Detalle y opciones en propuesta.md Parte 2:

1. Modelo de cuentas Cloudflare para producto de ticket bajo (matiza o contradice el ADR-0006
   global: una cuenta por cliente en produccion)
2. Nombre comercial y marca del producto
3. Alcance del piloto: 3 modulos completos, o Turnos + Caja primero
4. Ventana de soporte comprometida (el riesgo economico principal, no el precio)

## Gaps

- [ ] Ningun club validado: precios, modulos y prioridades salen de la investigacion de mercado, no
      de una conversacion con un club
- [ ] Precios de la competencia sin verificar de primera mano (provistos como investigacion, no
      consultados en las webs)
- [ ] Inversion de construccion sin estimar en horas: la tabla de recupero usa tres escenarios
      hipoteticos
- [ ] Modelo de datos en borrador, sin pasar por database-architect
- [ ] Sin relevar que hardware tienen realmente los clubes objetivo en el mostrador

## Inbox
<!-- Humano: deja notas aqui para la proxima sesion -->

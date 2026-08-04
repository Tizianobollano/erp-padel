import type { FC } from 'hono/jsx'
import { html } from 'hono/html'

/**
 * Único bloque de JS progresivo de la página. Activa, mediante data-attributes:
 *  - Reveal on scroll (data-reveal -> data-revealed via IntersectionObserver)
 *  - Navbar móvil (data-nav-toggle / data-nav-drawer)
 *  - Popup promo (data-popup, recuerda descarte en localStorage)
 *  - Carrito básico (data-cart-open/close, data-add-to-cart) con estado en localStorage
 *  - Carrusel horizontal (data-carousel + prev/next)
 *  - Slider rotativo (data-slider + dots/flechas/autoplay)
 *  - Overlays genericos (data-overlay-trigger via data-cancelar / data-overlay-close / Esc)
 *  - Reserva publica: TurnosGrid + ReservaForm (data-form-root, ver design.md Modulo 1 seccion 7)
 *  - Panel privado: filtro de fecha (data-filtro-fecha) y cancelacion de reserva (data-cancelar)
 * Todo degrada de forma elegante si el JS no carga.
 * Nota: este bloque es un unico template literal (hono/html) -- todo el JS de abajo usa
 * concatenacion con "+", nunca `${}`, porque `${}` lo interpolaria TypeScript en build time,
 * no el navegador en runtime (mismo criterio que el resto del archivo).
 */
export const ClientScript: FC = () => html`
  <script>
    (function () {
      // ── Flag JS (habilita estados iniciales de motion sin romper el no-JS) ──
      document.documentElement.classList.add('js');

      // ── Reveal on scroll ([data-reveal] -> [data-revealed]) ──
      var reveals = document.querySelectorAll('[data-reveal]');
      if (reveals.length) {
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) { e.target.setAttribute('data-revealed', ''); io.unobserve(e.target); }
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
          reveals.forEach(function (el) { io.observe(el); });
        } else {
          reveals.forEach(function (el) { el.setAttribute('data-revealed', ''); });
        }
      }

      // ── Nav móvil ──
      var nav = document.querySelector('[data-nav]');
      if (nav) {
        var toggle = nav.querySelector('[data-nav-toggle]');
        var drawer = nav.querySelector('[data-nav-drawer]');
        toggle &&
          toggle.addEventListener('click', function () {
            var open = drawer.classList.toggle('hidden') === false;
            drawer.classList.toggle('flex', open);
            drawer.classList.toggle('flex-col', open);
            toggle.setAttribute('aria-expanded', String(open));
          });
      }

      // ── Links externos seguros ──
      document.querySelectorAll('a[href^="http"], a[href^="mailto:"]').forEach(function (a) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });

      // ── Popup promo ──
      var popup = document.querySelector('[data-popup]');
      if (popup) {
        var days = parseInt(popup.getAttribute('data-popup-days'), 10) || 7;
        var delay = parseInt(popup.getAttribute('data-popup-delay'), 10) || 1800;
        var key = 'ui_popup_v1';
        var stored = localStorage.getItem(key);
        if (!stored || Date.now() >= Number(stored)) {
          var dismiss = function () {
            localStorage.setItem(key, Date.now() + days * 86400000);
            popup.removeAttribute('data-open');
          };
          setTimeout(function () {
            popup.setAttribute('data-open', '');
          }, delay);
          var close = popup.querySelector('[data-popup-close]');
          close && close.addEventListener('click', dismiss);
          popup.addEventListener('click', function (e) {
            if (e.target === popup) dismiss();
          });
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') dismiss();
          });
        }
      }

      // ── Carrito (estado local mínimo) ──
      var cart = document.querySelector('[data-cart]');
      if (cart) {
        var KEY = 'ui_cart_v1';
        var state = JSON.parse(localStorage.getItem(KEY) || '{}');
        var openEls = document.querySelectorAll('[data-cart-open]');
        var closeEls = cart.querySelectorAll('[data-cart-close], [data-cart-overlay]');
        var setOpen = function (open) {
          if (open) cart.setAttribute('data-open', '');
          else cart.removeAttribute('data-open');
          cart.querySelector('[data-cart-panel]') && (open ? cart.querySelector('[data-cart-panel]').setAttribute('data-open', '') : cart.querySelector('[data-cart-panel]').removeAttribute('data-open'));
        };
        openEls.forEach(function (b) { b.addEventListener('click', function () { setOpen(true); }); });
        closeEls.forEach(function (b) { b.addEventListener('click', function () { setOpen(false); }); });

        var renderCount = function () {
          var n = Object.values(state).reduce(function (s, q) { return s + q; }, 0);
          document.querySelectorAll('[data-cart-badge], [data-cart-count]').forEach(function (el) { el.textContent = n; });
        };
        renderCount();

        document.querySelectorAll('[data-add-to-cart]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-product-id');
            state[id] = (state[id] || 0) + 1;
            localStorage.setItem(KEY, JSON.stringify(state));
            renderCount();
            setOpen(true);
          });
        });
      }

      // ── Carrusel horizontal ──
      document.querySelectorAll('[data-carousel]').forEach(function (c) {
        var track = c.querySelector('[data-carousel-track]');
        if (!track) return;
        var step = function () {
          var card = track.querySelector(':scope > *');
          return card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
        };
        var prev = c.querySelector('[data-carousel-prev]');
        var next = c.querySelector('[data-carousel-next]');
        prev && prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
        next && next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      });

      // ── Slider rotativo ──
      document.querySelectorAll('[data-slider]').forEach(function (s) {
        var slides = Array.prototype.slice.call(s.querySelectorAll('[data-slide]'));
        if (slides.length < 2) return;
        var dots = Array.prototype.slice.call(s.querySelectorAll('[data-slider-dot]'));
        var i = 0;
        var autoplay = parseInt(s.getAttribute('data-slider-autoplay'), 10) || 0;
        var show = function (n) {
          i = (n + slides.length) % slides.length;
          slides.forEach(function (sl, idx) {
            var on = idx === i;
            sl.classList.toggle('opacity-100', on);
            sl.classList.toggle('opacity-0', !on);
            sl.classList.toggle('pointer-events-none', !on);
          });
          dots.forEach(function (d, idx) { d.setAttribute('aria-current', String(idx === i)); });
        };
        var prev = s.querySelector('[data-slider-prev]');
        var next = s.querySelector('[data-slider-next]');
        prev && prev.addEventListener('click', function () { show(i - 1); });
        next && next.addEventListener('click', function () { show(i + 1); });
        dots.forEach(function (d, idx) { d.addEventListener('click', function () { show(idx); }); });
        show(0);
        if (autoplay > 0) setInterval(function () { show(i + 1); }, autoplay);
      });

      // ── Helpers de icono/estado (mismas clases que ui/Icon.tsx y app/states.tsx) ──
      var icon = function (name) {
        return '<svg class="icon" aria-hidden="true"><use href="#ic-' + name + '"></use></svg>';
      };
      var buildEmptyState = function (iconName, title, desc) {
        var box = document.createElement('div');
        box.className = 'flex flex-col items-center justify-center text-center gap-2 py-14 px-6';
        var circle = document.createElement('span');
        circle.className = 'w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-ink-muted/60 text-xl';
        circle.innerHTML = icon(iconName);
        var t = document.createElement('p');
        t.className = 'text-sm font-semibold text-ink';
        t.textContent = title;
        box.appendChild(circle);
        box.appendChild(t);
        if (desc) {
          var d = document.createElement('p');
          d.className = 'text-sm text-ink-muted/70 max-w-[340px]';
          d.textContent = desc;
          box.appendChild(d);
        }
        return box;
      };
      var buildLoadingState = function (title) {
        var box = document.createElement('div');
        box.className = 'flex flex-col items-center justify-center text-center gap-2 py-14 px-6';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        var spinner = document.createElement('span');
        spinner.className = 'text-2xl text-accent motion-safe:animate-spin';
        spinner.innerHTML = icon('loader');
        var t = document.createElement('p');
        t.className = 'text-sm text-ink-muted/70';
        t.textContent = title;
        box.appendChild(spinner);
        box.appendChild(t);
        return box;
      };
      var buildDangerAlert = function (message, onRetry) {
        var box = document.createElement('div');
        box.className = 'flex items-start gap-3 border rounded-md px-4 py-3 text-sm leading-relaxed bg-danger/12 border-danger/30 text-ink';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        var ic = document.createElement('span');
        ic.className = 'text-base shrink-0 mt-0.5';
        ic.innerHTML = icon('alert-triangle');
        var body = document.createElement('div');
        var p = document.createElement('p');
        p.textContent = message;
        body.appendChild(p);
        if (onRetry) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mt-1.5 text-sm font-semibold text-danger underline underline-offset-2 hover:no-underline cursor-pointer';
          btn.textContent = 'Reintentar';
          btn.addEventListener('click', onRetry);
          var wrap = document.createElement('div');
          wrap.className = 'mt-1.5';
          wrap.appendChild(btn);
          body.appendChild(wrap);
        }
        box.appendChild(ic);
        box.appendChild(body);
        return box;
      };
      var showToast = function (root, kind, message) {
        if (!root) return;
        var toneBorder = kind === 'success' ? 'border-success/30' : 'border-danger/30';
        var iconName = kind === 'success' ? 'check' : 'alert-triangle';
        var iconColor = kind === 'success' ? 'text-success' : 'text-danger';
        var el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.className = 'flex items-center gap-2.5 bg-surface-1 border rounded-md shadow-hover px-4 py-3 text-sm text-ink motion-safe:animate-fade-up ' + toneBorder;
        var iconSpan = document.createElement('span');
        iconSpan.className = iconColor;
        iconSpan.innerHTML = icon(iconName);
        var msg = document.createElement('div');
        msg.className = 'flex-1';
        msg.textContent = message;
        el.appendChild(iconSpan);
        el.appendChild(msg);
        root.appendChild(el);
        setTimeout(function () { el.remove(); }, 4000);
      };

      // ── Overlays genericos: [data-overlay-close] y Esc cierran, foco vuelve al trigger ──
      // (PRODUCT.md 7: "sin trampas de foco... foco entra al abrir, Esc y click afuera cierran,
      // foco vuelve al elemento que abrio el modal al cerrar"; click-afuera ya lo resuelve el
      // propio Modal/Drawer con su overlay [data-overlay-close]).
      var lastOverlayTrigger = null;
      var overlayClosers = {};
      document.querySelectorAll('[data-overlay]').forEach(function (overlay) {
        var id = overlay.getAttribute('data-overlay');
        var close = function () {
          overlay.removeAttribute('data-open');
          if (lastOverlayTrigger) { lastOverlayTrigger.focus(); lastOverlayTrigger = null; }
        };
        overlay.querySelectorAll('[data-overlay-close]').forEach(function (c) { c.addEventListener('click', close); });
        overlayClosers[id] = close;
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('[data-overlay][data-open]').forEach(function (o) {
          var id = o.getAttribute('data-overlay');
          overlayClosers[id] && overlayClosers[id]();
        });
      });

      // ── Focus-trap generico (PRODUCT.md 7 / design.md seccion 7 "Modal de cancelacion") ──
      // Mientras un [data-overlay] este con [data-open], Tab en el ultimo elemento focuseable
      // vuelve al primero, Shift+Tab en el primero va al ultimo; nada de la pagina de fondo debe
      // recibir foco. El set de focuseables se recalcula en cada Tab (no se cachea al abrir),
      // porque el contenido del overlay puede cambiar (ej. este mismo Modal reusa data-cancel-*).
      var getFocusable = function (container) {
        return Array.prototype.slice
          .call(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
          .filter(function (el) { return el.offsetParent !== null; });
      };
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var openOverlay = document.querySelector('[data-overlay][data-open]');
        if (!openOverlay) return;
        var focusable = getFocusable(openOverlay);
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var insideOverlay = openOverlay.contains(document.activeElement);
        if (e.shiftKey) {
          if (!insideOverlay || document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!insideOverlay || document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      // ── Reserva publica: TurnosGrid + ReservaForm (design.md Modulo 1, seccion 7) ──
      var formRoot = document.querySelector('[data-form-root]');
      if (formRoot) {
        var reservaForm = formRoot.querySelector('[data-form="reserva"]');
        var canchaSelect = reservaForm.querySelector('[name="cancha_id"]');
        var fechaInput = reservaForm.querySelector('[name="fecha"]');
        var turnosGrid = reservaForm.querySelector('[data-turnos-grid]');
        var horaInput = reservaForm.querySelector('[data-hora-inicio-input]');
        var submitBtn = reservaForm.querySelector('[data-submit-btn]');
        var reintentarBtn = reservaForm.querySelector('[data-reintentar]');

        var TURNO_BASE = 'min-h-[44px] flex items-center justify-center rounded-sm border text-[15px] font-semibold transition-colors duration-150';
        var TURNO_DISPONIBLE = 'bg-surface-1 text-ink border-hairline hover:border-accent focus-visible:border-accent';
        // Correccion de contraste (design.md seccion 6, revision 2026-08-04): mismo par
        // accent-tint+ink que TurnosGrid.tsx/Button variant="accent" -- bg-accent+text-on-dark
        // media 4.22:1, bajo el piso 4.5:1.
        var TURNO_SELECCIONADO = 'bg-accent-tint text-ink border-accent';
        var TURNO_OCUPADO = 'bg-surface-2 text-ink-muted/40 border-hairline cursor-not-allowed';

        var setFormState = function (state) { formRoot.setAttribute('data-state', state); };

        // ── Warning 7 (auditoria UX): sin turno elegido, "Confirmar reserva" no daba feedback
        // (focus() sin adonde ir si la grilla esta vacia). Hint inline + scroll a la grilla. ──
        var turnoHintEl = null;
        var clearTurnoHint = function () {
          if (turnoHintEl) { turnoHintEl.remove(); turnoHintEl = null; }
        };
        var showTurnoHint = function () {
          clearTurnoHint();
          turnoHintEl = document.createElement('p');
          turnoHintEl.className = 'text-sm text-danger mt-2';
          turnoHintEl.setAttribute('role', 'status');
          turnoHintEl.setAttribute('aria-live', 'polite');
          turnoHintEl.textContent = 'Elegi un horario para continuar.';
          turnosGrid.insertAdjacentElement('afterend', turnoHintEl);
        };

        var wireTurnoClicks = function (grid) {
          var btns = Array.prototype.slice.call(grid.querySelectorAll('[data-turno]'));
          btns.forEach(function (b) {
            b.addEventListener('click', function () {
              btns.forEach(function (o) {
                o.removeAttribute('data-selected');
                o.className = TURNO_BASE + ' ' + TURNO_DISPONIBLE;
              });
              b.setAttribute('data-selected', '');
              b.className = TURNO_BASE + ' ' + TURNO_SELECCIONADO;
              horaInput.value = b.getAttribute('data-turno');
              clearTurnoHint();
            });
          });
        };

        var renderTurnos = function (turnos) {
          var disponibles = turnos.filter(function (t) { return t.disponible; });
          turnosGrid.innerHTML = '';
          if (!turnos.length || !disponibles.length) {
            turnosGrid.appendChild(buildEmptyState('clock', 'Sin horarios disponibles', 'Elegi otra fecha o cancha.'));
            return;
          }
          var grid = document.createElement('div');
          grid.className = 'grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2';
          grid.setAttribute('data-turnos-list', '');
          turnos.forEach(function (t) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = t.hora_inicio;
            if (t.disponible) {
              btn.setAttribute('data-turno', t.hora_inicio);
              btn.className = TURNO_BASE + ' ' + TURNO_DISPONIBLE;
            } else {
              btn.disabled = true;
              btn.setAttribute('aria-label', 'Ocupado, no disponible ' + t.hora_inicio);
              btn.className = TURNO_BASE + ' ' + TURNO_OCUPADO;
              var sr = document.createElement('span');
              sr.className = 'sr-only';
              sr.textContent = 'Ocupado';
              btn.appendChild(sr);
            }
            grid.appendChild(btn);
          });
          turnosGrid.appendChild(grid);
          wireTurnoClicks(grid);
        };

        var fetchDisponibilidad = function () {
          horaInput.value = '';
          clearTurnoHint();
          var canchaId = canchaSelect.value;
          var fecha = fechaInput.value;
          if (!canchaId || !fecha) {
            turnosGrid.innerHTML = '';
            turnosGrid.appendChild(buildEmptyState('clock', 'Elegi cancha y fecha', 'Ahi vas a ver los horarios disponibles.'));
            return;
          }
          turnosGrid.innerHTML = '';
          turnosGrid.appendChild(buildLoadingState('Buscando horarios...'));
          fetch('/api/disponibilidad?cancha_id=' + encodeURIComponent(canchaId) + '&fecha=' + encodeURIComponent(fecha))
            .then(function (res) {
              if (!res.ok) throw new Error('bad status');
              return res.json();
            })
            .then(function (data) { renderTurnos(data.turnos || []); })
            .catch(function () {
              turnosGrid.innerHTML = '';
              turnosGrid.appendChild(buildDangerAlert('No pudimos cargar los horarios. Reintenta.', fetchDisponibilidad));
            });
        };

        canchaSelect.addEventListener('change', fetchDisponibilidad);
        fechaInput.addEventListener('change', fetchDisponibilidad);

        var submitting = false;
        var doSubmit = function () {
          if (submitting) return;
          if (!horaInput.value) {
            turnosGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var firstTurno = turnosGrid.querySelector('[data-turno]');
            if (firstTurno) {
              clearTurnoHint();
              firstTurno.focus();
            } else {
              showTurnoHint();
            }
            return;
          }
          clearTurnoHint();
          var payload = {
            cancha_id: Number(canchaSelect.value),
            fecha: fechaInput.value,
            hora_inicio: horaInput.value,
            jugador_nombre: reservaForm.querySelector('[name="jugador_nombre"]').value,
            jugador_telefono: reservaForm.querySelector('[name="jugador_telefono"]').value,
          };
          submitting = true;
          setFormState('loading');
          submitBtn.disabled = true;
          submitBtn.textContent = submitBtn.getAttribute('data-label-loading');
          fetch('/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(function (res) {
              return res.json().then(function (body) { return { status: res.status, body: body }; });
            })
            .then(function (r) {
              submitting = false;
              submitBtn.disabled = false;
              submitBtn.textContent = submitBtn.getAttribute('data-label-idle');
              if (r.status === 201) {
                var canchaLabel = canchaSelect.options[canchaSelect.selectedIndex] ? canchaSelect.options[canchaSelect.selectedIndex].text : '';
                formRoot.querySelector('[data-success-cancha]').textContent = canchaLabel;
                formRoot.querySelector('[data-success-fecha]').textContent = r.body.fecha;
                formRoot.querySelector('[data-success-horario]').textContent = r.body.hora_inicio + '-' + r.body.hora_fin;
                formRoot.querySelector('[data-success-nombre]').textContent = payload.jugador_nombre;
                setFormState('success');
              } else if (r.status === 409) {
                setFormState('conflict');
                fetchDisponibilidad();
              } else if (r.status === 400) {
                // invalid (design.md seccion 7, warning 6): texto literal de la API, sin
                // Reintentar -- el formulario ya quedo interactivo arriba (submitBtn.disabled
                // = false), el jugador corrige el campo senalado y reenvia por el submit normal.
                formRoot.querySelector('[data-invalid-message]').textContent = r.body.error || 'Revisa los datos ingresados.';
                setFormState('invalid');
              } else {
                setFormState('error');
              }
            })
            .catch(function () {
              submitting = false;
              submitBtn.disabled = false;
              submitBtn.textContent = submitBtn.getAttribute('data-label-idle');
              setFormState('error');
            });
        };

        reservaForm.addEventListener('submit', function (e) {
          e.preventDefault();
          doSubmit();
        });
        reintentarBtn && reintentarBtn.addEventListener('click', doSubmit);
      }

      // ── Panel privado: filtro de fecha auto-submit ──
      var filtroFecha = document.querySelector('[data-filtro-fecha]');
      if (filtroFecha && filtroFecha.form) {
        filtroFecha.addEventListener('change', function () { filtroFecha.form.submit(); });
      }

      // ── Panel privado: cancelacion de reserva (Modal + fila + Toast) ──
      var cancelModal = document.querySelector('[data-overlay="cancelar-reserva"]');
      if (cancelModal) {
        var toastRoot = document.querySelector('[data-toast-root]');
        var confirmCancelBtn = cancelModal.querySelector('[data-cancelar-confirm]');
        var pendingCancel = null;

        var updateRowToCancelada = function (row) {
          var tr = row.triggerBtn.closest('tr');
          if (!tr) return;
          var badge = tr.querySelector('[data-status-cell] > span');
          if (badge) {
            badge.classList.remove('text-success', 'bg-success/12');
            badge.classList.add('text-ink-muted', 'bg-hairline');
            var dot = badge.querySelector('span');
            if (dot) {
              dot.classList.remove('bg-success');
              dot.classList.add('bg-ink-muted/50');
            }
            if (badge.lastChild) badge.lastChild.textContent = 'cancelada';
          }
          row.triggerBtn.remove();
        };

        document.querySelectorAll('[data-cancelar]').forEach(function (trigger) {
          trigger.addEventListener('click', function () {
            pendingCancel = { id: trigger.getAttribute('data-cancelar'), triggerBtn: trigger };
            cancelModal.querySelector('[data-cancel-jugador]').textContent = trigger.getAttribute('data-jugador') || '';
            cancelModal.querySelector('[data-cancel-fecha]').textContent = trigger.getAttribute('data-fecha') || '';
            cancelModal.querySelector('[data-cancel-hora]').textContent = trigger.getAttribute('data-hora') || '';
            cancelModal.querySelector('[data-cancel-cancha]').textContent = trigger.getAttribute('data-cancha') || '';
            lastOverlayTrigger = trigger;
            cancelModal.setAttribute('data-open', '');
            var focusable = cancelModal.querySelector('button, [href]');
            focusable && focusable.focus();
          });
        });

        confirmCancelBtn && confirmCancelBtn.addEventListener('click', function () {
          if (!pendingCancel) return;
          var row = pendingCancel;
          confirmCancelBtn.disabled = true;
          fetch('/api/panel/reservas/' + row.id + '/cancelar', { method: 'POST' })
            .then(function (res) {
              return res.json().then(function (body) { return { status: res.status, body: body }; });
            })
            .then(function (r) {
              confirmCancelBtn.disabled = false;
              cancelModal.removeAttribute('data-open');
              if (lastOverlayTrigger) { lastOverlayTrigger.focus(); lastOverlayTrigger = null; }
              if (r.status === 200) {
                updateRowToCancelada(row);
                showToast(toastRoot, 'success', 'Reserva cancelada');
              } else if (r.status === 409) {
                updateRowToCancelada(row);
                showToast(toastRoot, 'danger', 'Esta reserva ya estaba cancelada.');
              } else {
                showToast(toastRoot, 'danger', 'No pudimos cancelar la reserva.');
              }
              pendingCancel = null;
            })
            .catch(function () {
              confirmCancelBtn.disabled = false;
              cancelModal.removeAttribute('data-open');
              showToast(toastRoot, 'danger', 'No pudimos cancelar la reserva.');
              pendingCancel = null;
            });
        });
      }
    })();
  </script>
`

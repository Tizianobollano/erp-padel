import type { FC } from 'hono/jsx'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'

export type NavLink = {
  label: string
  href: string
  active?: boolean
  /** submenú desplegable (desktop) / indentado (mobile). */
  children?: { label: string; href: string; active?: boolean }[]
}

export type NavCta = { label: string; href: string; variant?: 'accent' | 'outline-accent'; external?: boolean }

type NavbarProps = {
  brand: { logo: string; alt: string; href?: string }
  links: NavLink[]
  ctas?: NavCta[]
  /** número de WhatsApp (solo dígitos) para el botón verde. */
  whatsapp?: string
}

/**
 * Barra de navegación sticky con dropdown (desktop) y drawer (mobile).
 * El comportamiento móvil lo activa <ClientScript /> vía data-nav.
 */
export const Navbar: FC<NavbarProps> = ({ brand, links, ctas = [], whatsapp }) => (
  <header
    data-nav
    class="sticky top-0 z-50 bg-surface-2 border-b border-accent/15 backdrop-blur-md"
  >
    <Container>
      <div class="flex items-center justify-between h-[72px]">
        <a class="shrink-0" href={brand.href ?? '/'}>
          <img src={brand.logo} alt={brand.alt} class="h-12 w-auto" />
        </a>

        {/* Links desktop */}
        <ul class="hidden md:flex items-center gap-7 list-none">
          {links.map((link) => (
            <li class={link.children ? 'relative group' : ''}>
              <a
                href={link.href}
                class={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent ${
                  link.active ? 'text-accent' : 'text-ink-subtle'
                }`}
              >
                {link.label}
                {link.children && <Icon name="chevron-down" class="text-[10px]" />}
              </a>
              {link.children && (
                <ul class="absolute top-full left-1/2 -translate-x-1/2 min-w-[180px] bg-white border border-black/8 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-2.5 list-none opacity-0 invisible -translate-y-1.5 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all z-50">
                  {link.children.map((sub) => (
                    <li>
                      <a
                        href={sub.href}
                        class={`block px-[18px] py-2 text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-accent/[0.07] hover:text-accent ${
                          sub.active ? 'text-accent bg-accent/[0.07]' : 'text-ink-subtle'
                        }`}
                      >
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* CTAs desktop */}
        <div class="hidden md:flex items-center gap-2.5">
          {ctas.map((cta) => (
            <Button href={cta.href} variant={cta.variant ?? 'accent'} external={cta.external} class="text-[13px] px-[18px] py-2">
              {cta.label}
            </Button>
          ))}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp"
              class="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-whatsapp rounded-sm px-3.5 py-2 transition-colors hover:brightness-95"
            >
              <Icon name="whatsapp" fill class="text-base" />
            </a>
          )}
        </div>

        {/* Hamburguesa */}
        <button data-nav-toggle class="md:hidden flex flex-col gap-1.5 p-1" aria-label="Menú" aria-expanded="false">
          <span class="block w-[22px] h-0.5 bg-accent rounded-sm transition-transform" />
          <span class="block w-[22px] h-0.5 bg-accent rounded-sm transition-opacity" />
          <span class="block w-[22px] h-0.5 bg-accent rounded-sm transition-transform" />
        </button>
      </div>

      {/* Drawer mobile */}
      <div data-nav-drawer class="hidden md:hidden pb-5">
        <ul class="list-none flex flex-col">
          {links.map((link) => (
            <>
              <li>
                <a href={link.href} class="block py-3 text-[15px] font-medium text-ink-subtle border-b border-accent/10 hover:text-accent">
                  {link.label}
                </a>
              </li>
              {link.children?.map((sub) => (
                <li>
                  <a href={sub.href} class="block py-2.5 pl-5 text-[13px] text-ink-subtle/85 border-b border-accent/10 hover:text-accent">
                    ↳ {sub.label}
                  </a>
                </li>
              ))}
            </>
          ))}
        </ul>
        <div class="flex flex-col gap-2.5 pt-4">
          {ctas.map((cta) => (
            <Button href={cta.href} variant={cta.variant ?? 'accent'} external={cta.external} class="w-full">
              {cta.label}
            </Button>
          ))}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-whatsapp rounded-sm px-3.5 py-2.5"
            >
              <Icon name="whatsapp" fill class="text-base" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </Container>
  </header>
)

/** Botón flotante de WhatsApp (visible solo en mobile). */
export const WhatsappFloat: FC<{ whatsapp: string }> = ({ whatsapp }) => (
  <a
    href={`https://wa.me/${whatsapp}`}
    target="_blank"
    rel="noopener"
    aria-label="WhatsApp"
    class="md:hidden fixed bottom-5 right-5 w-[54px] h-[54px] bg-whatsapp text-white rounded-full flex items-center justify-center text-[28px] shadow-[0_4px_18px_rgba(37,211,102,0.45)] z-40 transition-transform hover:scale-105"
  >
    <Icon name="whatsapp" fill />
  </a>
)

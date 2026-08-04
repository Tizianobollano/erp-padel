import type { FC } from 'hono/jsx'
import { Container } from '../ui/Container'
import { Icon } from '../ui/Icon'

export type FooterColumn = {
  title: string
  links: { label: string; href: string; sub?: string[] }[]
}

export type SocialLink = { network: 'facebook' | 'instagram' | 'linkedin' | 'whatsapp'; href: string }

type FooterProps = {
  brand: { logo: string; alt: string }
  tagline?: string
  social?: SocialLink[]
  columns?: FooterColumn[]
  copyright?: string
  rights?: string
}

/** Pie de página oscuro con logo, redes, columnas de enlaces y barra inferior. */
export const Footer: FC<FooterProps> = ({ brand, tagline, social = [], columns = [], copyright, rights }) => (
  <footer class="bg-ink border-t border-on-dark/8 pt-14 pb-8">
    <Container>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-12 mb-12">
        <div>
          <img src={brand.logo} alt={brand.alt} class="h-11 w-auto mb-[18px]" />
          {tagline && <p class="text-[13px] text-on-dark/50 leading-[1.55] max-w-[240px] mb-5">{tagline}</p>}
          {social.length > 0 && (
            <div class="flex gap-3">
              {social.map((s) => (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.network}
                  class="w-9 h-9 border border-on-dark/15 rounded-sm flex items-center justify-center text-on-dark/55 text-lg transition-colors hover:border-accent-tint hover:text-accent-tint"
                >
                  <Icon name={s.network} fill />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div>
            <p class="text-xs font-semibold tracking-[0.8px] uppercase text-on-dark/45 mb-4">{col.title}</p>
            <ul class="list-none flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li>
                  <a href={link.href} class="text-sm text-on-dark/60 transition-colors hover:text-accent-tint">
                    {link.label}
                  </a>
                  {link.sub && (
                    <ul class="list-none flex flex-col gap-1.5 mt-1.5 pl-3 border-l border-on-dark/15">
                      {link.sub.map((s) => (
                        <li class="text-[13px] text-on-dark/40">{s}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div class="border-t border-on-dark/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-[13px] text-on-dark/35 text-center md:text-left">
        {copyright && <span>{copyright}</span>}
        {rights && <span>{rights}</span>}
      </div>
    </Container>
  </footer>
)

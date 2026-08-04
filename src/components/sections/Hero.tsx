import type { FC } from 'hono/jsx'
import { Container } from '../ui/Container'
import { Button, type ButtonVariant } from '../ui/Button'

type HeroStat = { num: string; label: string }
type HeroCta = { label: string; href: string; variant?: ButtonVariant; external?: boolean }

type HeroProps = {
  eyebrow?: string
  /** admite <em> y <strong> (resaltado de marca). */
  title: string
  tagline?: string
  desc?: string
  ctas?: HeroCta[]
  /** tarjeta de cristal a la derecha con logo + métricas. */
  card?: {
    logo?: string
    logoAlt?: string
    stats?: HeroStat[]
    badge?: string
  }
}

/** Hero a dos columnas sobre superficie oscura, con tarjeta translúcida de stats. */
export const Hero: FC<HeroProps> = ({ eyebrow, title, tagline, desc, ctas = [], card }) => (
  <section class="relative overflow-hidden bg-surface-dark py-24 md:py-[88px]">
    {/* Manchas decorativas */}
    <div class="pointer-events-none absolute -top-20 -right-28 w-[480px] h-[480px] rounded-full bg-accent-hover/30" />
    <div class="pointer-events-none absolute -bottom-14 -left-20 w-80 h-80 rounded-full bg-accent-tint/20" />

    <Container class="relative z-10">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          {eyebrow && <span class="inline-block text-xs font-semibold tracking-[1.2px] uppercase text-accent-tint mb-4">{eyebrow}</span>}
          <h1
            class="text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.08] tracking-[-1px] text-on-dark mb-5 [&_em]:not-italic [&_em]:text-white"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          {tagline && <p class="text-lg text-on-dark/80 leading-[1.5] mb-7 max-w-[480px]">{tagline}</p>}
          {desc && (
            <p
              class="text-[15px] text-on-dark/65 leading-[1.6] mb-9 max-w-[460px] [&_strong]:text-on-dark [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: desc }}
            />
          )}
          {ctas.length > 0 && (
            <div class="flex flex-wrap gap-3">
              {ctas.map((cta) => (
                <Button href={cta.href} variant={cta.variant ?? 'primary'} external={cta.external}>
                  {cta.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {card && (
          <div class="hidden lg:flex justify-center">
            <div class="w-full max-w-[380px] bg-white/10 border border-on-dark/25 rounded-lg p-9 backdrop-blur-md">
              {card.logo && <img src={card.logo} alt={card.logoAlt ?? ''} class="h-[72px] w-auto mb-8" />}
              {card.stats?.map((stat, i) => (
                <>
                  {i > 0 && <hr class="border-0 border-t border-on-dark/15 my-5" />}
                  <div>
                    <div class="text-4xl font-bold text-on-dark leading-none tracking-[-0.5px]">{stat.num}</div>
                    <div class="text-[13px] text-on-dark/65 mt-1">{stat.label}</div>
                  </div>
                </>
              ))}
              {card.badge && (
                <>
                  <hr class="border-0 border-t border-on-dark/15 my-5" />
                  <div class="inline-flex items-center gap-2 bg-on-dark/10 border border-on-dark/25 rounded-sm px-3.5 py-2 text-[13px] text-on-dark">
                    <span class="w-2 h-2 bg-success rounded-full shrink-0" />
                    {card.badge}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  </section>
)

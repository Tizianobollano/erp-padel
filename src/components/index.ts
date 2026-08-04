// Barrel: importá todo desde "../components" en tus páginas.

// Primitivos
export { Container } from './ui/Container'
export { Section, isDarkTone, type Tone } from './ui/Section'
export { SectionHeader } from './ui/SectionHeader'
export { SectionDivider } from './ui/SectionDivider'
export { Button, type ButtonVariant } from './ui/Button'
export { Badge } from './ui/Badge'
export { Card } from './ui/Card'
export { Input, inputBase } from './ui/Input'
export { Select, type SelectOption } from './ui/Select'
export { Table, Thead, Tbody, Tr, Th, Td } from './ui/Table'
export { Icon } from './ui/Icon'
export { IconSprite } from './ui/IconSprite'

// Layout
export { Navbar, WhatsappFloat, type NavLink, type NavCta } from './layout/Navbar'
export { Footer, type FooterColumn, type SocialLink } from './layout/Footer'

// Secciones landing
export { Hero } from './sections/Hero'
export { FeatureGrid, type Feature } from './sections/FeatureGrid'
export { ProgramCards, type Program } from './sections/ProgramCards'
export { Stats, type Stat } from './sections/Stats'
export { Testimonials, type Testimonial } from './sections/Testimonials'
export { Partners, type Partner, type Agreement } from './sections/Partners'
export { CommunityGrid, type CommunityRole } from './sections/CommunityGrid'
export { Faq, type FaqItem } from './sections/Faq'
export { CtaFinal } from './sections/CtaFinal'
export { Popup } from './sections/Popup'
export { Slider, type Slide } from './sections/Slider'

// E-commerce / genéricos
export { ProductCard, type Product } from './commerce/ProductCard'
export { ProductGrid } from './commerce/ProductGrid'
export { Carousel } from './commerce/Carousel'
export { ProductCarousel } from './commerce/ProductCarousel'
export { Catalog, type CatalogFilter } from './commerce/Catalog'
export { PricingTable, type PricingTier } from './commerce/PricingTable'
export { Rating } from './commerce/Rating'
export { Newsletter } from './commerce/Newsletter'
export { Breadcrumbs, type Crumb } from './commerce/Breadcrumbs'
export { Accordion, type AccordionItem } from './commerce/Accordion'
export { Alert } from './commerce/Alert'
export { CartDrawer, CartButton } from './commerce/CartDrawer'

// App / consola (back-office)
export { AppShell, type NavItem } from './app/AppShell'
export { StatusBadge, TemperatureBadge, BotStatusBadge, type Temperature } from './app/badges'
export { EmptyState, LoadingState, ErrorState } from './app/states'
export { KpiTile, DataTable, Timeline, Panel, type Column, type TimelineItem } from './app/data'
export {
  MessageStatusIcon,
  ConversationRow,
  ConversationList,
  MessageBubble,
  InternalNoteBlock,
  ThreadView,
  AttachmentView,
  TemplatePicker,
  Composer,
  type Conversation,
  type Message,
  type MessageStatus,
  type ThreadEntry,
} from './app/conversation'
export { LeadSummaryPanel, TaskList, AssignmentSelect, FilterBar, type LeadField, type Task, type FilterChip } from './app/panels'
export { Drawer, Modal, Toast } from './app/overlays'

// Reservas (dominio erp-padel Modulo 1, design.md seccion 7)
export { TurnosGrid, type Turno, type TurnosGridProps } from './reservas/TurnosGrid'
export { ReservaForm, type ReservaFormProps } from './reservas/ReservaForm'

// Cliente
export { ClientScript } from './ClientScript'

import type { FC } from 'hono/jsx'
import { Icon } from '../ui/Icon'
import { Select, type SelectOption } from '../ui/Select'
import { inputBase } from '../ui/Input'

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

/** Icono de estado de un mensaje saliente (estilo WhatsApp). */
export const MessageStatusIcon: FC<{ status: MessageStatus; class?: string }> = ({ status, class: cls = '' }) => {
  if (status === 'failed') return <Icon name="alert-triangle" class={`text-danger text-xs ${cls}`} />
  if (status === 'read') return <Icon name="check-check" class={`text-info text-xs ${cls}`} />
  if (status === 'delivered') return <Icon name="check-check" class={`text-ink-muted/50 text-xs ${cls}`} />
  return <Icon name="check" class={`text-ink-muted/50 text-xs ${cls}`} />
}

export type Conversation = {
  id: string
  name: string
  preview: string
  time: string
  unread?: number
  active?: boolean
  href?: string
}

/** Fila de la bandeja de conversaciones. */
export const ConversationRow: FC<{ conv: Conversation }> = ({ conv }) => {
  const inner = (
    <div class={`flex items-start gap-3 px-4 py-3 border-b border-hairline transition-colors ${conv.active ? 'bg-accent/[0.06]' : 'hover:bg-surface-2/60'}`}>
      <span class="shrink-0 w-9 h-9 rounded-full bg-surface-2 text-ink-muted flex items-center justify-center text-sm font-semibold">
        {conv.name.slice(0, 1).toUpperCase()}
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-ink truncate">{conv.name}</span>
          <span class="text-[11px] text-ink-muted/55 shrink-0">{conv.time}</span>
        </div>
        <div class="flex items-center justify-between gap-2 mt-0.5">
          <span class="text-sm text-ink-muted/70 truncate">{conv.preview}</span>
          {conv.unread ? (
            <span class="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-on-dark text-[11px] font-semibold flex items-center justify-center">
              {conv.unread}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
  return conv.href ? <a href={conv.href} class="block">{inner}</a> : inner
}

export const ConversationList: FC<{ items: Conversation[]; class?: string }> = ({ items, class: cls = '' }) => (
  <div class={`divide-y-0 ${cls}`}>
    {items.map((c) => (
      <ConversationRow conv={c} />
    ))}
  </div>
)

export type Message = {
  id: string
  body: string
  time: string
  /** true = saliente (equipo); false = entrante (cliente). */
  outbound: boolean
  status?: MessageStatus
}

/** Burbuja de mensaje. Saliente = acento; entrante = superficie clara. */
export const MessageBubble: FC<{ msg: Message }> = ({ msg }) => (
  <div class={`flex ${msg.outbound ? 'justify-end' : 'justify-start'}`}>
    <div
      class={`max-w-[76%] rounded-lg px-3.5 py-2 text-sm leading-relaxed ${
        msg.outbound ? 'bg-accent text-on-dark rounded-br-sm' : 'bg-surface-2 text-ink rounded-bl-sm'
      }`}
    >
      <p>{msg.body}</p>
      <div class={`flex items-center gap-1 justify-end mt-1 text-[10px] ${msg.outbound ? 'text-on-dark/70' : 'text-ink-muted/55'}`}>
        <span>{msg.time}</span>
        {msg.outbound && msg.status && <MessageStatusIcon status={msg.status} />}
      </div>
    </div>
  </div>
)

/** Nota interna (no visible para el cliente). */
export const InternalNoteBlock: FC<{ author: string; time: string; body: string }> = ({ author, time, body }) => (
  <div class="mx-auto max-w-[85%] bg-warning/12 border border-warning/25 rounded-md px-3.5 py-2">
    <div class="flex items-center gap-1.5 text-[11px] font-semibold text-warning mb-0.5">
      <Icon name="user" class="text-xs" /> Nota interna · {author} · {time}
    </div>
    <p class="text-sm text-ink/80 leading-relaxed">{body}</p>
  </div>
)

export type ThreadEntry = { type: 'message'; msg: Message } | { type: 'note'; author: string; time: string; body: string }

/** Hilo de mensajes + notas internas. */
export const ThreadView: FC<{ entries: ThreadEntry[]; class?: string }> = ({ entries, class: cls = '' }) => (
  <div class={`flex flex-col gap-3 ${cls}`}>
    {entries.map((e) =>
      e.type === 'message' ? <MessageBubble msg={e.msg} /> : <InternalNoteBlock author={e.author} time={e.time} body={e.body} />,
    )}
  </div>
)

/** Adjunto de un mensaje (pill con icono + nombre). */
export const AttachmentView: FC<{ name: string; href?: string; class?: string }> = ({ name, href, class: cls = '' }) => {
  const inner = (
    <span class={`inline-flex items-center gap-2 text-xs text-ink-muted bg-surface-2 border border-hairline rounded-sm px-2.5 py-1.5 ${cls}`}>
      <Icon name="paperclip" class="text-sm" />
      <span class="truncate max-w-[180px]">{name}</span>
    </span>
  )
  return href ? <a href={href} class="hover:opacity-80 transition-opacity">{inner}</a> : inner
}

/** Selector de plantilla de respuesta (nativo). */
export const TemplatePicker: FC<{ options: SelectOption[]; name?: string; class?: string }> = ({ options, name = 'template', class: cls = '' }) => (
  <Select name={name} placeholder="Plantilla…" options={options} class={cls} />
)

/** Composer de respuesta. Form nativo (POST); degrada sin JS. */
export const Composer: FC<{ action?: string; templates?: SelectOption[]; class?: string }> = ({ action = '#', templates, class: cls = '' }) => (
  <form action={action} method="post" class={`border-t border-hairline bg-surface-1 p-3 ${cls}`}>
    {templates && templates.length > 0 && (
      <div class="mb-2 flex items-center gap-2">
        <TemplatePicker options={templates} class="max-w-[220px] py-1.5" />
      </div>
    )}
    <div class="flex items-end gap-2">
      <label class="shrink-0 w-9 h-9 rounded-sm border border-hairline flex items-center justify-center text-ink-muted hover:text-accent hover:border-accent transition-colors cursor-pointer">
        <Icon name="paperclip" />
        <input type="file" name="attachment" class="hidden" />
      </label>
      <textarea
        name="body"
        rows={1}
        placeholder="Escribí una respuesta…"
        class={`${inputBase} resize-none min-h-[38px] max-h-40`}
      />
      <button type="submit" class="shrink-0 w-9 h-9 rounded-sm bg-accent text-on-dark flex items-center justify-center hover:bg-accent-hover transition-colors" aria-label="Enviar">
        <Icon name="send" />
      </button>
    </div>
  </form>
)

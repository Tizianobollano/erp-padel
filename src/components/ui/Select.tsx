import type { FC } from 'hono/jsx'
import { inputBase } from './Input'

export type SelectOption = { value: string; label: string }

type SelectProps = {
  name?: string
  value?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  invalid?: boolean
  id?: string
  class?: string
}

/** Desplegable nativo SSR. Comparte la base visual de Input. */
export const Select: FC<SelectProps> = ({ options, value, placeholder, invalid = false, class: cls = '', ...rest }) => (
  <select
    class={`${inputBase} appearance-none bg-no-repeat pr-9 ${invalid ? 'border-danger focus:border-danger' : ''} ${cls}`}
    style="background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23467b76' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E&quot;);background-position:right 0.75rem center"
    {...rest}
  >
    {placeholder && (
      <option value="" disabled selected={value === undefined || value === ''}>
        {placeholder}
      </option>
    )}
    {options.map((o) => (
      <option value={o.value} selected={o.value === value}>
        {o.label}
      </option>
    ))}
  </select>
)

import { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
}

export default function Input({ label, hint, ...props }: Props) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <input
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
        {...props}
      />
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  )
}

import { ReactNode } from 'react'

export default function Card({ children, className='' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm border p-4 ${className}`}>{children}</div>
  )
}

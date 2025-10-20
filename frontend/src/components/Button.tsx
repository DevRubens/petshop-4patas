import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }

export default function Button({ variant='primary', className='', ...props }: Props) {
  const cls = variant === 'primary'
    ? 'bg-sky-500 hover:bg-sky-600 text-white'
    : 'bg-transparent hover:bg-gray-100 text-gray-800 border'

  return (
    <button
      className={`px-4 py-2 rounded-xl transition ${cls} ${className}`}
      {...props}
    />
  )
}

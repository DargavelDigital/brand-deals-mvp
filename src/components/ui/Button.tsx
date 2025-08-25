import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'sm'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export default forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant='primary', size='md', asChild, ...props }, ref
){
  const base = 'inline-flex items-center justify-center rounded-[10px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
  const sizes = { md: 'px-4 py-2 text-sm', sm: 'px-3 py-2 text-sm' }[size]
  const variants = {
    primary: 'text-white bg-[var(--brand-600)] hover:bg-[color-mix(in oklch,var(--brand-600) 90%, black)] shadow-sm',
    secondary: 'bg-[var(--muted)] text-[var(--fg)] hover:bg-[color-mix(in oklch,var(--muted) 92%, black)]',
    ghost: 'text-[var(--fg)] hover:bg-[var(--muted)]'
  }[variant]

  if (asChild) {
    return <span ref={ref} className={clsx(base, sizes, variants, className)} {...props} />
  }

  return <button ref={ref} className={clsx(base, sizes, variants, className)} {...props} />
})

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none'
  
  const variants = {
    primary: 'bg-[var(--brand-600)] text-white hover:bg-[color-mix(in_oklch,var(--brand-600)_90%,black)] shadow-sm',
    secondary: 'bg-[var(--muted)] text-[var(--fg)] border border-[var(--border)] hover:bg-[color-mix(in_oklch,var(--muted)_90%,black)]',
    ghost: 'text-[var(--fg)] hover:bg-[var(--muted)]'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm rounded-[10px]',
    md: 'h-10 px-4 text-sm rounded-[10px]',
    lg: 'h-12 px-6 text-base rounded-[14px]'
  }
  
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
    />
  )
})

Button.displayName = 'Button'

export default Button

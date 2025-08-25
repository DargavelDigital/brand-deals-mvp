import * as React from "react";
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}
const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed";
const sizes: Record<Size,string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};
const variants: Record<Variant,string> = {
  primary: "bg-[color:var(--accent)] text-white hover:brightness-95",
  secondary: "bg-surface text-[var(--text)] border border-[var(--border)] hover:bg-[color:var(--muted)]/10",
  ghost: "bg-transparent text-[var(--text)] hover:bg-[color:var(--muted)]/10"
};

export function Button({ variant="primary", size="md", className="", asChild=false, ...props }: Props) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  
  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement<any>, {
      className: classes,
      ...props
    });
  }
  
  return <button className={classes} {...props} />;
}

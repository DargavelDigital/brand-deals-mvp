import * as React from "react";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onValueChange'> {
  onValueChange?: (value: string) => void;
}

export function Select({ className="", children, onValueChange, ...props }: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <select
      className={`h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${className}`}
      {...props}
      onChange={handleChange}
    >
      {children}
    </select>
  );
}

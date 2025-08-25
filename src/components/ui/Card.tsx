import * as React from "react";
type Props = React.HTMLAttributes<HTMLDivElement>;
export function Card({ className = "", ...props }: Props) {
  return <div className={`card ${className}`} {...props} />;
}

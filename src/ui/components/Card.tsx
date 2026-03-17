import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/src/ui/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
} & HTMLAttributes<HTMLElement>;

export function Card({
  children,
  className,
  title,
  description,
  ...props
}: CardProps) {
  return (
    <section className={cn("ds-card", className)} {...props}>
      {title ? <h2 className="ds-card-title">{title}</h2> : null}
      {description ? <p className="ds-card-description">{description}</p> : null}
      {children}
    </section>
  );
}

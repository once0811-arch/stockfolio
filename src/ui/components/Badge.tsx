import type { ReactNode } from "react";

import { cn } from "@/src/ui/lib/cn";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "positive" | "warning";
  className?: string;
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span className={cn("ds-badge", `ds-badge-${tone}`, className)}>{children}</span>
  );
}

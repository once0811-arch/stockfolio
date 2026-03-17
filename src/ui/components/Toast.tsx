import type { ReactNode } from "react";

import { cn } from "@/src/ui/lib/cn";

type ToastProps = {
  children: ReactNode;
  tone?: "info" | "error" | "success";
};

export function Toast({ children, tone = "info" }: ToastProps) {
  return <p className={cn("ds-toast", `ds-toast-${tone}`)}>{children}</p>;
}

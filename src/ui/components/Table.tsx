import type { ReactNode } from "react";

import { cn } from "@/src/ui/lib/cn";

type TableProps = {
  className?: string;
  children: ReactNode;
};

export function Table({ className, children }: TableProps) {
  return (
    <div className="ds-table-wrap">
      <table className={cn("ds-table", className)}>{children}</table>
    </div>
  );
}

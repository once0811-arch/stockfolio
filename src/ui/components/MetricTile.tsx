import type { ReactNode } from "react";

import { cn } from "@/src/ui/lib/cn";

type MetricTileProps = {
  label: string;
  value: ReactNode;
  description?: string;
  tone?: "default" | "positive" | "warning";
  testId?: string;
};

export function MetricTile({
  label,
  value,
  description,
  tone = "default",
  testId,
}: MetricTileProps) {
  return (
    <article className="ds-metric-tile">
      <p className="ds-metric-label">{label}</p>
      <p
        className={cn(
          "ds-metric-value",
          tone === "positive" && "ds-metric-value-positive",
          tone === "warning" && "ds-metric-value-warning",
        )}
        data-testid={testId}
      >
        {value}
      </p>
      {description ? <p className="ds-metric-description">{description}</p> : null}
    </article>
  );
}

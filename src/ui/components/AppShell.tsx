import type { ReactNode } from "react";

import { cn } from "@/src/ui/lib/cn";

type AppShellProps = {
  children: ReactNode;
  header: ReactNode;
  nav: ReactNode;
  footer: ReactNode;
  className?: string;
};

export function AppShell({ children, header, nav, footer, className }: AppShellProps) {
  return (
    <div className={cn("ds-app-shell", className)}>
      <header className="ds-app-header">{header}</header>
      {nav}
      <main className="ds-app-main">{children}</main>
      <footer className="ds-app-footer">{footer}</footer>
    </div>
  );
}

import Link from "next/link";

import { cn } from "@/src/ui/lib/cn";

type NavItem = {
  href: string;
  label: string;
};

type TopNavProps = {
  items: NavItem[];
  className?: string;
};

export function TopNav({ items, className }: TopNavProps) {
  return (
    <nav className={cn("ds-top-nav", className)} aria-label="주요 화면">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="ds-top-nav-link">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

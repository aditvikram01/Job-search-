"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";

export function NavLinks({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();
  const items =
    variant === "bottom"
      ? NAV.filter((i) =>
          ["/", "/roster", "/review", "/linkedin", "/settings"].includes(i.href),
        )
      : NAV;

  return (
    <>
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              variant === "bottom"
                ? `flex-1 py-3 text-center text-xs ${active ? "font-semibold text-accent" : "text-muted"}`
                : `rounded-md px-3 py-2 text-sm ${active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-foreground"}`
            }
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

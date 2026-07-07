"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard Home" },
  { href: "/admin/dashboard", label: "Scrape & Ingest Vehicles" },
  { href: "/admin/inventory", label: "Vehicle Inventory & Pricing" },
  { href: "/admin/orders", label: "Manage Orders & Payments" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 p-4">
      <div className="px-2 pb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Admin Portal
      </div>
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-amber-500 text-black"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

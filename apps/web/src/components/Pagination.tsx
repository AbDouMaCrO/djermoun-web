"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/language-context";

type Props = {
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string>;
};

function buildHref(page: number, sp: Record<string, string>) {
  const params = new URLSearchParams({ ...sp, page: String(page) });
  return `?${params.toString()}`;
}

function getPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (current > 3) out.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) out.push(p);
  if (current < total - 2) out.push("…");
  out.push(total);
  return out;
}

const btnBase =
  "flex h-9 min-w-[2.25rem] items-center justify-center rounded-md px-3 text-sm font-medium transition-colors duration-150";

export default function Pagination({ currentPage, totalPages, searchParams = {} }: Props) {
  const { dict } = useLanguage();
  if (totalPages <= 1) return null;

  const pages = getPages(currentPage, totalPages);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage <= 1 ? (
        <span className={`${btnBase} cursor-not-allowed text-slate-300`}>{dict.pagination.prev}</span>
      ) : (
        <Link href={buildHref(currentPage - 1, searchParams)} className={`${btnBase} text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5`}>
          {dict.pagination.prev}
        </Link>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-slate-400 select-none">…</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p, searchParams)}
            className={
              p === currentPage
                ? `${btnBase} bg-amber-500 text-white shadow-sm`
                : `${btnBase} text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5`
            }
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {currentPage >= totalPages ? (
        <span className={`${btnBase} cursor-not-allowed text-slate-300`}>{dict.pagination.next}</span>
      ) : (
        <Link href={buildHref(currentPage + 1, searchParams)} className={`${btnBase} text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5`}>
          {dict.pagination.next}
        </Link>
      )}
    </nav>
  );
}

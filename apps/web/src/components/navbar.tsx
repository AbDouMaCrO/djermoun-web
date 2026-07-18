import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/utils/supabase/roles";
import NavLinks from "@/components/nav-links";
import ThemeToggle from "@/components/theme-toggle";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await getUserRole(user.id) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0A0F1E]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="leading-none">
          <span className="text-lg font-black tracking-widest text-slate-900 dark:text-white">
            DJERMOUN <span className="text-amber-500 dark:text-amber-400">AUTO</span>
          </span>
          <span className="block text-[9px] tracking-[0.4em] text-slate-400 dark:text-slate-500 uppercase mt-0.5">
            Premium Import
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavLinks isLoggedIn={!!user} role={role} />
        </div>
      </nav>
    </header>
  );
}

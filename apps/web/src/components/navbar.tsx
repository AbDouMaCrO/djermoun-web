import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import NavLinks from "@/components/nav-links";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-wide text-slate-900">
          DJERMOUN <span className="text-amber-500">AUTO</span>
        </Link>

        <NavLinks isLoggedIn={!!user} />
      </nav>
    </header>
  );
}

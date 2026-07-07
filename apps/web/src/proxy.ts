import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Admin-only sub-paths of /admin/*; everything else under /admin is shared
// with supervisors (dashboard home, scrape/intake, inventory).
const ADMIN_ONLY_PREFIXES = ["/admin/orders", "/admin/settings", "/admin/import"];

// Protects /admin/* by role (profiles.role, set up by the RBAC migration):
// admins get full access, supervisors get everything except ADMIN_ONLY_PREFIXES,
// everyone else is sent to login. Also refreshes the Supabase auth session on
// every request (required for SSR auth).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role;

    const isAdminOnlyPath = ADMIN_ONLY_PREFIXES.some((p) =>
      request.nextUrl.pathname.startsWith(p),
    );

    const allowed = role === "admin" || (role === "supervisor" && !isAdminOnlyPath);

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = role === "supervisor" ? "/admin" : "/login";
      if (role !== "supervisor") url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: "/admin/:path*",
};

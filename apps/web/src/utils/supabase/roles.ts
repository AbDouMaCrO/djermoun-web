import { createClient } from "@/utils/supabase/server";

export type UserRole = "admin" | "supervisor" | "customer";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role as UserRole | undefined) ?? null;
}

export async function getCurrentRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return getUserRole(user.id);
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === "admin";
}

export async function isSupervisor(): Promise<boolean> {
  return (await getCurrentRole()) === "supervisor";
}

export async function isCustomer(): Promise<boolean> {
  return (await getCurrentRole()) === "customer";
}

/**
 * Guard for Server Actions and Route Handlers. Throws UnauthorizedError
 * (message "Unauthorized") if the current session's role isn't in `allowed`.
 * Route Handlers should catch it and respond 403; Server Actions can let it
 * propagate or catch it to return an { success: false, error } result.
 */
export async function requireRole(...allowed: UserRole[]): Promise<UserRole> {
  const role = await getCurrentRole();
  if (!role || !allowed.includes(role)) throw new UnauthorizedError();
  return role;
}

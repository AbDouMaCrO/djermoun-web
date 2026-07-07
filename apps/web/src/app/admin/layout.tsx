import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/utils/supabase/roles";
import Sidebar from "./sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await getUserRole(user.id) : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

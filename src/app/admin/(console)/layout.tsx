import type { ReactNode } from "react";
import { isAdmin } from "@/lib/roles";
import { getAdminCounts } from "@/server/queries/admin";
import { requireStaff } from "@/server/session";
import { AdminNav } from "./_components/admin-nav";

export default async function ConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const staff = await requireStaff("/");
  const counts = await getAdminCounts();

  return (
    <div className="min-h-dvh lg:fixed lg:inset-0 lg:grid lg:min-h-0 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-clip">
      <AdminNav
        counts={counts}
        admin={{
          id: staff.id,
          name: staff.name,
          role: isAdmin(staff.role) ? "ADMIN" : "MODERATOR",
        }}
      />
      <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
        {children}
      </div>
    </div>
  );
}

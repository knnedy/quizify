import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireUser } from "@/server/session";
import { AdminNav } from "./_components/admin-nav";
import { getAdminShell } from "./mock-data";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Quizify admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser("/admin");
  const { counts, admin } = await getAdminShell();

  return (
    <div className="min-h-dvh lg:fixed lg:inset-0 lg:grid lg:min-h-0 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-clip">
      <AdminNav counts={counts} admin={admin} />
      <div className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
        {children}
      </div>
    </div>
  );
}

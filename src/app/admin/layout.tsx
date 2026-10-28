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
    <div className="min-h-dvh lg:grid lg:h-dvh lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:overflow-hidden">
      <AdminNav counts={counts} admin={admin} />
      <div className="min-w-0 lg:h-dvh lg:overflow-y-auto">{children}</div>
    </div>
  );
}

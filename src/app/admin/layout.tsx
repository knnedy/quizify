import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireUser } from "@/server/session";
import { AdminNav } from "./_components/admin-nav";
import { getAdminCounts } from "./mock-data";

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
  const counts = await getAdminCounts();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <AdminNav counts={counts} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

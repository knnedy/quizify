import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost } from "@/lib/site-urls";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Quizify admin" },
  robots: { index: false, follow: false },
};

// The admin area only exists on the admin host. The proxy already hides it
// elsewhere, and this makes sure of it.
export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!isAdminHost((await headers()).get("host"))) notFound();

  return <>{children}</>;
}

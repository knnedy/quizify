import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "This is the dashboard page.",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>;
}

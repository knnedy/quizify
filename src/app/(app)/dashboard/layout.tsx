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
  return (
    <main className="container mx-auto px-4 py-4 min-h-screen md:px-10 lg:px-14">
      {children}
    </main>
  );
}

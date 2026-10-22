import type { ReactNode } from "react";
import AppHeader from "./_components/app-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}

import type { ReactNode } from "react";

export function AdminPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-col gap-6 px-6 py-6 sm:py-8 lg:h-full lg:min-h-0 lg:gap-5 lg:py-7">
      <header className="space-y-1">
        <h1 className="text-3xl">{title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
    </main>
  );
}

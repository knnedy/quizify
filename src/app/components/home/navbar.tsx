import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brand } from "../brand";
import { ThemeToggle } from "../theme-toggle";
import { UserMenu } from "./user-menu";

const links = [
  { href: "/quizzes", label: "Browse" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
];

export default function HomeNavbar({
  user,
}: {
  user: { name: string; email: string } | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-6 px-6 md:grid-cols-[1fr_auto_1fr]">
        <Brand className="justify-self-start" />

        <nav
          aria-label="Main"
          className="hidden items-center gap-0.5 rounded-full border bg-muted/50 p-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground hover:shadow-xs focus-visible:outline-2 focus-visible:outline-ring">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <span
            aria-hidden
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shadow-primary",
                )}>
                Dashboard
              </Link>
              <UserMenu name={user.name} email={user.email} />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                )}>
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shadow-primary",
                )}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

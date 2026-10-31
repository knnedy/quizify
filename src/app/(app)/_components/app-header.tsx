import Link from "next/link";
import { Brand } from "@/components/shell/brand";
import { MobileMenu } from "@/components/shell/mobile-menu";
import { UserMenu } from "@/components/shell/user-menu";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOptionalUser } from "@/server/session";
import { AppNav } from "./app-nav";

const guestLinks = [{ href: "/quizzes", label: "Browse" }];

const memberLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quizzes", label: "Browse" },
  { href: "/my-quizzes", label: "My quizzes" },
];

export default async function AppHeader() {
  const user = await getOptionalUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Brand />
        <AppNav links={user ? memberLinks : guestLinks} />

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <span
            aria-hidden
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          {user ? (
            <UserMenu name={user.name} email={user.email} />
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
                  "hidden shadow-primary sm:inline-flex",
                )}>
                Get started
              </Link>
            </>
          )}
          <MobileMenu
            links={user ? memberLinks : guestLinks}
            isSignedIn={Boolean(user)}
          />
        </div>
      </div>
    </header>
  );
}

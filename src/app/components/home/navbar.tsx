"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeLogo from "../theme-logo";
import ThemeToggle from "../theme-toggle";
import { Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Session } from "@/server/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdLogout } from "react-icons/md";

type Props = {
  session: Session | null;
};

export default function Navbar({ session }: Props) {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // detect whether user has scrolled the page
  const scrollHandler = () => {
    setScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);
  return (
    <header
      className={cn(
        "fixed top-0 w-full flex h-16 items-center gap-4 px-4 md:px-6 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-sm border-b shadow-sm dark:border-slate-700 dark:shadow-slate-900/10"
          : "bg-transparent",
      )}>
      {/* Left Section - Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ThemeLogo width={20} height={20} alt="Quizify logo" />
          </div>
          <div className="flex-1 text-left text-lg leading-tight">
            <span className="font-bold tracking-tight">Quizify</span>
          </div>
        </Link>
      </div>

      {/* Center Section - Navigation Links */}
      <div className="hidden md:flex items-center justify-center flex-1">
        <div className="flex items-center space-x-1">
          {["How It Works", "Features", "Popular Categories", "FAQ"].map(
            (item) => {
              const href = `#${item.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <Link key={item} href={href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium">
                    {item}
                  </Button>
                </Link>
              );
            },
          )}
        </div>
      </div>

      {/* Right Section - Theme Toggle & User Menu */}
      <div className="flex items-center space-x-4 shrink-0">
        <ThemeToggle />

        {/* Mobile Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-75 sm:w-100">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
                  <ThemeLogo width={18} height={18} alt="Quizify logo" />
                </div>
                <span>Quizify</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-2">
              {["Features", "How It Works", "Testimonials", "FAQ"].map(
                (item) => (
                  <SheetClose key={item}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-base">
                      {item}
                    </Button>
                  </SheetClose>
                ),
              )}
              <div className="h-px bg-border my-4" />
              {session ? (
                <>
                  <SheetClose>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-base text-red-500"
                      onClick={() => {
                        authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => {
                              router.replace("/sign-in");
                            },
                          },
                        });
                      }}>
                      <MdLogout className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </SheetClose>
                </>
              ) : (
                <>
                  <SheetClose>
                    <Button
                      className="w-full"
                      onClick={() => router.push("/sign-in")}>
                      Sign In
                    </Button>
                  </SheetClose>
                  <SheetClose>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/sign-up")}>
                      Sign Up
                    </Button>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-9 w-9 border border-gray-300 dark:border-gray-600 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50">
                <AvatarImage src={""} alt="profile-image" />
                <AvatarFallback className="bg-muted">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-medium leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.replace("/sign-in");
                      },
                    },
                  });
                }}
                className="flex items-center text-red-500 dark:text-red-400">
                <MdLogout className="mr-2 w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/sign-up")}
              className="hidden md:flex">
              Sign Up
            </Button>
            <Button
              onClick={() => router.push("/sign-in")}
              className="flex items-center gap-2 bg-linear-to-r from-primary to-primary/90 hover:opacity-90 transition-all">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

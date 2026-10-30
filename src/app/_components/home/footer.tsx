import Link from "next/link";
import { Brand } from "../brand";

const columns = [
  {
    title: "Play",
    links: [
      { href: "/quizzes", label: "Browse quizzes" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#features", label: "Features" },
    ],
  },
  {
    title: "Create",
    links: [
      { href: "/quizzes/create", label: "Make a quiz" },
      { href: "/my-quizzes", label: "My quizzes" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Brand />
          <p className="max-w-xs text-sm text-muted-foreground">
            Quick quizzes, streaks and XP for curious minds.
          </p>
        </div>

        {columns.map((column) => (
          <nav
            key={column.title}
            aria-label={column.title}
            className="space-y-3">
            <p className="text-sm font-semibold">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Quizify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

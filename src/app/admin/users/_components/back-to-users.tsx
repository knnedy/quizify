"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { USERS_LIST_KEY } from "../query-params";

// Returns to the list with the same search, filter, sort and page you left.
export function BackToUsers() {
  const router = useRouter();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();

    let search = "";
    try {
      search = window.sessionStorage.getItem(USERS_LIST_KEY) ?? "";
    } catch {
      // Without storage it just opens the plain list.
    }

    router.push(search ? `/admin/users?${search}` : "/admin/users");
  }

  return (
    <Link
      href="/admin/users"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeftIcon aria-hidden className="size-4" />
      All users
    </Link>
  );
}

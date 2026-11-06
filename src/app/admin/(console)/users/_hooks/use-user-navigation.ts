"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseUserQuery,
  toSearchString,
  type UserQuery,
} from "../query-params";

export function useUserNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Any change except the page itself sends you back to page 1.
  const navigate = useCallback(
    (patch: Partial<UserQuery>, mode: "push" | "replace" = "push") => {
      const current = parseUserQuery(
        Object.fromEntries(searchParams.entries()),
      );
      const search = toSearchString({ ...current, page: 1, ...patch });
      const href = search ? `${pathname}?${search}` : pathname;

      startTransition(() => {
        if (mode === "replace") {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      });
    },
    [pathname, router, searchParams],
  );

  return { navigate, pending };
}
